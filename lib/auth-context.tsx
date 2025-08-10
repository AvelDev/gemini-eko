"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: "participant" | "organizer";
  bio?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: "participant" | "organizer"
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            // If user document doesn't exist, clear userData but keep user
            console.log("User document not found in Firestore for:", user.uid);
            setUserData(null);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        // On error, still set user but clear userData
        if (user) {
          setUser(user);
          setUserData(null);
        } else {
          setUser(null);
          setUserData(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: "participant" | "organizer"
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save user data to Firestore
      const userData: UserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName,
        role,
      };

      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      setUserData(userData);
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
