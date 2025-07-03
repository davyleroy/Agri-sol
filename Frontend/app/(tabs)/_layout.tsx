import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Chrome as Home, Camera, History, BookOpen, Settings } from 'lucide-react-native';

export default function TabLayout() {
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
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ size, color, focused }) => (
            <Camera 
              size={22} 
              color={focused ? '#ffffff' : color} 
              strokeWidth={2} 
              style={{
                backgroundColor: focused ? '#059669' : 'transparent',
                borderRadius: 16,
                padding: 6,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <History size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: 'Guide',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}