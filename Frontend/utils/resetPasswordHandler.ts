import { router } from 'expo-router';
import { supabase } from '@/contexts/AuthContext';

export interface ResetPasswordParams {
  access_token?: string;
  refresh_token?: string;
  type?: string;
}

export const handleResetPasswordLink = async (url: string) => {
  try {
    // Parse the URL to extract parameters
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const type = params.get('type');

    // Check if this is a password recovery flow
    if (type === 'recovery' && access_token && refresh_token) {
      // Set the session with the tokens from the reset link
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('Error setting session:', error);
        router.replace('/(auth)/sign-in');
        return;
      }

      // Navigate to the reset password screen
      router.replace('/reset-password');
    } else {
      // Invalid or missing parameters
      console.error('Invalid reset password link parameters');
      router.replace('/(auth)/sign-in');
    }
  } catch (error) {
    console.error('Error handling reset password link:', error);
    router.replace('/(auth)/sign-in');
  }
};

export const handleDeepLink = (url: string) => {
  // Check if this is a password reset link
  if (url.includes('reset-password') || url.includes('type=recovery')) {
    handleResetPasswordLink(url);
    return true;
  }
  
  return false;
}; 