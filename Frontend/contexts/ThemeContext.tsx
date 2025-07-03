import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    inputBackground: string;
    inputBorder: string;
    shadow: string;
    overlay: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@agrisol_dark_mode';

const lightColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  primary: '#059669',
  primaryLight: '#d1fae5',
  secondary: '#6366f1',
  accent: '#f59e0b',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  inputBackground: '#ffffff',
  inputBorder: '#d1d5db',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors = {
  background: '#111827',
  surface: '#1f2937',
  card: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  primary: '#10b981',
  primaryLight: '#064e3b',
  secondary: '#818cf8',
  accent: '#fbbf24',
  border: '#374151',
  borderLight: '#4b5563',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  inputBackground: '#374151',
  inputBorder: '#4b5563',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMode));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
