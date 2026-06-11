import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Komponent gwiazdek — wyświetlanie oceny lub interaktywny wybór
export default function RatingStars({ rating = 0, size = 16, interactive = false, onRate }) {
  const stars = [1, 2, 3, 4, 5];

  const renderStar = (starValue) => {
    const filled = starValue <= Math.round(rating);
    const iconName = filled ? 'star' : 'star-outline';
    const iconColor = filled ? '#F59E0B' : '#D1D5DB';

    if (interactive) {
      return (
        <TouchableOpacity
          key={starValue}
          onPress={() => onRate && onRate(starValue)}
          style={styles.starButton}
          activeOpacity={0.6}
        >
          <Ionicons name={iconName} size={size} color={iconColor} />
        </TouchableOpacity>
      );
    }

    return (
      <Ionicons
        key={starValue}
        name={iconName}
        size={size}
        color={iconColor}
        style={styles.starIcon}
      />
    );
  };

  return (
    <View style={styles.container}>
      {stars.map(renderStar)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  starButton: {
    marginRight: 4,
    padding: 2,
  },
});
