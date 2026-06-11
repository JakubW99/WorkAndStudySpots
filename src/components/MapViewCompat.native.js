// Wersja natywna (iOS/Android) — re-eksportuje react-native-maps z obsługą ciemnego motywu
import React from 'react';
import MapViewOriginal, { Marker } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import { darkMapStyle } from '../theme/mapStyles';

const MapView = React.forwardRef((props, ref) => {
  const { isDarkMode } = useTheme();
  return (
    <MapViewOriginal
      ref={ref}
      customMapStyle={isDarkMode ? darkMapStyle : []}
      userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
      {...props}
    />
  );
});

export default MapView;
export { Marker };
