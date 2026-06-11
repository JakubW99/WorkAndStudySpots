// src/screens/RegisterScreen.js
// Ekran rejestracji — imię, email, hasło, potwierdzenie hasła

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signUp } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Walidacja formularza
  const validate = () => {
    if (!displayName.trim()) {
      setError('Wpisz swoje imię');
      return false;
    }
    if (!email.trim()) {
      setError('Wpisz adres e-mail');
      return false;
    }
    // Prosty regex na email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Nieprawidłowy format adresu e-mail');
      return false;
    }
    if (password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Hasła nie są takie same');
      return false;
    }
    return true;
  };

  // Obsługa rejestracji
  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError('');

    try {
      await signUp(email.trim(), password, displayName.trim());
      // Po rejestracji — AuthContext automatycznie wykryje nowego użytkownika
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Konto z tym adresem e-mail już istnieje');
          break;
        case 'auth/invalid-email':
          setError('Nieprawidłowy format adresu e-mail');
          break;
        case 'auth/weak-password':
          setError('Hasło jest zbyt słabe. Użyj minimum 6 znaków');
          break;
        default:
          setError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Przycisk wstecz */}
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Nagłówek */}
          <View style={styles.headerSection}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Utwórz konto</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Dołącz do społeczności i odkrywaj najlepsze miejsca do pracy
            </Text>
          </View>

          {/* Formularz rejestracji */}
          <View style={[styles.formSection, { backgroundColor: colors.card }]}>
            {/* Komunikat błędu */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Pole: Imię */}
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Imię"
                placeholderTextColor={colors.textMuted}
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  setError('');
                }}
                autoCapitalize="words"
              />
            </View>

            {/* Pole: Email */}
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Adres e-mail"
                placeholderTextColor={colors.textMuted}
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

            {/* Pole: Hasło */}
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Hasło (min. 6 znaków)"
                placeholderTextColor={colors.textMuted}
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
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Pole: Potwierdź hasło */}
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Potwierdź hasło"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Wskaźnik siły hasła */}
            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={[styles.strengthBarContainer, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        width: password.length < 6 ? '33%' : password.length < 10 ? '66%' : '100%',
                        backgroundColor:
                          password.length < 6 ? '#EF4444' : password.length < 10 ? '#F59E0B' : '#059669',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    {
                      color:
                        password.length < 6 ? '#EF4444' : password.length < 10 ? '#F59E0B' : '#059669',
                    },
                  ]}
                >
                  {password.length < 6 ? 'Słabe' : password.length < 10 ? 'Średnie' : 'Silne'}
                </Text>
              </View>
            )}

            {/* Przycisk rejestracji */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled, { backgroundColor: isDarkMode ? '#4338CA' : '#1E1B4B' }]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Zarejestruj się</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link do logowania */}
          <View style={styles.bottomSection}>
            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>Masz już konto? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.loginLink, { color: colors.textPrimary }]}>Zaloguj się</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  // Przycisk wstecz
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Nagłówek
  headerSection: {
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },

  // Formularz
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

  // Wskaźnik siły hasła
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  strengthBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Przycisk rejestracji
  registerButton: {
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Dolna sekcja — link do logowania
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
  loginLink: {
    fontSize: 14,
    color: '#1E1B4B',
    fontWeight: '700',
  },
});
