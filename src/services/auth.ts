import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import app, { auth, db } from "../config/firebase";
import { printLog } from "../utils/log";

const storage = getStorage(app);

export const registerUser = async (email: string, password: string, imageUri: string) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();

        // 1️⃣ Create the Firebase Auth account first
        const authUser = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

        // 2️⃣ Optional: sign in the user immediately so Firestore rules recognize them
        await signInWithEmailAndPassword(auth, normalizedEmail, password);

        // 3️⃣ Now read Firestore safely
        const userRef = doc(db, "users", normalizedEmail);
        const userSnap = await getDoc(userRef);

        // 4️⃣ Two flows
        if (userSnap.exists()) {
            // Existing user in Firestore
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

            return { status: "success", type: "existing", authUser };
        } else {
            // New user registering

            // fetch file bytes
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // create storage path
            const filename = `registerUser/${authUser.user.uid}/${Date.now()}.jpg`;
            const sRef = storageRef(storage, filename);
            await uploadBytes(sRef, blob, { contentType: "image/jpeg" });
            const url = await getDownloadURL(sRef);

            await setDoc(userRef, {
                uid: authUser.user.uid,
                email: normalizedEmail,
                name: "",
                createdAt: serverTimestamp(),
                status: "pending", // admin must approve
                role: "user",
                slipBayaranUrl: url
            });

            return { status: "success", type: "new", authUser };
        }
    } catch (error: any) {
        printLog('registerUser ERR', error.message);
        throw error;
    }
};


export const loginUser = async (email: string, password: string) => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        printLog('loginUser ERR', error.message);
        throw error;
    }
};

export const logoutUser = async () => {
    return await signOut(auth);
};

export const getUserProfile = async (email: string) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const docRef = doc(db, "users", normalizedEmail);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error: any) {
        printLog('getUserProfile ERR', error.message);
        throw error;
    }
};