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
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { signOut } from '../services/authService';
import { getSpotsForUser, getSpotById } from '../services/spotsService';
import { getReviewsForUser } from '../services/reviewsService';
import { COLORS, FONTS } from '../theme/colors';

// Usunięto stałą ACTIVITY_DATA - dane pobierane są dynamicznie z serwisów



// Ikona kategorii
const getCategoryIcon = (category) => {
  switch (category) {
    case 'cafe': return 'cafe';
    case 'library': return 'book';
    case 'coworking': return 'laptop';
    case 'outdoor': return 'leaf';
    case 'university': return 'school';
    case 'other': return 'location';
    default: return 'location';
  }
};

export default function ProfileScreen({ navigation }) {
  const { user, userData, userRole } = useAuth();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { favorites, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState('saved');
  const [notifications, setNotifications] = useState(true);
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Pobranie prawdziwych aktywności użytkownika
  React.useEffect(() => {
    const fetchActivity = async () => {
      if (!user?.uid) return;
      setIsLoadingActivities(true);
      try {
        const userId = user.uid;
        const userSpots = await getSpotsForUser(userId);
        const userReviews = await getReviewsForUser(userId);

        const activitiesArr = [];

        // Przetworzenie miejsc
        userSpots.forEach(s => {
          activitiesArr.push({
            id: `spot_${s.id}`,
            type: 'spot',
            text: `Dodałeś nowe miejsce "${s.name}"`,
            createdAt: s.addedAt ? new Date(s.addedAt) : new Date(),
            time: s.addedAt || 'Niedawno',
            icon: 'add-circle',
          });
        });

        // Przetworzenie recenzji
        for (const r of userReviews) {
          const spotInfo = await getSpotById(r.spotId);
          activitiesArr.push({
            id: `rev_${r.id}`,
            type: 'review',
            text: `Napisałeś recenzję dla "${spotInfo ? spotInfo.name : 'nieznanego miejsca'}"`,
            rating: r.rating,
            createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
            time: new Date(r.createdAt || Date.now()).toLocaleDateString(),
            icon: 'chatbubble',
          });
        }

        // Dodanie zapisanych do aktywności
        favorites.forEach(f => {
          activitiesArr.push({
            id: `fav_${f.id}`,
            type: 'saved',
            text: `Zapisałeś "${f.name}"`,
            createdAt: new Date(Date.now() - 100000), // przykładowy czas dla favs
            time: 'Zapisane',
            icon: 'bookmark',
          });
        });

        // Sortowanie najnowsze pierwsze
        activitiesArr.sort((a, b) => b.createdAt - a.createdAt);
        setActivities(activitiesArr);
      } catch (e) {
        console.warn('Error fetching activities:', e);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      fetchActivity();
    });

    fetchActivity();
    return unsubscribe;
  }, [user, favorites, navigation]);

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
          onPress: () => signOut(),  // z authService
        },
      ]
    );
  };

  // Renderowanie karty zapisanego miejsca
  const renderSavedSpot = (spot) => (
    <TouchableOpacity key={spot.id} style={[styles.savedCard, { backgroundColor: colors.card }]} activeOpacity={0.7}>
      <Image source={{ uri: spot.imageUrl }} style={styles.savedCardImage} />
      <View style={styles.savedCardContent}>
        <View style={styles.savedCardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.chipBg }]}>
            <Ionicons name={getCategoryIcon(spot.category)} size={12} color={colors.primary} />
            <Text style={[styles.categoryText, { color: colors.primary }]}>{spot.category}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(spot)}>
            <Ionicons name="bookmark" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.savedCardTitle, { color: colors.textPrimary }]}>{spot.name}</Text>
        <View style={styles.savedCardFooter}>
          <View style={styles.ratingMini}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={[styles.ratingMiniText, { color: colors.textPrimary }]}>{spot.rating}</Text>
          </View>
          <Text style={[styles.distanceMini, { color: colors.textMuted }]}>{spot.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Renderowanie elementu aktywności
  const renderActivityItem = (activity) => (
    <View key={activity.id} style={[styles.activityItem, { backgroundColor: colors.card }]}>
      <View style={[
        styles.activityIconWrap,
        activity.type === 'review' && { backgroundColor: colors.chipBg },
        activity.type === 'spot' && { backgroundColor: colors.subtleBg },
        activity.type === 'saved' && { backgroundColor: colors.chipBg },
      ]}>
        <Ionicons
          name={activity.icon}
          size={20}
          color={
            activity.type === 'review' ? colors.primary :
            activity.type === 'spot' ? colors.success :
            colors.accent
          }
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityText, { color: colors.textPrimary }]}>{activity.text}</Text>
        <View style={styles.activityMeta}>
          <Text style={[styles.activityTime, { color: colors.textMuted }]}>{activity.time}</Text>
          {activity.rating && (
            <View style={styles.activityRating}>
              {[1, 2, 3, 4, 5].map(star => (
                <Ionicons
                  key={star}
                  name={star <= activity.rating ? 'star' : 'star-outline'}
                  size={12}
                  color={colors.accent}
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
      style={[styles.settingItem, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={[styles.settingIconWrap, { backgroundColor: colors.chipBg }, danger && { backgroundColor: '#FEE2E2' }]}>
        <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.textPrimary }, danger && { color: colors.danger }]}>{label}</Text>
      <View style={styles.settingRight}>
        {rightComponent || (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Nagłówek profilu */}
        <View style={[styles.header, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Profile</Text>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.chipBg }]}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar i dane */}
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ 
                  uri: userData?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email?.split('@')[0] || 'User')}&background=random&size=150` 
                }} 
                style={[styles.avatar, { borderColor: colors.accent }]} 
              />
            </View>
            <View style={styles.profileDetails}>
              <Text style={[styles.displayName, { color: colors.textPrimary }]}>{user?.displayName}</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
              <View style={[
                styles.roleBadge,
                { backgroundColor: colors.chipBg },
                userRole === 'admin' && styles.roleBadgeAdmin,
              ]}>
                <Ionicons
                  name={userRole === 'admin' ? 'shield-checkmark' : 'person'}
                  size={12}
                  color={userRole === 'admin' ? colors.accent : colors.primary}
                />
                <Text style={[
                  styles.roleText,
                  { color: colors.primary },
                  userRole === 'admin' && { color: colors.accent },
                ]}>
                  {userRole === 'admin' ? 'Admin' : 'User'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statystyki */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{userData?.spotsAdded || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Spots Added</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{userData?.reviewsCount || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reviews</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Saved</Text>
          </View>
        </View>

        {/* Tabs: Saved / Activity */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && [styles.tabActive, { backgroundColor: colors.chipActiveBg }]]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons
              name={activeTab === 'saved' ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={activeTab === 'saved' ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'saved' && { color: colors.primary, fontWeight: '600' }]}>
              Saved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && [styles.tabActive, { backgroundColor: colors.chipActiveBg }]]}
            onPress={() => setActiveTab('activity')}
          >
            <Ionicons
              name={activeTab === 'activity' ? 'time' : 'time-outline'}
              size={18}
              color={activeTab === 'activity' ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'activity' && { color: colors.primary, fontWeight: '600' }]}>
              Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Zawartość aktywnej zakładki */}
        <View style={styles.tabContent}>
          {activeTab === 'saved' ? (
            favorites.length > 0 ? (
              favorites.map(renderSavedSpot)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Brak zapisanych miejsc</Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Zapisuj miejsca, by mieć je pod ręką</Text>
              </View>
            )
          ) : (
            isLoadingActivities ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Ładowanie...</Text>
              </View>
            ) : activities.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16, gap: 12 }}>
                {activities.map((act) => (
                  <View key={act.id} style={{ width: 280 }}>
                    {renderActivityItem(act)}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Brak aktywności</Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Twoja aktywność pojawi się tutaj</Text>
              </View>
            )
          )}
        </View>

        {/* Ustawienia */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Settings</Text>

          {renderSettingItem({
            icon: 'notifications-outline',
            label: 'Notifications',
            rightComponent: (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            ),
          })}

          {renderSettingItem({
            icon: 'moon-outline',
            label: 'Dark Mode',
            rightComponent: (
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
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
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Administration</Text>
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
          <Text style={[styles.footerText, { color: colors.textMuted }]}>WorkAndStudySpots v1.0.0</Text>
          <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>
            Member since {userData?.createdAt?.toDate?.()?.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }) || '—'}
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
