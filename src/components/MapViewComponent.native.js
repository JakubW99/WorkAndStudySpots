// src/components/MapViewComponent.native.js
// Komponent mapy dla platform natywnych (iOS / Android)
// Używa react-native-maps

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Platform, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { darkMapStyle } from '../theme/mapStyles';

export default function MapViewComponent({ spots, selectedSpot, onSelectSpot, onMapPress }) {
  const { height } = Dimensions.get('window');
  const { isDarkMode } = useTheme();
  const mapRef = useRef(null);

  useEffect(() => {
    if (selectedSpot && mapRef.current) {
      const lat = selectedSpot.latitude || selectedSpot.lat;
      const lng = selectedSpot.longitude || selectedSpot.lng;
      if (lat && lng) {
        mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          500
        );
      }
    }
  }, [selectedSpot]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      initialRegion={{
        latitude: 50.0614,
        longitude: 19.9365,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
      onPress={onMapPress}
      showsUserLocation={true}
      toolbarEnabled={false}
      compassOffset={{ x: 20, y: height - 150 }}
      mapPadding={{ bottom: 85, right: 10 }}
      customMapStyle={isDarkMode ? darkMapStyle : []}
      userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
    >
      {spots.map(spot => {
        const isSelected = selectedSpot?.id === spot.id;
        const lat = spot.latitude || spot.lat || 0;
        const lng = spot.longitude || spot.lng || 0;

        if (lat === 0 && lng === 0) return null;

        return (
          <Marker
            key={spot.id}
            coordinate={{ latitude: lat, longitude: lng }}
            onPress={(e) => {
              if (e && e.stopPropagation) e.stopPropagation();
              onSelectSpot(spot);
            }}
          // Usunięto tracksViewChanges aby na Androidzie markery poprawnie się pojawiały
          >
            <View
              style={[styles.markerContainer, isSelected && styles.markerSelected]}
              pointerEvents="none"
            >
              <Ionicons
                name={spot.category === 'cafe' ? 'cafe' : spot.category === 'library' ? 'book' : 'location'}
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  markerSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
});
