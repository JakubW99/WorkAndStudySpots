// src/services/reviewsService.js
// Serwis recenzji — dodawanie, pobieranie, usuwanie + przeliczanie średniej

import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Referencja do kolekcji reviews
const reviewsCollection = collection(db, 'reviews');

/**
 * Dodaj recenzję i przelicz średnią ocenę dla spotu
 * @param {string} spotId — ID miejsca
 * @param {string} userId — ID autora recenzji
 * @param {string} userName — imię wyświetlane
 * @param {number} rating — ocena 1-5
 * @param {string} comment — treść recenzji
 * @returns {Promise<string>} ID nowej recenzji
 */
export const addReview = async (spotId, userId, userName, rating, comment) => {
  // Dodanie recenzji do kolekcji
  const reviewData = {
    spotId,
    userId,
    userName,
    rating,
    comment,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(reviewsCollection, reviewData);

  // Przeliczenie średniej oceny dla tego spotu
  await recalculateSpotRating(spotId);

  return docRef.id;
};

/**
 * Pobierz wszystkie recenzje dla danego miejsca (od najnowszych)
 * @param {string} spotId
 * @returns {Promise<Array>}
 */
export const getReviewsForSpot = async (spotId) => {
  const q = query(
    reviewsCollection,
    where('spotId', '==', spotId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Usuń recenzję
 * @param {string} reviewId
 * @param {string} spotId — potrzebne do przeliczenia średniej
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId, spotId) => {
  const docRef = doc(db, 'reviews', reviewId);
  await deleteDoc(docRef);

  // Przelicz średnią po usunięciu
  if (spotId) {
    await recalculateSpotRating(spotId);
  }
};

/**
 * Przelicz i zaktualizuj średnią ocenę dla spotu
 * Wywoływana automatycznie po dodaniu/usunięciu recenzji
 * @param {string} spotId
 */
const recalculateSpotRating = async (spotId) => {
  const q = query(reviewsCollection, where('spotId', '==', spotId));
  const snapshot = await getDocs(q);

  let totalRating = 0;
  let count = 0;

  snapshot.docs.forEach((doc) => {
    totalRating += doc.data().rating;
    count++;
  });

  // Oblicz średnią (zaokrąglona do 1 miejsca po przecinku)
  const averageRating = count > 0 ? Math.round((totalRating / count) * 10) / 10 : 0;

  // Zaktualizuj pole rating w dokumencie spotu
  const spotRef = doc(db, 'spots', spotId);
  await updateDoc(spotRef, { rating: averageRating });
};
