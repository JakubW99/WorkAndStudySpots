// src/services/reviewsService.js
// Serwis recenzji — lokalna tablica

import { updateSpotRating } from './spotsService';

let MOCK_REVIEWS = [
  {
    id: 'r1',
    spotId: 'spot_1',
    userId: 'u1',
    userName: 'Alex Mercer',
    rating: 5,
    comment: 'Great spot for working. The Wi-Fi is incredibly fast and there are plenty of outlets along the walls. Gets a bit noisy around lunch, though.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    avatarUrl: 'https://i.pravatar.cc/100?img=12',
  },
  {
    id: 'r2',
    spotId: 'spot_1',
    userId: 'u2',
    userName: 'Sarah Jenkins',
    rating: 4,
    comment: 'Coffee is decent, atmosphere is very productive. I love the large tables in the back for spreading out my study materials.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), // 1 week ago
    avatarUrl: 'https://i.pravatar.cc/100?img=25',
  },
  {
    id: 'r3',
    spotId: 'spot_2',
    userId: 'u3',
    userName: 'Mark Thompson',
    rating: 5,
    comment: 'My go-to study spot! The baristas are friendly and the ambient music is perfect for concentration.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    avatarUrl: 'https://i.pravatar.cc/100?img=33',
  }
];

export const addReview = async (spotId, userId, userName, rating, comment) => {
  const newReview = {
    id: 'r' + Date.now(),
    spotId,
    userId,
    userName,
    rating,
    comment,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://i.pravatar.cc/100?img=' + (Math.floor(Math.random() * 70) + 1), // random avatar
  };

  MOCK_REVIEWS.unshift(newReview); // add to top (newest first)
  await recalculateSpotRating(spotId);
  return newReview.id;
};

export const getReviewsForSpot = async (spotId) => {
  return MOCK_REVIEWS
    .filter(r => r.spotId === spotId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getReviewsForUser = async (userId) => {
  return MOCK_REVIEWS
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const deleteReview = async (reviewId, spotId) => {
  MOCK_REVIEWS = MOCK_REVIEWS.filter(r => r.id !== reviewId);
  if (spotId) {
    await recalculateSpotRating(spotId);
  }
};

const recalculateSpotRating = async (spotId) => {
  const spotReviews = MOCK_REVIEWS.filter(r => r.spotId === spotId);
  
  let totalRating = 0;
  let count = spotReviews.length;

  spotReviews.forEach(r => {
    totalRating += r.rating;
  });

  const averageRating = count > 0 ? Math.round((totalRating / count) * 10) / 10 : 0;
  
  // Zaktualizuj miejsce w spotsService
  await updateSpotRating(spotId, averageRating, count);
};
