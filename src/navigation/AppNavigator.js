// src/navigation/AppNavigator.js
// Główna nawigacja aplikacji — Stack Navigator opakowujący Bottom Tabs
// Autor: Jakub

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

// Ekrany
import MapScreen from '../screens/MapScreen';
import ListScreen from '../screens/ListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator — główne zakładki
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 80,
          paddingBottom: 20, // Miejsce na pasek systemowy w iPhonie
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

      {/* 
        Placeholdery na ekrany innych osób:
        
        Rafał doda:
        - SpotDetail (szczegóły miejsca)
        - AddSpot (formularz dodawania, modal)
        
        Łukasz doda:
        - Auth flow (Login, Register) — przez AuthNavigator
        
        Przykład dodania po ich ukończeniu:
        
        <Stack.Screen 
          name="SpotDetail" 
          component={SpotDetailScreen} 
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="AddSpot" 
          component={AddSpotScreen} 
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      */}
    </Stack.Navigator>
  );
}
