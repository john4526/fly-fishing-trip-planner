"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { isFirebaseConfigured, auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Firebase observer vs Mock observer
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            isAdmin: firebaseUser.email === 'admin@flyfishing.com' || firebaseUser.email === 'admin@kline.cloud'
          });
          // Load favorites from Firestore
          try {
            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setFavorites(docSnap.data().favorites || []);
            } else {
              // Create doc
              await setDoc(docRef, { favorites: [] });
              setFavorites([]);
            }
          } catch (e) {
            console.error("Error reading favorites from Firestore:", e);
          }
        } else {
          setUser(null);
          setFavorites([]);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock Auth check
      const mockUserRaw = localStorage.getItem("mock_user");
      if (mockUserRaw) {
        const mockUser = JSON.parse(mockUserRaw);
        setUser(mockUser);
        const mockFavs = JSON.parse(localStorage.getItem(`mock_favorites_${mockUser.uid}`) || "[]");
        setFavorites(mockFavs);
      } else {
        setUser(null);
        setFavorites([]);
      }
      setLoading(false);
    }
  }, []);

  const signup = async (email, password) => {
    if (isFirebaseConfigured) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } else {
      // Mock Sign Up
      const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
      if (users.find(u => u.email === email)) {
        throw new Error("auth/email-already-in-use");
      }
      const newMockUser = {
        uid: "mock_" + Math.random().toString(36).substr(2, 9),
        email,
        displayName: email.split("@")[0],
        isAdmin: email === 'admin@flyfishing.com' || email === 'admin@kline.cloud'
      };
      users.push({ ...newMockUser, password });
      localStorage.setItem("mock_users", JSON.stringify(users));
      
      // Log them in
      localStorage.setItem("mock_user", JSON.stringify(newMockUser));
      setUser(newMockUser);
      setFavorites([]);
      return newMockUser;
    }
  };

  const login = async (email, password) => {
    if (isFirebaseConfigured) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } else {
      // Mock Log In
      const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const foundUser = users.find(u => u.email === email && u.password === password);
      if (!foundUser) {
        throw new Error("auth/invalid-credential");
      }
      const loggedUser = {
        uid: foundUser.uid,
        email: foundUser.email,
        displayName: foundUser.displayName,
        isAdmin: foundUser.email === 'admin@flyfishing.com' || foundUser.email === 'admin@kline.cloud'
      };
      localStorage.setItem("mock_user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      const mockFavs = JSON.parse(localStorage.getItem(`mock_favorites_${loggedUser.uid}`) || "[]");
      setFavorites(mockFavs);
      return loggedUser;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    } else {
      localStorage.removeItem("mock_user");
      setUser(null);
      setFavorites([]);
    }
  };

  const toggleFavorite = async (riverId) => {
    if (!user) return;

    const isFav = favorites.includes(riverId);
    let updatedFavorites;

    if (isFav) {
      updatedFavorites = favorites.filter(id => id !== riverId);
    } else {
      updatedFavorites = [...favorites, riverId];
    }

    setFavorites(updatedFavorites);

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          favorites: isFav ? arrayRemove(riverId) : arrayUnion(riverId)
        });
      } catch (e) {
        console.error("Error updating Firestore favorites:", e);
      }
    } else {
      localStorage.setItem(`mock_favorites_${user.uid}`, JSON.stringify(updatedFavorites));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, favorites, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
