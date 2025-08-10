import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - In production, use environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCZf7-TKnFLRAJuCx5TZaWF2dj3UUFvvnk",
  authDomain: "eko-odznaki.firebaseapp.com",
  projectId: "eko-odznaki",
  storageBucket: "eko-odznaki.firebasestorage.app",
  messagingSenderId: "753096131970",
  appId: "1:753096131970:web:5c3a7b04ca0a1e08b0bb9b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
