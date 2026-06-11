// src/theme/colors.js
// Wspólna paleta kolorów i fontów dla całego projektu WorkAndStudySpots
// Wszyscy członkowie zespołu powinni importować kolory z tego pliku

export const COLORS = {
  primary: '#1E1B4B',       // Ciemny granat — główny kolor
  accent: '#F59E0B',        // Złoty/Amber — akcent (rating, CTA)
  accentHover: '#FBBF24',   // Jaśniejszy amber
  success: '#059669',       // Zielony — Wi-Fi, pozytywne
  danger: '#DC2626',        // Czerwony — błędy, usuwanie, reject
  warning: '#F59E0B',       // Pomarańczowy — ostrzeżenia
  background: '#F8F9FA',    // Jasne tło
  white: '#FFFFFF',
  textPrimary: '#1E1B4B',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F0F0F0',
  cardShadow: '#000',
  overlay: 'rgba(0,0,0,0.5)',
  card: '#FFFFFF',
  inputBg: '#F9FAFB',
  chipBg: '#F3F4F6',
  chipActiveBg: '#EEF2FF',
  subtleBg: '#EEF2FF',
};

export const DARK_COLORS = {
  primary: '#A5B4FC',        // Jasny indigo — czytelny na ciemnym tle
  accent: '#F59E0B',
  accentHover: '#FBBF24',
  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  background: '#0F0D23',     // Bardzo ciemny granat
  white: '#1A1833',           // Kolor kart / paneli
  textPrimary: '#E8E6F0',
  textSecondary: '#9B97B8',
  textMuted: '#6B6790',
  border: '#2A2745',
  borderLight: '#231F3A',
  cardShadow: '#000',
  overlay: 'rgba(0,0,0,0.7)',
  card: '#1A1833',
  inputBg: '#1E1B3A',
  chipBg: '#252240',
  chipActiveBg: '#4338CA',
  subtleBg: '#252240',
};

export const FONTS = {
  bold: { fontWeight: '700' },
  semiBold: { fontWeight: '600' },
  medium: { fontWeight: '500' },
  regular: { fontWeight: '400' },
};
