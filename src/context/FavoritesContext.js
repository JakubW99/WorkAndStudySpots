// src/context/FavoritesContext.js
// Kontekst ulubionych miejsc — stan lokalny w pamięci sesji (bez AsyncStorage)

import React, { createContext, useContext, useState } from 'react';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Dodaj/usuń z ulubionych
  const toggleFavorite = (spot) => {
    setFavorites((prev) => {
      const exists = prev.find((s) => s.id === spot.id);
      if (exists) {
        return prev.filter((s) => s.id !== spot.id);
      } else {
        return [...prev, spot];
      }
    });
  };

  // Sprawdź czy spot jest w ulubionych
  const isFavorite = (spotId) => {
    return favorites.some((s) => s.id === spotId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites musi byc uzyty wewnatrz FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
