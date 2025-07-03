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
import {
  Leaf,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Phone,
  Tractor,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { LocationSelector, LocationData } from '@/components/LocationSelector';

export interface FarmerType {
  id: string;
  label: string;
  description: string;
}

const farmerTypes: FarmerType[] = [
  {
    id: 'small',
    label: 'smallScaleFarmer',
    description: 'smallScaleDesc',
  },
  {
    id: 'medium',
    label: 'mediumScaleFarmer',
    description: 'mediumScaleDesc',
  },
  {
    id: 'large',
    label: 'largeScaleFarmer',
    description: 'largeScaleDesc',
  },
  {
    id: 'commercial',
    label: 'commercialFarmer',
    description: 'commercialDesc',
  },
];

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState<LocationData>({ country: '' });
  const [farmerType, setFarmerType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = t('fillAllFields');
    }

    if (!email.trim()) {
      newErrors.email = t('fillAllFields');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = t('fillAllFields');
    }

    if (!password) {
      newErrors.password = t('fillAllFields');
    } else if (password.length < 6) {
      newErrors.password = t('passwordTooShort');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('fillAllFields');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch');
    }

    if (!location.country) {
      newErrors.location = t('fillAllFields');
    }

    if (
      location.country === 'RW' &&
      (!location.province || !location.district || !location.sector)
    ) {
      newErrors.location = 'Please complete all location fields for Rwanda';
    }

    if (!farmerType) {
      newErrors.farmerType = t('fillAllFields');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      Alert.alert(t('error'), Object.values(errors)[0] || t('fillAllFields'));
      return;
    }

    setLoading(true);

    // Prepare user profile data
    const userProfileData = {
      full_name: fullName,
      email: email,
      phone_number: phoneNumber,
      country: location.country,
      province: location.province,
      district: location.district,
      sector: location.sector,
      farmer_type: farmerType,
    };

    const { error } = await signUp(email, password, fullName, userProfileData);
    setLoading(false);

    if (error) {
      Alert.alert(t('signUpError'), error.message);
    } else {
      Alert.alert(t('success'), t('accountCreated'), [
        { text: t('ok'), onPress: () => router.replace('/(tabs)') },
      ]);
    }
  };

  const handleFarmerTypeSelect = (type: string) => {
    setFarmerType(type);
    setErrors({ ...errors, farmerType: '' });
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
          <Text style={styles.title}>{t('createAccount')}</Text>
          <Text style={styles.subtitle}>{t('joinAgrisolCommunity')}</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputContainer}>
            <User size={20} color="#6b7280" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder={t('fullName')}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setErrors({ ...errors, fullName: '' });
              }}
              autoCapitalize="words"
            />
          </View>
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Mail size={20} color="#6b7280" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder={t('emailAddress')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Phone Number Field */}
          <View style={styles.inputContainer}>
            <Phone size={20} color="#6b7280" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder={t('phoneNumber')}
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setErrors({ ...errors, phoneNumber: '' });
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}

          {/* Location Selector */}
          <LocationSelector
            value={location}
            onChange={(newLocation) => {
              setLocation(newLocation);
              setErrors({ ...errors, location: '' });
            }}
            error={errors.location}
          />

          {/* Farmer Type Selection */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('farmerType')}</Text>
            <Text style={styles.sectionSubtitle}>{t('selectFarmerType')}</Text>

            <View style={styles.farmerTypeContainer}>
              {farmerTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.farmerTypeCard,
                    farmerType === type.id && styles.selectedFarmerType,
                  ]}
                  onPress={() => handleFarmerTypeSelect(type.id)}
                >
                  <View style={styles.farmerTypeHeader}>
                    <Tractor
                      size={24}
                      color={farmerType === type.id ? '#059669' : '#6b7280'}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.farmerTypeLabel,
                        farmerType === type.id && styles.selectedFarmerTypeText,
                      ]}
                    >
                      {t(type.label)}
                    </Text>
                  </View>
                  <Text style={styles.farmerTypeDescription}>
                    {t(type.description)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.farmerType && (
              <Text style={styles.errorText}>{errors.farmerType}</Text>
            )}
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Lock size={20} color="#6b7280" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder={t('password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
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
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <Lock size={20} color="#6b7280" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder={t('confirmPassword')}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#6b7280" strokeWidth={2} />
              ) : (
                <Eye size={20} color="#6b7280" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <LinearGradient
              colors={['#059669', '#10b981']}
              style={styles.buttonGradient}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? t('creatingAccount') : t('createAccount')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.signInLinkText}>
              {t('alreadyHaveAccount')}{' '}
              <Text style={styles.signInLinkBold}>{t('signIn')}</Text>
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
    textAlign: 'center',
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
  sectionContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  farmerTypeContainer: {
    gap: 12,
  },
  farmerTypeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedFarmerType: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  farmerTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  farmerTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  selectedFarmerTypeText: {
    color: '#059669',
  },
  farmerTypeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  signUpButton: {
    borderRadius: 12,
    marginTop: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  signInLink: {
    alignItems: 'center',
    marginBottom: 40,
  },
  signInLinkText: {
    fontSize: 16,
    color: '#6b7280',
  },
  signInLinkBold: {
    color: '#059669',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
});
