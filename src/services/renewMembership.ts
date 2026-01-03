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

// Approve a renewal by userId and renewalId
export const approveRenewal = async ({ userId, renewalId }: { userId: string; renewalId: string }) => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("User not found");

    const data: any = snap.data() || {};
    const renewals = data.renewals;

    if (Array.isArray(renewals)) {
        const updated = renewals.map((it: any) =>
            it?.id === renewalId ? { ...it, status: "approved", approvedAtMillis: Date.now() } : it
        );
        await updateDoc(userRef, { renewals: updated });
    } else if (renewals && typeof renewals === "object") {
        await updateDoc(userRef, {
            [`renewals.${renewalId}.status`]: "approved",
            [`renewals.${renewalId}.approvedAtMillis`]: Date.now(),
        });
    } else {
        throw new Error("No renewals found for user");
    }
};

// Reject a renewal by userId and renewalId
export const rejectRenewal = async ({ userId, renewalId }: { userId: string; renewalId: string }) => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("User not found");

    const data: any = snap.data() || {};
    const renewals = data.renewals;

    if (Array.isArray(renewals)) {
        const updated = renewals.map((it: any) =>
            it?.id === renewalId ? { ...it, status: "rejected", rejectedAtMillis: Date.now() } : it
        );
        await updateDoc(userRef, { renewals: updated });
    } else if (renewals && typeof renewals === "object") {
        await updateDoc(userRef, {
            [`renewals.${renewalId}.status`]: "rejected",
            [`renewals.${renewalId}.rejectedAtMillis`]: Date.now(),
        });
    } else {
        throw new Error("No renewals found for user");
    }
};


//import { approveRenewal, rejectRenewal } from "@/src/services/renewMembership";

// const onApprove = async (item: any) => {
//   // userId is the user document id; in your users collection this is the email key
//   await approveRenewal({ userId: item.userEmail.toLowerCase().trim(), renewalId: item.id });
//   await fetchRenewals(); // refresh list
// };

// const onReject = async (item: any) => {
//   await rejectRenewal({ userId: item.userEmail.toLowerCase().trim(), renewalId: item.id });
//   await fetchRenewals(); // refresh list
// };