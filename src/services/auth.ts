import { supabase } from "../config/supabase";
import type { UserRow } from "../types/models";
import type { TablesInsert, TablesUpdate } from "../types/supabase";
import { createErrorReport, logError, logInfo, logPerformance, logUserAction } from "../utils/log";

const normalizeIc = (ic: string | undefined | null): string => (ic || "").replace(/\D+/g, "").trim();

// Camelcase shape mirroring the old Firestore user doc, so existing screens
// (profile.tsx, dashboard.tsx, renewMembership.tsx, etc.) don't need to change
// how they read userProfile fields just because the DB columns are snake_case.
export interface UserProfile {
    id: string;
    uid: string;
    email: string;
    fullName: string;
    phoneNo: string;
    icNo: string | null;
    birthDate: string | null;
    gender: string | null;
    maritalStatus: string | null;
    kitaResident: string | null;
    address: string | null;
    numberOfFamilyMembers: number | null;
    occupation: string | null;
    status: UserRow["status"];
    role: UserRow["role"];
    pkkcID: string | null;
    slipBayaranUrl: string | null;
    ack: boolean;
    membershipExpiry: string | null;
    approvedAtMillis?: number;
    approvedRemark: string | null;
    approvedBy: string | null;
    rejectedAtMillis?: number;
    rejectedRemark: string | null;
    rejectedBy: string | null;
    verifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
    renewals: { status: string }[];
    // Not backed by a DB column yet (wasn't in Firestore either); reserved for a future profile-photo feature.
    profileImage?: string;
}

export type PostAuthRouteName = "login" | "pending" | "dashboard" | "rejected" | "preLogin";

// Single source of truth for "which screen does this account belong on". Used both by
// app/index.tsx (routing on every app-state change) and by login.tsx/verifyAndSetPassword.tsx
// (routing right after a successful sign-in) so a pending/rejected account can never land on
// the dashboard just because one of those call sites forgot to check status.
export const getPostAuthRouteName = (profile: UserProfile | null | undefined): PostAuthRouteName => {
    if (!profile) return "login";
    switch (profile.status) {
        case "pending":
            return "pending";
        case "active":
            return "dashboard";
        case "rejected":
            return "rejected";
        default:
            return "preLogin";
    }
};

const mapUserRowToProfile = (row: UserRow, renewals: { status: string }[]): UserProfile => ({
    id: row.id,
    uid: row.id,
    email: row.email,
    fullName: row.full_name,
    phoneNo: row.phone_no,
    icNo: row.ic_no,
    birthDate: row.birth_date,
    gender: row.gender,
    maritalStatus: row.marital_status,
    kitaResident: row.kita_resident,
    address: row.address,
    numberOfFamilyMembers: row.number_of_family_members,
    occupation: row.occupation,
    status: row.status,
    role: row.role,
    pkkcID: row.pkkc_id,
    slipBayaranUrl: row.slip_bayaran_url,
    ack: row.ack,
    membershipExpiry: row.membership_expiry,
    approvedAtMillis: row.approved_at ? new Date(row.approved_at).getTime() : undefined,
    approvedRemark: row.approved_remark,
    approvedBy: row.approved_by,
    rejectedAtMillis: row.rejected_at ? new Date(row.rejected_at).getTime() : undefined,
    rejectedRemark: row.rejected_remark,
    rejectedBy: row.rejected_by,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    renewals,
});

