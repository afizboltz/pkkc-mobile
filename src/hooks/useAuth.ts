import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { getUserProfile } from "../services/auth";
import { printLog } from "../utils/log";

interface AuthState {
    user: User | null;
    userProfile: any | null;
    loading: boolean;
}

export function useAuth(): AuthState {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            printLog('firebaseUser', firebaseUser)
            if (firebaseUser) {
                setUser(firebaseUser);
                const userProfile = await getUserProfile(firebaseUser.email!);
                printLog('userProfile', userProfile)
                setUserProfile(userProfile);
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe; // cleanup listener
    }, []);

    return { user, userProfile, loading };
}
