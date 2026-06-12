import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';

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

  // Zmiana natywnych kolorów Androida przy każdej zmianie trybu
  useEffect(() => {
    // Tło roota (pod klawiaturą)
    SystemUI.setBackgroundColorAsync(colors.card).catch(() => { });
    // Pasek nawigacyjny na dole (tylko na Androidzie)
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark').catch(() => { });
    }
  }, [colors.card, isDarkMode]);

  // Ekran ładowania podczas sprawdzania stanu auth
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Odtwarzamy motyw dla React Navigation, aby systemowy kolor tła był spójny z naszym ThemeContext
  const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;
  const customTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: isDarkMode ? '#1A1833' : 'white',
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };

  // Jeśli niezalogowany → ekrany logowania/rejestracji (Łukasz)
  // Jeśli zalogowany → AppNavigator ze Stack + Bottom Tabs (Jakub)
  return (
    <NavigationContainer theme={customTheme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
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
      <AuthProvider>
        <FavoritesProvider>
          <RootNavigator />
        </FavoritesProvider>
      </AuthProvider>
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