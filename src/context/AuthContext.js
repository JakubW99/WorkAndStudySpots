// src/context/AuthContext.js
// Kontekst autoryzacji — zarządzanie stanem logowania w całej aplikacji

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// Tworzenie kontekstu
const AuthContext = createContext(null);

/**
 * AuthProvider — opakowuje aplikację i udostępnia dane o zalogowanym użytkowniku
 * Jakub użyje tego w App.js: <AuthProvider><NavigationContainer>...</AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Dane użytkownika z Firebase Auth
  const [userData, setUserData] = useState(null); // Dane z Firestore (rola, itd.)
  const [isLoading, setIsLoading] = useState(true); // Ładowanie stanu auth

  useEffect(() => {
    // Nasłuchiwanie zmian stanu autentykacji
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Użytkownik zalogowany — pobierz dodatkowe dane z Firestore
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Dokument nie istnieje — ustaw domyślne dane
            setUserData({ role: 'user', displayName: firebaseUser.displayName || '' });
          }
        } catch (error) {
          console.error('Błąd pobierania danych użytkownika:', error);
          setUserData({ role: 'user', displayName: firebaseUser.displayName || '' });
        }
      } else {
        // Użytkownik wylogowany
        setUser(null);
        setUserData(null);
      }
      setIsLoading(false);
    });

    // Cleanup — odsubskrybowanie listenera przy odmontowaniu
    return () => unsubscribe();
  }, []);

  // Wartości udostępniane przez kontekst
  const value = {
    user, // Obiekt Firebase Auth user (uid, email, displayName)
    userData, // Dane z Firestore (role, avatarUrl, spotsAdded, itd.)
    isLoading, // true podczas sprawdzania stanu auth
    isLoggedIn: !!user, // true jeśli zalogowany
    userRole: userData?.role || 'user', // 'user' | 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook do użycia w komponentach
 * @returns {{ user, userData, isLoading, isLoggedIn, userRole }}
 *
 * Przykład użycia:
 * const { user, isLoggedIn, userRole } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth musi być użyty wewnątrz AuthProvider');
  }
  return context;
};

export default AuthContext;
