// src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// הגדרות Firebase שלך
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
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Firestore Database
export const auth = getAuth(app); // Authentication
