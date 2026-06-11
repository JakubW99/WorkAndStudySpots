import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import RatingStars from './RatingStars';

// Karta recenzji — wyświetla avatar, imię, czas, ocenę i komentarz
export default function ReviewCard({ userName, timeAgo, rating, comment, avatarUrl }) {
  return (
    <View style={styles.container}>
      {/* Nagłówek: avatar + dane użytkownika */}
      <View style={styles.header}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          defaultSource={{ uri: 'https://i.pravatar.cc/100?img=0' }}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>
      </View>

      {/* Gwiazdki oceny */}
      <View style={styles.ratingRow}>
        <RatingStars rating={rating} size={14} />
      </View>

      {/* Tekst recenzji */}
      <Text style={styles.comment}>{comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    color: '#1E1B4B',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  ratingRow: {
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
