import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  Keyboard,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getAllSpots } from '../services/spotsService';
import {
  getSearchHistory,
  addSearchEntry,
  removeSearchEntry,
  clearSearchHistory,
} from '../services/searchHistoryService';
import { spotMatchesFilters } from '../utils/filters';
import { CATEGORY_EMOJI } from '../constants/categories';

// Metro automatycznie wybierze:
// - MapViewComponent.native.js na iOS/Android
// - MapViewComponent.web.js na webie
import MapViewComponent from '../components/MapViewComponent';



const FILTERS = ['Fast Wi-Fi', 'Outlets', 'Quiet'];

// Map filter labels to their corresponding Ionicon names
const FILTER_ICONS = {
  'Fast Wi-Fi': 'wifi',
  'Outlets': 'power',
  'Quiet': 'volume-mute',
};



export default function MapScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [spotsData, setSpotsData] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ─── Search overlay state ───
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [overlayQuery, setOverlayQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const searchInputRef = useRef(null);

  // Pobranie miejsc z Firestore
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const spots = await getAllSpots();
        setSpotsData(spots);
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



  // Załaduj historię wyszukiwań przy otwarciu overlay
  const loadHistory = useCallback(async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  }, []);

  /** Toggle a filter on/off in the active set */
  const toggleFilter = (filter) => {
    Keyboard.dismiss();
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

    // Celowo NIE filtrujemy wyników mapy (result) na podstawie searchQuery,
    // aby po zaznaczeniu miejsca (wpisaniu go w pasek) inne pinezki nie znikały.

    return result;
  }, [activeFilters, spotsData]);

  /** Podpowiedzi w overlay — filtrowane z bazy spotów */
  const searchSuggestions = useMemo(() => {
    if (!overlayQuery.trim()) return [];
    const query = overlayQuery.toLowerCase();
    return spotsData.filter((spot) =>
      (spot.name && spot.name.toLowerCase().includes(query)) ||
      (spot.description && spot.description.toLowerCase().includes(query)) ||
      (spot.address && spot.address.toLowerCase().includes(query)) ||
      (spot.district && spot.district.toLowerCase().includes(query))
    );
  }, [overlayQuery, spotsData]);

  // ─── Otwieranie / zamykanie overlay ───

  const openSearchOverlay = () => {
    setOverlayQuery(searchQuery);
    setIsSearchActive(true);
    loadHistory();
  };

  const closeSearchOverlay = () => {
    Keyboard.dismiss();
    // Czekamy chwilę, aż system natywnie schowa klawiaturę, 
    // zanim odmontujemy Modal, aby uniknąć skakania layoutu mapy pod spodem.
    setTimeout(() => {
      setIsSearchActive(false);
      setOverlayQuery('');
    }, 100);
  };

  /** Wybranie spota z podpowiedzi */
  const handleSelectSpot = async (spot) => {
    Keyboard.dismiss();
    await addSearchEntry(spot.name);
    setSearchQuery(spot.name);
    setSelectedSpot(spot);
    closeSearchOverlay();
    // Po kliknięciu podpowiedzi od razu nawiguj do detali
    navigation.navigate('SpotDetail', { spotId: spot.id });
  };

  /** Wybranie wpisu z historii */
  const handleSelectHistoryEntry = async (entry) => {
    Keyboard.dismiss();
    await addSearchEntry(entry);
    setSearchQuery(entry);

    // Ustaw najlepszy dopasowany wynik
    const query = entry.toLowerCase();
    const match = spotsData.find((s) =>
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.address && s.address.toLowerCase().includes(query))
    );
    setSelectedSpot(match || null);

    closeSearchOverlay();
  };

  /** Usunięcie wpisu z historii */
  const handleRemoveHistoryEntry = async (entry) => {
    await removeSearchEntry(entry);
    await loadHistory();
  };

  /** Wyczyść historię */
  const handleClearHistory = async () => {
    await clearSearchHistory();
    setSearchHistory([]);
  };

  /** Przycisk "Pokaż na mapie" — zamyka overlay i zaznacza pierwszy z brzegu dopasowany */
  const handleShowOnMap = () => {
    if (overlayQuery.trim()) {
      setSearchQuery(overlayQuery.trim());
      addSearchEntry(overlayQuery.trim());

      // Zaznacz pierwszy pasujący wynik (najlepiej dopasowany), aby scentrować na nim mapę
      if (searchSuggestions.length > 0) {
        setSelectedSpot(searchSuggestions[0]);
      } else {
        setSelectedSpot(null);
      }
    }
    closeSearchOverlay();
  };

  // ─── Render: Search Overlay ───

  const renderSearchOverlay = () => {
    const hasQuery = overlayQuery.trim().length > 0;

    return (
      <Modal
        visible={isSearchActive}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSearchOverlay}
        statusBarTranslucent={true}
        onShow={() => setTimeout(() => searchInputRef.current?.focus(), 100)}
      >
        <SafeAreaView style={[styles.searchOverlay, { backgroundColor: colors.card }]} edges={['top']}>
          {/* ─── Overlay Search Bar ─── */}
          <View style={[styles.overlayHeader, { borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity
              style={styles.overlayBackButton}
              onPress={closeSearchOverlay}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={[styles.overlayInputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                ref={searchInputRef}
                style={[styles.overlayInput, { color: colors.textPrimary }]}
                placeholder="Szukaj miejsc..."
                placeholderTextColor={colors.textMuted}
                value={overlayQuery}
                onChangeText={setOverlayQuery}
                autoFocus={false}
                returnKeyType="search"
                onSubmitEditing={() => {
                  if (overlayQuery.trim()) {
                    handleShowOnMap();
                  }
                }}
              />
              {overlayQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setOverlayQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ─── Overlay Content ─── */}
          <ScrollView
            style={styles.overlayContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!hasQuery ? (
              /* ─── Historia wyszukiwań ─── */
              <>
                {searchHistory.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        Ostatnie wyszukiwania
                      </Text>
                      <TouchableOpacity onPress={handleClearHistory}>
                        <Text style={[styles.clearText, { color: colors.accent }]}>Wyczyść</Text>
                      </TouchableOpacity>
                    </View>

                    {searchHistory.map((entry, index) => (
                      <TouchableOpacity
                        key={`history-${index}`}
                        style={[styles.historyItem, { borderBottomColor: colors.borderLight }]}
                        onPress={() => handleSelectHistoryEntry(entry)}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="time-outline" size={20} color={colors.textMuted} />
                        <Text style={[styles.historyText, { color: colors.textPrimary }]} numberOfLines={1}>
                          {entry}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveHistoryEntry(entry)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={styles.historyRemove}
                        >
                          <Ionicons name="close" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {searchHistory.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                      Wyszukaj miejsce
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                      Wpisz nazwę, adres lub dzielnicę, aby znaleźć idealne miejsce do pracy lub nauki.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              /* ─── Podpowiedzi z bazy spotów ─── */
              <>
                {searchSuggestions.length > 0 ? (
                  <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginBottom: 8 }]}>
                      Wyniki ({searchSuggestions.length})
                    </Text>

                    {searchSuggestions.map((spot) => (
                      <TouchableOpacity
                        key={spot.id}
                        style={[styles.suggestionItem, { borderBottomColor: colors.borderLight }]}
                        onPress={() => handleSelectSpot(spot)}
                        activeOpacity={0.6}
                      >
                        {/* Miniatura / emoji */}
                        {spot.imageUrl ? (
                          <Image source={{ uri: spot.imageUrl }} style={styles.suggestionImage} />
                        ) : (
                          <View style={[styles.suggestionEmojiContainer, { backgroundColor: colors.chipBg }]}>
                            <Text style={styles.suggestionEmoji}>
                              {CATEGORY_EMOJI[spot.category] || '📍'}
                            </Text>
                          </View>
                        )}

                        <View style={styles.suggestionInfo}>
                          <Text style={[styles.suggestionName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {spot.name}
                          </Text>
                          <Text style={[styles.suggestionAddress, { color: colors.textMuted }]} numberOfLines={1}>
                            {spot.address || spot.district || ''}
                          </Text>
                        </View>

                        <View style={styles.suggestionMeta}>
                          <View style={styles.suggestionRating}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text style={[styles.suggestionRatingText, { color: colors.textSecondary }]}>
                              {spot.rating}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="location-outline" size={48} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                      Brak wyników
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                      Nie znaleziono miejsc pasujących do "{overlayQuery}".
                    </Text>
                  </View>
                )}


              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

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
        onSelectSpot={(spot) => {
          setSelectedSpot(spot);
          setSearchQuery(spot.name); // aktualizuje input na górze
        }}
        onMapPress={() => {
          Keyboard.dismiss();
          setSelectedSpot(null);
          setSearchQuery(''); // czyści input na górze
        }}
      />

      {/* 2. Gorna sekcja: Szukajka i Filtry */}
      <View style={[styles.topOverlay, Platform.OS === 'web' && styles.topOverlayWeb]}>
        {/* Search bar — kliknięcie otwiera overlay */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
          onPress={openSearchOverlay}
          activeOpacity={0.9}
        >
          <Ionicons name="search-outline" size={22} color={colors.textMuted} style={styles.searchIcon} />
          <Text
            style={[
              styles.searchPlaceholder,
              { color: searchQuery ? colors.textPrimary : colors.textMuted },
            ]}
            numberOfLines={1}
          >
            {searchQuery || 'Szukaj miejsc...'}
          </Text>
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedSpot(null);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 5 }}
            >
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>

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

      {/* 4. Fullscreen Search Overlay */}
      {isSearchActive && renderSearchOverlay()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Top Overlay (Search & Filters)
  topOverlay: { position: 'absolute', top: 60, width: '100%', paddingHorizontal: 20, zIndex: 10 },
  topOverlayWeb: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 20, paddingHorizontal: 24, backgroundColor: 'transparent' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 30, paddingHorizontal: 15, height: 55,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5,
  },
  searchIcon: { marginRight: 10 },
  searchPlaceholder: { flex: 1, fontSize: 16, color: '#9CA3AF' },

  // Filters
  filtersScroll: { marginTop: 15, flexDirection: 'row', marginBottom: 10},
  filterChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
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
    position: 'absolute', bottom: 20, left: 20, right: 20,
    maxWidth: 400,
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
    position: 'absolute', top: 28, left: 22, backgroundColor: 'white',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 4,
  },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#333' },

  // FAB — przycisk dodawania miejsca
  fab: {
    position: 'absolute', bottom: 20, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1E1B4B', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
    zIndex: 20,
  },

  // ─── Fullscreen Search Overlay ───
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  overlayBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  overlayInput: {
    flex: 1,
    fontSize: 16,
  },
  overlayContent: {
    flex: 1,
    paddingTop: 8,
  },

  // ─── Sekcje w overlay ───
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ─── Historia ───
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  historyText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  historyRemove: {
    padding: 4,
  },

  // ─── Podpowiedzi / sugestie ───
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  suggestionImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  suggestionEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionEmoji: {
    fontSize: 22,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 13,
  },
  suggestionMeta: {
    alignItems: 'flex-end',
  },
  suggestionRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  suggestionRatingText: {
    fontSize: 13,
    fontWeight: '600',
  },


  // ─── Empty state ───
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});