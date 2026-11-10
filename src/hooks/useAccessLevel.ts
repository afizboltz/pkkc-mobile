import { useGuest } from "@/src/contexts/GuestContext";
import { useAuth } from "./useAuth";

export type AccessLevel = "member" | "guest";

// Single place for screens to branch on "what can this person see", instead
// of scattering isGuest/userProfile checks ad hoc. A screen reachable from
// both the dashboard grid and the Komuniti hub should read this once rather
// than re-deriving it from useAuth()/useGuest() separately.
export function useAccessLevel(): AccessLevel {
    const { userProfile, loading } = useAuth();
    const { isGuest } = useGuest();

    if (isGuest) return "guest";
    if (userProfile) return "member";

    // A real member's profile briefly reads as null right after sign-in,
    // while AuthContext is still hydrating it from the SIGNED_IN event —
    // don't guest-gate that window. Guest mode is always an explicit opt-in
    // (isGuest, checked above) so this can't mask a genuine guest.
    if (loading) return "member";

    // Neither authenticated nor an explicit guest: shouldn't normally render
    // (the root index.tsx gate sends this case to preLogin), but default to
    // the more restrictive level rather than leaking member-only content.
    return "guest";
}
