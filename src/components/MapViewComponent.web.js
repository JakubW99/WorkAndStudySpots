// src/components/MapViewComponent.web.js
// Komponent mapy dla wersji webowej z użyciem react-leaflet

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { MapContainer, TileLayer, Marker as LeafletMarker, useMapEvents, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Add CSS only once
  if (!document.getElementById('leaflet-css')) {
    const style = document.createElement('style');
    style.id = 'leaflet-css';
    style.type = 'text/css';
    style.innerHTML = `@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');`;
    document.head.appendChild(style);
  }
}

// Ikony zależne od wybranego markera (z użyciem HTML+CSS dla Leaflet)
const createIcon = (isSelected, color) => new L.divIcon({
  html: `<div style="background-color: ${isSelected ? '#F59E0B' : 'white'}; width: 32px; height: 32px; padding: 2px; border-radius: 16px; display: flex; justify-content: center; align-items: center; border: 2px solid ${isSelected ? 'white' : color}; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><svg width="18" height="18" viewBox="0 0 512 512" fill="${isSelected ? 'white' : color}"><path d="M256 32C167.67 32 96 96.51 96 176c0 128 160 304 160 304s160-176 160-304c0-79.49-71.67-144-160-144zm0 224a64 64 0 1164-64 64.07 64.07 0 01-64 64z"/></svg></div>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapEvents({ onMapPress }) {
  useMapEvents({
    click(e) {
      if (onMapPress) {
        onMapPress({ nativeEvent: { coordinate: { latitude: e.latlng.lat, longitude: e.latlng.lng } } });
      }
    },
  });
  return null;
}

function MapCenterer({ selectedSpot }) {
  const map = useMap();
  useEffect(() => {
    if (selectedSpot) {
      const lat = selectedSpot.latitude || selectedSpot.lat;
      const lng = selectedSpot.longitude || selectedSpot.lng;
      if (lat && lng) {
        map.flyTo([lat, lng], 15, { duration: 0.5 });
      }
    }
  }, [selectedSpot, map]);
  return null;
}

export default function MapViewComponent({ spots, selectedSpot, onSelectSpot, onMapPress }) {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      <MapContainer
        center={[50.0614, 19.9365]}
        zoom={13}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        <MapCenterer selectedSpot={selectedSpot} />
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url={isDarkMode
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />
        <MapEvents onMapPress={onMapPress} />

        {spots.map(spot => {
          const isSelected = selectedSpot?.id === spot.id;
          const lat = spot.latitude || spot.lat || 0;
          const lng = spot.longitude || spot.lng || 0;

          if (lat === 0 && lng === 0) return null;

          return (
            <LeafletMarker
              key={spot.id}
              position={[lat, lng]}
              icon={createIcon(isSelected, colors.primary)}
              eventHandlers={{
                click: () => onSelectSpot(spot)
              }}
            >
              <Popup closeButton={false}>
                <View style={{ padding: 4 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{spot.name}</Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>{spot.category}</Text>
                </View>
              </Popup>
            </LeafletMarker>
          );
        })}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0F2F5',
  }
});
