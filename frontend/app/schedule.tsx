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
import { ScheduleEntry } from '@/src/types';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';
import LoadingScreen from '@/src/components/LoadingScreen';
import EmptyState from '@/src/components/EmptyState';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];
const CLASS_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16'
];

export default function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, fontScale } = useSettings();
  const { data: schedule, loading, refetch } = useApi<ScheduleEntry[]>('/schedule');

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showAddModal, setShowAddModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [room, setRoom] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [color, setColor] = useState(CLASS_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleAddClass = async () => {
    if (!courseCode.trim() || !courseName.trim() || !room.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      await apiPost('/schedule', {
        course_code: courseCode.toUpperCase(),
        course_name: courseName,
        day,
        start_time: startTime,
        end_time: endTime,
        room,
        lecturer,
        color,
      });
      setShowAddModal(false);
      resetForm();
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to add class.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCourseCode('');
    setCourseName('');
    setRoom('');
    setLecturer('');
    setDay('Monday');
    setStartTime('09:00');
    setEndTime('10:30');
    setColor(CLASS_COLORS[0]);
  };

  const handleDeleteClass = (classId: string) => {
    Alert.alert('Delete Class', 'Remove this class from your schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await apiDelete(`/schedule/${classId}`);
          refetch();
        },
      },
    ]);
  };

  const getClassesForDay = (dayName: string) => {
    if (!schedule) return [];
    return schedule
      .filter((s) => s.day === dayName)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const todayClasses = getClassesForDay(selectedDay);

  if (loading) return <LoadingScreen message="Loading schedule..." />;

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
        contentContainerStyle={styles.daySelectorContent}
      >
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[
              styles.dayButton,
              selectedDay === d && styles.dayButtonActive,
              highContrast && selectedDay === d && styles.highContrastActive,
            ]}
            onPress={() => setSelectedDay(d)}
          >
            <ThemedText
              variant="label"
              color={selectedDay === d ? (highContrast ? '#000' : COLORS.white) : COLORS.textSecondary}
            >
              {d.substring(0, 3)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="title" style={styles.dayTitle}>{selectedDay}</ThemedText>

        {todayClasses.length > 0 ? (
          todayClasses.map((cls) => (
            <Card key={cls.id} style={[styles.classCard, { borderLeftColor: cls.color }]}>
              <View style={styles.classHeader}>
                <View>
                  <ThemedText variant="subtitle">{cls.course_code}</ThemedText>
                  <ThemedText variant="body" color={COLORS.textSecondary}>
                    {cls.course_name}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => handleDeleteClass(cls.id)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
              <View style={styles.classDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                  <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.detailText}>
                    {cls.start_time} - {cls.end_time}
                  </ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                  <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.detailText}>
                    {cls.room}
                  </ThemedText>
                </View>
                {cls.lecturer && (
                  <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
                    <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.detailText}>
                      {cls.lecturer}
                    </ThemedText>
                  </View>
                )}
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No Classes"
            message={`No classes scheduled for ${selectedDay}`}
          />
        )}
      </ScrollView>

      {/* Add Class FAB */}
      <TouchableOpacity
        style={[styles.fab, highContrast && styles.highContrastFab]}
        onPress={() => setShowAddModal(true)}
        accessibilityLabel="Add class"
      >
        <Ionicons name="add" size={28} color={highContrast ? '#000' : COLORS.white} />
      </TouchableOpacity>

      {/* Add Class Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, highContrast && styles.highContrastBg]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <ThemedText variant="body" color={COLORS.error}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText variant="subtitle">Add Class</ThemedText>
            <TouchableOpacity onPress={handleAddClass} disabled={saving}>
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
              <ThemedText variant="label" style={styles.label}>Day</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dayButtons}>
                  {DAYS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.selectButton, day === d && styles.selectButtonActive]}
                      onPress={() => setDay(d)}
                    >
                      <ThemedText
                        variant="caption"
                        color={day === d ? COLORS.white : COLORS.textPrimary}
                      >
                        {d}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText variant="label" style={styles.label}>Start Time</ThemedText>
                <TextInput
                  style={[styles.input, { fontSize: 16 * fontScale }]}
                  placeholder="09:00"
                  placeholderTextColor={COLORS.textLight}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText variant="label" style={styles.label}>End Time</ThemedText>
                <TextInput
                  style={[styles.input, { fontSize: 16 * fontScale }]}
                  placeholder="10:30"
                  placeholderTextColor={COLORS.textLight}
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText variant="label" style={styles.label}>Room *</ThemedText>
              <TextInput
                style={[styles.input, { fontSize: 16 * fontScale }]}
                placeholder="e.g., IT Lab 101"
                placeholderTextColor={COLORS.textLight}
                value={room}
                onChangeText={setRoom}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText variant="label" style={styles.label}>Lecturer</ThemedText>
              <TextInput
                style={[styles.input, { fontSize: 16 * fontScale }]}
                placeholder="e.g., Dr. Kevin Brown"
                placeholderTextColor={COLORS.textLight}
                value={lecturer}
                onChangeText={setLecturer}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText variant="label" style={styles.label}>Color</ThemedText>
              <View style={styles.colorButtons}>
                {CLASS_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorButton,
                      { backgroundColor: c },
                      color === c && styles.colorButtonActive,
                    ]}
                    onPress={() => setColor(c)}
                  >
                    {color === c && <Ionicons name="checkmark" size={20} color={COLORS.white} />}
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
  daySelector: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  daySelectorContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  dayButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.lightGray,
    marginRight: SPACING.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: COLORS.navy,
  },
  highContrastActive: {
    backgroundColor: COLORS.highContrastAccent,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  dayTitle: {
    marginBottom: SPACING.md,
  },
  classCard: {
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  classDetails: {
    gap: SPACING.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: SPACING.xs,
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
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dayButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  selectButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    minHeight: 40,
    justifyContent: 'center',
  },
  selectButtonActive: {
    backgroundColor: COLORS.navy,
  },
  colorButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonActive: {
    borderWidth: 3,
    borderColor: COLORS.white,
  },
});
