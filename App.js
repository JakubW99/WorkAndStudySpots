import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Nawigacja i kontekst
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

// Komponent decydujący co wyświetlić (auth vs main)
function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  // Ekran ładowania podczas sprawdzania stanu auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E1B4B" />
      </View>
    );
  }

  // Jeśli niezalogowany → ekrany logowania/rejestracji (Łukasz)
  // Jeśli zalogowany → AppNavigator ze Stack + Bottom Tabs (Jakub)
  return isLoggedIn ? <AppNavigator /> : <AuthNavigator />;
}

// Główny komponent aplikacji
// AuthProvider opakowuje całą aplikację, udostępniając kontekst użytkownika
// RootNavigator warunkowo renderuje AuthNavigator lub AppNavigator
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});