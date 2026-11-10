import type { Tables } from "./supabase";

export type UserRow = Tables<"users">;
export type RenewalRow = Tables<"renewals">;
export type AnnouncementRow = Tables<"announcements">;
export type ErrorLogRow = Tables<"error_logs">;
export type ErrorReportRow = Tables<"error_reports">;

export type AgmEventRow = Tables<"agm_events">;
export type AgmCodeRow = Tables<"agm_codes">;
export type AgmDocumentRow = Tables<"agm_documents">;
export type AgmResolutionRow = Tables<"agm_resolutions">;
export type AgmVoteRow = Tables<"agm_votes">;
export type AgmResolutionTally = {
  yes_count: number;
  no_count: number;
  abstain_count: number;
  total: number;
  visible: boolean;
};
