import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { COLORS, FONT_SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

interface ThemedTextProps {
  children: React.ReactNode;
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  accessibilityLabel?: string;
}

export default function ThemedText({
  children,
  variant = 'body',
  color,
  style,
  numberOfLines,
  accessibilityLabel,
}: ThemedTextProps) {
  const { fontScale, highContrast } = useSettings();

  const getTextStyle = (): TextStyle => {
    const baseSize = FONT_SIZES[variant === 'hero' ? 'hero' : variant === 'title' ? 'xxl' : variant === 'subtitle' ? 'lg' : variant === 'caption' ? 'xs' : variant === 'label' ? 'sm' : 'md'];
    
    return {
      fontSize: baseSize * fontScale,
      fontWeight: variant === 'hero' || variant === 'title' ? '700' : variant === 'subtitle' ? '600' : '400',
      color: highContrast ? COLORS.highContrastText : (color || COLORS.textPrimary),
      lineHeight: baseSize * fontScale * 1.4,
    };
  };

  return (
    <Text
      style={[getTextStyle(), style]}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      accessible={true}
    >
      {children}
    </Text>
  );
}
