"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { isFirebaseConfigured, auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onIdTokenChanged, getIdTokenResult } from "firebase/auth";
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const AuthContext = createContext();
const signedOut = { user: null, favorites: [], favoritesReady: false, loading: false, error: null };

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ ...signedOut, loading: isFirebaseConfigured });
  const [favoritePending, setFavoritePending] = useState(false);
  const generation = useRef(null);
  const saving = useRef(false);

  useEffect(() => {
    // Erase credentials left by the old demo flow; never restore a mock session.
    try {
      localStorage.removeItem("mock_users");
      localStorage.removeItem("mock_user");
    } catch { /* Storage may be unavailable in private browsing. */ }
    if (!isFirebaseConfigured) return;

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      const current = Symbol();
      generation.current = current;
      setSession({ ...signedOut, loading: Boolean(firebaseUser) });
      if (!firebaseUser) return;
      try {
        const token = await getIdTokenResult(firebaseUser);
        if (current !== generation.current) return;
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Angler",
          isAdmin: token.claims.admin === true,
        };
        try {
          const snapshot = await getDoc(doc(db, "users", user.uid));
          if (current !== generation.current) return;
          const saved = snapshot.exists() ? snapshot.data().favorites : [];
          setSession({ user, favorites: Array.isArray(saved) ? saved.filter(id => typeof id === "string") : [],
            favoritesReady: true, loading: false, error: null });
        } catch {
          if (current === generation.current) setSession({ ...signedOut, user,
            error: "Your saved spots could not be loaded. Sign in again to retry." });
        }
      } catch {
        if (current === generation.current) setSession({ ...signedOut,
          error: "Your account could not be verified. Please sign in again." });
      }
    }, () => {
      generation.current = null;
      setSession({ ...signedOut, error: "Sign-in is temporarily unavailable." });
    });
    return () => { generation.current = null; unsubscribe(); };
  }, []);

  const requireAuth = () => {
    if (!isFirebaseConfigured) throw new Error("Sign-in is unavailable until accounts are configured.");
  };
  const signup = async (email, password) => {
    requireAuth();
    return (await createUserWithEmailAndPassword(auth, email, password)).user;
  };
  const login = async (email, password) => {
    requireAuth();
    return (await signInWithEmailAndPassword(auth, email, password)).user;
  };
  const logout = async () => { requireAuth(); await signOut(auth); };

  const toggleFavorite = async (riverId) => {
    requireAuth();
    if (!session.user || !session.favoritesReady) throw new Error("Please sign in to save spots.");
    if (saving.current) return;
    const current = generation.current;
    const isFavorite = session.favorites.includes(riverId);
    saving.current = true;
    setFavoritePending(true);
    try {
      await setDoc(doc(db, "users", session.user.uid), {
        favorites: isFavorite ? arrayRemove(riverId) : arrayUnion(riverId),
      }, { merge: true });
      if (current === generation.current) setSession(previous => ({ ...previous, error: null,
        favorites: isFavorite ? previous.favorites.filter(id => id !== riverId) : [...previous.favorites, riverId] }));
    } catch (error) {
      if (current === generation.current) setSession(previous => ({ ...previous,
        error: "Could not save your favorite. Please try again." }));
      throw error;
    } finally {
      saving.current = false;
      setFavoritePending(false);
    }
  };

  return <AuthContext.Provider value={{ ...session, authEnabled: isFirebaseConfigured, favoritePending,
    signup, login, logout, toggleFavorite }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
