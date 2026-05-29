// src/screens/ProfileScreen.js
// Panel użytkownika — avatar, statystyki, zakładki Saved/Activity, ustawienia
// Autor: Jakub

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme/colors';

// Dummy dane zapisanych miejsc
const SAVED_SPOTS = [
  {
    id: 's1',
    name: 'Kawiarnia Literacka',
    category: 'cafe',
    rating: 4.8,
    distance: '0.4 km',
    imageUrl: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's2',
    name: 'Central Public Library',
    category: 'library',
    rating: 4.5,
    distance: '1.2 km',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's3',
    name: 'The Daily Grind Roasters',
    category: 'cafe',
    rating: 4.9,
    distance: '0.8 km',
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400&auto=format&fit=crop',
  },
];

// Dummy dane aktywności
const ACTIVITY_DATA = [
  {
    id: 'a1',
    type: 'review',
    text: 'Napisałeś recenzję dla "Kawiarnia Literacka"',
    rating: 5,
    time: '2 godziny temu',
    icon: 'chatbubble',
  },
  {
    id: 'a2',
    type: 'spot',
    text: 'Dodałeś nowe miejsce "Workspace Hub"',
    time: '1 dzień temu',
    icon: 'add-circle',
  },
  {
    id: 'a3',
    type: 'review',
    text: 'Napisałeś recenzję dla "Central Public Library"',
    rating: 4,
    time: '3 dni temu',
    icon: 'chatbubble',
  },
  {
    id: 'a4',
    type: 'spot',
    text: 'Dodałeś nowe miejsce "Silent Corner Cafe"',
    time: '1 tydzień temu',
    icon: 'add-circle',
  },
  {
    id: 'a5',
    type: 'saved',
    text: 'Zapisałeś "The Daily Grind Roasters"',
    time: '1 tydzień temu',
    icon: 'bookmark',
  },
];

// Ikona kategorii
const getCategoryIcon = (category) => {
  switch (category) {
    case 'cafe': return 'cafe';
    case 'library': return 'book';
    case 'coworking': return 'laptop';
    default: return 'location';
  }
};

