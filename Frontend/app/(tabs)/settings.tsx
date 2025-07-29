import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings as SettingsIcon,
  Globe,
  Info,
  User,
  Mail,
  Shield,
  FileText,
  Star,
  Share2,
  ChevronRight,
  Check,
  X,
  Moon,
  Sun,
  LogOut,
  MessageSquare,
  Bell,
} from 'lucide-react-native';
import {
  useLanguage,
  SUPPORTED_LANGUAGES,
  Language,
} from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal';
import NotificationSettingsComponent from '@/components/admin/NotificationSettings';

// Helper function to get flag display
const getFlagDisplay = (language: Language) => {
  if (Platform.OS === 'web') {
    // For web, use text fallbacks if emoji doesn't render
    const flagMap: { [key: string]: string } = {
      en: '🇺🇸',
      rw: '🇷🇼',
      fr: '🇫🇷',
    };

    // Try emoji first, fallback to text codes
    const emojiFlag = flagMap[language.code] || language.flag;

    // If emoji doesn't render (check if it's a single character), use text
    if (emojiFlag.length === 2) {
      return emojiFlag; // Emoji flag
    } else {
      // Fallback to text codes
      const textFlags: { [key: string]: string } = {
        en: 'US',
        rw: 'RW',
        fr: 'FR',
      };
      return textFlags[language.code] || language.code.toUpperCase();
    }
  }
  return language.flag;
};

