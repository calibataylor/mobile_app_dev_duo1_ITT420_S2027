import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
  } = useSettings();

  const fontScalePercent = Math.round(fontScale * 100);

  const decreaseFontSize = () => {
    setFontScale(Math.max(1, fontScale - 0.1));
  };

  const increaseFontSize = () => {
    setFontScale(Math.min(1.7, fontScale + 0.1));
  };

  const resetFontSize = () => {
    setFontScale(1);
  };

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="body" color={COLORS.textSecondary} style={styles.intro}>
          Customize your app experience for better accessibility.
        </ThemedText>

        {/* Font Size */}
        <Card style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Ionicons name="text" size={24} color={highContrast ? COLORS.highContrastAccent : COLORS.navy} />
            <View style={styles.settingInfo}>
              <ThemedText variant="subtitle">Font Size</ThemedText>
              <ThemedText variant="caption" color={COLORS.textSecondary}>
                Current: {fontScalePercent}%
              </ThemedText>
            </View>
          </View>
          
          {/* Font Size Progress Bar */}
          <View style={styles.progressContainer}>
            <ThemedText variant="caption">100%</ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((fontScale - 1) / 0.7) * 100}%` },
                  highContrast && { backgroundColor: COLORS.highContrastAccent }
                ]} 
              />
            </View>
            <ThemedText variant="caption">170%</ThemedText>
          </View>
          
          <View style={styles.fontSizeButtons}>
            <TouchableOpacity
              style={[styles.fontButton, highContrast && styles.highContrastButton]}
              onPress={decreaseFontSize}
              accessibilityLabel="Decrease font size"
            >
              <ThemedText variant="subtitle">A-</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fontButton, styles.fontButtonPrimary, highContrast && styles.highContrastButtonPrimary]}
              onPress={resetFontSize}
              accessibilityLabel="Reset font size"
            >
              <ThemedText variant="body" color={highContrast ? '#000' : COLORS.white}>Reset</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fontButton, highContrast && styles.highContrastButton]}
              onPress={increaseFontSize}
              accessibilityLabel="Increase font size"
            >
              <ThemedText variant="subtitle">A+</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.previewBox, highContrast && styles.highContrastPreview]}>
            <ThemedText variant="caption" color={COLORS.textSecondary}>
              Preview:
            </ThemedText>
            <ThemedText variant="body">
              This is how text will appear in the app.
            </ThemedText>
          </View>
        </Card>

        {/* High Contrast */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="contrast" size={24} color={highContrast ? COLORS.highContrastAccent : COLORS.navy} />
              <View style={styles.settingInfo}>
                <ThemedText variant="subtitle">High Contrast Mode</ThemedText>
                <ThemedText variant="caption" color={COLORS.textSecondary}>
                  Improve visibility with stronger colors
                </ThemedText>
              </View>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: COLORS.lightGray, true: COLORS.gold }}
              thumbColor={COLORS.white}
              accessibilityLabel="Toggle high contrast mode"
            />
          </View>
        </Card>

        {/* Reduced Motion */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="pause-circle" size={24} color={highContrast ? COLORS.highContrastAccent : COLORS.navy} />
              <View style={styles.settingInfo}>
                <ThemedText variant="subtitle">Reduced Motion</ThemedText>
                <ThemedText variant="caption" color={COLORS.textSecondary}>
                  Minimize animations and transitions
                </ThemedText>
              </View>
            </View>
            <Switch
              value={reducedMotion}
              onValueChange={setReducedMotion}
              trackColor={{ false: COLORS.lightGray, true: COLORS.gold }}
              thumbColor={COLORS.white}
              accessibilityLabel="Toggle reduced motion"
            />
          </View>
        </Card>

        {/* Info */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.infoText}>
            These settings are saved automatically and will persist across app sessions.
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  highContrastBg: {
    backgroundColor: COLORS.highContrastBg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  intro: {
    marginBottom: SPACING.lg,
  },
  settingCard: {
    marginBottom: SPACING.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  settingInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.navy,
    borderRadius: 4,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  fontButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
    minHeight: 48,
    justifyContent: 'center',
  },
  fontButtonPrimary: {
    backgroundColor: COLORS.navy,
  },
  highContrastButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.highContrastText,
  },
  highContrastButtonPrimary: {
    backgroundColor: COLORS.highContrastAccent,
    borderWidth: 0,
  },
  previewBox: {
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.sm,
  },
  highContrastPreview: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.highContrastText,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
});
