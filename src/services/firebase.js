// src/services/firebase.js
// Inicjalizacja Firebase — konfiguracja projektu
// Klucze API czytane ze zmiennych środowiskowych (.env)

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Konfiguracja Firebase — wartości pobierane z pliku .env
// Prefix EXPO_PUBLIC_ jest wymagany przez Expo SDK 54
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Inicjalizacja aplikacji Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizacja Auth — uzycie getAuth (dziala zarowno na web jak i native)
const auth = getAuth(app);

// Inicjalizacja Firestore
const db = getFirestore(app);

export { app, auth, db };
