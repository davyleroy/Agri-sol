import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Leaf, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/contexts/AuthContext';

export default function ResetPasswordScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if we have a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid reset link. Please request a new password reset.');
      }
    };
    
    checkSession();
  }, []);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`At least ${minLength} characters`);
    if (!hasUpperCase) errors.push('One uppercase letter');
    if (!hasLowerCase) errors.push('One lowercase letter');
    if (!hasNumbers) errors.push('One number');
    if (!hasSpecialChar) errors.push('One special character');

    return errors;
  };

  const handleResetPassword = async () => {
    // Clear previous errors
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      // Update the user's password using the access token
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Auto-navigate to login after 3 seconds
        setTimeout(() => {
          router.replace('/(auth)/sign-in');
        }, 3000);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>{t('passwordResetSuccess')}</Text>
          <Text style={styles.subtitle}>{t('passwordResetSuccessMessage')}</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.successMessage}>
            <CheckCircle size={48} color="#059669" strokeWidth={2} />
            <Text style={styles.successText}>
              Your password has been successfully reset!
            </Text>
            <Text style={styles.redirectText}>
              Redirecting to login...
            </Text>
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
          <Text style={styles.title}>{t('resetLinkError')}</Text>
          <Text style={styles.subtitle}>{t('resetLinkErrorMessage')}</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.errorMessage}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.backToSignIn}
              onPress={() => router.replace('/(auth)/sign-in')}
            >
              <Text style={styles.backToSignInText}>{t('backToSignIn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#059669', '#10b981', '#34d399']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Lock size={60} color="#ffffff" strokeWidth={2} />
        </View>
        <Text style={styles.title}>{t('setNewPassword')}</Text>
        <Text style={styles.subtitle}>{t('setNewPasswordInstructions')}</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6b7280" strokeWidth={2} />
          <TextInput
            style={styles.input}
            placeholder={t('newPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? (
              <EyeOff size={20} color="#6b7280" strokeWidth={2} />
            ) : (
              <Eye size={20} color="#6b7280" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6b7280" strokeWidth={2} />
          <TextInput
            style={styles.input}
            placeholder={t('confirmNewPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color="#6b7280" strokeWidth={2} />
            ) : (
              <Eye size={20} color="#6b7280" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <Text style={styles.requirement}>• At least 8 characters</Text>
          <Text style={styles.requirement}>• One uppercase letter</Text>
          <Text style={styles.requirement}>• One lowercase letter</Text>
          <Text style={styles.requirement}>• One number</Text>
          <Text style={styles.requirement}>• One special character</Text>
        </View>

        <TouchableOpacity
          style={[styles.resetButton, loading && styles.disabledButton]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <LinearGradient
            colors={['#059669', '#10b981']}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.resetButtonText}>
                {t('resetPassword')}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToSignIn}
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text style={styles.backToSignInText}>{t('backToSignIn')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
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
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    paddingLeft: 12,
    color: '#1f2937',
  },
  eyeButton: {
    padding: 8,
  },
  passwordRequirements: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  resetButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  backToSignIn: {
    alignItems: 'center',
  },
  backToSignInText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  successMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  redirectText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
}); 