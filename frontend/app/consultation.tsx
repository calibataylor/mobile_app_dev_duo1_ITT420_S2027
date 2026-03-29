import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as MailComposer from 'expo-mail-composer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';

export default function ConsultationScreen() {
  const { name, email } = useLocalSearchParams<{ name: string; email: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, fontScale } = useSettings();

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!studentName.trim() || !studentId.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const emailSubject = `Consultation Request from ${studentName} (${studentId})`;
    const emailBody = `
Dear ${name || 'Professor'},

I would like to request a consultation meeting.

--- Student Information ---
Name: ${studentName}
Student ID: ${studentId}

--- Request Details ---
Subject: ${subject || 'General Consultation'}
Preferred Date/Time: ${preferredDate || 'Flexible'}

--- Message ---
${message}

Thank you for your time.

Best regards,
${studentName}

---
Sent via UCC Connect App
    `.trim();

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [email || 'm.johnson@ucc.edu.jm'],
          subject: emailSubject,
          body: emailBody,
        });
        router.back();
      } else {
        Alert.alert(
          'Email Not Available',
          'Email is not configured on this device. Please set up an email account.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open email composer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={[styles.scrollView, highContrast && styles.highContrastBg]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.infoCard}>
          <ThemedText variant="subtitle">Requesting consultation with:</ThemedText>
          <ThemedText variant="title" style={styles.facultyName}>
            {name || 'Faculty Member'}
          </ThemedText>
          <ThemedText variant="body" color={COLORS.textSecondary}>
            {email || 'm.johnson@ucc.edu.jm'}
          </ThemedText>
        </Card>

        <ThemedText variant="subtitle" style={styles.sectionTitle}>
          Your Information
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText variant="label" style={styles.label}>
            Full Name *
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { fontSize: 16 * fontScale },
              highContrast && styles.highContrastInput,
            ]}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.textLight}
            value={studentName}
            onChangeText={setStudentName}
            accessibilityLabel="Full name input"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="label" style={styles.label}>
            Student ID *
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { fontSize: 16 * fontScale },
              highContrast && styles.highContrastInput,
            ]}
            placeholder="e.g., 20244115"
            placeholderTextColor={COLORS.textLight}
            value={studentId}
            onChangeText={setStudentId}
            keyboardType="number-pad"
            accessibilityLabel="Student ID input"
          />
        </View>

        <ThemedText variant="subtitle" style={styles.sectionTitle}>
          Consultation Details
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText variant="label" style={styles.label}>
            Subject
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { fontSize: 16 * fontScale },
              highContrast && styles.highContrastInput,
            ]}
            placeholder="What would you like to discuss?"
            placeholderTextColor={COLORS.textLight}
            value={subject}
            onChangeText={setSubject}
            accessibilityLabel="Subject input"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="label" style={styles.label}>
            Preferred Date/Time
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { fontSize: 16 * fontScale },
              highContrast && styles.highContrastInput,
            ]}
            placeholder="e.g., Monday 2PM or Flexible"
            placeholderTextColor={COLORS.textLight}
            value={preferredDate}
            onChangeText={setPreferredDate}
            accessibilityLabel="Preferred date/time input"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="label" style={styles.label}>
            Message *
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { fontSize: 16 * fontScale },
              highContrast && styles.highContrastInput,
            ]}
            placeholder="Explain what you'd like to discuss..."
            placeholderTextColor={COLORS.textLight}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            accessibilityLabel="Message input"
          />
        </View>

        <Button
          title="Send Request"
          onPress={handleSubmit}
          icon="send"
          loading={loading}
          fullWidth
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  highContrastBg: {
    backgroundColor: COLORS.highContrastBg,
  },
  content: {
    padding: SPACING.md,
  },
  infoCard: {
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  facultyName: {
    marginVertical: SPACING.xs,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
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
  highContrastInput: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.highContrastText,
    color: COLORS.highContrastText,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.md,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});
