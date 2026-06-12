import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import RatingStars from './RatingStars';
import { useTheme } from '../context/ThemeContext';

// Karta recenzji — wyświetla avatar, imię, czas, ocenę i komentarz
export default function ReviewCard({ userName, timeAgo, rating, comment, avatarUrl }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
      {/* Nagłówek: avatar + dane użytkownika */}
      <View style={styles.header}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          defaultSource={{ uri: 'https://i.pravatar.cc/100?img=0' }}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{userName}</Text>
          <Text style={[styles.timeAgo, { color: colors.textMuted }]}>{timeAgo}</Text>
        </View>
      </View>

      {/* Gwiazdki oceny */}
      <View style={styles.ratingRow}>
        <RatingStars rating={rating} size={14} />
      </View>

      {/* Tekst recenzji */}
      <Text style={[styles.comment, { color: colors.textSecondary }]}>{comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingRow: {
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
  },
});
