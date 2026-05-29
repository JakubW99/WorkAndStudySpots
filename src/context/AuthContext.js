// src/context/AuthContext.js
// Tymczasowy mock AuthContext — do zastąpienia przez Łukasza prawdziwym Firebase Auth
// Struktura hook useAuth() jest zgodna z docelowym API opisanym w TEAM_ROLES.md

import React, { createContext, useContext, useState } from 'react';

// Dummy dane użytkownika — symulują zalogowanego usera
const MOCK_USER = {
  uid: 'user-001',
  email: 'jakub@example.com',
  displayName: 'Jakub Wojciechowski',
  avatarUrl: 'https://i.pravatar.cc/200?img=68',
  role: 'admin', // Zmień na 'user' żeby testować widok zwykłego użytkownika
  createdAt: new Date('2024-09-15'),
  spotsAdded: 12,
  reviewsCount: 34,
};

const AuthContext = createContext(null);

// Provider opakowujący całą aplikację
export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false);

  // Mock funkcji logowania/wylogowania
  const signIn = async (email, password) => {
    setIsLoading(true);
    // Symulacja opóźnienia sieciowego
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(MOCK_USER);
    setIsLoading(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    // W mock nie wylogowujemy naprawdę — zostawiamy usera
    // Odkomentuj poniżej aby testować stan wylogowany:
    // setUser(null);
    setIsLoading(false);
  };

  const value = {
    user,
    isLoading,
    isLoggedIn: !!user,
    userRole: user?.role || 'user',
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook do używania w komponentach
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth musi być używany wewnątrz AuthProvider');
  }
  return context;
}

export default AuthContext;
