import { useEffect } from 'react';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import QueryProvider from '@/contexts/QueryProvider';
import * as SplashScreen from 'expo-splash-screen';
import { ThemedView } from '@/components/ThemedView';
import * as Linking from 'expo-linking';
import { handleDeepLink } from '@/utils/resetPasswordHandler';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (loading || !navigationState?.key) {
      // Auth state is loading or navigation is not ready, wait.
      return;
    }

    // Hide the splash screen once we are ready for navigation.
    SplashScreen.hideAsync();

    if (!user) {
      router.replace('/(auth)/sign-in');
    } else {
      router.replace('/(tabs)');
    }
  }, [user, loading, navigationState?.key]);

  // Handle deep links for password reset
  useEffect(() => {
    const handleUrl = (url: string) => {
      console.log('🔗 Deep link received:', url);
      handleDeepLink(url);
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl(url);
      }
    });

    // Listen for incoming links when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Render nothing while waiting for authentication state and navigation readiness
  if (loading || !navigationState?.key) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="crop-selection" options={{ headerShown: false }} />
      <Stack.Screen name="results" options={{ headerShown: false }} />
      <Stack.Screen name="scan-guide" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <QueryProvider>
            <ThemedView style={{ flex: 1 }}>
              <RootLayoutNav />
            </ThemedView>
            <StatusBar style="auto" />
          </QueryProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
