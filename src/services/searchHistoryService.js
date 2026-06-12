// src/services/searchHistoryService.js
// Serwis historii wyszukiwań — AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@search_history';
const MAX_ENTRIES = 10;

/**
 * Pobiera historię wyszukiwań z AsyncStorage.
 * @returns {Promise<string[]>} Lista ostatnich wyszukiwań (najnowsze na górze).
 */
export const getSearchHistory = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return [];
  } catch (err) {
    console.warn('searchHistoryService: getSearchHistory error', err);
    return [];
  }
};

/**
 * Dodaje wpis do historii wyszukiwań.
 * Jeśli wpis już istnieje, przenosi go na górę.
 * Limit: MAX_ENTRIES pozycji.
 * @param {string} query — tekst wyszukiwania
 */
export const addSearchEntry = async (query) => {
  if (!query || !query.trim()) return;

  const trimmed = query.trim();

  try {
    const history = await getSearchHistory();
    // Usuń duplikat (case-insensitive)
    const filtered = history.filter(
      (entry) => entry.toLowerCase() !== trimmed.toLowerCase()
    );
    // Dodaj na początek
    filtered.unshift(trimmed);
    // Ogranicz do MAX_ENTRIES
    const limited = filtered.slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch (err) {
    console.warn('searchHistoryService: addSearchEntry error', err);
  }
};

/**
 * Usuwa pojedynczy wpis z historii.
 * @param {string} query — tekst do usunięcia
 */
export const removeSearchEntry = async (query) => {
  try {
    const history = await getSearchHistory();
    const filtered = history.filter(
      (entry) => entry.toLowerCase() !== query.toLowerCase()
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('searchHistoryService: removeSearchEntry error', err);
  }
};

/**
 * Czyści całą historię wyszukiwań.
 */
export const clearSearchHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('searchHistoryService: clearSearchHistory error', err);
  }
};
