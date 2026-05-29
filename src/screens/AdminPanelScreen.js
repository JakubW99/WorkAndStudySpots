// src/screens/AdminPanelScreen.js
// Panel admina — moderacja miejsc (pending/approved/rejected)
// Autor: Jakub

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme/colors';

// Dummy dane miejsc do moderacji
const INITIAL_SPOTS = [
  {
    id: 'p1',
    name: 'Workspace Hub Downtown',
    category: 'coworking',
    description: 'Modern coworking space with meeting rooms and high-speed internet.',
    address: 'ul. Floriańska 15, Kraków',
    addedBy: 'Anna Kowalska',
    addedAt: '2025-01-28',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop',
    wifi: 'Fast',
    outlets: 'Plentiful',
    noise: 'Chatter',
  },
  {
    id: 'p2',
    name: 'Quiet Corner Cafe',
    category: 'cafe',
    description: 'Small cafe with comfortable seating, perfect for focused work sessions.',
    address: 'ul. Grodzka 42, Kraków',
    addedBy: 'Piotr Nowak',
    addedAt: '2025-01-27',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=400&auto=format&fit=crop',
    wifi: 'Reliable',
    outlets: 'Limited',
    noise: 'Silent',
  },
  {
    id: 'p3',
    name: 'City Central Library',
    category: 'library',
    description: 'Large public library with study rooms and computer access.',
    address: 'ul. Długa 8, Kraków',
    addedBy: 'Marta Wiśniewska',
    addedAt: '2025-01-25',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=400&auto=format&fit=crop',
    wifi: 'Fast',
    outlets: 'Plentiful',
    noise: 'Silent',
  },
  {
    id: 'a1',
    name: 'Kawiarnia Literacka',
    category: 'cafe',
    description: 'Cozy bookstore cafe with ample seating.',
    address: 'ul. Karmelicka 12, Kraków',
    addedBy: 'Jakub W.',
    addedAt: '2025-01-20',
    status: 'approved',
    imageUrl: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=400&auto=format&fit=crop',
    wifi: 'Fast',
    outlets: 'Plentiful',
    noise: 'Lively',
  },
  {
    id: 'a2',
    name: 'The Daily Grind Roasters',
    category: 'cafe',
    description: 'Great coffee, but seating fills up quickly.',
    address: 'ul. Szewska 28, Kraków',
    addedBy: 'Rafał K.',
    addedAt: '2025-01-18',
    status: 'approved',
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400&auto=format&fit=crop',
    wifi: 'Fast',
    outlets: 'Limited',
    noise: 'Loud',
  },
  {
    id: 'r1',
    name: 'Old Town Study Room',
    category: 'coworking',
    description: 'Too noisy and crowded, not suitable for work.',
    address: 'ul. Bracka 5, Kraków',
    addedBy: 'Test User',
    addedAt: '2025-01-15',
    status: 'rejected',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=400&auto=format&fit=crop',
    wifi: 'Spotty',
    outlets: 'None',
    noise: 'Loud',
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

// Kolor statusu
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'approved': return '#059669';
    case 'rejected': return '#DC2626';
    default: return COLORS.textMuted;
  }
};

const getStatusBg = (status) => {
  switch (status) {
    case 'pending': return '#FFF7ED';
    case 'approved': return '#ECFDF5';
    case 'rejected': return '#FEF2F2';
    default: return '#F3F4F6';
  }
};

export default function AdminPanelScreen({ navigation }) {
  const [spots, setSpots] = useState(INITIAL_SPOTS);
  const [activeTab, setActiveTab] = useState('pending');

  // Filtrowanie po statusie
  const filteredSpots = spots.filter(s => s.status === activeTab);
  const pendingCount = spots.filter(s => s.status === 'pending').length;
  const approvedCount = spots.filter(s => s.status === 'approved').length;
  const rejectedCount = spots.filter(s => s.status === 'rejected').length;

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
          onPress: () => {
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
          onPress: () => {
            setSpots(prev => prev.filter(s => s.id !== spotId));
          },
        },
      ]
    );
  };

  // Renderowanie karty miejsca w panelu admina
  const renderSpotCard = (spot) => (
    <View key={spot.id} style={styles.card}>
      {/* Zdjęcie z badge statusu */}
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: spot.imageUrl }} style={styles.cardImage} />
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(spot.status) }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(spot.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(spot.status) }]}>
            {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
          </Text>
        </View>
        <View style={styles.categoryBadgeOnImage}>
          <Ionicons name={getCategoryIcon(spot.category)} size={12} color={COLORS.white} />
          <Text style={styles.categoryBadgeText}>
            {spot.category.charAt(0).toUpperCase() + spot.category.slice(1)}
          </Text>
        </View>
      </View>

      {/* Treść karty */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{spot.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>{spot.description}</Text>

        {/* Adres */}
        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.cardMetaText}>{spot.address}</Text>
        </View>

        {/* Dodane przez */}
        <View style={styles.cardMeta}>
          <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.cardMetaText}>Dodane przez: {spot.addedBy}</Text>
        </View>

        {/* Data */}
        <View style={styles.cardMeta}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.cardMetaText}>{spot.addedAt}</Text>
        </View>

        {/* Udogodnienia */}
        <View style={styles.amenitiesRow}>
          <View style={styles.amenityChip}>
            <Ionicons name="wifi" size={12} color={COLORS.success} />
            <Text style={styles.amenityText}>{spot.wifi}</Text>
          </View>
          <View style={styles.amenityChip}>
            <Ionicons name="power" size={12} color={COLORS.primary} />
            <Text style={styles.amenityText}>{spot.outlets}</Text>
          </View>
          <View style={styles.amenityChip}>
            <Ionicons
              name={spot.noise === 'Silent' ? 'volume-mute' : 'volume-high'}
              size={12}
              color={COLORS.primary}
            />
            <Text style={styles.amenityText}>{spot.noise}</Text>
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
                <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleStatusChange(spot.id, 'rejected')}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color={COLORS.danger} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}

          {spot.status === 'approved' && (
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleStatusChange(spot.id, 'rejected')}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.danger} />
              <Text style={styles.rejectButtonText}>Revoke</Text>
            </TouchableOpacity>
          )}

          {spot.status === 'rejected' && (
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleStatusChange(spot.id, 'approved')}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
              <Text style={styles.approveButtonText}>Restore</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(spot.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Nagłówek */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Statystyki */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[
              styles.statCard,
              activeTab === 'pending' && styles.statCardActive,
            ]}
            onPress={() => setActiveTab('pending')}
          >
            <View style={[styles.statIconWrap, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              activeTab === 'approved' && styles.statCardActive,
            ]}
            onPress={() => setActiveTab('approved')}
          >
            <View style={[styles.statIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
            </View>
            <Text style={styles.statNumber}>{approvedCount}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              activeTab === 'rejected' && styles.statCardActive,
            ]}
            onPress={() => setActiveTab('rejected')}
          >
            <View style={[styles.statIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="close-circle" size={20} color="#DC2626" />
            </View>
            <Text style={styles.statNumber}>{rejectedCount}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
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
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' ? 'Brak oczekujących' :
               activeTab === 'approved' ? 'Brak zatwierdzonych' :
               'Brak odrzuconych'}
            </Text>
            <Text style={styles.emptySubtext}>
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
    backgroundColor: COLORS.background,
  },

  // Nagłówek
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Statystyki
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
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
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.white,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.cardShadow,
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
    backgroundColor: COLORS.border,
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
    color: COLORS.white,
  },

  // Treść karty
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  approveButtonText: {
    color: COLORS.white,
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
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  // Pusty stan
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
});
