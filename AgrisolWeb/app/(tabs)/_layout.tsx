import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { Camera, History, Chrome as Home, BookOpen, Settings } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0.5,
          borderTopColor: '#e5e7eb',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 70,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ size, color }) => (
            <Home size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('scan'),
          tabBarIcon: ({ size, color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#059669' : '#e5e7eb',
                borderRadius: 16,
                padding: 6,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera 
                size={22} 
                color={focused ? '#ffffff' : '#6b7280'} 
                strokeWidth={2} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('history'),
          tabBarIcon: ({ size, color }) => (
            <History size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: t('guide'),
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ size, color }) => (
            <Settings size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}