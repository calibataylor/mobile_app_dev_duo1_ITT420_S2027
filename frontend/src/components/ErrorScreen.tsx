import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';
import ThemedText from './ThemedText';
import Button from './Button';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({ message = 'Something went wrong', onRetry }: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
      <ThemedText variant="subtitle" style={styles.message}>
        {message}
      </ThemedText>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          icon="refresh"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  message: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  button: {
    marginTop: SPACING.lg,
  },
});
