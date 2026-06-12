// src/navigation/AppNavigator.js
// Główna nawigacja aplikacji — Stack Navigator opakowujący Bottom Tabs
// Autor: Jakub

import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Ekrany
import MapScreen from '../screens/MapScreen';
import ListScreen from '../screens/ListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import SpotDetailScreen from '../screens/SpotDetailScreen';
import AddSpotScreen from '../screens/AddSpotScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator — główne zakładki
function MainTabs() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1A1833' : 'white',
          borderTopWidth: isDarkMode ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'List') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="List" component={ListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Stack Navigator — opakowuje Tabs + ekrany modalne/pełnoekranowe
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Główne zakładki */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Panel admina — push z ProfileScreen */}
      <Stack.Screen
        name="AdminPanel"
        component={AdminPanelScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* Ekran szczegółów miejsca — Rafał */}
      <Stack.Screen
        name="SpotDetail"
        component={SpotDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* Formularz dodawania miejsca — Rafał (modal) */}
      <Stack.Screen
        name="AddSpot"
        component={AddSpotScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
