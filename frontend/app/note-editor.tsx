import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import { useApi, apiPost, apiPut, apiDelete } from '@/src/hooks/useApi';
import { Note } from '@/src/types';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import LoadingScreen from '@/src/components/LoadingScreen';
import EmptyState from '@/src/components/EmptyState';

export default function NoteEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, fontScale } = useSettings();
  const { data: notes, loading, refetch } = useApi<Note[]>('/notes');

  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleNewNote = () => {
    setIsEditing(true);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  const handleEditNote = (note: Note) => {
    setIsEditing(true);
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please enter both title and content.');
      return;
    }

    setSaving(true);
    try {
      if (editingNote) {
        await apiPut(`/notes/${editingNote.id}`, { title, content });
      } else {
        await apiPost('/notes', { title, content });
      }
      setIsEditing(false);
      setEditingNote(null);
      setTitle('');
      setContent('');
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDelete(`/notes/${noteId}`);
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note.');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingScreen message="Loading notes..." />;

  if (isEditing) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={[styles.editorContainer, highContrast && styles.highContrastBg]}>
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Ionicons name="close" size={24} color={highContrast ? COLORS.highContrastText : COLORS.textPrimary} />
            </TouchableOpacity>
            <ThemedText variant="subtitle">
              {editingNote ? 'Edit Note' : 'New Note'}
            </ThemedText>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={saving}>
              <ThemedText variant="body" color={COLORS.gold}>
                {saving ? 'Saving...' : 'Save'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.editorContent}
            contentContainerStyle={styles.editorContentInner}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={[
                styles.titleInput,
                { fontSize: 20 * fontScale },
                highContrast && styles.highContrastInput,
              ]}
              placeholder="Note Title"
              placeholderTextColor={COLORS.textLight}
              value={title}
              onChangeText={setTitle}
              accessibilityLabel="Note title"
            />
            <TextInput
              style={[
                styles.contentInput,
                { fontSize: 16 * fontScale },
                highContrast && styles.highContrastInput,
              ]}
              placeholder="Write your note here..."
              placeholderTextColor={COLORS.textLight}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Note content"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      {notes && notes.length > 0 ? (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.notesList, { paddingBottom: insets.bottom + 80 }]}
          renderItem={({ item }) => (
            <Card style={styles.noteCard} onPress={() => handleEditNote(item)}>
              <View style={styles.noteHeader}>
                <ThemedText variant="subtitle" numberOfLines={1} style={styles.noteTitle}>
                  {item.title}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Delete note"
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
              <ThemedText variant="body" color={COLORS.textSecondary} numberOfLines={3}>
                {item.content}
              </ThemedText>
              <ThemedText variant="caption" color={COLORS.textLight} style={styles.noteDate}>
                {formatDate(item.updated_at)}
              </ThemedText>
            </Card>
          )}
        />
      ) : (
        <EmptyState
          icon="document-text-outline"
          title="No Notes Yet"
          message="Tap the + button to create your first note"
        />
      )}

      {/* FAB for new note */}
      <TouchableOpacity
        style={[styles.fab, highContrast && styles.highContrastFab]}
        onPress={handleNewNote}
        accessibilityLabel="Create new note"
      >
        <Ionicons name="add" size={28} color={highContrast ? '#000' : COLORS.white} />
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
  notesList: {
    padding: SPACING.md,
  },
  noteCard: {
    marginBottom: SPACING.md,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  noteTitle: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  noteDate: {
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
  editorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    padding: SPACING.sm,
  },
  saveButton: {
    padding: SPACING.sm,
  },
  editorContent: {
    flex: 1,
  },
  editorContentInner: {
    padding: SPACING.md,
  },
  titleInput: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contentInput: {
    flex: 1,
    color: COLORS.textPrimary,
    minHeight: 300,
  },
  highContrastInput: {
    color: COLORS.highContrastText,
    borderBottomColor: COLORS.highContrastAccent,
  },
});
