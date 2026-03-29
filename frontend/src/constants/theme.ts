// UCC Connect Theme Constants
import { Platform } from 'react-native';

export const COLORS = {
  // Primary Colors
  navy: '#0D2340',
  gold: '#D4A017',
  
  // Background Colors
  white: '#FFFFFF',
  background: '#F5F7FA',
  lightGray: '#E8ECF0',
  
  // Text Colors
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Card & Border
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.08)',
  
  // High Contrast Colors
  highContrastBg: '#000000',
  highContrastText: '#FFFFFF',
  highContrastAccent: '#FFD700',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// Platform-compatible shadows
const createShadow = (offsetY: number, blur: number, opacity: number, elevation: number) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${blur}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation: elevation,
  };
};

export const SHADOWS = {
  sm: createShadow(1, 2, 0.05, 1),
  md: createShadow(2, 4, 0.08, 3),
  lg: createShadow(4, 8, 0.1, 5),
};
