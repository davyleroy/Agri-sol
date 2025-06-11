import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  Share,
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
} from 'lucide-react-native';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '@/contexts/LanguageContext';

export default function SettingsScreen() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageSelect = async (language: Language) => {
    await setLanguage(language);
    setShowLanguageModal(false);
  };

  const handleRateApp = () => {
    Alert.alert(
      t('rateApp'),
      'Thank you for using Agrisol! Please rate us on the app store.',
      [{ text: t('ok') }]
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
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        t('contact'),
        `Please send an email to: ${email}`,
        [{ text: t('ok') }]
      );
    });
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      t('privacyPolicy'),
      'Privacy policy will be available on our website soon.',
      [{ text: t('ok') }]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      t('termsOfService'),
      'Terms of service will be available on our website soon.',
      [{ text: t('ok') }]
    );
  };

  const settingsOptions = [
    {
      id: 'language',
      title: t('language'),
      subtitle: currentLanguage.nativeName,
      icon: Globe,
      onPress: () => setShowLanguageModal(true),
      showChevron: true,
    },
    {
      id: 'about',
      title: t('about'),
      subtitle: t('version') + ' 1.0.0',
      icon: Info,
      onPress: () => Alert.alert(
        t('about'),
        'Agrisol - AI-Powered Precision Agriculture System for Sustainable Crop Management in Rwanda\n\nDeveloped by: Davy Mbuto Nkurunziza\nVersion: 1.0.0 (MVP)',
        [{ text: t('close') }]
      ),
      showChevron: true,
    },
    {
      id: 'developer',
      title: t('developer'),
      subtitle: 'Davy Mbuto Nkurunziza',
      icon: User,
      onPress: () => Alert.alert(
        t('developer'),
        'Davy Mbuto Nkurunziza\nSoftware Engineer & AI Enthusiast\n\nSpecializing in precision agriculture and sustainable farming solutions.',
        [{ text: t('close') }]
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
      title: t('privacyPolicy'),
      subtitle: 'Data protection & privacy',
      icon: Shield,
      onPress: handlePrivacyPolicy,
      showChevron: true,
    },
    {
      id: 'terms',
      title: t('termsOfService'),
      subtitle: 'Terms & conditions',
      icon: FileText,
      onPress: handleTermsOfService,
      showChevron: true,
    },
    {
      id: 'rate',
      title: t('rateApp'),
      subtitle: 'Help us improve',
      icon: Star,
      onPress: handleRateApp,
      showChevron: true,
    },
    {
      id: 'share',
      title: t('shareApp'),
      subtitle: 'Tell your friends',
      icon: Share2,
      onPress: handleShareApp,
      showChevron: true,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#374151', '#4b5563']}
        style={styles.header}
      >
        <SettingsIcon size={32} color="#ffffff" strokeWidth={2} />
        <Text style={styles.title}>{t('settings')}</Text>
        <Text style={styles.subtitle}>Customize your Agrisol experience</Text>
      </LinearGradient>

      {/* Settings Options */}
      <View style={styles.settingsContainer}>
        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.settingItem}
            onPress={option.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <option.icon size={24} color="#059669" strokeWidth={2} />
            </View>
            
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{option.title}</Text>
              <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
            </View>
            
            {option.showChevron && (
              <ChevronRight size={20} color="#6b7280" strokeWidth={2} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.appInfoTitle}>Agrisol</Text>
        <Text style={styles.appInfoSubtitle}>
          AI-Powered Crop Health Monitor
        </Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0 (MVP)</Text>
        <Text style={styles.appInfoCopyright}>
          © 2024 Davy Mbuto Nkurunziza. All rights reserved.
        </Text>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <X size={24} color="#6b7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.languageList}>
              {SUPPORTED_LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    currentLanguage.code === language.code && styles.selectedLanguageItem,
                  ]}
                  onPress={() => handleLanguageSelect(language)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                  </View>
                  {currentLanguage.code === language.code && (
                    <Check size={20} color="#059669" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingIcon: {
    backgroundColor: '#ecfdf5',
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
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
    color: '#059669',
    marginBottom: 4,
  },
  appInfoSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  appInfoCopyright: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
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
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
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
  selectedLanguageItem: {
    backgroundColor: '#ecfdf5',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomSpacing: {
    height: 20,
  },
});