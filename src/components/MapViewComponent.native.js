// src/components/MapViewComponent.native.js
// Komponent mapy dla platform natywnych (iOS / Android)
// Używa react-native-maps

import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function MapViewComponent({ spots, selectedSpot, onSelectSpot, onMapPress }) {
  return (
    <MapView
      style={StyleSheet.absoluteFillObject}
      initialRegion={{
        latitude: 50.0614,
        longitude: 19.9365,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
      onPress={onMapPress}
      showsUserLocation={true}
    >
      {spots.map(spot => {
        const isSelected = selectedSpot?.id === spot.id;
        return (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.lat, longitude: spot.lng }}
            onPress={() => onSelectSpot(spot)}
          >
            <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
              <Ionicons
                name={spot.type === 'cafe' ? 'cafe' : 'book'}
                size={16}
                color={isSelected ? 'white' : '#1E1B4B'}
              />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  markerSelected: {
    backgroundColor: '#F59E0B',
  },
});
