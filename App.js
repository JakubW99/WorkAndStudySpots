import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importujemy nasze ekrany
import MapScreen from './src/screens/MapScreen';
import ListScreen from './src/screens/ListScreen';

const Tab = createBottomTabNavigator();

// Zaślepka dla ekranu profilu (zrobimy go później)
const ProfileScreenDummy = () => null; 

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Konfiguracja wyglądu dolnego paska z Twojego projektu
          headerShown: false,
          tabBarActiveTintColor: '#1E1B4B', // Ciemny granat z Twojego UI
          tabBarInactiveTintColor: '#9CA3AF', // Szary
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
        <Tab.Screen name="Profile" component={ProfileScreenDummy} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}