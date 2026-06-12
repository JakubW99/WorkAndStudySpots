// src/utils/formatters.js
// Wspólne helpery formatowania tekstu

/**
 * Konwertuje ISO date string na czytelny opis typu "2 days ago", "1 week ago" itd.
 * @param {string} isoDate — data w formacie ISO 8601
 * @returns {string} czytelny opis czasu
 */
export const formatTimeAgo = (isoDate) => {
  if (!isoDate) return '';

  const now = Date.now();
  const date = new Date(isoDate).getTime();
  const diffMs = now - date;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return '1 week ago';
  if (weeks < 4) return `${weeks} weeks ago`;
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
};

/**
 * Konwertuje numeryczny poziom cenowy na string wyświetlany w UI.
 * 0 → 'Free', 1 → '$', 2 → '$$', itd.
 * @param {number} level — numeryczny poziom cenowy
 * @returns {string} czytelna etykieta ceny
 */
export const priceLevelToString = (level) => {
  if (level === 0) return 'Free';
  return '$'.repeat(level);
};
