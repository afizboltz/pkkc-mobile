import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import app, { auth, db } from "../config/firebase";
import { createErrorReport, logError, logInfo, logPerformance, logUserAction } from "../utils/log";

const storage = getStorage(app);

// Function to generate next PKKC ID
const generateNextPkkcId = async (): Promise<string> => {
    const startTime = Date.now();
    try {
        await logInfo('generateNextPkkcId', 'Fetching latest PKKC ID');

        // Query users collection to find the highest PKKC ID
        const usersQuery = query(
            collection(db, "users"),
            orderBy("pkkcID", "desc"),
            limit(1)
        );

        const querySnapshot = await getDocs(usersQuery);

        if (querySnapshot.empty) {
            // No existing PKKC IDs found, start with PKKC-0001
            await logInfo('generateNextPkkcId', 'No existing PKKC IDs found, starting with PKKC-0001');
            await logPerformance('generateNextPkkcId', startTime, { result: 'PKKC-0001' });
            return "PKKC-0001";
        }

        const latestDoc = querySnapshot.docs[0];
        const latestPkkcId = latestDoc.data().pkkcID;

        if (!latestPkkcId || typeof latestPkkcId !== 'string') {
            await logInfo('generateNextPkkcId', 'Invalid latest PKKC ID found, starting with PKKC-0001');
            await logPerformance('generateNextPkkcId', startTime, { result: 'PKKC-0001' });
            return "PKKC-0001";
        }

        // Extract numeric part from PKKC-XXXX format
        const match = latestPkkcId.match(/PKKC-(\d+)/);
        if (!match) {
            await logInfo('generateNextPkkcId', 'Latest PKKC ID format invalid, starting with PKKC-0001');
            await logPerformance('generateNextPkkcId', startTime, { result: 'PKKC-0001' });
            return "PKKC-0001";
        }

        const currentNumber = parseInt(match[1], 10);
        const nextNumber = currentNumber + 1;

        // Format with leading zeros (4 digits)
        const nextPkkcId = `PKKC-${nextNumber.toString().padStart(4, '0')}`;

        await logInfo('generateNextPkkcId', `Generated next PKKC ID: ${nextPkkcId}`);
        await logPerformance('generateNextPkkcId', startTime, { result: nextPkkcId });
        return nextPkkcId;

    } catch (error: any) {
        await logError('generateNextPkkcId', 'Failed to generate PKKC ID', error, { fallback: 'PKKC-0001' });
        await logPerformance('generateNextPkkcId', startTime, { result: 'PKKC-0001', error: true });
        // Fallback to PKKC-0001 if there's an error
        return "PKKC-0001";
    }
};

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
    const normalizedIc = (data.ic || "").replace(/\D+/g, "").trim();

    try {
        await logUserAction('registerUser_start', { email: normalizedEmail, hasImage: !!imageUri });

        // 1️⃣ Create the Firebase Auth account first
        const authUser = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await logInfo('registerUser', 'Firebase Auth account created successfully', { uid: authUser.user.uid });

        // 2️⃣ Optional: sign in the user immediately so Firestore rules recognize them
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
        await logInfo('registerUser', 'User signed in successfully');

        // 3️⃣ Now read Firestore safely
        const userRef = doc(db, "users", normalizedEmail);
        const userSnap = await getDoc(userRef);

        // 4️⃣ Two flows
        if (userSnap.exists()) {
            // Existing user in Firestore
            await logInfo('registerUser', 'Existing user found in Firestore, updating profile');
            await setDoc(
                userRef,
                {
                    uid: authUser.user.uid,
                    verifiedAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    status: "active",
                },
                { merge: true }
            );

            await logPerformance('registerUser_existing', startTime, { email: normalizedEmail });
            return { status: "success", type: "existing", authUser };
        } else {
            // New user registering
            await logInfo('registerUser', 'New user registration process started');

            // Generate PKKC ID
            const pkkcID = await generateNextPkkcId();

            // fetch file bytes
            await logInfo('registerUser', 'Fetching image bytes');
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // create storage path
            const filename = `registerUser/${authUser.user.uid}/${Date.now()}.jpg`;
            const sRef = storageRef(storage, filename);
            await logInfo('registerUser', 'Uploading receipt to storage');
            await uploadBytes(sRef, blob, { contentType: "image/jpeg" });
            const url = await getDownloadURL(sRef);
            await logInfo('registerUser', 'Receipt uploaded successfully');

            await logInfo('registerUser', 'Writing user profile to Firestore');
            await setDoc(userRef, {
                uid: authUser.user.uid,
                email: normalizedEmail,
                fullName: data.name || "",
                phoneNo: data.phone || "",
                icNo: normalizedIc,
                birthDate: data.dob || "",
                gender: data.gender || "",
                status: "pending", // admin must approve
                maritalStatus: data.status || "",
                kitaResident: data.taman || "",
                address: data.address || "",
                numberOfFamilyMembers: data.household || "",
                occupation: data.occupation || "",
                createdAt: serverTimestamp(),
                role: "member", // member | admin | ajk
                slipBayaranUrl: url,
                ack: !!data.ack,
                updatedAt: serverTimestamp(),
                pkkcID: pkkcID,
            });
            await logInfo('registerUser', 'User profile written successfully');

            if (normalizedIc) {
                await logInfo('registerUser', 'Writing icToEmail mapping');
                const mapRef = doc(db, "icToEmail", normalizedIc);
                await setDoc(
                    mapRef,
                    {
                        email: normalizedEmail,
                        uid: authUser.user.uid,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                );
                await logInfo('registerUser', 'icToEmail mapping written successfully');
            }

            await logPerformance('registerUser_new', startTime, { email: normalizedEmail, pkkcID });
            await logUserAction('registerUser_complete', { email: normalizedEmail, pkkcID, type: 'new' });
            return { status: "success", type: "new", authUser };
        }
    } catch (error: any) {
        await logError('registerUser', 'User registration failed', error, {
            email: normalizedEmail,
            hasImage: !!imageUri,
            step: 'registration_process'
        });
        await logPerformance('registerUser_error', startTime, { email: normalizedEmail, error: true });

        // Create detailed error report for debugging
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
            auth.currentUser?.uid,
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
        const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        await logPerformance('loginUser', startTime, { email: normalizedEmail, success: true });
        await logUserAction('loginUser_success', { email: normalizedEmail });
        return result;
    } catch (error: any) {
        await logError('loginUser', 'User login failed', error, {
            email: normalizedEmail,
            errorCode: error.code
        });
        await logPerformance('loginUser', startTime, { email: normalizedEmail, success: false });

        await createErrorReport(
            error,
            'loginUser',
            { email: normalizedEmail },
            auth.currentUser?.uid,
            normalizedEmail
        );

        throw error;
    }
};