export const registerUser = async (
    email: string,
    password: string,
    imageUri: string,
    data: {
        name: string;
        phone: string;
        ic: string;
        dob: string;
        gender: string;
        status: string;
        taman: string;
        address: string;
        household: string;
        occupation: string;
        ack: boolean;
    }
) => {
    const startTime = Date.now();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedIc = normalizeIc(data.ic);

    try {
        await logUserAction('registerUser_start', { email: normalizedEmail, hasImage: !!imageUri });

        // 1. Create the Supabase Auth account (or sign in, if this email already has one —
        // mirrors the old Firestore flow where a user could resume an in-progress registration).
        let authUserId: string;
        let session;
        const signUpResult = await supabase.auth.signUp({ email: normalizedEmail, password });

        if (signUpResult.error) {
            const alreadyRegistered =
                signUpResult.error.code === 'user_already_exists' ||
                /already registered|already exists/i.test(signUpResult.error.message);
            if (!alreadyRegistered) throw signUpResult.error;

            await logInfo('registerUser', 'Email already has an auth account, signing in instead');
            const signInResult = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
            if (signInResult.error) throw signInResult.error;
            authUserId = signInResult.data.user.id;
            session = signInResult.data.session;
        } else {
            if (!signUpResult.data.user) throw new Error("Sign up did not return a user");
            authUserId = signUpResult.data.user.id;
            session = signUpResult.data.session;
        }

        if (!session) {
            // "Confirm email" is enabled on this Supabase project — the user must verify
            // their email before they have a session, so we can't write their profile yet.
            await logInfo('registerUser', 'No session after sign up; email confirmation required');
            return { status: "pending_email_confirmation", type: "new" as const };
        }

        await logInfo('registerUser', 'Supabase Auth account ready', { uid: authUserId });

        // 2. Check whether a profile row already exists for this account.
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", authUserId)
            .maybeSingle();

        if (existingUser) {
            // A profile row already exists for this account, meaning it already went
            // through (or is going through) admin review once. Do NOT touch status
            // here — doing so used to set it straight to "active", which let a
            // pending/rejected applicant bypass admin approval just by re-running the
            // sign-up form with their original email/password. Let the real current
            // status (pending/active/rejected) keep driving routing, as it already
            // does elsewhere.
            await logInfo('registerUser', 'Existing user profile found, resuming without changing status');
            await logPerformance('registerUser_existing', startTime, { email: normalizedEmail });
            return { status: "success", type: "existing" as const, userId: authUserId };
        }

        // 3. New registration: upload the receipt, then insert the profile row.
        await logInfo('registerUser', 'New user registration process started');

        await logInfo('registerUser', 'Fetching image bytes');
        const response = await fetch(imageUri);
        const arraybuffer = await response.arrayBuffer();

        const path = `${authUserId}/registration/${Date.now()}.jpg`;
        await logInfo('registerUser', 'Uploading receipt to storage');
        const { error: uploadError } = await supabase.storage
            .from("receipts")
            .upload(path, arraybuffer, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        await logInfo('registerUser', 'Receipt uploaded successfully');

        await logInfo('registerUser', 'Writing user profile');
        const insertPayload: TablesInsert<"users"> = {
            id: authUserId,
            email: normalizedEmail,
            full_name: data.name || "",
            phone_no: data.phone || "",
            ic_no: normalizedIc || null,
            birth_date: data.dob || null,
            gender: data.gender || "",
            status: "pending",
            marital_status: data.status || "",
            kita_resident: data.taman || "",
            address: data.address || "",
            number_of_family_members: data.household ? Number(data.household) : null,
            occupation: data.occupation || "",
            role: "member",
            slip_bayaran_url: path,
            ack: !!data.ack,
        };
        const { data: insertedUser, error: insertError } = await supabase
            .from("users")
            .insert(insertPayload)
            .select()
            .single();
        if (insertError) throw insertError;
        await logInfo('registerUser', 'User profile written successfully');

        await logPerformance('registerUser_new', startTime, { email: normalizedEmail, pkkcId: insertedUser.pkkc_id });
        await logUserAction('registerUser_complete', { email: normalizedEmail, pkkcId: insertedUser.pkkc_id, type: 'new' });
        return { status: "success", type: "new" as const, userId: authUserId, user: insertedUser as UserRow };
    } catch (error: any) {
        await logError('registerUser', 'User registration failed', error, {
            email: normalizedEmail,
            hasImage: !!imageUri,
            step: 'registration_process'
        });
        await logPerformance('registerUser_error', startTime, { email: normalizedEmail, error: true });

        const { data: sessionData } = await supabase.auth.getSession();
        await createErrorReport(
            error,
            'registerUser',
            {
                email: normalizedEmail,
                imageUri: imageUri ? 'provided' : 'not_provided',
                userData: {
                    name: data.name,
                    phone: data.phone,
                    ic: normalizedIc,
                    hasData: Object.keys(data).length > 0
                }
            },
            sessionData.session?.user.id,
            normalizedEmail
        );

        throw error;
    }
};

export const loginUser = async (email: string, password: string) => {
    const startTime = Date.now();
    const normalizedEmail = email.toLowerCase().trim();

    try {
        await logUserAction('loginUser_start', { email: normalizedEmail });
        const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        });
        if (error) throw error;

        await logPerformance('loginUser', startTime, { email: normalizedEmail, success: true });
        await logUserAction('loginUser_success', { email: normalizedEmail });
        return data;
    } catch (error: any) {
        await logError('loginUser', 'User login failed', error, {
            email: normalizedEmail,
            errorCode: error.code
        });
        await logPerformance('loginUser', startTime, { email: normalizedEmail, success: false });

        await createErrorReport(error, 'loginUser', { email: normalizedEmail }, undefined, normalizedEmail);

        throw error;
    }
};

export const loginWithIcNo = async (icNo: string, password: string) => {
    const startTime = Date.now();
    const normalizedIc = normalizeIc(icNo);

    try {
        await logUserAction('loginWithIcNo_start', { icNo: normalizedIc });

        if (!normalizedIc) {
            throw new Error("IC not found");
        }

        // Pre-auth RPC: resolves IC -> email without exposing the users table to anon.
        const { data: email, error: rpcError } = await supabase.rpc('resolve_ic_to_email', {
            p_ic_no: normalizedIc,
        });
        if (rpcError) throw rpcError;
        if (!email) {
            throw new Error("IC not found");
        }

        await logInfo('loginWithIcNo', 'IC to email lookup resolved', { ic: normalizedIc, email });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        await logPerformance('loginWithIcNo', startTime, { ic: normalizedIc, success: true });
        await logUserAction('loginWithIcNo_success', { ic: normalizedIc, email });

        return data;
    } catch (error: any) {
        await logError('loginWithIcNo', 'IC login failed', error, {
            icNo: normalizedIc,
            errorCode: error.code
        });
        await logPerformance('loginWithIcNo', startTime, { icNo: normalizedIc, success: false });

        await createErrorReport(error, 'loginWithIcNo', { icNo: normalizedIc });

        throw error;
    }
};

