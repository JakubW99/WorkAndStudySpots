import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getAllSpots } from '../services/spotsService';

// Dane usunięte - korzystamy ze zmockowanego spotsService.js

const FILTERS = ['All Spots', 'Open Now', 'Fast Wi-Fi', 'Quiet'];

export default function ListScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All Spots');
  const [spotsData, setSpotsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();

  // Pobranie miejsc z Firestore
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const spots = await getAllSpots();
        setSpotsData(spots);
      } catch (e) {
        console.warn('Nie udało się pobrać miejsc w liście', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSpots();
    });

    fetchSpots();
    return unsubscribe;
  }, [navigation]);

  // Filter spots based on active filter
  const filteredSpots = useMemo(() => {
    switch (activeFilter) {
      case 'Fast Wi-Fi':
        return spotsData.filter(spot => spot.wifi === 'Fast');
      case 'Quiet':
        return spotsData.filter(spot => spot.noise === 'Silent' || spot.noise === 'Quiet');
      case 'Open Now':
        return spotsData;
      case 'All Spots':
      default:
        return spotsData;
    }
  }, [activeFilter, spotsData]);

  const renderSpotCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('SpotDetail', { spotId: item.id })}
    >
      {/* Zdjęcie z nałożoną oceną */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <View style={[styles.ratingBadge, { backgroundColor: colors.card }]}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={[styles.ratingText, { color: colors.textPrimary }]}>{item.rating}</Text>
        </View>
      </View>

      {/* Dolna część karty (Teksty i tagi) */}
      <View style={styles.cardContent}>
        <View style={[styles.cardHeader, { marginBottom: 16 }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.distanceText, { color: colors.textMuted }]}>{item.distance}</Text>
        </View>

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Ionicons name="wifi" size={14} color={colors.success} />
            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{item.wifi}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="power" size={14} color={colors.textPrimary} />
            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{item.outlets}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name={item.noise === 'Silent' ? "volume-mute" : "volume-high"} size={14} color={colors.textPrimary} />
            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{item.noise}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Pasek filtrów */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.card, borderBottomColor: colors.borderLight }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.filterChip,
                { backgroundColor: colors.chipBg, borderColor: colors.border },
                activeFilter === item && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[
                styles.filterText,
                { color: colors.textSecondary },
                activeFilter === item && styles.filterTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {/* Lista miejsc */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSpots}
          keyExtractor={item => item.id}
          renderItem={renderSpotCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB — Dodaj nowe miejsce */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddSpot')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  
  // Filtry
  filtersContainer: { paddingVertical: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  filterChip: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E5E7EB'
  },
  filterChipActive: { backgroundColor: '#1E1B4B', borderColor: '#1E1B4B' },
  filterText: { color: '#4B5563', fontWeight: '500' },
  filterTextActive: { color: 'white', fontWeight: '600' },

  // Lista i Karta
  listContainer: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: 'white', borderRadius: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    overflow: 'hidden'
  },
  imageContainer: { position: 'relative' },
  cardImage: { width: '100%', height: 160, backgroundColor: '#E5E7EB' },
  ratingBadge: {
    position: 'absolute', top: 12, right: 12, backgroundColor: 'white',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#1E1B4B', marginLeft: 4 },
  
  cardContent: { padding: 16, position: 'relative' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E1B4B', flex: 1, marginRight: 10 },
  distanceText: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  cardDesc: { color: '#4B5563', fontSize: 14, marginTop: 8, marginBottom: 16 },
  
  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { color: '#1E1B4B', fontSize: 13, fontWeight: '500' },

  // FAB — przycisk dodawania miejsca
  fab: {
    position: 'absolute', bottom: 100, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1E1B4B', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
});