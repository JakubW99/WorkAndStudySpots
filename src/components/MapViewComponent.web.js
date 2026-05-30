// src/components/MapViewComponent.web.js
// Komponent mapy dla wersji webowej (fallback)
// react-native-maps nie obsługuje web — wyświetlamy stylizowaną listę miejsc

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapViewComponent({ spots, selectedSpot, onSelectSpot }) {
  return (
    <View style={styles.container}>
      {/* Nagłówek z ikoną mapy */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="map" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Mapa miejsc</Text>
        <Text style={styles.subtitle}>Mapa natywna dostępna w aplikacji mobilnej</Text>
        <Text style={styles.subtitle}>Wybierz miejsce z listy poniżej</Text>
      </View>

      {/* Lista miejsc jako fallback */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {spots.map(spot => (
          <TouchableOpacity
            key={spot.id}
            style={[
              styles.spotItem,
              selectedSpot?.id === spot.id && styles.spotItemSelected,
            ]}
            onPress={() => onSelectSpot(spot)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.spotIcon,
              selectedSpot?.id === spot.id && styles.spotIconSelected,
            ]}>
              <Ionicons
                name={spot.type === 'cafe' ? 'cafe' : 'book'}
                size={20}
                color={selectedSpot?.id === spot.id ? '#FFFFFF' : '#1E1B4B'}
              />
            </View>
            <View style={styles.spotInfo}>
              <Text style={styles.spotName}>{spot.name || 'Miejsce'}</Text>
              {spot.desc ? <Text style={styles.spotDesc}>{spot.desc}</Text> : null}
            </View>
            {spot.rating && (
              <View style={styles.spotRating}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.spotRatingText}>{spot.rating}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  spotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  spotItemSelected: {
    borderColor: '#1E1B4B',
  },
  spotIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  spotIconSelected: {
    backgroundColor: '#1E1B4B',
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  spotDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  spotRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  spotRatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
  },
});
