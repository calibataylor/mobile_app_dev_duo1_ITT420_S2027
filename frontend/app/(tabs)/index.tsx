import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';

const QUICK_LINKS = [
  { id: 'faculty', title: 'Faculty', icon: 'people', route: '/(tabs)/faculty', color: '#3B82F6' },
  { id: 'courses', title: 'Courses', icon: 'book', route: '/(tabs)/courses', color: '#10B981' },
  { id: 'announcements', title: 'News', icon: 'megaphone', route: '/(tabs)/more', color: '#F59E0B' },
  { id: 'resources', title: 'Resources', icon: 'folder', route: '/(tabs)/more', color: '#8B5CF6' },
];

const FEATURES = [
  { id: 'deadlines', title: 'Deadlines', icon: 'calendar', route: '/(tabs)/more', desc: 'Track important dates' },
  { id: 'notes', title: 'My Notes', icon: 'document-text', route: '/(tabs)/more', desc: 'Personal scratchpad' },
  { id: 'faq', title: 'FAQ', icon: 'help-circle', route: '/(tabs)/more', desc: 'Common questions' },
  { id: 'emergency', title: 'Emergency', icon: 'warning', route: '/(tabs)/more', desc: 'Campus contacts' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, fontScale } = useSettings();

  const handleEmailHOD = () => {
    Linking.openURL('mailto:m.johnson@ucc.edu.jm?subject=Inquiry%20from%20UCC%20Connect');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Banner */}
        <View style={[styles.welcomeBanner, highContrast && styles.highContrastCard]}>
          <View style={styles.welcomeContent}>
            <ThemedText variant="title" color={highContrast ? COLORS.highContrastAccent : COLORS.white}>
              Welcome to UCC Connect
            </ThemedText>
            <ThemedText variant="body" color={highContrast ? COLORS.highContrastText : 'rgba(255,255,255,0.9)'} style={styles.welcomeSubtitle}>
              Your IT Department companion
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettings}
            accessibilityLabel="Accessibility Settings"
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={24} color={highContrast ? COLORS.highContrastAccent : COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Quick Access */}
        <ThemedText variant="subtitle" style={styles.sectionTitle}>
          Quick Access
        </ThemedText>
        <View style={styles.quickLinksGrid}>
          {QUICK_LINKS.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={[
                styles.quickLinkCard,
                highContrast && styles.highContrastCard,
              ]}
              onPress={() => router.push(link.route as any)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={link.title}
            >
              <View style={[styles.quickLinkIcon, { backgroundColor: highContrast ? COLORS.highContrastAccent : link.color }]}>
                <Ionicons name={link.icon as any} size={28} color={highContrast ? '#000' : COLORS.white} />
              </View>
              <ThemedText variant="label" style={styles.quickLinkText}>
                {link.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features Section */}
        <ThemedText variant="subtitle" style={styles.sectionTitle}>
          Student Tools
        </ThemedText>
        {FEATURES.map((feature) => (
          <Card
            key={feature.id}
            style={styles.featureCard}
            onPress={() => router.push(feature.route as any)}
          >
            <View style={styles.featureContent}>
              <View style={[styles.featureIcon, highContrast && styles.highContrastIcon]}>
                <Ionicons name={feature.icon as any} size={24} color={highContrast ? COLORS.highContrastAccent : COLORS.navy} />
              </View>
              <View style={styles.featureText}>
                <ThemedText variant="subtitle">{feature.title}</ThemedText>
                <ThemedText variant="caption" color={COLORS.textSecondary}>
                  {feature.desc}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </View>
          </Card>
        ))}

        {/* Developer Credits */}
        <View style={[styles.creditsCard, highContrast && styles.highContrastCard]}>
          <ThemedText variant="caption" style={styles.creditsTitle}>
            Developed by
          </ThemedText>
          <ThemedText variant="body" style={styles.creditName}>
            Matthew Taylor (20244115)
          </ThemedText>
          <ThemedText variant="body" style={styles.creditName}>
            Taneika Cunningham (20216503)
          </ThemedText>
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.courseInfo}>
            ITT420 - Spring 2027
          </ThemedText>
        </View>
      </ScrollView>

      {/* FAB for Email HOD */}
      <TouchableOpacity
        style={[styles.fab, highContrast && styles.highContrastFab]}
        onPress={handleEmailHOD}
        activeOpacity={0.8}
        accessibilityLabel="Email Head of Department"
        accessibilityRole="button"
      >
        <Ionicons name="mail" size={24} color={highContrast ? '#000' : COLORS.white} />
      </TouchableOpacity>
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
  welcomeBanner: {
    backgroundColor: COLORS.navy,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeSubtitle: {
    marginTop: SPACING.xs,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
    marginBottom: SPACING.lg,
  },
  quickLinkCard: {
    width: '25%',
    padding: SPACING.xs,
    alignItems: 'center',
  },
  quickLinkIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  quickLinkText: {
    textAlign: 'center',
  },
  featureCard: {
    marginBottom: SPACING.sm,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  highContrastIcon: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.highContrastAccent,
  },
  featureText: {
    flex: 1,
  },
  creditsCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  highContrastCard: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.highContrastAccent,
  },
  creditsTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.textSecondary,
  },
  creditName: {
    fontWeight: '600',
  },
  courseInfo: {
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  highContrastFab: {
    backgroundColor: COLORS.highContrastAccent,
  },
});
