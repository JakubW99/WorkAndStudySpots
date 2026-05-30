// src/services/authService.js
// Serwis autentykacji — logowanie, rejestracja, wylogowanie, reset hasła

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Rejestracja nowego użytkownika
 * Tworzy konto w Firebase Auth + dokument w kolekcji users/
 * @param {string} email
 * @param {string} password
 * @param {string} displayName — imię wyświetlane
 * @returns {Promise<UserCredential>}
 */
export const signUp = async (email, password, displayName) => {
  // Tworzenie konta w Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Ustawienie nazwy wyświetlanej w profilu Auth
  await updateProfile(user, { displayName });

  // Tworzenie dokumentu użytkownika w Firestore
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    displayName,
    avatarUrl: '',
    role: 'user', // Domyślna rola
    createdAt: serverTimestamp(),
    spotsAdded: 0,
    reviewsCount: 0,
  });

  return userCredential;
};

/**
 * Logowanie istniejącego użytkownika
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Wylogowanie użytkownika
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  return await firebaseSignOut(auth);
};

/**
 * Wysłanie e-maila do resetu hasła
 * @param {string} email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};
