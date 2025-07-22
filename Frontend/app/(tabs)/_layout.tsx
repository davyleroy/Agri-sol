import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Camera, Clock, BookOpen, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home') || 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('scan') || 'Scan',
          tabBarIcon: ({ color, size }) => (
            <Camera size={size} color={color} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: t('history') || 'History',
          tabBarIcon: ({ color, size }) => (
            <Clock size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: t('guide') || 'Guide',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings') || 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
