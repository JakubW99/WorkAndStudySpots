// src/constants/spotOptions.js
// Wspólne opcje udogodnień i ceny — single source of truth

export const WIFI_OPTIONS = ['Spotty', 'Reliable', 'Fast'];
export const OUTLET_OPTIONS = ['None', 'Limited', 'Plentiful'];
export const NOISE_OPTIONS = ['Silent', 'Chatter', 'Lively'];
export const CROWD_OPTIONS = ['Empty', 'Moderate', 'Busy', 'Packed'];

/**
 * Opcje poziomu cenowego — ujednolicone.
 * Używane zarówno w AddSpotScreen, SpotDetailScreen i spotsService.
 */
export const PRICE_OPTIONS = ['Free', '$', '$$', '$$$'];
