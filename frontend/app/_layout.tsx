import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider, useSettings } from '@/src/context/SettingsContext';
import { COLORS } from '@/src/constants/theme';

function RootLayoutContent() {
  const { highContrast } = useSettings();
  
  return (
    <>
      <StatusBar style={highContrast ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: highContrast ? COLORS.highContrastBg : COLORS.navy,
          },
          headerTintColor: highContrast ? COLORS.highContrastAccent : COLORS.white,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: highContrast ? COLORS.highContrastBg : COLORS.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="faculty/[id]" options={{ title: 'Faculty Details', presentation: 'card' }} />
        <Stack.Screen name="course/[id]" options={{ title: 'Course Details', presentation: 'card' }} />
        <Stack.Screen name="webview" options={{ title: 'UCC Social', presentation: 'card' }} />
        <Stack.Screen name="consultation" options={{ title: 'Request Consultation', presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ title: 'Accessibility Settings', presentation: 'modal' }} />
        <Stack.Screen name="note-editor" options={{ title: 'Edit Note', presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RootLayoutContent />
    </SettingsProvider>
  );
}
