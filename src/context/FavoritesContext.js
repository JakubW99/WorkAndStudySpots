// src/context/FavoritesContext.js
// Kontekst ulubionych miejsc — persystowany w AsyncStorage

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext(null);
const STORAGE_KEY = '@favorites';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Odczyt ulubionych z AsyncStorage przy montowaniu
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          setFavorites(JSON.parse(json));
        }
      } catch (err) {
        console.warn('FavoritesContext: loadFavorites error', err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadFavorites();
  }, []);

  // Zapis do AsyncStorage przy każdej zmianie (pomijamy pierwszy render)
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch((err) =>
      console.warn('FavoritesContext: saveFavorites error', err)
    );
  }, [favorites, isLoaded]);

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
