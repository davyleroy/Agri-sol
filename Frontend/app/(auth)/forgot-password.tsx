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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Leaf, Mail, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(t('error'), t('enterEmailAddress'));
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      Alert.alert(t('error'), error.message);
    } else {
      Alert.alert(
        t('success'),
        t('passwordResetSent'),
        [{ text: t('ok'), onPress: () => router.back() }]
      );
    }
  };

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
          <Leaf size={60} color="#ffffff" strokeWidth={2} />
        </View>
        <Text style={styles.title}>{t('resetPassword')}</Text>
        <Text style={styles.subtitle}>{t('resetPasswordInstructions')}</Text>
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

        <TouchableOpacity
          style={[styles.resetButton, loading && styles.disabledButton]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <LinearGradient
            colors={['#059669', '#10b981']}
            style={styles.buttonGradient}
          >
            <Text style={styles.resetButtonText}>
              {loading ? t('sending') : t('sendResetLink')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToSignIn}
          onPress={() => router.back()}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
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
});