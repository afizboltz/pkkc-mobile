import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const getAllUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
