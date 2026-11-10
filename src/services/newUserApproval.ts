import { supabase } from "../config/supabase";
import type { UserRow } from "../types/models";

// Build a normalized view model for the UI from a user row.
const mapUserForList = (u: UserRow) => ({
    id: u.id,
    userFullName: u.full_name || "-",
    userEmail: u.email,
    phoneNo: u.phone_no,
    // No amount for new registration; keep API-compatible with the renewal list UI.
    amount: undefined as number | undefined,
    submittedAtMillis: new Date(u.created_at).getTime(),
    submittedAt: u.created_at,
    slipBayaranUrl: u.slip_bayaran_url,
    status: u.status,
});

export const getPendingNewUsers = async () => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapUserForList);
};

export const getApprovedNewUsers = async () => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("status", "active")
        .order("approved_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((u) => ({
        ...mapUserForList(u),
        approvedAtMillis: u.approved_at ? new Date(u.approved_at).getTime() : undefined,
    }));
};

export const approveNewUser = async ({ userId, remark, by }: { userId: string; remark?: string; by?: string }) => {
    const next = new Date();
    next.setFullYear(next.getFullYear() + 1);
    const membershipExpiry = next.toISOString().slice(0, 10);

    const { error } = await supabase
        .from("users")
        .update({
            status: "active",
            approved_at: new Date().toISOString(),
            approved_remark: remark,
            approved_by: by,
            membership_expiry: membershipExpiry,
            role: "user",
        })
        .eq("id", userId)
        .select()
        .single();
    if (error) throw new Error(error.message === "JSON object requested, multiple (or no) rows returned" ? "User not found" : error.message);
};

export const rejectNewUser = async ({ userId, remark, by }: { userId: string; remark?: string; by?: string }) => {
    const { error } = await supabase
        .from("users")
        .update({
            status: "rejected",
            rejected_at: new Date().toISOString(),
            rejected_remark: remark,
            rejected_by: by,
        })
        .eq("id", userId)
        .select()
        .single();
    if (error) throw new Error(error.message === "JSON object requested, multiple (or no) rows returned" ? "User not found" : error.message);
};
