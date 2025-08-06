
// src/lib/firebase/clientApp.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, sendPasswordResetEmail, updateProfile, ActionCodeSettings } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  "apiKey": "AIzaSyAwV1-PtT_1ld0Wru3BQqH0pZ2T4h65b_s",
  "authDomain": "bloom-journey-cfezc.firebaseapp.com",
  "projectId": "bloom-journey-cfezc",
  "storageBucket": "bloom-journey-cfezc.appspot.com",
  "messagingSenderId": "246287222430",
  "appId": "1:246287222430:web:5b02ff554caf7933c55d8f"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Custom password reset email function with branded templates
const sendBrandedPasswordResetEmail = async (email: string) => {
  // Create a masked email for display purposes
  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  };

  const actionCodeSettings: ActionCodeSettings = {
    url: `${window.location.origin}/login?email=${encodeURIComponent(email)}&reset=true`,
    handleCodeInApp: false,
  };

  // Use the standard Firebase password reset but with custom settings
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
};

export { 
  app, 
  firestore, 
  auth, 
  storage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  updateProfile, 
  googleProvider, 
  appleProvider, 
  sendPasswordResetEmail, 
  sendBrandedPasswordResetEmail,
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  doc, 
  getDoc, 
  setDoc 
};
