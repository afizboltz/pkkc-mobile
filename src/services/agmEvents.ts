import { supabase } from "../config/supabase";
import type { AgmEventRow } from "../types/models";

export const getActiveAgmEvent = async (): Promise<AgmEventRow | null> => {
    const { data, error } = await supabase
        .from("agm_events")
        .select("*")
        .eq("status", "active")
        .eq("is_test", false)
        .maybeSingle();
    if (error) throw error;
    return data;
};
