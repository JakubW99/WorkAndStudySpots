import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

// Nawigacja i kontekst
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Główny komponent aplikacji
// AuthProvider opakowuje całą aplikację, udostępniając kontekst użytkownika
// AppNavigator zawiera Stack + Bottom Tabs nawigację
// W przyszłości: warunkowe renderowanie AuthNavigator (Łukasz) vs AppNavigator
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}