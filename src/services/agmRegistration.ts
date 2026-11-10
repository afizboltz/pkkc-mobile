import { supabase } from "../config/supabase";
import type { AgmCodeRow } from "../types/models";

export type ClaimAgmCodeReason =
    | "not_authenticated"
    | "no_active_event"
    | "already_registered"
    | "already_claimed"
    | "invalid_code"
    | "unknown";

const KNOWN_REASONS: ClaimAgmCodeReason[] = [
    "not_authenticated",
    "no_active_event",
    "already_registered",
    "already_claimed",
    "invalid_code",
];

export class ClaimAgmCodeError extends Error {
    reason: ClaimAgmCodeReason;
    constructor(reason: ClaimAgmCodeReason, message: string) {
        super(message);
        this.reason = reason;
    }
}

// Atomically claims a badge code for the signed-in member via the claim_agm_code RPC,
// which does the real race-safe work; this just maps its error text to a reason the UI
// can branch on.
export const claimAgmCode = async (code: string): Promise<AgmCodeRow> => {
    const { data, error } = await supabase.rpc("claim_agm_code", { p_code: code });
    if (error) {
        const reason = KNOWN_REASONS.find((r) => error.message.includes(r)) ?? "unknown";
        throw new ClaimAgmCodeError(reason, error.message);
    }
    return data as AgmCodeRow;
};

export const getMyClaimedCode = async (eventId: string, userId: string): Promise<AgmCodeRow | null> => {
    const { data, error } = await supabase
        .from("agm_codes")
        .select("*")
        .eq("event_id", eventId)
        .eq("claimed_by", userId)
        .maybeSingle();
    if (error) throw error;
    return data;
};