export default function ProfileScreen({ navigation }) {
  const { user, userRole, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Obsługa wylogowania
  const handleLogout = () => {
    Alert.alert(
      'Wyloguj się',
      'Czy na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Wyloguj',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  // Renderowanie karty zapisanego miejsca
  const renderSavedSpot = (spot) => (
    <TouchableOpacity key={spot.id} style={styles.savedCard} activeOpacity={0.7}>
      <Image source={{ uri: spot.imageUrl }} style={styles.savedCardImage} />
      <View style={styles.savedCardContent}>
        <View style={styles.savedCardHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons name={getCategoryIcon(spot.category)} size={12} color={COLORS.primary} />
            <Text style={styles.categoryText}>{spot.category}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="bookmark" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
        <Text style={styles.savedCardTitle}>{spot.name}</Text>
        <View style={styles.savedCardFooter}>
          <View style={styles.ratingMini}>
            <Ionicons name="star" size={14} color={COLORS.accent} />
            <Text style={styles.ratingMiniText}>{spot.rating}</Text>
          </View>
          <Text style={styles.distanceMini}>{spot.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Renderowanie elementu aktywności
  const renderActivityItem = (activity) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={[
        styles.activityIconWrap,
        activity.type === 'review' && { backgroundColor: '#EEF2FF' },
        activity.type === 'spot' && { backgroundColor: '#ECFDF5' },
        activity.type === 'saved' && { backgroundColor: '#FFF7ED' },
      ]}>
        <Ionicons
          name={activity.icon}
          size={20}
          color={
            activity.type === 'review' ? COLORS.primary :
            activity.type === 'spot' ? COLORS.success :
            COLORS.accent
          }
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>{activity.text}</Text>
        <View style={styles.activityMeta}>
          <Text style={styles.activityTime}>{activity.time}</Text>
          {activity.rating && (
            <View style={styles.activityRating}>
              {[1, 2, 3, 4, 5].map(star => (
                <Ionicons
                  key={star}
                  name={star <= activity.rating ? 'star' : 'star-outline'}
                  size={12}
                  color={COLORS.accent}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // Element ustawień
  const renderSettingItem = ({ icon, label, rightComponent, onPress, danger }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={[styles.settingIconWrap, danger && { backgroundColor: '#FEE2E2' }]}>
        <Ionicons name={icon} size={20} color={danger ? COLORS.danger : COLORS.primary} />
      </View>
      <Text style={[styles.settingLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      <View style={styles.settingRight}>
        {rightComponent || (
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Nagłówek profilu */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar i dane */}
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user?.avatarUrl }} style={styles.avatar} />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.displayName}>{user?.displayName}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View style={[
                styles.roleBadge,
                userRole === 'admin' && styles.roleBadgeAdmin,
              ]}>
                <Ionicons
                  name={userRole === 'admin' ? 'shield-checkmark' : 'person'}
                  size={12}
                  color={userRole === 'admin' ? COLORS.accent : COLORS.primary}
                />
                <Text style={[
                  styles.roleText,
                  userRole === 'admin' && styles.roleTextAdmin,
                ]}>
                  {userRole === 'admin' ? 'Admin' : 'User'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statystyki */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.spotsAdded || 0}</Text>
            <Text style={styles.statLabel}>Spots Added</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.reviewsCount || 0}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{SAVED_SPOTS.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* Tabs: Saved / Activity */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons
              name={activeTab === 'saved' ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={activeTab === 'saved' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Saved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
            onPress={() => setActiveTab('activity')}
          >
            <Ionicons
              name={activeTab === 'activity' ? 'time' : 'time-outline'}
              size={18}
              color={activeTab === 'activity' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>
              Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Zawartość aktywnej zakładki */}
        <View style={styles.tabContent}>
          {activeTab === 'saved' ? (
            SAVED_SPOTS.length > 0 ? (
              SAVED_SPOTS.map(renderSavedSpot)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Brak zapisanych miejsc</Text>
                <Text style={styles.emptySubtext}>Zapisuj miejsca, by mieć je pod ręką</Text>
              </View>
            )
          ) : (
            ACTIVITY_DATA.length > 0 ? (
              ACTIVITY_DATA.map(renderActivityItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Brak aktywności</Text>
                <Text style={styles.emptySubtext}>Twoja aktywność pojawi się tutaj</Text>
              </View>
            )
          )}
        </View>

        {/* Ustawienia */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          {renderSettingItem({
            icon: 'notifications-outline',
            label: 'Notifications',
            rightComponent: (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            ),
          })}

          {renderSettingItem({
            icon: 'moon-outline',
            label: 'Dark Mode',
            rightComponent: (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            ),
          })}

          {renderSettingItem({
            icon: 'language-outline',
            label: 'Language',
            onPress: () => Alert.alert('Language', 'Wybór języka — wkrótce'),
          })}

          {renderSettingItem({
            icon: 'help-circle-outline',
            label: 'Help & Support',
            onPress: () => Alert.alert('Help', 'Pomoc i wsparcie — wkrótce'),
          })}

          {/* Przycisk Admin Panel — widoczny tylko dla admina */}
          {userRole === 'admin' && (
            <>
              <View style={styles.settingsDivider} />
              <Text style={styles.sectionTitle}>Administration</Text>
              {renderSettingItem({
                icon: 'shield-checkmark-outline',
                label: 'Admin Panel',
                onPress: () => navigation.navigate('AdminPanel'),
              })}
            </>
          )}

          <View style={styles.settingsDivider} />

          {renderSettingItem({
            icon: 'log-out-outline',
            label: 'Log Out',
            danger: true,
            onPress: handleLogout,
          })}
        </View>

        {/* Stopka */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>WorkAndStudySpots v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Member since {user?.createdAt?.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Nagłówek
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // Profil
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  profileDetails: {
    flex: 1,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleBadgeAdmin: {
    backgroundColor: '#FFF7ED',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  roleTextAdmin: {
    color: COLORS.accent,
  },

  // Statystyki
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 4,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Zawartość zakładek
  tabContent: {
    paddingHorizontal: 20,
    marginTop: 16,
  },

  // Karta zapisanego miejsca
  savedCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  savedCardImage: {
    width: 100,
    height: 100,
  },
  savedCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  savedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  savedCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  savedCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  ratingMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingMiniText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  distanceMini: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Aktywność
  activityItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: 'flex-start',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  activityIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  activityRating: {
    flexDirection: 'row',
    gap: 2,
  },

  // Pusty stan
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Ustawienia
  settingsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  settingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  settingRight: {
    marginLeft: 8,
  },
  settingsDivider: {
    height: 16,
  },

  // Stopka
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 100, // Miejsce na tab bar
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
