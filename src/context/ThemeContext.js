// src/context/ThemeContext.js
// Globalny kontekst motywu — Dark Mode (stan lokalny w pamięci sesji)

import React, { createContext, useContext, useState } from 'react';
import { COLORS, DARK_COLORS } from '../theme/colors';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Przełącz motyw
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const colors = isDarkMode ? DARK_COLORS : COLORS;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme musi byc uzyty wewnatrz ThemeProvider');
  }
  return context;
};

export default ThemeContext;
