import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../config/firebase";

export const getAnnouncements = async () => {
    const colRef = collection(db, "announcement");

    const q = query(
        colRef,
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};