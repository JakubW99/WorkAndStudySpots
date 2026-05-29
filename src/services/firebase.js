// src/services/firebase.js
// Inicjalizacja Firebase — konfiguracja projektu
// Klucze API czytane ze zmiennych środowiskowych (.env)

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

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

// Inicjalizacja Auth — różna persistence dla web i native
let auth;
if (Platform.OS === 'web') {
  // Na webie — domyślna persistence (browserLocalPersistence)
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
} else {
  // Na mobile (Expo Go) — AsyncStorage persistence
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Inicjalizacja Firestore
const db = getFirestore(app);

export { app, auth, db };
