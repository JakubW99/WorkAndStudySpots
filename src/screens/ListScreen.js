import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dane odwzorowujące Twój projekt z Figmy/Stitcha
const DUMMY_SPOTS = [
  {
    id: '1',
    name: 'Kawiarnia Literacka',
    desc: 'Cozy bookstore cafe with ample seating.',
    distance: '0.4 km',
    rating: 4.8,
    wifi: 'Fast',
    outlets: 'Yes',
    noise: 'Lively',
    imageUrl: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Central Public Library',
    desc: 'Silent reading rooms, perfect for deep focus.',
    distance: '1.2 km',
    rating: 4.5,
    wifi: 'Ok',
    outlets: 'Yes',
    noise: 'Silent',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'The Daily Grind Roasters',
    desc: 'Great coffee, but seating fills up quickly.',
    distance: '0.8 km',
    rating: 4.9,
    wifi: 'Fast',
    outlets: 'Few',
    noise: 'Loud',
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400&auto=format&fit=crop'
  }
];

const FILTERS = ['All Spots', 'Open Now', 'Fast Wi-Fi', 'Quiet'];

export default function ListScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All Spots');

  const renderSpotCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('SpotDetail', { spotId: item.id })}
    >
      {/* Zdjęcie z nałożoną oceną */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      {/* Dolna część karty (Teksty i tagi) */}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>
        <Text style={styles.cardDesc}>{item.desc}</Text>

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Ionicons name="wifi" size={14} color="#059669" />
            <Text style={styles.badgeText}>{item.wifi}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="power" size={14} color="#1E1B4B" />
            <Text style={styles.badgeText}>{item.outlets}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name={item.noise === 'Silent' ? "volume-mute" : "volume-high"} size={14} color="#1E1B4B" />
            <Text style={styles.badgeText}>{item.noise}</Text>
          </View>
        </View>

        {/* Pływający przycisk "Pokaż na mapie" - jak na 3 karcie w Twoim projekcie */}
        <TouchableOpacity style={styles.mapButtonAction}>
          <Ionicons name="map" size={20} color="#1E1B4B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Pasek filtrów */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {/* Lista miejsc */}
      <FlatList
        data={DUMMY_SPOTS}
        keyExtractor={item => item.id}
        renderItem={renderSpotCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB — Dodaj nowe miejsce */}
      <TouchableOpacity
        style={styles.fab}
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

  mapButtonAction: {
    position: 'absolute', bottom: 16, right: 16, backgroundColor: '#FBBF24',
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },

  // FAB — przycisk dodawania miejsca
  fab: {
    position: 'absolute', bottom: 100, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1E1B4B', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
});