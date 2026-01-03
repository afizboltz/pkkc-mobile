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
