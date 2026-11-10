import { supabase } from "../config/supabase";

export const getAnnouncements = async () => {
    const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;

    return (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        description: row.description,
        images: row.images,
        date: row.date,
        createdAt: row.created_at,
    }));
};
