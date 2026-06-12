// src/navigation/AppNavigator.js
// Główna nawigacja aplikacji — Stack Navigator opakowujący Bottom Tabs
// Autor: Jakub

import React, { useRef } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import WebLayoutShell, { useWebSidebarVisible } from '../components/WebLayoutShell';

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
  const hasSidebar = useWebSidebarVisible();
  const tabNavRef = useRef(null);

  const tabNavigator = (
    <Tab.Navigator
      ref={tabNavRef}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          // On web with sidebar — hide bottom tabs entirely
          ...(hasSidebar ? { display: 'none' } : {}),
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

  // On web with sidebar — wrap in WebLayoutShell
  if (hasSidebar) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { display: 'none' },
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
        <Tab.Screen name="Map">
          {(props) => (
            <WebLayoutShellWrapper activeTab="Map" {...props}>
              <MapScreen {...props} />
            </WebLayoutShellWrapper>
          )}
        </Tab.Screen>
        <Tab.Screen name="List">
          {(props) => (
            <WebLayoutShellWrapper activeTab="List" {...props}>
              <ListScreen {...props} />
            </WebLayoutShellWrapper>
          )}
        </Tab.Screen>
        <Tab.Screen name="Profile">
          {(props) => (
            <WebLayoutShellWrapper activeTab="Profile" {...props}>
              <ProfileScreen {...props} />
            </WebLayoutShellWrapper>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  return tabNavigator;
}

// Wrapper to pass tab navigation to WebLayoutShell
function WebLayoutShellWrapper({ children, activeTab, navigation }) {
  return (
    <WebLayoutShell
      activeTab={activeTab}
      onTabPress={(tabName) => navigation.navigate(tabName)}
    >
      {children}
    </WebLayoutShell>
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

