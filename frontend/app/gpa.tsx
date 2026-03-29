import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import { useApi, apiPost, apiDelete } from '@/src/hooks/useApi';
import { GradeEntry, GPAResult } from '@/src/types';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import LoadingScreen from '@/src/components/LoadingScreen';
import EmptyState from '@/src/components/EmptyState';

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
const SEMESTERS = ['Fall', 'Spring', 'Summer'];
const YEARS = ['2024', '2025', '2026', '2027', '2028'];

const GRADE_COLORS: { [key: string]: string } = {
  'A+': '#10B981', 'A': '#10B981', 'A-': '#34D399',
  'B+': '#3B82F6', 'B': '#3B82F6', 'B-': '#60A5FA',
  'C+': '#F59E0B', 'C': '#F59E0B', 'C-': '#FBBF24',
  'D+': '#EF4444', 'D': '#EF4444', 'D-': '#F87171',
  'F': '#991B1B'
};

export default function GPACalculatorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, fontScale } = useSettings();
  const { data: grades, loading, refetch } = useApi<GradeEntry[]>('/grades');
  const { data: gpaData, refetch: refetchGPA } = useApi<GPAResult>('/gpa');

  const [showAddModal, setShowAddModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('3');
  const [grade, setGrade] = useState('A');
  const [semester, setSemester] = useState('Spring');
  const [year, setYear] = useState('2027');
  const [saving, setSaving] = useState(false);

  const handleAddGrade = async () => {
    if (!courseCode.trim() || !courseName.trim()) {
      Alert.alert('Missing Information', 'Please enter course code and name.');
      return;
    }

    setSaving(true);
    try {
      await apiPost('/grades', {
        course_code: courseCode.toUpperCase(),
        course_name: courseName,
        credits: parseInt(credits) || 3,
        grade,
        semester,
        year,
      });
      setShowAddModal(false);
      setCourseCode('');
      setCourseName('');
      setCredits('3');
      setGrade('A');
      refetch();
      refetchGPA();
    } catch (error) {
      Alert.alert('Error', 'Failed to add grade.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrade = (gradeId: string) => {
    Alert.alert('Delete Grade', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await apiDelete(`/grades/${gradeId}`);
          refetch();
          refetchGPA();
        },
      },
    ]);
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return COLORS.success;
    if (gpa >= 3.0) return COLORS.info;
    if (gpa >= 2.0) return COLORS.warning;
    return COLORS.error;
  };

  if (loading) return <LoadingScreen message="Loading grades..." />;

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* GPA Summary Card */}
        <Card style={styles.gpaCard}>
          <ThemedText variant="caption" color={COLORS.textSecondary}>Cumulative GPA</ThemedText>
          <View style={styles.gpaDisplay}>
            <ThemedText
              variant="hero"
              color={getGPAColor(gpaData?.cumulative_gpa || 0)}
              style={styles.gpaNumber}
            >
              {(gpaData?.cumulative_gpa || 0).toFixed(2)}
            </ThemedText>
            <ThemedText variant="body" color={COLORS.textSecondary}>/4.00</ThemedText>
          </View>
          <ThemedText variant="caption" color={COLORS.textSecondary}>
            Total Credits: {gpaData?.total_credits || 0}
          </ThemedText>
        </Card>

        {/* Semester GPAs */}
        {gpaData?.semesters && gpaData.semesters.length > 0 && (
          <>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>Semester GPAs</ThemedText>
            <View style={styles.semesterGrid}>
              {gpaData.semesters.map((sem, index) => (
                <Card key={index} style={styles.semesterCard}>
                  <ThemedText variant="caption" color={COLORS.textSecondary}>{sem.semester}</ThemedText>
                  <ThemedText variant="title" color={getGPAColor(sem.gpa)}>
                    {sem.gpa.toFixed(2)}
                  </ThemedText>
                  <ThemedText variant="caption" color={COLORS.textLight}>
                    {sem.credits} credits
                  </ThemedText>
                </Card>
              ))}
            </View>
          </>
        )}

        {/* Grades List */}
        <ThemedText variant="subtitle" style={styles.sectionTitle}>Course Grades</ThemedText>
        {grades && grades.length > 0 ? (
          grades.map((g) => (
            <Card key={g.id} style={styles.gradeCard}>
              <View style={styles.gradeRow}>
                <View style={[styles.gradeBadge, { backgroundColor: GRADE_COLORS[g.grade] || COLORS.textLight }]}>
                  <ThemedText variant="subtitle" color={COLORS.white}>{g.grade}</ThemedText>
                </View>
                <View style={styles.gradeInfo}>
                  <ThemedText variant="subtitle">{g.course_code}</ThemedText>
                  <ThemedText variant="body" color={COLORS.textSecondary} numberOfLines={1}>
                    {g.course_name}
                  </ThemedText>
                  <ThemedText variant="caption" color={COLORS.textLight}>
                    {g.semester} {g.year} • {g.credits} credits
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => handleDeleteGrade(g.id)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="school-outline"
            title="No Grades Yet"
            message="Add your course grades to calculate GPA"
          />
        )}
      </ScrollView>

      {/* Add Grade FAB */}
      <TouchableOpacity
        style={[styles.fab, highContrast && styles.highContrastFab]}
        onPress={() => setShowAddModal(true)}
        accessibilityLabel="Add grade"
      >
        <Ionicons name="add" size={28} color={highContrast ? '#000' : COLORS.white} />
      </TouchableOpacity>

      {/* Add Grade Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, highContrast && styles.highContrastBg]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <ThemedText variant="body" color={COLORS.error}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText variant="subtitle">Add Grade</ThemedText>
            <TouchableOpacity onPress={handleAddGrade} disabled={saving}>
              <ThemedText variant="body" color={COLORS.gold}>
                {saving ? 'Saving...' : 'Save'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <ThemedText variant="label" style={styles.label}>Course Code *</ThemedText>
              <TextInput
                style={[styles.input, { fontSize: 16 * fontScale }]}
                placeholder="e.g., ITT420"
                placeholderTextColor={COLORS.textLight}
                value={courseCode}
                onChangeText={setCourseCode}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText variant="label" style={styles.label}>Course Name *</ThemedText>
              <TextInput
                style={[styles.input, { fontSize: 16 * fontScale }]}
                placeholder="e.g., Mobile Application Development"
                placeholderTextColor={COLORS.textLight}
                value={courseName}
                onChangeText={setCourseName}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText variant="label" style={styles.label}>Credits</ThemedText>
              <View style={styles.creditButtons}>
                {['1', '2', '3', '4', '6'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.creditButton, credits === c && styles.creditButtonActive]}
                    onPress={() => setCredits(c)}
                  >
                    <ThemedText
                      variant="body"
                      color={credits === c ? COLORS.white : COLORS.textPrimary}
                    >
                      {c}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText variant="label" style={styles.label}>Grade</ThemedText>
              <View style={styles.gradeButtons}>
                {GRADES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.gradeButton,
                      grade === g && { backgroundColor: GRADE_COLORS[g] }
                    ]}
                    onPress={() => setGrade(g)}
                  >
                    <ThemedText
                      variant="caption"
                      color={grade === g ? COLORS.white : COLORS.textPrimary}
                    >
                      {g}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText variant="label" style={styles.label}>Semester</ThemedText>
                <View style={styles.pickerButtons}>
                  {SEMESTERS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.pickerButton, semester === s && styles.pickerButtonActive]}
                      onPress={() => setSemester(s)}
                    >
                      <ThemedText
                        variant="caption"
                        color={semester === s ? COLORS.white : COLORS.textPrimary}
                      >
                        {s}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText variant="label" style={styles.label}>Year</ThemedText>
              <View style={styles.yearButtons}>
                {YEARS.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearButton, year === y && styles.yearButtonActive]}
                    onPress={() => setYear(y)}
                  >
                    <ThemedText
                      variant="caption"
                      color={year === y ? COLORS.white : COLORS.textPrimary}
                    >
                      {y}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  gpaCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  gpaDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: SPACING.sm,
  },
  gpaNumber: {
    fontSize: 56,
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  semesterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  semesterCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
  },
  gradeCard: {
    marginBottom: SPACING.sm,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeBadge: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  gradeInfo: {
    flex: 1,
  },
  deleteButton: {
    padding: SPACING.sm,
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
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalContent: {
    padding: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.xs,
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    minHeight: 48,
  },
  creditButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  creditButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    minHeight: 44,
    justifyContent: 'center',
  },
  creditButtonActive: {
    backgroundColor: COLORS.navy,
  },
  gradeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  gradeButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    minHeight: 40,
    justifyContent: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pickerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pickerButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    minHeight: 40,
  },
  pickerButtonActive: {
    backgroundColor: COLORS.navy,
  },
  yearButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  yearButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    minHeight: 40,
  },
  yearButtonActive: {
    backgroundColor: COLORS.navy,
  },
});
