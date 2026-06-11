import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Nawigacja i kontekst
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

// Komponent decydujący co wyświetlić (auth vs main)
function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();
  const { colors, isDarkMode } = useTheme();

  // Ekran ładowania podczas sprawdzania stanu auth
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Jeśli niezalogowany → ekrany logowania/rejestracji (Łukasz)
  // Jeśli zalogowany → AppNavigator ze Stack + Bottom Tabs (Jakub)
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </>
  );
}

// Główny komponent aplikacji
// AuthProvider opakowuje całą aplikację, udostępniając kontekst użytkownika
// ThemeProvider udostępnia tryb ciemny
// FavoritesProvider zarządza ulubionymi
// RootNavigator warunkowo renderuje AuthNavigator lub AppNavigator
export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </FavoritesProvider>
    </ThemeProvider>
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