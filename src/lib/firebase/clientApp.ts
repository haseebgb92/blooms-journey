
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

// Configure Google provider with additional scopes and settings
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});

// Configure Apple provider
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Debug function to check Firebase configuration
const debugFirebaseConfig = () => {
  if (typeof window !== 'undefined') {
    console.log('Firebase Config:', {
      apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
      authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
      projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
      storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
      messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
      appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing'
    });
  }
};

// Call debug function in development
if (process.env.NODE_ENV === 'development') {
  debugFirebaseConfig();
}

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

// Re-export auth utilities
export * from './authUtils';
