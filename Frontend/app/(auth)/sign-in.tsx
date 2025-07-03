import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert(t('signInError'), error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={['#059669', '#10b981', '#34d399']}
          style={styles.header}
        >
          {/* Language Selector in top left corner */}
          <View style={styles.languageSelectorContainer}>
            <LanguageSelector compact={true} showLabel={false} />
          </View>

          {/* Dark Mode Toggle in top right corner */}
          <View style={styles.darkModeToggleContainer}>
            <DarkModeToggle compact={true} />
          </View>

          <View style={styles.logoContainer}>
            <Leaf size={60} color="#ffffff" strokeWidth={2} />
          </View>
          <Text style={styles.title}>{t('welcomeBack')}</Text>
          <Text style={styles.subtitle}>{t('signInToContinue')}</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#6b7280" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder={t('emailAddress')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#6b7280" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder={t('password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6b7280" strokeWidth={2} />
              ) : (
                <Eye size={20} color="#6b7280" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <LinearGradient
              colors={['#059669', '#10b981']}
              style={styles.buttonGradient}
            >
              <Text style={styles.signInButtonText}>
                {loading ? t('signingIn') : t('signIn')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signUpLink}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={styles.signUpLinkText}>
              {t('dontHaveAccount')}{' '}
              <Text style={styles.signUpLinkBold}>{t('signUp')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
  },
  languageSelectorContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
  },
  darkModeToggleContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
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
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
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
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  signInButton: {
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
  signInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 16,
  },
  signUpLink: {
    alignItems: 'center',
  },
  signUpLinkText: {
    fontSize: 16,
    color: '#6b7280',
  },
  signUpLinkBold: {
    fontWeight: 'bold',
    color: '#059669',
  },
});
