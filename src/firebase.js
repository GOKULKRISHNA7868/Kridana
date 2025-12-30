// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC46XZRlrtFGpol7oubJCkUwuCdOUtxG7I",
  authDomain: "kridana-3ce60.firebaseapp.com",
  projectId: "kridana-3ce60",
  storageBucket: "kridana-3ce60.firebasestorage.app",
  messagingSenderId: "267497181722",
  appId: "1:267497181722:web:0076978660acb927cd37a3",
  measurementId: "G-240DYMGSV7",
};

// 🔹 Primary app (existing)
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 🔹 Primary Auth (Institute login)
export const auth = getAuth(app);

// 🔹 Secondary Auth (Student auto-creation – does NOT affect institute login)
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);

// 🔹 Firestore & Storage (existing)
export const db = getFirestore(app);
export const storage = getStorage(app);
