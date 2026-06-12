// src/screens/AdminPanelScreen.js
// Panel admina — moderacja miejsc (pending/approved/rejected)
// Autor: Jakub

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getSpotsAdmin, updateSpotStatus, deleteSpot } from '../services/spotsService';
import { getCategoryIcon } from '../constants/categories';

// Dummy dane usunięte - korzystamy z serwisu

// Kolor statusu
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'approved': return '#059669';
    case 'rejected': return '#DC2626';
    default: return '#9CA3AF';
  }
};

const getStatusBg = (status, isDarkMode) => {
  if (isDarkMode) {
    switch (status) {
      case 'pending': return '#3D2E0A';
      case 'approved': return '#0A2E1F';
      case 'rejected': return '#2E0A0A';
      default: return '#252240';
    }
  }
  switch (status) {
    case 'pending': return '#FFF7ED';
    case 'approved': return '#ECFDF5';
    case 'rejected': return '#FEF2F2';
    default: return '#F3F4F6';
  }
};

export default function AdminPanelScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [spots, setSpots] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchSpots = async () => {
      try {
        const data = await getSpotsAdmin();
        setSpots(data);
      } catch (err) {
        console.warn('Error fetching admin spots:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSpots();
    });

    fetchSpots();
    return unsubscribe;
  }, [navigation]);

  // Filtrowanie po statusie — memoizowane
  const { filteredSpots, pendingCount, approvedCount, rejectedCount } = useMemo(() => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    spots.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });
    return {
      filteredSpots: spots.filter(s => s.status === activeTab),
      pendingCount: counts.pending,
      approvedCount: counts.approved,
      rejectedCount: counts.rejected,
    };
  }, [spots, activeTab]);

  // Zmiana statusu miejsca
  const handleStatusChange = (spotId, newStatus) => {
    const spot = spots.find(s => s.id === spotId);
    const actionLabel = newStatus === 'approved' ? 'zatwierdzić' : 'odrzucić';

    Alert.alert(
      `${newStatus === 'approved' ? 'Zatwierdź' : 'Odrzuć'} miejsce`,
      `Czy na pewno chcesz ${actionLabel} "${spot.name}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: newStatus === 'approved' ? 'Zatwierdź' : 'Odrzuć',
          style: newStatus === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            await updateSpotStatus(spotId, newStatus);
            setSpots(prev =>
              prev.map(s =>
                s.id === spotId ? { ...s, status: newStatus } : s
              )
            );
          },
        },
      ]
    );
  };

  // Usunięcie miejsca
  const handleDelete = (spotId) => {
    const spot = spots.find(s => s.id === spotId);
    Alert.alert(
      'Usuń miejsce',
      `Czy na pewno chcesz usunąć "${spot.name}"? Tej akcji nie można cofnąć.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await deleteSpot(spotId);
            setSpots(prev => prev.filter(s => s.id !== spotId));
          },
        },
      ]
    );
  };

  // Renderowanie karty miejsca w panelu admina
  const renderSpotCard = (spot) => (
    <View key={spot.id} style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Zdjęcie z badge statusu */}
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: spot.imageUrl }} style={styles.cardImage} />
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(spot.status, isDarkMode) }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(spot.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(spot.status) }]}>
            {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
          </Text>
        </View>
        <View style={styles.categoryBadgeOnImage}>
          <Ionicons name={getCategoryIcon(spot.category)} size={12} color="#FFFFFF" />
          <Text style={styles.categoryBadgeText}>
            {spot.category.charAt(0).toUpperCase() + spot.category.slice(1)}
          </Text>
        </View>
      </View>

      {/* Treść karty */}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{spot.name}</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>{spot.description}</Text>

        {/* Adres */}
        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.cardMetaText, { color: colors.textMuted }]}>{spot.address}</Text>
        </View>

        {/* Dodane przez */}
        <View style={styles.cardMeta}>
          <Ionicons name="person-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.cardMetaText, { color: colors.textMuted }]}>Dodane przez: {spot.addedBy}</Text>
        </View>

        {/* Data */}
        <View style={styles.cardMeta}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.cardMetaText, { color: colors.textMuted }]}>{spot.createdAt}</Text>
        </View>

        {/* Udogodnienia */}
        <View style={styles.amenitiesRow}>
          <View style={[styles.amenityChip, { backgroundColor: colors.chipBg }]}>
            <Ionicons name="wifi" size={12} color={colors.success} />
            <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{spot.wifi}</Text>
          </View>
          <View style={[styles.amenityChip, { backgroundColor: colors.chipBg }]}>
            <Ionicons name="power" size={12} color={colors.primary} />
            <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{spot.outlets}</Text>
          </View>
          <View style={[styles.amenityChip, { backgroundColor: colors.chipBg }]}>
            <Ionicons
              name={spot.noise === 'Silent' ? 'volume-mute' : 'volume-high'}
              size={12}
              color={colors.primary}
            />
            <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{spot.noise}</Text>
          </View>
        </View>

        {/* Przyciski akcji */}
        <View style={styles.actionsRow}>
          {spot.status === 'pending' && (
            <>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleStatusChange(spot.id, 'approved')}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectButton, { backgroundColor: isDarkMode ? '#2E0A0A' : '#FEF2F2', borderColor: isDarkMode ? '#5C2020' : '#FECACA' }]}
                onPress={() => handleStatusChange(spot.id, 'rejected')}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color={colors.danger} />
                <Text style={[styles.rejectButtonText, { color: colors.danger }]}>Reject</Text>
              </TouchableOpacity>
            </>
          )}

          {spot.status === 'approved' && (
            <TouchableOpacity
              style={[styles.rejectButton, { backgroundColor: isDarkMode ? '#2E0A0A' : '#FEF2F2', borderColor: isDarkMode ? '#5C2020' : '#FECACA' }]}
              onPress={() => handleStatusChange(spot.id, 'rejected')}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color={colors.danger} />
              <Text style={[styles.rejectButtonText, { color: colors.danger }]}>Revoke</Text>
            </TouchableOpacity>
          )}

          {spot.status === 'rejected' && (
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleStatusChange(spot.id, 'approved')}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.approveButtonText}>Restore</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: isDarkMode ? '#2E0A0A' : '#FEF2F2', borderColor: isDarkMode ? '#5C2020' : '#FECACA' }]}
            onPress={() => handleDelete(spot.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Nagłówek */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.subtleBg }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Admin Panel</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Statystyki */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: colors.chipBg, borderColor: 'transparent' },
              activeTab === 'pending' && { borderColor: colors.primary, backgroundColor: colors.subtleBg },
            ]}
            onPress={() => setActiveTab('pending')}
          >
            <View style={[styles.statIconWrap, { backgroundColor: isDarkMode ? '#3D2E0A' : '#FFF7ED' }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{pendingCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: colors.chipBg, borderColor: 'transparent' },
              activeTab === 'approved' && { borderColor: colors.primary, backgroundColor: colors.subtleBg },
            ]}
            onPress={() => setActiveTab('approved')}
          >
            <View style={[styles.statIconWrap, { backgroundColor: isDarkMode ? '#0A2E1F' : '#ECFDF5' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
            </View>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{approvedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Approved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: colors.chipBg, borderColor: 'transparent' },
              activeTab === 'rejected' && { borderColor: colors.primary, backgroundColor: colors.subtleBg },
            ]}
            onPress={() => setActiveTab('rejected')}
          >
            <View style={[styles.statIconWrap, { backgroundColor: isDarkMode ? '#2E0A0A' : '#FEF2F2' }]}>
              <Ionicons name="close-circle" size={20} color="#DC2626" />
            </View>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{rejectedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Rejected</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista miejsc */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSpots.length > 0 ? (
          filteredSpots.map(renderSpotCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                activeTab === 'pending' ? 'hourglass-outline' :
                activeTab === 'approved' ? 'checkmark-done-outline' :
                'close-circle-outline'
              }
              size={56}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              {activeTab === 'pending' ? 'Brak oczekujących' :
               activeTab === 'approved' ? 'Brak zatwierdzonych' :
               'Brak odrzuconych'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              {activeTab === 'pending'
                ? 'Wszystkie zgłoszenia zostały przetworzone!'
                : `Brak miejsc ze statusem "${activeTab}".`
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Nagłówek
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  // Statystyki
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Karta miejsca
  card: {
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadgeOnImage: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 27, 75, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Treść karty
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardMetaText: {
    fontSize: 13,
  },

  // Udogodnienia
  amenitiesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 14,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Przyciski akcji
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // Pusty stan
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
