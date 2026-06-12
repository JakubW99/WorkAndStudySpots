// src/constants/categories.js
// Wspólne definicje kategorii — single source of truth dla całego projektu

/**
 * Lista kategorii do wyboru w formularzach (AddSpotScreen).
 * Każda kategoria zawiera: klucz, label i emoji.
 */
export const CATEGORIES = [
  { key: 'cafe', label: 'Cafe', emoji: '☕' },
  { key: 'library', label: 'Library', emoji: '📚' },
  { key: 'coworking', label: 'Coworking', emoji: '💼' },
  { key: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { key: 'university', label: 'School / Uni', emoji: '🎓' },
  { key: 'other', label: 'Other', emoji: '📍' },
];

/**
 * Mapowanie kategorii na emoji (do użycia na mapie, w listach itp.)
 */
export const CATEGORY_EMOJI = {
  cafe: '☕',
  library: '📚',
  coworking: '💼',
  outdoor: '🌳',
  university: '🎓',
  other: '📍',
};

/**
 * Mapowanie kategorii na etykiety wyświetlane na ekranie szczegółów
 */
export const CATEGORY_LABELS = {
  cafe: 'CAFE',
  library: 'LIBRARY',
  coworking: 'COWORKING',
  outdoor: 'OUTDOOR',
  university: 'SCHOOL / UNI',
  other: 'OTHER',
};

/**
 * Mapowanie kategorii na ikonę Ionicons
 * @param {string} category — klucz kategorii
 * @returns {string} nazwa ikony Ionicons
 */
export const getCategoryIcon = (category) => {
  switch (category) {
    case 'cafe': return 'cafe';
    case 'library': return 'book';
    case 'coworking': return 'laptop';
    case 'outdoor': return 'leaf';
    case 'university': return 'school';
    case 'other': return 'location';
    default: return 'location';
  }
};
