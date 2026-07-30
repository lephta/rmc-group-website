import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDOIkIkUa7UGbYOJuDV_kbkbXI7VLwHUjI",
  authDomain: "rmc-group-d6343.firebaseapp.com",
  projectId: "rmc-group-d6343",
  storageBucket: "rmc-group-d6343.firebasestorage.app",
  messagingSenderId: "174214945819",
  appId: "1:174214945819:web:e88c73dd28761f1836ecbe",
  measurementId: "G-MQFSTYZW5D"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;