import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';

export default function TabLayout() {
  const { highContrast, fontScale } = useSettings();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: highContrast ? COLORS.highContrastAccent : COLORS.gold,
        tabBarInactiveTintColor: highContrast ? COLORS.highContrastText : COLORS.white,
        tabBarStyle: {
          backgroundColor: highContrast ? COLORS.highContrastBg : COLORS.navy,
          borderTopColor: highContrast ? COLORS.highContrastAccent : COLORS.navy,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10 * fontScale,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: highContrast ? COLORS.highContrastBg : COLORS.navy,
        },
        headerTintColor: highContrast ? COLORS.highContrastAccent : COLORS.white,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18 * fontScale,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          headerTitle: 'UCC Connect',
        }}
      />
      <Tabs.Screen
        name="faculty"
        options={{
          title: 'Faculty',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
