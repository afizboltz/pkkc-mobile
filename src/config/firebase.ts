// src/config/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";

import firebaseConfig from "../../firebase.config";
import { mmkvAsyncStorage } from "../utils/storage";

// Initialize Firebase (only once)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with React Native persistence. Try initializeAuth first; on hot reload fallback to getAuth
let authInstance;
try {
    authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(mmkvAsyncStorage),
    });
} catch (e) {
    authInstance = getAuth(app);
}
export const auth = authInstance;
export const db = getFirestore(app);
export default app;
