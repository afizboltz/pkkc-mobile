import { supabase } from "../config/supabase";
import type { AgmCodeRow } from "../types/models";

export const generateAgmCodes = async (eventId: string, count: number): Promise<AgmCodeRow[]> => {
    const { data, error } = await supabase.rpc("generate_agm_codes", { p_event_id: eventId, p_count: count });
    if (error) throw error;
    return (data ?? []) as AgmCodeRow[];
};

export const listAgmCodes = async (eventId: string) => {
    const { data, error } = await supabase
        .from("agm_codes")
        .select("*, users(full_name)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
        id: row.id as string,
        code: row.code as string,
        status: row.status as AgmCodeRow["status"],
        claimedByName: (row.users?.full_name as string | undefined) ?? null,
        claimedAt: row.claimed_at as string | null,
    }));
};

export const getQuorumCount = async (eventId: string): Promise<number> => {
    const { count, error } = await supabase
        .from("agm_codes")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("status", "claimed");
    if (error) throw error;
    return count ?? 0;
};