export default function SettingsScreen() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const { signOut, isAdmin } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);

  const handleLanguageSelect = async (language: Language) => {
    await setLanguage(language);
    setShowLanguageModal(false);
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate App',
      'Thank you for using Agrisol! Please rate us on the app store.',
      [{ text: 'OK' }],
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `Check out Agrisol - AI-Powered Crop Health Monitor! 🌱\n\nDownload it now to identify crop diseases and get expert recommendations for your farm.`,
        title: 'Agrisol - Smart Farming App',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleContact = () => {
    const email = 'support@agrisol.app';
    const subject = 'Agrisol App Support';
    const body = 'Hello Agrisol Team,\n\nI need help with...';

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(t('contact'), `Please send an email to: ${email}`, [
        { text: t('ok') },
      ]);
    });
  };

  const handlePrivacyPolicy = () => {
    setShowTermsModal(true);
  };

  const handleTermsOfService = () => {
    setShowTermsModal(true);
  };

  const handleFeedback = () => {
    Alert.alert(
      t('feedback') || 'Feedback',
      t('feedbackDescription') ||
        'Help us improve Agrisol by sharing your thoughts, suggestions, or reporting issues. Your feedback is valuable to us!',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('openForm') || 'Open Form',
          onPress: () => {
            // TODO: Replace with your actual Google Apps Script form URL
            const feedbackUrl =
              'https://script.google.com/macros/s/AKfycbxT1bF13Ct6tk20GYIvYDFT6iLDI4u9n3D82aejgGpasesi_hiJYpZGaEJkf2Ugge38lg/exec';
            Linking.openURL(feedbackUrl).catch(() => {
              Alert.alert(
                t('error') || 'Error',
                t('feedbackError') ||
                  'Unable to open feedback form. Please try again later.',
                [{ text: t('ok') || 'OK' }],
              );
            });
          },
        },
      ],
    );
  };

  const settingsOptions = [
    {
      id: 'darkmode',
      title: isDarkMode ? t('lightMode') : t('darkMode'),
      subtitle: isDarkMode ? t('switchToLight') : t('switchToDark'),
      icon: isDarkMode ? Sun : Moon,
      onPress: toggleDarkMode,
      showChevron: false,
      showToggle: true,
    },
    {
      id: 'language',
      title: t('language'),
      subtitle: currentLanguage.name,
      icon: Globe,
      onPress: () => setShowLanguageModal(true),
      showChevron: true,
    },
    {
      id: 'about',
      title: t('about'),
      subtitle: 'Version 1.0.0',
      icon: Info,
      onPress: () =>
        Alert.alert(
          t('about'),
          'Agrisol - AI-Powered Precision Agriculture System for Sustainable Crop Management in Rwanda\n\nDeveloped by: Davy Mbuto Nkurunziza\nVersion: 1.0.0 (MVP)',
          [{ text: t('close') }],
        ),
      showChevron: true,
    },
    {
      id: 'developer',
      title: t('developer'),
      subtitle: 'Davy Mbuto Nkurunziza',
      icon: User,
      onPress: () =>
        Alert.alert(
          t('developer'),
          'Davy Mbuto Nkurunziza\nSoftware Engineer & AI Enthusiast\n\nSpecializing in precision agriculture and sustainable farming solutions.',
          [{ text: t('close') }],
        ),
      showChevron: true,
    },
    {
      id: 'contact',
      title: t('contact'),
      subtitle: 'support@agrisol.app',
      icon: Mail,
      onPress: handleContact,
      showChevron: true,
    },
    {
      id: 'privacy',
      title: t('privacy'),
      subtitle: t('privacySubtitle'),
      icon: Shield,
      onPress: handlePrivacyPolicy,
      showChevron: true,
    },
    {
      id: 'terms',
      title: t('terms'),
      subtitle: t('termsSubtitle'),
      icon: FileText,
      onPress: handleTermsOfService,
      showChevron: true,
    },
    {
      id: 'rate',
      title: t('rateApp'),
      subtitle: t('rateAppSubtitle'),
      icon: Star,
      onPress: handleRateApp,
      showChevron: true,
    },
    {
      id: 'share',
      title: t('shareApp'),
      subtitle: t('shareAppSubtitle'),
      icon: Share2,
      onPress: handleShareApp,
      showChevron: true,
    },
    {
      id: 'feedback',
      title: t('feedback') || 'Feedback',
      subtitle: t('feedbackSubtitle') || 'Share your thoughts and suggestions',
      icon: MessageSquare,
      onPress: handleFeedback,
      showChevron: true,
    },
    // Admin-only notification settings
    ...(isAdmin
      ? [
          {
            id: 'notifications',
            title: 'Disease Alerts',
            subtitle: 'Configure notification preferences',
            icon: Bell,
            onPress: () => setShowNotificationSettings(true),
            showChevron: true,
          },
        ]
      : []),
    {
      id: 'logout',
      title: t('logout') || 'Logout',
      subtitle: '',
      icon: LogOut,
      onPress: async () => {
        try {
          await signOut();
        } catch (err) {
          Alert.alert('Error', 'Failed to log out');
        }
      },
      showChevron: false,
    },
  ];

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={['#374151', '#4b5563']} style={styles.header}>
          <SettingsIcon size={32} color="#ffffff" strokeWidth={2} />
          <Text style={styles.title}>{t('settings')}</Text>
          <Text style={styles.subtitle}>{t('settingsSubtitle')}</Text>
        </LinearGradient>

        {/* Settings Options */}
        <View style={styles.settingsContainer}>
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.settingItem,
                { backgroundColor: colors.surface, shadowColor: colors.shadow },
              ]}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <option.icon size={24} color={colors.primary} strokeWidth={2} />
              </View>

              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  {option.title}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {option.subtitle}
                </Text>
              </View>

              {option.showToggle && (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={isDarkMode ? colors.surface : colors.surface}
                  ios_backgroundColor={colors.border}
                />
              )}

              {option.showChevron && (
                <ChevronRight
                  size={20}
                  color={colors.textSecondary}
                  strokeWidth={2}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <Text style={[styles.appInfoTitle, { color: colors.primary }]}>
            Agrisol
          </Text>
          <Text
            style={[styles.appInfoSubtitle, { color: colors.textSecondary }]}
          >
            {t('appSubtitle')}
          </Text>
          <Text style={[styles.appInfoVersion, { color: colors.textMuted }]}>
            Version 1.0.0 (MVP)
          </Text>
          <Text style={[styles.appInfoCopyright, { color: colors.textMuted }]}>
            © 2025 Davy Mbuto Nkurunziza. All rights reserved.
          </Text>
        </View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View
            style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
          >
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t('selectLanguage')}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowLanguageModal(false)}
                >
                  <X size={24} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.languageList}>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageItem,
                      currentLanguage.code === language.code && {
                        backgroundColor: colors.primaryLight,
                      },
                    ]}
                    onPress={() => handleLanguageSelect(language)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.languageFlag,
                        Platform.OS === 'web' && styles.webLanguageFlag,
                      ]}
                    >
                      {getFlagDisplay(language)}
                    </Text>
                    <View style={styles.languageInfo}>
                      <Text
                        style={[styles.languageName, { color: colors.text }]}
                      >
                        {language.name}
                      </Text>
                      <Text
                        style={[
                          styles.languageNativeName,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {language.nativeName}
                      </Text>
                    </View>
                    {currentLanguage.code === language.code && (
                      <Check size={20} color={colors.primary} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotificationSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Disease Alert Settings
              </Text>
              <TouchableOpacity
                onPress={() => setShowNotificationSettings(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <NotificationSettingsComponent />
          </View>
        </View>
      </Modal>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        visible={showTermsModal}
        onAccept={() => setShowTermsModal(false)}
        onDecline={() => setShowTermsModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  settingsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingIcon: {
    borderRadius: 12,
    padding: 8,
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 20,
  },
  appInfoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appInfoSubtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 14,
    marginBottom: 16,
  },
  appInfoCopyright: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    paddingHorizontal: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  webLanguageFlag: {
    fontSize: 26, // Slightly larger for web
    fontFamily:
      Platform.OS === 'web'
        ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : undefined,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
  },
  bottomSpacing: {
    height: 20,
  },
});
