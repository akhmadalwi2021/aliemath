import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAPWoRxziKIdQl1ef50s6YXG96Ltzo4CQM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aliemath.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aliemath",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aliemath.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "718172565934",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:718172565934:web:f8315a49878d8f696f983f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KK16MFE5CX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);