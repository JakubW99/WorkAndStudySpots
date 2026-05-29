// src/screens/LoginScreen.js
// Ekran logowania — email + hasło, z obsługą błędów i loading state

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signIn, resetPassword } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Obsługa logowania
  const handleLogin = async () => {
    // Walidacja pól
    if (!email.trim() || !password.trim()) {
      setError('Wypełnij wszystkie pola');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email.trim(), password);
      // Po zalogowaniu — AuthContext automatycznie wykryje zmianę stanu
    } catch (err) {
      // Mapowanie kodów błędów Firebase na czytelne komunikaty
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Nie znaleziono konta z tym adresem e-mail');
          break;
        case 'auth/wrong-password':
          setError('Nieprawidłowe hasło');
          break;
        case 'auth/invalid-email':
          setError('Nieprawidłowy format adresu e-mail');
          break;
        case 'auth/too-many-requests':
          setError('Zbyt wiele prób logowania. Spróbuj ponownie później');
          break;
        case 'auth/invalid-credential':
          setError('Nieprawidłowy e-mail lub hasło');
          break;
        default:
          setError('Wystąpił błąd podczas logowania. Spróbuj ponownie');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Obsługa resetu hasła
  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        'Reset hasła',
        'Wpisz adres e-mail w polu powyżej, a następnie kliknij "Zapomniałeś hasła?"',
      );
      return;
    }

    try {
      await resetPassword(email.trim());
      Alert.alert(
        'E-mail wysłany',
        'Sprawdź swoją skrzynkę pocztową — wysłaliśmy link do resetu hasła.',
      );
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się wysłać e-maila. Sprawdź czy adres jest poprawny.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo i tytuł */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="location" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.appTitle}>WorkStudy</Text>
            <Text style={styles.appSubtitle}>
              Znajdź najlepsze miejsca do pracy i nauki
            </Text>
          </View>

          {/* Formularz logowania */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Zaloguj się</Text>

            {/* Komunikat błędu */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Pole email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adres e-mail"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Pole hasło */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Hasło"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Link "Zapomniałeś hasła?" */}
            <TouchableOpacity onPress={handleResetPassword} style={styles.forgotPasswordLink}>
              <Text style={styles.forgotPasswordText}>Zapomniałeś hasła?</Text>
            </TouchableOpacity>

            {/* Przycisk logowania */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Zaloguj się</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link do rejestracji */}
          <View style={styles.bottomSection}>
            <Text style={styles.bottomText}>Nie masz konta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Zarejestruj się</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Sekcja nagłówka (logo + tytuł)
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E1B4B',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },

  // Sekcja formularza
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 20,
  },

  // Komunikat błędu
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // Pola tekstowe
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E1B4B',
  },
  eyeButton: {
    padding: 4,
  },

  // Link "Zapomniałeś hasła?"
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 2,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },

  // Przycisk logowania
  loginButton: {
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Dolna sekcja — link do rejestracji
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  bottomText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#1E1B4B',
    fontWeight: '700',
  },
});
