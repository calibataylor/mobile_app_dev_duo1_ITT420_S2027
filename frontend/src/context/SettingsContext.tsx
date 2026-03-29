import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  fontScale: number;
  setFontScale: (scale: number) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FONT_SCALE: 'ucc_font_scale',
  HIGH_CONTRAST: 'ucc_high_contrast',
  REDUCED_MOTION: 'ucc_reduced_motion',
  FAVORITES: 'ucc_favorites',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScaleState] = useState(1);
  const [highContrast, setHighContrastState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedFontScale = await AsyncStorage.getItem(STORAGE_KEYS.FONT_SCALE);
      const savedHighContrast = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST);
      const savedReducedMotion = await AsyncStorage.getItem(STORAGE_KEYS.REDUCED_MOTION);
      const savedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);

      if (savedFontScale) setFontScaleState(parseFloat(savedFontScale));
      if (savedHighContrast) setHighContrastState(savedHighContrast === 'true');
      if (savedReducedMotion) setReducedMotionState(savedReducedMotion === 'true');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setFontScale = async (scale: number) => {
    setFontScaleState(scale);
    await AsyncStorage.setItem(STORAGE_KEYS.FONT_SCALE, scale.toString());
  };

  const setHighContrast = async (enabled: boolean) => {
    setHighContrastState(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, enabled.toString());
  };

  const setReducedMotion = async (enabled: boolean) => {
    setReducedMotionState(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, enabled.toString());
  };

  const addFavorite = async (id: string) => {
    const newFavorites = [...favorites, id];
    setFavorites(newFavorites);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
  };

  const removeFavorite = async (id: string) => {
    const newFavorites = favorites.filter(f => f !== id);
    setFavorites(newFavorites);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return (
    <SettingsContext.Provider
      value={{
        fontScale,
        setFontScale,
        highContrast,
        setHighContrast,
        reducedMotion,
        setReducedMotion,
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