export const loginWithIcNo = async (icNo: string, password: string) => {
    const startTime = Date.now();

    try {
        await logUserAction('loginWithIcNo_start', { icNo: icNo.replace(/\D/g, '') });

        // Normalize IC: keep digits only
        const normalizedIc = (icNo || "").replace(/\D+/g, "").trim();
        if (!normalizedIc) {
            throw new Error("IC not found");
        }

        // Public mapping doc: icToEmail/{normalizedIc}
        const mapRef = doc(db, "icToEmail", normalizedIc);
        const mapSnap = await getDoc(mapRef);
        if (!mapSnap.exists()) {
            throw new Error("IC not found");
        }

        const data = mapSnap.data() as any;
        const email = (data.email || "").toLowerCase().trim();
        if (!email) {
            throw new Error("Email not found for IC");
        }

        await logInfo('loginWithIcNo', 'IC to email mapping found', { ic: normalizedIc, email });
        const result = await signInWithEmailAndPassword(auth, email, password);

        await logPerformance('loginWithIcNo', startTime, { ic: normalizedIc, success: true });
        await logUserAction('loginWithIcNo_success', { ic: normalizedIc, email });

        return result;
    } catch (error: any) {
        await logError('loginWithIcNo', 'IC login failed', error, {
            icNo: icNo.replace(/\D/g, ''),
            errorCode: error.code
        });
        await logPerformance('loginWithIcNo', startTime, { icNo: icNo.replace(/\D/g, ''), success: false });

        await createErrorReport(
            error,
            'loginWithIcNo',
            { icNo: icNo.replace(/\D/g, '') },
            auth.currentUser?.uid
        );

        throw error;
    }
};

export const logoutUser = async () => {
    const startTime = Date.now();

    try {
        await logUserAction('logoutUser_start', { uid: auth.currentUser?.uid });
        const result = await signOut(auth);
        await logPerformance('logoutUser', startTime, { success: true });
        await logUserAction('logoutUser_success', { uid: auth.currentUser?.uid });
        return result;
    } catch (error: any) {
        await logError('logoutUser', 'User logout failed', error);
        await logPerformance('logoutUser', startTime, { success: false });
        throw error;
    }
};

export const getUserProfile = async (email: string) => {
    const startTime = Date.now();
    const normalizedEmail = email.toLowerCase().trim();

    try {
        await logInfo('getUserProfile', 'Fetching user profile', { email: normalizedEmail });

        const docRef = doc(db, "users", normalizedEmail);
        const docSnap = await getDoc(docRef);
        const result = docSnap.exists() ? docSnap.data() : null;

        await logPerformance('getUserProfile', startTime, {
            email: normalizedEmail,
            found: !!result,
            hasData: result && Object.keys(result).length > 0
        });

        return result;
    } catch (error: any) {
        await logError('getUserProfile', 'Failed to get user profile', error, {
            email: normalizedEmail
        });
        await logPerformance('getUserProfile', startTime, {
            email: normalizedEmail,
            error: true
        });
        throw error;
    }
};