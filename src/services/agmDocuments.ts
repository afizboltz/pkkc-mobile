import { supabase } from "../config/supabase";
import type { AgmDocumentRow } from "../types/models";

export type AgmDocumentCategory = "agenda" | "financial_statement" | "resolution" | "minutes" | "other";

export const listAgmDocuments = async (eventId: string): Promise<AgmDocumentRow[]> => {
    const { data, error } = await supabase
        .from("agm_documents")
        .select("*")
        .eq("event_id", eventId)
        .order("uploaded_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
};

export const getAgmDocumentSignedUrl = async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage.from("agm_documents").createSignedUrl(filePath, 60 * 5);
    if (error || !data) throw error ?? new Error("Failed to create signed URL");
    return data.signedUrl;
};

export const uploadAgmDocument = async ({
    eventId,
    fileUri,
    fileName,
    title,
    category,
    uploadedBy,
}: {
    eventId: string;
    fileUri: string;
    fileName: string;
    title: string;
    category: AgmDocumentCategory;
    uploadedBy: string;
}): Promise<void> => {
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const documentId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const path = `${eventId}/${documentId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from("agm_documents")
        .upload(path, blob, { contentType: "application/pdf" });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from("agm_documents").insert({
        id: documentId,
        event_id: eventId,
        title,
        category,
        file_path: path,
        uploaded_by: uploadedBy,
    });
    if (insertError) throw insertError;
};
