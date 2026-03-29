import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import { useApi } from '@/src/hooks/useApi';
import { Course } from '@/src/types';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';
import LoadingScreen from '@/src/components/LoadingScreen';
import ErrorScreen from '@/src/components/ErrorScreen';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, isFavorite, addFavorite, removeFavorite } = useSettings();
  const { data: course, loading, error, refetch } = useApi<Course>(`/courses/${id}`);

  const toggleFavorite = () => {
    if (course) {
      if (isFavorite(course.id)) {
        removeFavorite(course.id);
      } else {
        addFavorite(course.id);
      }
    }
  };

  if (loading) return <LoadingScreen message="Loading course details..." />;
  if (error || !course) return <ErrorScreen message={error || 'Course not found'} onRetry={refetch} />;

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={[styles.codeChip, highContrast && styles.highContrastChip]}>
              <ThemedText variant="subtitle" color={highContrast ? '#000' : COLORS.white}>
                {course.code}
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={toggleFavorite}
              style={styles.favoriteButton}
              accessibilityLabel={isFavorite(course.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Ionicons
                name={isFavorite(course.id) ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color={isFavorite(course.id) ? COLORS.gold : COLORS.textLight}
              />
            </TouchableOpacity>
          </View>
          <ThemedText variant="title" style={styles.courseTitle}>
            {course.title}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="school" size={18} color={COLORS.textSecondary} />
              <ThemedText variant="body" color={COLORS.textSecondary} style={styles.metaText}>
                {course.credits} Credits
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={18} color={COLORS.textSecondary} />
              <ThemedText variant="body" color={COLORS.textSecondary} style={styles.metaText}>
                {course.semester}
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Description
          </ThemedText>
          <ThemedText variant="body" color={COLORS.textSecondary}>
            {course.description}
          </ThemedText>
        </Card>

        {/* Lecturer */}
        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Instructor
          </ThemedText>
          <View style={styles.lecturerRow}>
            <View style={styles.lecturerAvatar}>
              <Ionicons name="person" size={24} color={COLORS.navy} />
            </View>
            <ThemedText variant="body">
              {course.lecturer}
            </ThemedText>
          </View>
        </Card>

        {/* Prerequisites */}
        {course.prerequisites.length > 0 && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Prerequisites
            </ThemedText>
            <View style={styles.prereqList}>
              {course.prerequisites.map((prereq, index) => (
                <View key={index} style={styles.prereqItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <ThemedText variant="body" style={styles.prereqText}>
                    {prereq}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Learning Outcomes */}
        {course.learning_outcomes.length > 0 && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Learning Outcomes
            </ThemedText>
            {course.learning_outcomes.map((outcome, index) => (
              <View key={index} style={styles.outcomeItem}>
                <View style={styles.outcomeBullet}>
                  <ThemedText variant="caption" color={COLORS.white}>
                    {index + 1}
                  </ThemedText>
                </View>
                <ThemedText variant="body" color={COLORS.textSecondary} style={styles.outcomeText}>
                  {outcome}
                </ThemedText>
              </View>
            ))}
          </Card>
        )}

        {/* Assessment Methods */}
        {course.assessment_methods.length > 0 && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Assessment Methods
            </ThemedText>
            {course.assessment_methods.map((method, index) => (
              <View key={index} style={styles.assessmentItem}>
                <Ionicons name="document-text-outline" size={18} color={COLORS.gold} />
                <ThemedText variant="body" color={COLORS.textSecondary} style={styles.assessmentText}>
                  {method}
                </ThemedText>
              </View>
            ))}
          </Card>
        )}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  codeChip: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  highContrastChip: {
    backgroundColor: COLORS.highContrastAccent,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  courseTitle: {
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  lecturerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lecturerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  prereqList: {
    gap: SPACING.sm,
  },
  prereqItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prereqText: {
    marginLeft: SPACING.sm,
  },
  outcomeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  outcomeBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  outcomeText: {
    flex: 1,
  },
  assessmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  assessmentText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
});
