// src/services/spotsService.js
// Serwis CRUD dla miejsc (spots) — używa LOKALNEJ tablicy zamiast Firestore

let MOCK_SPOTS = [
  {
    id: 'spot_1',
    name: 'Kawiarnia Literacka',
    description: 'Cozy bookstore cafe with ample seating. Great for long study sessions.',
    category: 'cafe',
    rating: 4.8,
    reviewCount: 15,
    distance: '0.4 km',
    district: 'Old Town',
    imageUrl: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=400&auto=format&fit=crop',
    wifiSpeed: 120,
    wifi: 'Fast',
    outlets: 'Plentiful',
    noise: 'Chatter',
    crowdedness: 'Moderate',
    priceLevel: 2, // 0=Free, 1=$, 2=$$, etc.
    latitude: 50.0614,
    longitude: 19.9365,
    address: 'ul. Literacka 10',
    addressFull: 'Old Town, 31-000 Kraków',
    openNow: true,
    hours: '8:00 AM - 9:00 PM',
    status: 'approved',
    addedBy: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'spot_2',
    name: 'Central Public Library',
    description: 'Silent reading rooms, perfect for deep focus. Needs membership for Wi-Fi.',
    category: 'library',
    rating: 4.5,
    reviewCount: 30,
    distance: '1.2 km',
    district: 'City Center',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=400&auto=format&fit=crop',
    wifiSpeed: 30,
    wifi: 'Reliable',
    outlets: 'Limited',
    noise: 'Silent',
    crowdedness: 'Empty',
    priceLevel: 0,
    latitude: 50.0645,
    longitude: 19.9450,
    address: 'ul. Rajska 1',
    addressFull: 'City Center, 31-124 Kraków',
    openNow: true,
    hours: '9:00 AM - 7:00 PM',
    status: 'approved',
    addedBy: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'spot_3',
    name: 'The Daily Grind Roasters',
    description: 'Great coffee, but seating fills up quickly. Loud music and energetic vibe.',
    category: 'cafe',
    rating: 4.9,
    reviewCount: 8,
    distance: '0.8 km',
    district: 'Kazimierz',
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400&auto=format&fit=crop',
    wifiSpeed: 200,
    wifi: 'Fast',
    outlets: 'Limited',
    noise: 'Lively',
    crowdedness: 'Packed',
    priceLevel: 3,
    latitude: 50.0515,
    longitude: 19.9460,
    address: 'Plac Nowy 3',
    addressFull: 'Kazimierz, 31-056 Kraków',
    openNow: false,
    hours: '7:00 AM - 6:00 PM',
    status: 'approved',
    addedBy: 'system',
    createdAt: new Date().toISOString(),
  }
];

export const getAllSpots = async () => {
  return MOCK_SPOTS.filter(s => s.status === 'approved');
};

export const getSpotById = async (spotId) => {
  const spot = MOCK_SPOTS.find(s => s.id === spotId);
  return spot || null;
};

export const addSpot = async (spotData, userId) => {
  const newId = 'spot_' + Date.now();
  
  // Przelicz cene (zwykle dostajemy string z AddSpot, zmieniamy na liczbe by pasowalo do widoku detali)
  let priceLevelInt = 0;
  if (spotData.priceLevel === 'Free') priceLevelInt = 0;
  else if (spotData.priceLevel === '$') priceLevelInt = 1;
  else if (spotData.priceLevel === '$$') priceLevelInt = 2;
  else if (spotData.priceLevel === '$$$') priceLevelInt = 3;

  const newSpot = {
    id: newId,
    name: spotData.name || 'Nowe Miejsce',
    description: spotData.description || '',
    category: spotData.category || 'cafe',
    rating: 0,
    reviewCount: 0,
    distance: '1.5 km', // dummy distance
    district: 'Twoja Okolica',
    imageUrl: spotData.imageUrl || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400&auto=format&fit=crop', // domyślne jeśli brak
    wifiSpeed: 50,
    wifi: spotData.wifi || 'Reliable',
    outlets: spotData.outlets || 'Limited',
    noise: spotData.noise || 'Chatter',
    crowdedness: spotData.crowdedness || 'Moderate',
    priceLevel: priceLevelInt,
    latitude: spotData.latitude || 50.06,
    longitude: spotData.longitude || 19.94,
    address: spotData.address || 'Dodany adres',
    addressFull: spotData.address || 'Dodany adres',
    openNow: true,
    hours: '8:00 AM - 8:00 PM',
    addedBy: userId,
    status: spotData.status || 'approved', // z automatu approved jak chcial uzytkownik
    createdAt: new Date().toISOString(),
  };

  MOCK_SPOTS.push(newSpot);
  return newId;
};

export const updateSpotStatus = async (spotId, status) => {
  const index = MOCK_SPOTS.findIndex(s => s.id === spotId);
  if (index !== -1) {
    MOCK_SPOTS[index].status = status;
  }
};

export const deleteSpot = async (spotId) => {
  MOCK_SPOTS = MOCK_SPOTS.filter(s => s.id !== spotId);
};

export const getPendingSpots = async () => {
  return MOCK_SPOTS.filter(s => s.status === 'pending');
};

export const getSpotsAdmin = async () => {
  return MOCK_SPOTS;
};

export const getSpotsForUser = async (userId) => {
  return MOCK_SPOTS.filter(s => s.addedBy === userId);
};

// Pomocnicza funkcja dla reviewsService do uaktualnienia statystyk w naszym MOCK-u
export const updateSpotRating = async (spotId, newRating, newReviewCount) => {
  const index = MOCK_SPOTS.findIndex(s => s.id === spotId);
  if (index !== -1) {
    MOCK_SPOTS[index].rating = newRating;
    MOCK_SPOTS[index].reviewCount = newReviewCount;
  }
};
