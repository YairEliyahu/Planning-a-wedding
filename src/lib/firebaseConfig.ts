// src/lib/firebaseConfig.ts

// Import necessary functions from the Firebase SDKs
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDYVxn6tT2JjFatd2TW6ai0zQDDp4URda8',
  authDomain: 'wedding-app-a6157.firebaseapp.com',
  projectId: 'wedding-app-a6157',
  storageBucket: 'wedding-app-a6157.appspot.com',
  messagingSenderId: '61758995979',
  appId: '1:61758995979:web:636dea4a2d8f2d7e22d10e',
  measurementId: 'G-MEXTB31J54'
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Declare 'analytics' with a specific type and initialize it conditionally
export let analytics: Analytics | undefined;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