export const logoutUser = async () => {
    const startTime = Date.now();

    try {
        const { data: sessionData } = await supabase.auth.getSession();
        await logUserAction('logoutUser_start', { uid: sessionData.session?.user.id });
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        await logPerformance('logoutUser', startTime, { success: true });
        await logUserAction('logoutUser_success', { uid: sessionData.session?.user.id });
    } catch (error: any) {
        await logError('logoutUser', 'User logout failed', error);
        await logPerformance('logoutUser', startTime, { success: false });
        throw error;
    }
};

// Result of the `self_verify_and_set_password` RPC. 'invalid' deliberately
// covers both "wrong IC" and "wrong email" so the caller can never learn
// which field was wrong.
export type SelfVerifyResult = "ok" | "invalid" | "throttled";

// Unified flow: used both as the temporary bootstrap for migrated users
// (no usable password yet) and as the permanent "Forgot password?" flow for
// everyone, forever. On "ok", signs the user straight in with the new password.
export const selfVerifyAndSetPassword = async (
    icNo: string,
    email: string,
    newPassword: string
) => {
    const normalizedIc = normalizeIc(icNo);
    const normalizedEmail = email.toLowerCase().trim();

    try {
        await logUserAction('selfVerifyAndSetPassword_start', { icNo: normalizedIc });

        const { data: result, error } = await supabase.rpc('self_verify_and_set_password', {
            p_ic_no: normalizedIc,
            p_email: normalizedEmail,
            p_new_password: newPassword,
        });
        if (error) throw error;

        const outcome = result as SelfVerifyResult;
        await logUserAction('selfVerifyAndSetPassword_result', { icNo: normalizedIc, outcome });

        if (outcome !== 'ok') {
            return { outcome };
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: newPassword,
        });
        if (signInError) throw signInError;

        return { outcome: 'ok' as const, session: data.session };
    } catch (error: any) {
        await logError('selfVerifyAndSetPassword', 'Self-verify/set-password failed', error, {
            icNo: normalizedIc,
        });
        throw error;
    }
};

// Self-service password change for an already-authenticated user.
export const changePassword = async (newPassword: string) => {
    try {
        await logUserAction('changePassword_start', {});
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        await logUserAction('changePassword_success', {});
    } catch (error: any) {
        await logError('changePassword', 'Change password failed', error);
        throw error;
    }
};

export type ResubmitResult = "ok" | "too_soon";

// Self-service "resubmit for review" for a rejected applicant. The DB trigger
// private.protect_privileged_user_columns only allows this specific
// rejected -> pending transition (with rejected_* cleared) for the row's own
// owner, and raises 'resubmit_too_soon' if attempted within 24h of the
// rejection — everything else about this row stays admin-only.
export const resubmitApplication = async (newReceiptUri?: string): Promise<{ outcome: ResubmitResult }> => {
    try {
        await logUserAction('resubmitApplication_start', {});

        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        if (!userId) throw new Error("Not signed in");

        const updatePayload: TablesUpdate<"users"> = {
            status: "pending",
            rejected_at: null,
            rejected_remark: null,
            rejected_by: null,
        };

        if (newReceiptUri) {
            const response = await fetch(newReceiptUri);
            const arraybuffer = await response.arrayBuffer();
            const path = `${userId}/registration/${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from("receipts")
                .upload(path, arraybuffer, { contentType: "image/jpeg" });
            if (uploadError) throw uploadError;
            updatePayload.slip_bayaran_url = path;
        }

        const { error } = await supabase.from("users").update(updatePayload).eq("id", userId);
        if (error) {
            if (/resubmit_too_soon/i.test(error.message)) {
                await logUserAction('resubmitApplication_throttled', {});
                return { outcome: "too_soon" };
            }
            throw error;
        }

        await logUserAction('resubmitApplication_success', {});
        return { outcome: "ok" };
    } catch (error: any) {
        await logError('resubmitApplication', 'Resubmit application failed', error);
        throw error;
    }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const startTime = Date.now();

    try {
        await logInfo('getUserProfile', 'Fetching user profile', { userId });

        const { data: userRow, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
        if (error) throw error;

        if (!userRow) {
            await logPerformance('getUserProfile', startTime, { userId, found: false });
            return null;
        }

        const { data: renewalRows, error: renewalsError } = await supabase
            .from("renewals")
            .select("status")
            .eq("user_id", userId);
        if (renewalsError) throw renewalsError;

        await logPerformance('getUserProfile', startTime, { userId, found: true });

        return mapUserRowToProfile(userRow, renewalRows ?? []);
    } catch (error: any) {
        await logError('getUserProfile', 'Failed to get user profile', error, { userId });
        await logPerformance('getUserProfile', startTime, { userId, error: true });
        throw error;
    }
};
