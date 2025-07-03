import { useEffect } from 'react';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
<<<<<<< HEAD
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';

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
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
=======
>>>>>>> a0a198d86a51ddfc6a3508925e25759d5eefef86

export default function RootLayout() {
  useFrameworkReady();

  return (
<<<<<<< HEAD
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
=======
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
>>>>>>> a0a198d86a51ddfc6a3508925e25759d5eefef86
  );
}
