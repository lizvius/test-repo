import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// TODO: Configure your Firebase Config using environment variables or replace below with your Firebase Project Credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSy_YOUR_FIREBASE_API_KEY_HERE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'azurlizeteam-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'azurlizeteam-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'azurlizeteam-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456789'
};

// Initialize Firebase App lazily or reuse existing instance
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Export Firestore database and Auth instances
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

export default app;
