import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';
import ThemedText from './ThemedText';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={COLORS.textLight} />
      <ThemedText variant="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {message && (
        <ThemedText variant="body" color={COLORS.textSecondary} style={styles.message}>
          {message}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  message: {
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
