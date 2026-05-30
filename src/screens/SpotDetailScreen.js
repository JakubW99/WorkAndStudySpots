import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker } from '../components/MapViewCompat';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AmenityBadge from '../components/AmenityBadge';
import ReviewCard from '../components/ReviewCard';
import RatingStars from '../components/RatingStars';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dane tymczasowe — zostaną zastąpione przez serwisy Firebase (Łukasz)
const DUMMY_DETAIL = {
  id: '1',
  name: 'The Grindhouse Roasters',
  category: 'cafe',
  rating: 4.8,
  reviewCount: 124,
  distance: '0.8 km',
  district: 'Downtown District',
  imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600',
  wifiSpeed: 50,
  wifi: 'Fast',
  outlets: 'Available',
  noise: 'Moderate',
  latitude: 50.0614,
  longitude: 19.9365,
  address: '123 Espresso Lane',
  addressFull: 'Downtown District, Cityville 90210',
  openNow: true,
  hours: '7:00 AM - 8:00 PM',
  description: 'A cozy, modern café perfect for remote workers and students. Fast Wi-Fi, plenty of outlets, and expertly crafted coffee.',
  reviews: [
    {
      id: 'r1',
      userName: 'Alex Mercer',
      timeAgo: '2 days ago',
      rating: 5,
      comment:
        'Great spot for working. The Wi-Fi is incredibly fast and there are plenty of outlets along the walls. Gets a bit noisy around lunch, though.',
      avatarUrl: 'https://i.pravatar.cc/100?img=12',
    },
    {
      id: 'r2',
      userName: 'Sarah Jenkins',
      timeAgo: '1 week ago',
      rating: 4,
      comment:
        'Coffee is decent, atmosphere is very productive. I love the large tables in the back for spreading out my study materials.',
      avatarUrl: 'https://i.pravatar.cc/100?img=25',
    },
    {
      id: 'r3',
      userName: 'Mark Thompson',
      timeAgo: '2 weeks ago',
      rating: 5,
      comment:
        'My go-to study spot! The baristas are friendly and the ambient music is perfect for concentration.',
      avatarUrl: 'https://i.pravatar.cc/100?img=33',
    },
  ],
};

// Mapowanie kategorii na etykiety
const CATEGORY_LABELS = {
  cafe: 'CAFE',
  library: 'LIBRARY',
  coworking: 'COWORKING',
};

export default function SpotDetailScreen({ navigation, route }) {
  // Pobierz spotId z parametrów nawigacji (na razie używamy dummy data)
  // const { spotId } = route.params;
  const spot = DUMMY_DETAIL;

  // Otwórz nawigację do miejsca (Google Maps / Apple Maps)
  const handleNavigateToSpot = () => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${spot.latitude},${spot.longitude}`;
    const label = spot.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  // Cofnięcie do poprzedniego ekranu
  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
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
          <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Informacje na hero overlay */}
          <View style={styles.heroInfo}>
            {/* Badge kategorii */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {CATEGORY_LABELS[spot.category] || spot.category.toUpperCase()}
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

        {/* ─── B) Kafelki amenities (3 kolumny) ─── */}
        <View style={styles.amenitiesRow}>
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
        </View>

        {/* ─── C) Sekcja lokalizacji ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          {/* Mini mapa */}
          <View style={styles.miniMapContainer}>
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
            <View style={styles.infoIconContainer}>
              <Ionicons name="location" size={18} color="#1E1B4B" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{spot.address}</Text>
              <Text style={styles.infoSub}>{spot.addressFull}</Text>
            </View>
          </View>

          {/* Godziny otwarcia */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time" size={18} color="#1E1B4B" />
            </View>
            <View style={styles.infoContent}>
              <View style={styles.hoursRow}>
                {spot.openNow && (
                  <View style={styles.openBadge}>
                    <Text style={styles.openBadgeText}>Open Now</Text>
                  </View>
                )}
                <Text style={styles.hoursText}>{spot.hours}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── D) Sekcja recenzji ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Community Reviews{' '}
              <Text style={styles.reviewCountText}>({spot.reviewCount})</Text>
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Średnia ocena */}
          <View style={styles.averageRatingRow}>
            <Text style={styles.averageRatingNumber}>{spot.rating}</Text>
            <View style={styles.averageRatingInfo}>
              <RatingStars rating={spot.rating} size={18} />
              <Text style={styles.averageRatingLabel}>
                Based on {spot.reviewCount} reviews
              </Text>
            </View>
          </View>

          {/* Lista recenzji */}
          {spot.reviews.map((review) => (
            <ReviewCard
              key={review.id}
              userName={review.userName}
              timeAgo={review.timeAgo}
              rating={review.rating}
              comment={review.comment}
              avatarUrl={review.avatarUrl}
            />
          ))}
        </View>

        {/* Odstęp na przycisk CTA na dole */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ─── E) Przycisk CTA — fixed na dole ─── */}
      <SafeAreaView edges={['bottom']} style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleNavigateToSpot}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={20} color="#FFFFFF" style={styles.ctaIcon} />
          <Text style={styles.ctaText}>Prowadź do celu</Text>
        </TouchableOpacity>
      </SafeAreaView>
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

  // ─── Amenities Row ───
  amenitiesRow: {
    flexDirection: 'row',
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

  // ─── CTA Button ───
  bottomSpacer: {
    height: 80,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248,249,250,0.95)',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
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
});
