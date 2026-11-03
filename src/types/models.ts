import type { Tables } from "./supabase";

export type UserRow = Tables<"users">;
export type RenewalRow = Tables<"renewals">;
export type AnnouncementRow = Tables<"announcements">;
export type ErrorLogRow = Tables<"error_logs">;
export type ErrorReportRow = Tables<"error_reports">;
