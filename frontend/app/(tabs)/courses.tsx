import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { useSettings } from '../../src/context/SettingsContext';
import { useApi } from '../../src/hooks/useApi';
import { Course } from '../../src/types';
import ThemedText from '../../src/components/ThemedText';
import Card from '../../src/components/Card';
import LoadingScreen from '../../src/components/LoadingScreen';
import ErrorScreen from '../../src/components/ErrorScreen';

export default function CoursesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, fontScale, isFavorite, addFavorite, removeFavorite } = useSettings();
  const { data: courses, loading, error, refetch } = useApi<Course[]>('/courses');

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((course) => {
      return course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.lecturer.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [courses, searchQuery]);

  const toggleFavorite = (id: string) => {
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  if (loading) return <LoadingScreen message="Loading courses..." />;
  if (error) return <ErrorScreen message={error} onRetry={refetch} />;

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, highContrast && styles.highContrastSearch]}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={[styles.searchInput, { fontSize: 16 * fontScale }]}
            placeholder="Search by code, title, or lecturer"
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search courses"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Courses List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.md }}
        showsVerticalScrollIndicator={false}
      >
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            style={styles.courseCard}
            onPress={() => router.push(`/course/${course.id}`)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.codeChip, highContrast && styles.highContrastChip]}>
                <ThemedText variant="label" color={highContrast ? '#000' : COLORS.white}>
                  {course.code}
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(course.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel={isFavorite(course.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Ionicons
                  name={isFavorite(course.id) ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={isFavorite(course.id) ? COLORS.gold : COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <ThemedText variant="subtitle" style={styles.courseTitle}>
              {course.title}
            </ThemedText>

            <ThemedText variant="body" color={COLORS.textSecondary} numberOfLines={2} style={styles.description}>
              {course.description}
            </ThemedText>

            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
                <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.footerText}>
                  {course.lecturer}
                </ThemedText>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="school-outline" size={16} color={COLORS.textSecondary} />
                <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.footerText}>
                  {course.credits} Credits
                </ThemedText>
              </View>
            </View>

            {course.prerequisites.length > 0 && (
              <View style={styles.prereqContainer}>
                <ThemedText variant="caption" color={COLORS.textSecondary}>
                  Prerequisites: {course.prerequisites.join(', ')}
                </ThemedText>
              </View>
            )}
          </Card>
        ))}

        {filteredCourses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="book" size={48} color={COLORS.textLight} />
            <ThemedText variant="body" color={COLORS.textSecondary} style={styles.emptyText}>
              No courses found
            </ThemedText>
          </View>
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
  searchContainer: {
    padding: SPACING.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    ...SHADOWS.sm,
  },
  highContrastSearch: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.highContrastText,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.textPrimary,
  },
  list: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  courseCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  codeChip: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  highContrastChip: {
    backgroundColor: COLORS.highContrastAccent,
  },
  courseTitle: {
    marginBottom: SPACING.xs,
  },
  description: {
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: SPACING.xs,
  },
  prereqContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.md,
  },
});
