// src/utils/filters.js
// Wspólna logika filtrowania spotów — single source of truth

/**
 * Sprawdza czy spot ma szybkie Wi-Fi.
 * Logika ujednolicona między MapScreen i ListScreen.
 * @param {object} spot
 * @returns {boolean}
 */
export const matchesFastWifi = (spot) => {
  if (spot.wifi === 'Fast') return true;
  // Sprawdź numeryczną prędkość (np. pole wifiSpeed)
  if (spot.wifiSpeed && spot.wifiSpeed >= 80) return true;
  return false;
};

/**
 * Sprawdza czy spot jest cichy.
 * @param {object} spot
 * @returns {boolean}
 */
export const matchesQuiet = (spot) => {
  return spot.noise === 'Silent' || spot.noise === 'Quiet';
};

/**
 * Sprawdza czy spot ma dużo gniazdek.
 * @param {object} spot
 * @returns {boolean}
 */
export const matchesOutlets = (spot) => {
  return ['Ample', 'Plenty', 'Plentiful', 'Yes'].includes(spot.outlets);
};

/**
 * Sprawdza czy spot jest tani (Free lub $).
 * @param {object} spot
 * @returns {boolean}
 */
export const matchesCheap = (spot) => {
  return spot.priceLevel <= 1;
};

/**
 * Sprawdza czy spot pasuje do wszystkich aktywnych filtrów.
 * @param {object} spot
 * @param {Set<string>} activeFilters — zbiór aktywnych filtrów
 * @returns {boolean}
 */
export const spotMatchesFilters = (spot, activeFilters) => {
  for (const filter of activeFilters) {
    switch (filter) {
      case 'Fast Wi-Fi':
        if (!matchesFastWifi(spot)) return false;
        break;
      case 'Outlets':
        if (!matchesOutlets(spot)) return false;
        break;
      case 'Quiet':
        if (!matchesQuiet(spot)) return false;
        break;
      default:
        break;
    }
  }
  return true;
};
