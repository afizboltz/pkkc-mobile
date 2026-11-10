import React, { createContext, useContext, useState } from "react";

// In-memory only: a guest who force-closes the app returns to onboarding on
// next launch rather than resuming a guest session. Guest mode is a
// lightweight public-browsing mode, not a persisted identity.
interface GuestContextValue {
    isGuest: boolean;
    enterGuestMode: () => void;
    exitGuestMode: () => void;
}

const GuestContext = createContext<GuestContextValue>({
    isGuest: false,
    enterGuestMode: () => {},
    exitGuestMode: () => {},
});

export function GuestProvider({ children }: { children: React.ReactNode }) {
    const [isGuest, setIsGuest] = useState(false);

    const value: GuestContextValue = {
        isGuest,
        enterGuestMode: () => setIsGuest(true),
        exitGuestMode: () => setIsGuest(false),
    };

    return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

export function useGuest(): GuestContextValue {
    return useContext(GuestContext);
}
