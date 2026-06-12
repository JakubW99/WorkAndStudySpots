// src/components/WebLayoutShell.js
// Wrapper component for web — adds sidebar navigation and maxWidth centering
// This component is ONLY rendered on web. On mobile, children are rendered directly.

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 72;

// Check if we should show the sidebar (wide enough viewport)
function useIsWideScreen() {
  const [isWide, setIsWide] = React.useState(() => {
    if (Platform.OS !== 'web') return false;
    return Dimensions.get('window').width > 900;
  });

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = ({ window }) => {
      setIsWide(window.width > 900);
    };
    const subscription = Dimensions.addEventListener('change', handler);
    return () => subscription?.remove();
  }, []);

  return isWide;
}

function useIsMediumScreen() {
  const [isMedium, setIsMedium] = React.useState(() => {
    if (Platform.OS !== 'web') return false;
    const w = Dimensions.get('window').width;
    return w > 600 && w <= 900;
  });

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = ({ window }) => {
      setIsMedium(window.width > 600 && window.width <= 900);
    };
    const subscription = Dimensions.addEventListener('change', handler);
    return () => subscription?.remove();
  }, []);

  return isMedium;
}

const NAV_ITEMS = [
  { key: 'Map', icon: 'map', iconOutline: 'map-outline', label: 'Mapa' },
  { key: 'List', icon: 'list', iconOutline: 'list-outline', label: 'Lista' },
  { key: 'Profile', icon: 'person', iconOutline: 'person-outline', label: 'Profil' },
];

export default function WebLayoutShell({ children, activeTab, onTabPress }) {
  const { colors, isDarkMode } = useTheme();
  const isWide = useIsWideScreen();
  const isMedium = useIsMediumScreen();

  // On mobile or narrow web — just render children directly (bottom tabs handle nav)
  if (Platform.OS !== 'web' || (!isWide && !isMedium)) {
    return children;
  }

  const collapsed = isMedium; // medium = collapsed sidebar (icons only)
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <View style={[styles.shellContainer, { backgroundColor: isDarkMode ? '#0A0820' : '#F0F1F5' }]}>
      {/* ─── Sidebar ─── */}
      <View
        style={[
          styles.sidebar,
          {
            width: sidebarWidth,
            backgroundColor: colors.card,
            borderRightColor: colors.border,
          },
        ]}
      >
        {/* Logo / Brand */}
        <View style={[styles.sidebarBrand, collapsed && styles.sidebarBrandCollapsed]}>
          <View style={[styles.brandIcon, { backgroundColor: isDarkMode ? '#4338CA' : '#1E1B4B' }]}>
            <Ionicons name="location" size={collapsed ? 20 : 22} color="#FFFFFF" />
          </View>
          {!collapsed && (
            <Text style={[styles.brandText, { color: colors.textPrimary, textAlign: 'center' }]}>Work&Study Spots</Text>
          )}
        </View>

        {/* Nav Items */}
        <View style={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.navItem,
                  collapsed && styles.navItemCollapsed,
                  isActive && [
                    styles.navItemActive,
                    { backgroundColor: isDarkMode ? '#252240' : '#EEF2FF' },
                  ],
                ]}
                onPress={() => onTabPress(item.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isActive ? item.icon : item.iconOutline}
                  size={22}
                  color={isActive ? colors.primary : colors.textMuted}
                />
                {!collapsed && (
                  <Text
                    style={[
                      styles.navLabel,
                      { color: colors.textMuted },
                      isActive && { color: colors.primary, fontWeight: '600' },
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        {!collapsed && (
          <View style={styles.sidebarFooter}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              WorkAndStudySpots
            </Text>
            <Text style={[styles.footerVersion, { color: colors.textMuted }]}>v2.1.37</Text>
          </View>
        )}
      </View>

      {/* ─── Main Content ─── */}
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
}

// Helper: export sidebar visibility for other components
export function useWebSidebarVisible() {
  const isWide = useIsWideScreen();
  const isMedium = useIsMediumScreen();
  return Platform.OS === 'web' && (isWide || isMedium);
}

const styles = StyleSheet.create({
  shellContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  // ─── Sidebar ───
  sidebar: {
    borderRightWidth: 1,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },

  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12
  },
  sidebarBrandCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  sidebarNav: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
  },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 14,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemActive: {
    backgroundColor: '#EEF2FF',
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
  },

  sidebarFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: 11,
    marginTop: 2,
  },

  // ─── Main Content ───
  mainContent: {
    flex: 1,
    overflow: 'hidden',
  },
});
