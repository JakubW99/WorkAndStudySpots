import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// ─── TRYB TESTOWY — ekrany Rafała ───
// Aby przywrócić normalną wersję, odkomentuj poniższe importy
// i zakomentuj sekcję "TRYB TESTOWY"
//
// import MapScreen from './src/screens/MapScreen';
// import ListScreen from './src/screens/ListScreen';

import SpotDetailScreen from './src/screens/SpotDetailScreen';
import AddSpotScreen from './src/screens/AddSpotScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1E1B4B',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            height: 80,
            paddingBottom: 20,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'SpotDetail') {
              iconName = focused ? 'eye' : 'eye-outline';
            } else if (route.name === 'AddSpot') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            }
            return <Ionicons name={iconName} size={28} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="SpotDetail"
          component={SpotDetailScreen}
          options={{ tabBarLabel: 'Szczegóły' }}
        />
        <Tab.Screen
          name="AddSpot"
          component={AddSpotScreen}
          options={{ tabBarLabel: 'Dodaj Spot' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}