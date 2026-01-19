import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { getAllUsers } from "./users";

// Build a normalized view model for the UI from a raw user document
const mapUserForList = (u: any) => {
    const createdAt = u?.createdAt;
    const submittedAtMillis = typeof createdAt?.seconds === 'number'
        ? createdAt.seconds * 1000
        : (typeof createdAt?.toMillis === 'function' ? createdAt.toMillis() : undefined);

    return {
        id: u.email || u.id,
        userFullName: u.fullName || u.name || "-",
        userEmail: u.email || u.id,
        // No amount for new registration; keep API-compatible with UI
        amount: undefined,
        submittedAtMillis,
        submittedAt: createdAt,
        slipBayaranUrl: u.slipBayaranUrl,
        status: (u.status || "").toLowerCase(),
    } as any;
};

export const getPendingNewUsers = async () => {
    const users = await getAllUsers();
    const pending = (users as any[])
        .filter(u => (u?.status || '').toLowerCase() === 'pending')
        .map(mapUserForList);

    pending.sort((a: any, b: any) => (b.submittedAtMillis || 0) - (a.submittedAtMillis || 0));
    return pending;
};

export const getApprovedNewUsers = async () => {
    const users = await getAllUsers();
    const approved = (users as any[])
        .filter(u => (u?.status || '').toLowerCase() === 'active')
        .map((u: any) => {
            const item = mapUserForList(u);
            item.approvedAtMillis = u.approvedAtMillis || undefined;
            return item;
        });

    approved.sort((a: any, b: any) => (b.approvedAtMillis || 0) - (a.approvedAtMillis || 0));
    return approved;
};

export const approveNewUser = async ({ userId, remark, by }: { userId: string; remark?: string; by?: string }) => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("User not found");

    const now = Date.now();
    // First year membership from today
    const next = new Date(now);
    next.setFullYear(next.getFullYear() + 1);
    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, '0');
    const dd = String(next.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;

    await updateDoc(userRef, {
        status: 'active',
        approvedAtMillis: now,
        ...(remark ? { approvedRemark: remark } : {}),
        ...(by ? { approvedBy: by } : {}),
        membershipExpiry: formatted,
        role: 'user',
    });
};

export const rejectNewUser = async ({ userId, remark, by }: { userId: string; remark?: string; by?: string }) => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("User not found");

    await updateDoc(userRef, {
        status: 'rejected',
        rejectedAtMillis: Date.now(),
        ...(remark ? { rejectedRemark: remark } : {}),
        ...(by ? { rejectedBy: by } : {}),
    });
};
