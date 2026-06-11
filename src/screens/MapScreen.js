import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getAllSpots } from '../services/spotsService';

// Metro automatycznie wybierze:
// - MapViewComponent.native.js na iOS/Android
// - MapViewComponent.web.js na webie
import MapViewComponent from '../components/MapViewComponent';

// Awaryjne dane usunięte - korzystamy ze zmockowanego spotsService.js

const FILTERS = ['Fast Wi-Fi', 'Outlets', 'Quiet', '$'];

// Map filter labels to their corresponding Ionicon names
const FILTER_ICONS = {
  'Fast Wi-Fi': 'wifi',
  'Outlets': 'power',
  'Quiet': 'volume-mute',
  '$': 'cash-outline',
};

/**
 * Extracts a numeric Mbps value from wifi strings like '120Mbps', '50Mbps', etc.
 * Returns 0 for non-numeric values unless the string is 'Fast'.
 */
function parseWifiSpeed(wifi) {
  if (!wifi) return 0;
  if (wifi === 'Fast') return 100; // treat 'Fast' as >= 80
  const match = wifi.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Returns true if a spot passes all currently active filters.
 */
function spotMatchesFilters(spot, activeFilters) {
  for (const filter of activeFilters) {
    switch (filter) {
      case 'Fast Wi-Fi':
        if (parseWifiSpeed(spot.wifi) < 80 && spot.wifi !== 'Fast') return false;
        break;
      case 'Outlets':
        if (!['Ample', 'Plenty', 'Plentiful', 'Yes'].includes(spot.outlets)) return false;
        break;
      case 'Quiet':
        if (spot.noise !== 'Silent' && spot.noise !== 'Quiet') return false;
        break;
      case '$':
        // Placeholder — no filtering applied
        break;
      default:
        break;
    }
  }
  return true;
}

export default function MapScreen({ navigation }) {
  const { colors } = useTheme();
  const [spotsData, setSpotsData] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pobranie miejsc z Firestore
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const spots = await getAllSpots();
        setSpotsData(spots);
        if (spots.length > 0) {
          setSelectedSpot(spots[0]);
        }
      } catch (e) {
        console.warn('Nie udalo sie pobrac miejsc', e);
      } finally {
        setIsLoading(false);
      }
    };

    // Dodanie nasluchiwania na focus z React Navigation aby odswiezac mape
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSpots();
    });

    fetchSpots();
    return unsubscribe;
  }, [navigation]);

  /** Toggle a filter on/off in the active set */
  const toggleFilter = (filter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  /** Memoised list of spots that pass all active filters and search query */
  const filteredSpots = useMemo(() => {
    let result = spotsData;
    
    if (activeFilters.size > 0) {
      result = result.filter((spot) => spotMatchesFilters(spot, activeFilters));
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter((spot) => 
        (spot.name && spot.name.toLowerCase().includes(query)) ||
        (spot.description && spot.description.toLowerCase().includes(query)) ||
        (spot.address && spot.address.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [activeFilters, spotsData, searchQuery]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Mapa (native) lub fallback (web) — wybierane automatycznie */}
      <MapViewComponent
        spots={filteredSpots}
        selectedSpot={selectedSpot}
        onSelectSpot={setSelectedSpot}
        onMapPress={() => setSelectedSpot(null)}
      />

      {/* 2. Gorna sekcja: Szukajka i Filtry */}
      <View style={[styles.topOverlay, Platform.OS === 'web' && [styles.topOverlayWeb, { backgroundColor: colors.subtleBg }]]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
          <Ionicons name="locate-outline" size={24} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search areas or spot names..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={[styles.filterButton, { borderLeftColor: colors.borderLight }]}>
            <Ionicons name="options-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {FILTERS.map((filter) => {
            const isActive = activeFilters.has(filter);
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card, shadowColor: colors.cardShadow },
                  isActive && { backgroundColor: colors.primary },
                ]}
                onPress={() => toggleFilter(filter)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={FILTER_ICONS[filter]}
                  size={16}
                  color={isActive ? '#FFFFFF' : colors.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.filterText, { color: colors.textPrimary }, isActive && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Dolna karta wyswietlana po zaznaczeniu miejsca */}
      {selectedSpot && selectedSpot.name && (
        <TouchableOpacity
          style={[
            styles.bottomCard,
            { backgroundColor: colors.card, shadowColor: colors.cardShadow },
            Platform.OS === 'web' && styles.bottomCardWeb,
          ]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('SpotDetail', { spotId: selectedSpot.id })}
        >
          {selectedSpot.imageUrl && (
            <Image source={{ uri: selectedSpot.imageUrl }} style={styles.cardImage} />
          )}

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.primary }]}>{selectedSpot.name}</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{selectedSpot.desc || selectedSpot.description}</Text>

            <View style={styles.badgesRow}>
               <View style={[styles.badge, { backgroundColor: colors.chipBg }]}>
                 <Ionicons name="wifi" size={14} color={colors.success} />
                 <Text style={[styles.badgeTextGreen, { color: colors.success }]}>{selectedSpot.wifi}</Text>
               </View>
               <View style={styles.badgeTransparent}>
                 <Ionicons name="power" size={14} color={colors.textMuted} />
                 <Text style={[styles.badgeText, { color: colors.textMuted }]}>{selectedSpot.outlets}</Text>
               </View>
            </View>
          </View>

          {/* Ocena */}
          <View style={[styles.ratingBadge, { backgroundColor: colors.card }]}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.textPrimary }]}>{selectedSpot.rating}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* FAB — Dodaj nowe miejsce */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddSpot')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Top Overlay (Search & Filters)
  topOverlay: { position: 'absolute', top: 60, width: '100%', paddingHorizontal: 20, zIndex: 10 },
  topOverlayWeb: { position: 'relative', top: 0, paddingTop: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 30, paddingHorizontal: 15, height: 55,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  filterButton: { padding: 5, borderLeftWidth: 1, borderLeftColor: '#eee', paddingLeft: 15 },

  // Filters
  filtersScroll: { marginTop: 15, flexDirection: 'row' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  filterChipActive: { backgroundColor: '#1E1B4B' },
  filterText: { color: '#333', fontWeight: '500' },
  filterTextActive: { color: 'white', fontWeight: '600' },

  // Bottom Card
  bottomCard: {
    position: 'absolute', bottom: 100, left: 20, right: 20,
    backgroundColor: 'white', borderRadius: 24, padding: 15,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  bottomCardWeb: {
    position: 'relative', bottom: 0, margin: 20,
  },
  cardImage: { width: 80, height: 80, borderRadius: 16, marginRight: 15 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E1B4B' },
  cardDesc: { color: '#666', fontSize: 13, marginTop: 4, marginBottom: 10 },

  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  badgeTransparent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeTextGreen: { color: '#059669', fontSize: 12, fontWeight: '600' },
  badgeText: { color: '#666', fontSize: 12, fontWeight: '500' },

  ratingBadge: {
    position: 'absolute', top: 22, left: 22, backgroundColor: 'white',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 4,
  },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#333' },

  // FAB — przycisk dodawania miejsca
  fab: {
    position: 'absolute', bottom: 100, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1E1B4B', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
    zIndex: 20,
  },
});