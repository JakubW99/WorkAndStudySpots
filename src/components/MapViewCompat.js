// Wersja webowa — implementacja za pomocą react-leaflet
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// Aby uniknąć błędów na serwerze lub podczas bundlowania, importujemy dynamicznie (jeśli wymagane), 
// ale na czystym Expo Web zwykłe importy powinny działać.
import { MapContainer, TileLayer, Marker as LeafletMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('leaflet-css')) {
    const style = document.createElement('style');
    style.id = 'leaflet-css';
    style.type = 'text/css';
    style.innerHTML = `@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');`;
    document.head.appendChild(style);
  }
}

// Niestandardowa ikona zapobiega problemowi ze ścieżkami w Leaflet + Webpack
const customIcon = new L.divIcon({
  html: `<div style="background-color: #1E1B4B; width: 30px; height: 30px; border-radius: 15px; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><svg width="16" height="16" viewBox="0 0 512 512" fill="white"><path d="M256 32C167.67 32 96 96.51 96 176c0 128 160 304 160 304s160-176 160-304c0-79.49-71.67-144-160-144zm0 224a64 64 0 1164-64 64.07 64.07 0 01-64 64z"/></svg></div>`,
  className: 'custom-leaflet-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Adapter zdarzeń
function MapEvents({ onPress }) {
  useMapEvents({
    click(e) {
      if (onPress) {
        onPress({
          nativeEvent: { coordinate: { latitude: e.latlng.lat, longitude: e.latlng.lng } }
        });
      }
    },
  });
  return null;
}

export default function WebMapView({ style, initialRegion, onPress, children, ...props }) {
  if (Platform.OS !== 'web') return null; // Fallback sanity check

  const center = initialRegion 
    ? [initialRegion.latitude, initialRegion.longitude]
    : [50.0614, 19.9365];
    
  // Simple conversion from delta to zoom
  const zoom = initialRegion?.latitudeDelta ? Math.round(Math.log2(360 / initialRegion.latitudeDelta)) : 13;

  return (
    <View style={[styles.container, style]}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onPress={onPress} />
        {children}
      </MapContainer>
    </View>
  );
}

export function Marker({ coordinate, onPress, draggable, onDragEnd }) {
  if (!coordinate) return null;
  const position = [coordinate.latitude || coordinate.lat || 0, coordinate.longitude || coordinate.lng || 0];
  
  const handleDragEnd = (e) => {
    if (onDragEnd) {
      const latlng = e.target.getLatLng();
      onDragEnd({
        nativeEvent: { coordinate: { latitude: latlng.lat, longitude: latlng.lng } }
      });
    }
  };

  return (
    <LeafletMarker 
      position={position} 
      icon={customIcon}
      draggable={draggable}
      eventHandlers={{
        click: () => onPress && onPress(),
        dragend: handleDragEnd
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB'
  }
});
