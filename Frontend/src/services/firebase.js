// src/services/firebase.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/* ===================== AUTH ===================== */

export const AuthService = {
  login: (email, password) =>
    signInWithEmailAndPassword(auth, email, password),

  signup: (email, password) =>
    createUserWithEmailAndPassword(auth, email, password),

  logout: () => signOut(auth),

  getCurrentUser: () => auth.currentUser,

  onAuthChange: (callback) =>
    onAuthStateChanged(auth, callback),
};

/* ===================== DATABASE ===================== */

export const DatabaseService = {
  async getUserData(userId) {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    return snap.exists()
      ? { success: true, data: snap.data() }
      : { success: false };
  },

  async saveUserData(userId, data) {
    const ref = doc(db, "users", userId);
    await setDoc(ref, data, { merge: true });
    return { success: true };
  },

  async updateProgress(userId, progress) {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, { progress });
    return { success: true };
  },
};

/* ===================== UTILS ===================== */

export const isFirebaseReady = () => true;
