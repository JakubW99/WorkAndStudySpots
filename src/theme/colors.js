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
};

export const FONTS = {
  bold: { fontWeight: '700' },
  semiBold: { fontWeight: '600' },
  medium: { fontWeight: '500' },
  regular: { fontWeight: '400' },
};
