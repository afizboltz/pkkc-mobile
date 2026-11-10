import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../config/supabase";
import { getUserProfile, type UserProfile } from "../services/auth";
import { registerForPushNotificationsAsync, unregisterCurrentDevicePushToken } from "../services/pushNotifications";

interface AuthContextValue {
    userProfile: UserProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({ userProfile: null, loading: true, refreshProfile: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const lastUserIdRef = useRef<string | undefined>(undefined);
    const hydrateProfileRef = useRef<(userId: string | undefined) => Promise<void>>(async () => {});

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
                lastUserIdRef.current = userId;
                // Fire-and-forget: re-registers the device's push token on every
                // login/app-foreground, which also handles token rotation.
                registerForPushNotificationsAsync(userId);
            } catch (error) {
                console.error("Failed to load user profile", error);
                if (isMounted) setUserProfile(null);
            }
        };
        hydrateProfileRef.current = hydrateProfile;

        // A single shared listener (instead of one per useAuth() call site) backs every
        // consumer of this context. It also covers the initial cold-start session: Supabase
        // always fires an INITIAL_SESSION event right after this subscription is registered,
        // carrying the persisted session — so there's no need to also call getSession()
        // separately. Doing both used to race two concurrent hydrateProfile() calls for the
        // same session, where a slow/failing second call could null out a profile the first
        // one had already set, bouncing the user back to the login screen after relaunch.
        // TOKEN_REFRESHED/USER_UPDATED don't change which profile applies, so we skip
        // refetching on those to avoid redundant queries and UI flicker.
        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
                return;
            }
            if (event === "SIGNED_OUT") {
                if (lastUserIdRef.current) {
                    unregisterCurrentDevicePushToken(lastUserIdRef.current);
                    lastUserIdRef.current = undefined;
                }
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

    const refreshProfile = async () => {
        await hydrateProfileRef.current(lastUserIdRef.current);
    };

    return <AuthContext.Provider value={{ userProfile, loading, refreshProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
