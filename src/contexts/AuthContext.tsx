import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { getUserProfile, type UserProfile } from "../services/auth";

interface AuthContextValue {
    userProfile: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ userProfile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const hydrateProfile = async (userId: string | undefined) => {
            if (!userId) {
                if (isMounted) setUserProfile(null);
                return;
            }
            try {
                const profile = await getUserProfile(userId);
                if (isMounted) setUserProfile(profile);
            } catch (error) {
                console.error("Failed to load user profile", error);
                if (isMounted) setUserProfile(null);
            }
        };

        supabase.auth.getSession().then(({ data }) => {
            hydrateProfile(data.session?.user.id).finally(() => {
                if (isMounted) setLoading(false);
            });
        });

        // A single shared listener (instead of one per useAuth() call site) backs every
        // consumer of this context. TOKEN_REFRESHED/USER_UPDATED don't change which profile
        // applies, so we skip refetching on those to avoid redundant queries and UI flicker.
        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
                return;
            }
            if (event === "SIGNED_OUT") {
                if (isMounted) {
                    setUserProfile(null);
                    setLoading(false);
                }
                return;
            }
            hydrateProfile(session?.user.id).finally(() => {
                if (isMounted) setLoading(false);
            });
        });

        return () => {
            isMounted = false;
            subscription.subscription.unsubscribe();
        };
    }, []);

    return <AuthContext.Provider value={{ userProfile, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
