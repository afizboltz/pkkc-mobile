import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { getUserProfile } from "../services/auth";

interface AuthState {
    userProfile: any | null;
    loading: boolean;
}

export function useAuth(): AuthState {
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userProfile = await getUserProfile(firebaseUser.email!);
                setUserProfile(userProfile);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe; // cleanup listener
    }, []);

    return { userProfile, loading };
}
