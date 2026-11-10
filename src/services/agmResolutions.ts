import { supabase } from "../config/supabase";
import type { AgmResolutionRow, AgmResolutionTally } from "../types/models";

export const listAgmResolutions = async (eventId: string): Promise<AgmResolutionRow[]> => {
    const { data, error } = await supabase
        .from("agm_resolutions")
        .select("*")
        .eq("event_id", eventId)
        .order("sequence_no", { ascending: true });
    if (error) throw error;
    return data ?? [];
};

export const createAgmResolution = async ({
    eventId,
    sequenceNo,
    title,
    description,
}: {
    eventId: string;
    sequenceNo: number;
    title: string;
    description?: string;
}): Promise<void> => {
    const { error } = await supabase.from("agm_resolutions").insert({
        event_id: eventId,
        sequence_no: sequenceNo,
        title,
        description,
    });
    if (error) throw error;
};

export const openResolution = async (resolutionId: string): Promise<AgmResolutionRow> => {
    const { data, error } = await supabase.rpc("open_agm_resolution", { p_resolution_id: resolutionId });
    if (error) throw error;
    return data as AgmResolutionRow;
};

export const closeResolution = async (resolutionId: string): Promise<AgmResolutionRow> => {
    const { data, error } = await supabase.rpc("close_agm_resolution", { p_resolution_id: resolutionId });
    if (error) throw error;
    return data as AgmResolutionRow;
};

export const getResolutionTally = async (resolutionId: string): Promise<AgmResolutionTally> => {
    const { data, error } = await supabase.rpc("get_agm_resolution_tally", { p_resolution_id: resolutionId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return row as AgmResolutionTally;
};
