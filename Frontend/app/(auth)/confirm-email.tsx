import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CheckCircle, Leaf, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/contexts/AuthContext';

export default function ConfirmEmailScreen() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkConfirmation = async () => {
      try {
        // Check if user is already confirmed
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // User is already logged in and confirmed
          setSuccess(true);
          setLoading(false);

          // Auto-navigate to main app after 3 seconds
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 3000);
        } else {
          setError('Invalid confirmation link. Please try signing up again.');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to confirm email. Please try again.');
        setLoading(false);
      }
    };

    checkConfirmation();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#059669', '#10b981', '#34d399']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <ActivityIndicator size={60} color="#ffffff" />
          </View>
          <Text style={styles.title}>Confirming Your Email</Text>
          <Text style={styles.subtitle}>
            Please wait while we verify your account...
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.loadingMessage}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Setting up your account...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#dc2626', '#ef4444', '#f87171']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Leaf size={60} color="#ffffff" strokeWidth={2} />
          </View>
          <Text style={styles.title}>Confirmation Error</Text>
          <Text style={styles.subtitle}>Something went wrong</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.errorMessage}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.backToSignUp}
              onPress={() => router.replace('/(auth)/sign-up')}
            >
              <Text style={styles.backToSignUpText}>Try Signing Up Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#059669', '#10b981', '#34d399']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <CheckCircle size={60} color="#ffffff" strokeWidth={2} />
          </View>
          <Text style={styles.title}>Welcome to Agrisol! 🎉</Text>
          <Text style={styles.subtitle}>Your account has been confirmed</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.successMessage}>
            <CheckCircle size={80} color="#059669" strokeWidth={2} />
            <Text style={styles.successTitle}>
              Email Confirmed Successfully!
            </Text>
            <Text style={styles.successText}>
              Your account has been verified and you're now logged in. Welcome
              to Agrisol!
            </Text>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What you can do now:</Text>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📸</Text>
                <Text style={styles.featureText}>
                  Scan crop photos for disease detection
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureText}>
                  Get precise treatment recommendations
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={styles.featureText}>
                  Track your crop health over time
                </Text>
              </View>
            </View>

            <Text style={styles.redirectText}>
              Taking you to the main app...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  loadingMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  backToSignUp: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToSignUpText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0369a1',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  redirectText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
