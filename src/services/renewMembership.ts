import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { getAllUsers } from "./users";

export const getPendingRenewals = async () => {
    const users = await getAllUsers();
    const pending: any[] = [];

    for (const u of users as any[]) {
        const raw = u?.renewals;
        if (Array.isArray(raw)) {
            for (const it of raw) {
                if ((it?.status || "").toLowerCase() === "pending") {
                    pending.push({ userFullName: u.fullName, userEmail: u.email || u.id, ...it });
                }
            }
        } else if (raw && typeof raw === "object") {
            for (const [id, value] of Object.entries(raw)) {
                const v: any = value || {};
                if ((v?.status || "").toLowerCase() === "pending") {
                    pending.push({ userFullName: u.fullName, userEmail: u.email || u.id, id, ...v });
                }
            }
        }
    }

    pending.sort((a: any, b: any) => {
        const at = a.submittedAt?.seconds || a.submittedAt?.toMillis?.() || a.submittedAtMillis || 0;
        const bt = b.submittedAt?.seconds || b.submittedAt?.toMillis?.() || b.submittedAtMillis || 0;
        return bt - at;
    });

    return pending;
};

export const getApprovedRenewals = async () => {
    const users = await getAllUsers();
    const approved: any[] = [];

    for (const u of users as any[]) {
        const raw = (u as any)?.renewals;
        if (Array.isArray(raw)) {
            for (const it of raw) {
                if ((it?.status || "").toLowerCase() === "approved") {
                    approved.push({ userFullName: (u as any).fullName, userEmail: (u as any).email || (u as any).id, ...it });
                }
            }
        } else if (raw && typeof raw === "object") {
            for (const [id, value] of Object.entries(raw)) {
                const v: any = value || {};
                if ((v?.status || "").toLowerCase() === "approved") {
                    approved.push({ userFullName: (u as any).fullName, userEmail: (u as any).email || (u as any).id, id, ...v });
                }
            }
        }
    }

    approved.sort((a: any, b: any) => {
        const at = a.approvedAtMillis || a.submittedAt?.seconds || a.submittedAt?.toMillis?.() || a.submittedAtMillis || 0;
        const bt = b.approvedAtMillis || b.submittedAt?.seconds || b.submittedAt?.toMillis?.() || b.submittedAtMillis || 0;
        return bt - at;
    });

    return approved;
};

// Approve a renewal by userId and renewalId
export const approveRenewal = async ({ userId, renewalId, remark, by }: { userId: string; renewalId: string; remark?: string; by?: string }) => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("User not found");

    const data: any = snap.data() || {};
    const renewals = data.renewals;

    if (Array.isArray(renewals)) {
        const updated = renewals.map((it: any) =>
            it?.id === renewalId
                ? { ...it, status: "approved", approvedAtMillis: Date.now(), ...(remark ? { approvedRemark: remark } : {}), ...(by ? { approvedBy: by } : {}) }
                : it
        );
        await updateDoc(userRef, { renewals: updated });
    } else if (renewals && typeof renewals === "object") {
        await updateDoc(userRef, {
            [`renewals.${renewalId}.status`]: "approved",
            [`renewals.${renewalId}.approvedAtMillis`]: Date.now(),
            ...(remark ? { [`renewals.${renewalId}.approvedRemark`]: remark } : {}),
            ...(by ? { [`renewals.${renewalId}.approvedBy`]: by } : {}),
        });
    } else {
        throw new Error("No renewals found for user");
    }

    // Set membership expiry to end of next year (December 31st)
    const nextYear = new Date().getFullYear() + 1;
    const formatted = `${nextYear}-12-31`;
    await updateDoc(userRef, { membershipExpiry: formatted });
};

// Reject a renewal by userId and renewalId
export const rejectRenewal = async ({ userId, renewalId, remark, by }: { userId: string; renewalId: string; remark?: string; by?: string }) => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("User not found");

    const data: any = snap.data() || {};
    const renewals = data.renewals;

    if (Array.isArray(renewals)) {
        const updated = renewals.map((it: any) =>
            it?.id === renewalId
                ? { ...it, status: "rejected", rejectedAtMillis: Date.now(), ...(remark ? { rejectedRemark: remark } : {}), ...(by ? { rejectedBy: by } : {}) }
                : it
        );
        await updateDoc(userRef, { renewals: updated });
    } else if (renewals && typeof renewals === "object") {
        await updateDoc(userRef, {
            [`renewals.${renewalId}.status`]: "rejected",
            [`renewals.${renewalId}.rejectedAtMillis`]: Date.now(),
            ...(remark ? { [`renewals.${renewalId}.rejectedRemark`]: remark } : {}),
            ...(by ? { [`renewals.${renewalId}.rejectedBy`]: by } : {}),
        });
    } else {
        throw new Error("No renewals found for user");
    }
};


export type RenewalStatus = "near_expiry" | "pending" | "completed";

const toMillisFromExpiry = (raw: any): number | null => {
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object" && typeof raw.seconds === "number") return raw.seconds * 1000;
    if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split('-').map((s) => parseInt(s, 10));
        const dt = new Date(y, m - 1, d);
        return isNaN(dt.getTime()) ? null : dt.getTime();
    }
    return null;
};

const normalizeRenewalsArray = (renewals: any): any[] => {
    if (Array.isArray(renewals)) return renewals;
    if (renewals && typeof renewals === "object") {
        return Object.entries(renewals).map(([id, v]: any) => ({ id, ...(v || {}) }));
    }
    return [];
};

export const getRenewalStatusFromProfile = (profile: any): RenewalStatus => {
    const renewals = normalizeRenewalsArray(profile?.renewals);
    const hasPending = renewals.some((r) => (r?.status || "").toLowerCase() === "pending");
    if (hasPending) return "pending";

    const expiryMillis = toMillisFromExpiry(profile?.membershipExpiry);
    if (expiryMillis && expiryMillis >= Date.now()) return "completed";

    return "near_expiry";
};
