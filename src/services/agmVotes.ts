import { supabase } from "../config/supabase";
import type { AgmVoteRow } from "../types/models";

export type AgmVoteChoice = "yes" | "no" | "abstain";

export const castVote = async ({
    resolutionId,
    userId,
    choice,
}: {
    resolutionId: string;
    userId: string;
    choice: AgmVoteChoice;
}): Promise<void> => {
    const { error } = await supabase.from("agm_votes").insert({
        resolution_id: resolutionId,
        user_id: userId,
        choice,
    });
    if (error) throw error;
};

export const getMyVote = async (resolutionId: string, userId: string): Promise<AgmVoteRow | null> => {
    const { data, error } = await supabase
        .from("agm_votes")
        .select("*")
        .eq("resolution_id", resolutionId)
        .eq("user_id", userId)
        .maybeSingle();
    if (error) throw error;
    return data;
};
