// src/services/spotsService.js
// Serwis CRUD dla miejsc (spots) — komunikacja z Firestore

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Referencja do kolekcji spots
const spotsCollection = collection(db, 'spots');

/**
 * Pobierz wszystkie zatwierdzone miejsca
 * @returns {Promise<Array>} Lista spotów ze statusem 'approved'
 */
export const getAllSpots = async () => {
  const q = query(
    spotsCollection,
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Pobierz miejsce po ID
 * @param {string} spotId
 * @returns {Promise<Object|null>}
 */
export const getSpotById = async (spotId) => {
  const docRef = doc(db, 'spots', spotId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Dodaj nowe miejsce (status: 'pending' — czeka na zatwierdzenie admina)
 * @param {Object} spotData — dane miejsca (name, description, category, itd.)
 * @param {string} userId — ID użytkownika dodającego
 * @returns {Promise<string>} ID nowo utworzonego dokumentu
 */
export const addSpot = async (spotData, userId) => {
  const newSpot = {
    name: spotData.name || '',
    description: spotData.description || '',
    category: spotData.category || 'cafe', // 'cafe' | 'library' | 'coworking'
    latitude: spotData.latitude || 0,
    longitude: spotData.longitude || 0,
    address: spotData.address || '',
    district: spotData.district || '',
    imageUrl: spotData.imageUrl || '',
    rating: 0,
    wifi: spotData.wifi || 'Reliable', // 'Spotty' | 'Reliable' | 'Fast'
    wifiSpeed: spotData.wifiSpeed || 0,
    outlets: spotData.outlets || 'Limited', // 'None' | 'Limited' | 'Plentiful'
    noise: spotData.noise || 'Chatter', // 'Silent' | 'Chatter' | 'Lively' | 'Loud'
    openingHours: spotData.openingHours || { open: '08:00', close: '20:00' },
    addedBy: userId,
    status: 'pending', // Nowe miejsca wymagają zatwierdzenia
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(spotsCollection, newSpot);
  return docRef.id;
};

/**
 * Zmień status miejsca (dla admina)
 * @param {string} spotId
 * @param {'approved'|'rejected'} status
 * @returns {Promise<void>}
 */
export const updateSpotStatus = async (spotId, status) => {
  const docRef = doc(db, 'spots', spotId);
  await updateDoc(docRef, { status });
};

/**
 * Usuń miejsce (dla admina)
 * @param {string} spotId
 * @returns {Promise<void>}
 */
export const deleteSpot = async (spotId) => {
  const docRef = doc(db, 'spots', spotId);
  await deleteDoc(docRef);
};

/**
 * Pobierz miejsca oczekujące na zatwierdzenie (dla panelu admina)
 * @returns {Promise<Array>} Lista spotów ze statusem 'pending'
 */
export const getPendingSpots = async () => {
  const q = query(
    spotsCollection,
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
