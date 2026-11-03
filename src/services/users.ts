import { supabase } from "../config/supabase";
import type { UserRow } from "../types/models";

export const getAllUsers = async (): Promise<UserRow[]> => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    return data ?? [];
};
