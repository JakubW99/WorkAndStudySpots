import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import MapView, { Marker } from '../components/MapViewCompat';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Tymczasowe dane symulujące bazę (widok ze screena)
const DUMMY_SPOTS = [
  {
    id: '1',
    name: 'Analog Coffee',
    desc: 'Cozy roastery with large tables',
    lat: 50.0614, // Zmień na współrzędne swojego miasta
    lng: 19.9365,
    rating: 4.8,
    wifi: '120Mbps',
    outlets: 'Ample',
    type: 'cafe',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=200&auto=format&fit=crop'
  },
  { id: '2', lat: 50.0650, lng: 19.9400, type: 'library' },
  { id: '3', lat: 50.0580, lng: 19.9300, type: 'cafe' },
];

const FILTERS = ['Fast Wi-Fi', 'Outlets', 'Quiet', '$'];

export default function MapScreen() {
  const [selectedSpot, setSelectedSpot] = useState(DUMMY_SPOTS[0]); // Domyślnie zaznaczamy Analog Coffee jak na screenie

  return (
    <View style={styles.container}>
      {/* 1. Tło: Interaktywna Mapa */}
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 50.0614,
          longitude: 19.9365,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={() => setSelectedSpot(null)}
        showsUserLocation={true}
      >
        {DUMMY_SPOTS.map(spot => {
          const isSelected = selectedSpot?.id === spot.id;
          return (
            <Marker
              key={spot.id}
              coordinate={{ latitude: spot.lat, longitude: spot.lng }}
              onPress={() => setSelectedSpot(spot)}
            >
              <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
                <Ionicons 
                  name={spot.type === 'cafe' ? "cafe" : "book"} 
                  size={16} 
                  color={isSelected ? "white" : "#1E1B4B"} 
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* 2. Górna sekcja: Szukajka i Filtry */}
      <View style={styles.topOverlay}>
        <View style={styles.searchBar}>
          <Ionicons name="locate-outline" size={24} color="#666" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search areas or spot names..." 
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#1E1B4B" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {FILTERS.map((filter, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.filterChip, index === 0 && styles.filterChipActive]}
            >
              {index === 0 && <Ionicons name="wifi" size={16} color="white" style={{marginRight: 6}} />}
              {index === 1 && <Ionicons name="power" size={16} color="#666" style={{marginRight: 6}} />}
              {index === 2 && <Ionicons name="volume-mute" size={16} color="#666" style={{marginRight: 6}} />}
              <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Dolna karta (BottomSheet) wyświetlana po zaznaczeniu miejsca */}
      {selectedSpot && selectedSpot.name && (
        <View style={styles.bottomCard}>
          <Image source={{ uri: selectedSpot.imageUrl }} style={styles.cardImage} />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{selectedSpot.name}</Text>
            </View>
            <Text style={styles.cardDesc}>{selectedSpot.desc}</Text>
            
            <View style={styles.badgesRow}>
               <View style={styles.badge}>
                 <Ionicons name="wifi" size={14} color="#059669" />
                 <Text style={styles.badgeTextGreen}>{selectedSpot.wifi}</Text>
               </View>
               <View style={styles.badgeTransparent}>
                 <Ionicons name="power" size={14} color="#666" />
                 <Text style={styles.badgeText}>{selectedSpot.outlets}</Text>
               </View>
               <View style={styles.badgeTransparent}>
                 <Ionicons name="volume-high" size={14} color="#666" />
               </View>
            </View>
          </View>
          
          {/* Ocena naklejona na zdjęcie */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{selectedSpot.rating}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  
  // Custom Markers
  markerContainer: {
    backgroundColor: 'white', padding: 8, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
  },
  markerSelected: { backgroundColor: '#F59E0B' }, // Pomarańczowy dla aktywnego

  // Top Overlay (Search & Filters)
  topOverlay: { position: 'absolute', top: 60, width: '100%', paddingHorizontal: 20 },
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
  filterChipActive: { backgroundColor: '#1E1B4B' }, // Ciemny granat z projektu
  filterText: { color: '#333', fontWeight: '500' },
  filterTextActive: { color: 'white', fontWeight: '600' },

  // Bottom Card
  bottomCard: {
    position: 'absolute', bottom: 100, left: 20, right: 20,
    backgroundColor: 'white', borderRadius: 24, padding: 15,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
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
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#333' }
});