import { useGuest } from "@/src/contexts/GuestContext";
import { useAuth } from "./useAuth";

export type AccessLevel = "member" | "guest";

// Single place for screens to branch on "what can this person see", instead
// of scattering isGuest/userProfile checks ad hoc. A screen reachable from
// both the dashboard grid and the Komuniti hub should read this once rather
// than re-deriving it from useAuth()/useGuest() separately.
export function useAccessLevel(): AccessLevel {
    const { userProfile } = useAuth();
    const { isGuest } = useGuest();

    if (userProfile) return "member";
    if (isGuest) return "guest";

    // Neither authenticated nor an explicit guest: shouldn't normally render
    // (the root index.tsx gate sends this case to preLogin), but default to
    // the more restrictive level rather than leaking member-only content.
    return "guest";
}
