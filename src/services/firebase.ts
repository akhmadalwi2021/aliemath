import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPWoRxziKIdQl1ef50s6YXG96Ltzo4CQM",
  authDomain: "aliemath.firebaseapp.com",
  projectId: "aliemath",
  storageBucket: "aliemath.firebasestorage.app",
  messagingSenderId: "718172565934",
  appId: "1:718172565934:web:f8315a49878d8f696f983f",
  measurementId: "G-KK16MFE5CX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);