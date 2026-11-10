import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { supabase } from "../config/supabase";
import { logError, logInfo } from "../utils/log";

const EAS_PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Called after a successful login/signup. Approval/rejection pushes are sent
// server-side (DB trigger + pg_net), so this only needs to keep the current
// device's token registered — it's fire-and-forget and must never block or
// fail the caller's login/signup flow.
export const registerForPushNotificationsAsync = async (userId: string): Promise<void> => {
    try {
        if (!Device.isDevice) {
            // Push tokens aren't available on simulators/emulators.
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            await logInfo("pushNotifications", "Permission not granted, skipping token registration");
            return;
        }

        if (!EAS_PROJECT_ID) {
            await logInfo("pushNotifications", "No EAS projectId configured, skipping token registration");
            return;
        }

        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });

        const { error } = await supabase
            .from("user_push_tokens")
            .upsert(
                {
                    user_id: userId,
                    token,
                    platform: Platform.OS,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id,token" }
            );
        if (error) throw error;

        await logInfo("pushNotifications", "Push token registered");
    } catch (error: any) {
        // Never let a push-registration failure break login/signup.
        await logError("pushNotifications", "Failed to register push token", error);
    }
};

// Called on logout, so a reinstalled/shared device doesn't keep receiving a
// previous user's notifications.
export const unregisterCurrentDevicePushToken = async (userId: string): Promise<void> => {
    try {
        if (!Device.isDevice || !EAS_PROJECT_ID) return;

        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
        const { error } = await supabase
            .from("user_push_tokens")
            .delete()
            .eq("user_id", userId)
            .eq("token", token);
        if (error) throw error;
    } catch (error: any) {
        await logError("pushNotifications", "Failed to unregister push token", error);
    }
};
