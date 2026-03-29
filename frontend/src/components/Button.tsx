import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import ThemedText from './ThemedText';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const { highContrast } = useSettings();

  const getBackgroundColor = () => {
    if (highContrast) return variant === 'primary' ? COLORS.highContrastAccent : 'transparent';
    switch (variant) {
      case 'primary': return COLORS.navy;
      case 'secondary': return COLORS.gold;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return COLORS.navy;
    }
  };

  const getTextColor = () => {
    if (highContrast) return variant === 'primary' ? '#000' : COLORS.highContrastText;
    switch (variant) {
      case 'primary': return COLORS.white;
      case 'secondary': return COLORS.navy;
      case 'outline': return COLORS.navy;
      case 'ghost': return COLORS.navy;
      default: return COLORS.white;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
      case 'large': return { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl };
      default: return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getPadding(),
        variant === 'outline' && styles.outline,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        highContrast && variant !== 'primary' && styles.highContrastBorder,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === 'small' ? 16 : 20} color={getTextColor()} style={styles.icon} />}
          <ThemedText variant={size === 'small' ? 'caption' : 'body'} color={getTextColor()} style={styles.text}>
            {title}
          </ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    minHeight: 48,
    ...SHADOWS.sm,
  },
  outline: {
    borderWidth: 2,
    borderColor: COLORS.navy,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  highContrastBorder: {
    borderWidth: 2,
    borderColor: COLORS.highContrastText,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  text: {
    fontWeight: '600',
  },
});
