// Wersja webowa — placeholder zamiast react-native-maps (nie działa w przeglądarce)
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function WebMapView({ style, children, ...props }) {
  return (
    <View style={[styles.container, style]} {...props}>
      <Ionicons name="map" size={40} color="#9CA3AF" />
      <Text style={styles.title}>Map Preview</Text>
      <Text style={styles.subtitle}>
        Mapa jest dostępna na urządzeniu mobilnym (iOS / Android)
      </Text>
    </View>
  );
}

function MarkerPlaceholder({ children }) {
  return children || null;
}

export default WebMapView;
export { MarkerPlaceholder as Marker };

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
});
