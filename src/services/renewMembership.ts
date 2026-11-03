import { supabase } from "../config/supabase";
import type { RenewalRow } from "../types/models";
import type { TablesInsert } from "../types/supabase";

type RenewalJoinRow = RenewalRow & { users: { full_name: string; email: string } | null };

const notFoundToError = (message: string) =>
    message === "JSON object requested, multiple (or no) rows returned" ? "Renewal not found" : message;

const mapRenewal = (r: RenewalJoinRow) => ({
    id: r.id,
    userId: r.user_id,
    userFullName: r.users?.full_name || "-",
    userEmail: r.users?.email || "-",
    kind: r.kind,
    amount: r.amount,
    status: r.status,
    paymentMethod: r.payment_method,
    screenshotUrl: r.screenshot_url,
    certificateUrl: r.certificate_url,
    submittedAtMillis: new Date(r.submitted_at).getTime(),
    submittedAt: r.submitted_at,
    approvedAtMillis: r.approved_at ? new Date(r.approved_at).getTime() : undefined,
});

export const getPendingRenewals = async () => {
    const { data, error } = await supabase
        .from("renewals")
        .select("*, users(full_name, email)")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapRenewal(r as unknown as RenewalJoinRow));
};

export const getApprovedRenewals = async () => {
    const { data, error } = await supabase
        .from("renewals")
        .select("*, users(full_name, email)")
        .eq("status", "approved")
        .order("approved_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapRenewal(r as unknown as RenewalJoinRow));
};

// Approve a renewal by its own id (the users row it belongs to is read off the renewal itself).
export const approveRenewal = async ({ renewalId, remark, by }: { renewalId: string; remark?: string; by?: string }) => {
    const { data: renewal, error } = await supabase
        .from("renewals")
        .update({
            status: "approved",
            approved_at: new Date().toISOString(),
            approved_remark: remark,
            approved_by: by,
        })
        .eq("id", renewalId)
        .select()
        .single();
    if (error) throw new Error(notFoundToError(error.message));

    const nextYear = new Date().getFullYear() + 1;
    const membershipExpiry = `${nextYear}-12-31`;
    const { error: userUpdateError } = await supabase
        .from("users")
        .update({ membership_expiry: membershipExpiry })
        .eq("id", renewal.user_id);
    if (userUpdateError) throw userUpdateError;
};

export const rejectRenewal = async ({ renewalId, remark, by }: { renewalId: string; remark?: string; by?: string }) => {
    const { error } = await supabase
        .from("renewals")
        .update({
            status: "rejected",
            rejected_at: new Date().toISOString(),
            rejected_remark: remark,
            rejected_by: by,
        })
        .eq("id", renewalId)
        .select()
        .single();
    if (error) throw new Error(notFoundToError(error.message));
};

// Member-facing: submit a new renewal (payment or certificate) with its receipt/certificate image.
export const submitRenewal = async ({
    userId,
    kind,
    imageUri,
}: {
    userId: string;
    kind: "payment" | "certificate";
    imageUri: string;
}) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Supabase Storage path owner-prefix must be set before the renewal row exists, so the
    // renewal's own id is generated client-side here (gen_random_uuid() equivalent).
    const renewalId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const path = `${userId}/renewals/${renewalId}/${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, blob, { contentType: "image/jpeg" });
    if (uploadError) throw uploadError;

    const insertPayload: TablesInsert<"renewals"> = {
        id: renewalId,
        user_id: userId,
        kind,
        amount: kind === "certificate" ? 0 : 5,
        status: "pending",
    };
    if (kind === "certificate") {
        insertPayload.certificate_url = path;
    } else {
        insertPayload.screenshot_url = path;
        insertPayload.payment_method = "bank_transfer";
    }

    const { error: insertError } = await supabase.from("renewals").insert(insertPayload);
    if (insertError) throw insertError;
};

export type RenewalStatus = "near_expiry" | "pending" | "completed";

export const getRenewalStatusFromProfile = (
    profile: { renewals?: { status: string }[]; membershipExpiry?: string | null } | null | undefined
): RenewalStatus => {
    const hasPending = (profile?.renewals ?? []).some((r) => r.status === "pending");
    if (hasPending) return "pending";

    if (profile?.membershipExpiry) {
        const expiryMillis = new Date(profile.membershipExpiry).getTime();
        if (!isNaN(expiryMillis) && expiryMillis >= Date.now()) return "completed";
    }

    return "near_expiry";
};
