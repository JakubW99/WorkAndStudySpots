import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Marker } from '../components/MapViewCompat';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import AmenityBadge from '../components/AmenityBadge';
import ReviewCard from '../components/ReviewCard';
import RatingStars from '../components/RatingStars';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { getSpotById } from '../services/spotsService';
import { getReviewsForSpot, addReview } from '../services/reviewsService';
import { CATEGORY_LABELS } from '../constants/categories';
import { PRICE_OPTIONS } from '../constants/spotOptions';
import { priceLevelToString, formatTimeAgo } from '../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dane tymczasowe usunięte - pobieramy z serwisu

export default function SpotDetailScreen({ navigation, route }) {
  const { spotId } = route.params;

  const { isDarkMode, colors } = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth(); // User for review submission

  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review form state
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newPriceLevel, setNewPriceLevel] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const spotData = await getSpotById(spotId);
        const reviewsData = await getReviewsForSpot(spotId);
        setSpot(spotData);
        setReviews(reviewsData);
      } catch (err) {
        console.warn('Error fetching spot detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [spotId]);

  // Submit a new review
  const handleSubmitReview = async () => {
    if (newRating === 0) {
      Alert.alert('Rating required', 'Please select a star rating before submitting.');
      return;
    }

    const userName = user && user.email ? user.email.split('@')[0] : 'Anonymous User';
    const userId = user ? user.uid : 'anon';

    try {
      await addReview(spotId, userId, userName, newRating, newComment);

      // Refresh to reflect the new rating and review
      const updatedReviews = await getReviewsForSpot(spotId);
      const updatedSpot = await getSpotById(spotId);
      setReviews(updatedReviews);
      setSpot(updatedSpot);

      setNewRating(0);
      setNewComment('');
      setNewPriceLevel(0);
      Alert.alert('Thank you!', 'Your review has been submitted.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not submit review.');
    }
  };

  // Otwórz nawigację do miejsca (Google Maps / Apple Maps / Web)
  const handleNavigateToSpot = () => {
    const latLng = `${spot.latitude},${spot.longitude}`;
    const label = encodeURIComponent(spot.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });

    Linking.openURL(url);
  };

  // Cofnięcie do poprzedniego ekranu
  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  if (isLoading || !spot) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='padding'
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── A) Hero Image z overlay ─── */}
          <View style={styles.heroContainer}>
            <Image source={{ uri: spot.imageUrl }} style={styles.heroImage} />

            {/* Gradient overlay od dołu */}
            <View style={styles.heroOverlay} />

            {/* Przycisk Wstecz */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Przycisk ulubionych */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(spot)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite(spot.id) ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite(spot.id) ? '#EF4444' : '#FFFFFF'}
              />
            </TouchableOpacity>

            {/* Informacje na hero overlay */}
            <View style={styles.heroInfo}>
              {/* Badge kategorii */}
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {CATEGORY_LABELS[spot.category] || spot.category?.toUpperCase() || 'OTHER'}
                </Text>
              </View>

              {/* Ocena */}
              <View style={styles.heroRating}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.heroRatingText}>{spot.rating}</Text>
                <Text style={styles.heroReviewCount}>({spot.reviewCount})</Text>
              </View>

              {/* Nazwa miejsca */}
              <Text style={styles.heroTitle}>{spot.name}</Text>

              {/* Lokalizacja i dystans */}
              <View style={styles.heroSubtitle}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroSubtitleText}>
                  {spot.distance} · {spot.district}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── B) Opis (About) ─── */}
          {spot.description ? (
            <View style={[styles.section, { marginTop: 16 }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
                {spot.description}
              </Text>
            </View>
          ) : null}

          {/* ─── C) Kafelki amenities (wrapping flex layout for 5 badges) ─── */}
          <View style={[styles.amenitiesRow, { backgroundColor: colors.background }]}>
            <AmenityBadge
              icon="wifi"
              label="Wi-Fi"
              value={`${spot.wifiSpeed} Mbps`}
              color="#059669"
            />
            <AmenityBadge
              icon="power"
              label="Outlets"
              value={spot.outlets}
              color="#1E1B4B"
            />
            <AmenityBadge
              icon="volume-medium"
              label="Noise"
              value={spot.noise}
              color="#F59E0B"
            />
            <AmenityBadge
              icon="people"
              label="Crowd"
              value={spot.crowdedness}
              color="#8B5CF6"
            />
            <AmenityBadge
              icon="cash-outline"
              label="Price"
              value={priceLevelToString(spot.priceLevel)}
              color="#059669"
            />
          </View>

          {/* ─── C) Sekcja lokalizacji ─── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Location</Text>

            {/* Mini mapa */}
            <View style={[styles.miniMapContainer, { shadowColor: colors.cardShadow }]}>
              <MapView
                style={styles.miniMap}
                initialRegion={{
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: spot.latitude,
                    longitude: spot.longitude,
                  }}
                >
                  <View style={styles.miniMapMarker}>
                    <Ionicons name="cafe" size={14} color="#FFFFFF" />
                  </View>
                </Marker>
              </MapView>
            </View>

            {/* Adres */}
            <View style={styles.infoRow}>
              <View style={[styles.infoIconContainer, { backgroundColor: isDarkMode ? colors.subtleBg : '#EEF2FF' }]}>
                <Ionicons name="location" size={18} color={colors.primary || '#1E1B4B'} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textPrimary }]}>{spot.address}</Text>
                <Text style={[styles.infoSub, { color: colors.textMuted }]}>{spot.addressFull}</Text>
              </View>
            </View>

            {/* Godziny otwarcia */}
            <View style={styles.infoRow}>
              <View style={[styles.infoIconContainer, { backgroundColor: isDarkMode ? colors.subtleBg : '#EEF2FF' }]}>
                <Ionicons name="time" size={18} color={colors.primary || '#1E1B4B'} />
              </View>
              <View style={styles.infoContent}>
                <View style={styles.hoursRow}>
                  {spot.openNow && (
                    <View style={styles.openBadge}>
                      <Text style={styles.openBadgeText}>Open Now</Text>
                    </View>
                  )}
                  <Text style={[styles.hoursText, { color: colors.textSecondary }]}>{spot.hours}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.primary || '#1E1B4B', marginTop: 16 }]}
              onPress={handleNavigateToSpot}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={20} color="#FFFFFF" style={styles.ctaIcon} />
              <Text style={styles.ctaText}>Prowadź do celu</Text>
            </TouchableOpacity>
          </View>

          {/* ─── D) Sekcja recenzji ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Community Reviews{' '}
                <Text style={[styles.reviewCountText, { color: colors.textMuted }]}>({spot.reviewCount})</Text>
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAllLink}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Średnia ocena */}
            <View style={[styles.averageRatingRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.averageRatingNumber, { color: colors.textPrimary }]}>{spot.rating}</Text>
              <View style={styles.averageRatingInfo}>
                <RatingStars rating={spot.rating} size={18} />
                <Text style={[styles.averageRatingLabel, { color: colors.textMuted }]}>
                  Based on {spot.reviewCount} reviews
                </Text>
              </View>
            </View>

            {/* Lista recenzji - poziomy suwak */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16, gap: 12 }}>
              {reviews.map((review) => (
                <View key={review.id} style={{ width: SCREEN_WIDTH * 0.75 }}>
                  <ReviewCard
                    userName={review.userName}
                    timeAgo={formatTimeAgo(review.createdAt)}
                    rating={review.rating}
                    comment={review.comment}
                    avatarUrl={review.avatarUrl}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ─── E) Sekcja dodawania recenzji ─── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Add Your Review</Text>

            <View style={[styles.reviewFormCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              {/* Star rating */}
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Your Rating</Text>
              <RatingStars rating={newRating} size={28} interactive={true} onRate={setNewRating} />

              {/* Comment input */}
              <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 16 }]}>Comment</Text>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: colors.inputBg,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Share your experience..."
                placeholderTextColor={colors.textMuted}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                value={newComment}
                onChangeText={setNewComment}
              />

              {/* Price selector */}
              <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 16 }]}>
                Price Level: {PRICE_OPTIONS[newPriceLevel]}
              </Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={PRICE_OPTIONS.length - 1}
                step={1}
                value={newPriceLevel}
                onValueChange={setNewPriceLevel}
                minimumTrackTintColor={colors.accent || '#F59E0B'}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.accent || '#F59E0B'}
              />

              {/* Submit button */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary || '#1E1B4B' }]}
                onPress={handleSubmitReview}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // ─── Hero Image ───
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  // Dodatkowy overlay na dole hero
  heroInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 60,
    // Gradient overlay
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  categoryBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroRatingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 4,
  },
  heroReviewCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginLeft: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSubtitleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginLeft: 4,
  },

  // ─── Amenities Row (wrapping flex layout) ───
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },

  // ─── Sections ───
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 12,
  },
  reviewCountText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },

  // ─── Mini Mapa ───
  miniMapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  miniMap: {
    width: '100%',
    height: 140,
  },
  miniMapMarker: {
    backgroundColor: '#1E1B4B',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // ─── Info Rows ───
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  infoSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  openBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  hoursText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },

  // ─── Average Rating ───
  averageRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  averageRatingNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1E1B4B',
    marginRight: 16,
  },
  averageRatingInfo: {
    flex: 1,
  },
  averageRatingLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // ─── Review Form ───
  reviewFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    backgroundColor: '#F9FAFB',
  },
  // ─── CTA Button ───
  ctaButton: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaIcon: {
    marginRight: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
