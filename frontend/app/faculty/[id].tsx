import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import { useApi } from '@/src/hooks/useApi';
import { FacultyMember } from '@/src/types';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import LoadingScreen from '@/src/components/LoadingScreen';
import ErrorScreen from '@/src/components/ErrorScreen';

export default function FacultyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, isFavorite, addFavorite, removeFavorite } = useSettings();
  const { data: faculty, loading, error, refetch } = useApi<FacultyMember>(`/faculty/${id}`);

  const handleCall = () => {
    if (faculty) Linking.openURL(`tel:${faculty.phone}`);
  };

  const handleEmail = () => {
    if (faculty) Linking.openURL(`mailto:${faculty.email}`);
  };

  const handleConsultation = () => {
    if (faculty) {
      router.push({
        pathname: '/consultation',
        params: { name: faculty.name, email: faculty.email },
      });
    }
  };

  const toggleFavorite = () => {
    if (faculty) {
      if (isFavorite(faculty.id)) {
        removeFavorite(faculty.id);
      } else {
        addFavorite(faculty.id);
      }
    }
  };

  if (loading) return <LoadingScreen message="Loading faculty details..." />;
  if (error || !faculty) return <ErrorScreen message={error || 'Faculty not found'} onRetry={refetch} />;

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={[styles.avatar, highContrast && styles.highContrastAvatar]}>
              <ThemedText variant="hero" color={highContrast ? COLORS.highContrastAccent : COLORS.white}>
                {faculty.name.split(' ').map(n => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <ThemedText variant="title" style={styles.name}>
                  {faculty.name}
                </ThemedText>
                <TouchableOpacity
                  onPress={toggleFavorite}
                  style={styles.favoriteButton}
                  accessibilityLabel={isFavorite(faculty.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Ionicons
                    name={isFavorite(faculty.id) ? 'heart' : 'heart-outline'}
                    size={28}
                    color={isFavorite(faculty.id) ? COLORS.error : COLORS.textLight}
                  />
                </TouchableOpacity>
              </View>
              <ThemedText variant="body" color={COLORS.textSecondary}>
                {faculty.title}
              </ThemedText>
              <View style={styles.roleChip}>
                <ThemedText variant="label" color={COLORS.gold}>
                  {faculty.role}
                </ThemedText>
              </View>
            </View>
          </View>
        </Card>

        {/* Bio */}
        {faculty.bio && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              About
            </ThemedText>
            <ThemedText variant="body" color={COLORS.textSecondary}>
              {faculty.bio}
            </ThemedText>
          </Card>
        )}

        {/* Contact Info */}
        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Contact Information
          </ThemedText>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            <ThemedText variant="body" style={styles.infoText}>
              {faculty.email}
            </ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
            <ThemedText variant="body" style={styles.infoText}>
              {faculty.phone}
            </ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
            <ThemedText variant="body" style={styles.infoText}>
              {faculty.office}
            </ThemedText>
          </View>
          
          {faculty.office_hours && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
              <ThemedText variant="body" style={styles.infoText}>
                {faculty.office_hours}
              </ThemedText>
            </View>
          )}
        </Card>

        {/* Specialization */}
        {faculty.specialization && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Specialization
            </ThemedText>
            <View style={styles.specializationTags}>
              {faculty.specialization.split(',').map((spec, index) => (
                <View key={index} style={styles.specTag}>
                  <ThemedText variant="caption" color={COLORS.navy}>
                    {spec.trim()}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Call"
            onPress={handleCall}
            icon="call"
            variant="primary"
            style={styles.actionButton}
          />
          <Button
            title="Email"
            onPress={handleEmail}
            icon="mail"
            variant="outline"
            style={styles.actionButton}
          />
        </View>
        <Button
          title="Request Consultation"
          onPress={handleConsultation}
          icon="calendar"
          variant="secondary"
          fullWidth
        />
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
  headerCard: {
    marginBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  highContrastAvatar: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.highContrastAccent,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  roleChip: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  specializationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  specTag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
});
