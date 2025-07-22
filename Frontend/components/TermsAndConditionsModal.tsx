import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, FileText, Shield, User, Globe } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface TermsAndConditionsModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsAndConditionsModal({
  visible,
  onAccept,
  onDecline,
}: TermsAndConditionsModalProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleAccept = () => {
    if (!acceptedTerms || !acceptedPrivacy) {
      Alert.alert(
        'Accept Terms',
        'Please accept both Terms & Conditions and Privacy Policy to continue.',
        [{ text: 'OK' }],
      );
      return;
    }
    onAccept();
  };

  const handleDecline = () => {
    Alert.alert(
      'Decline Terms',
      'You must accept the Terms & Conditions and Privacy Policy to use AgriSol. Would you like to decline and exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Decline', style: 'destructive', onPress: onDecline },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDecline}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.header}>
          <View style={styles.headerContent}>
            <Shield size={32} color="#ffffff" strokeWidth={2} />
            <Text style={styles.title}>Welcome to AgriSol</Text>
            <Text style={styles.subtitle}>
              Please review and accept our terms to continue
            </Text>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Terms & Conditions
            </Text>
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
              By using AgriSol, you agree to our Terms & Conditions which govern
              your use of our AI-powered agricultural services.
            </Text>

            <View style={styles.bulletPoints}>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • You must be at least 13 years old to use the service
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • You are responsible for the accuracy of information you
                provide
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • AI analysis results are not professional agricultural advice
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • You retain ownership of your agricultural data and images
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • We may update these terms with notice
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Privacy Policy
            </Text>
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
              We are committed to protecting your privacy and securing your
              agricultural data.
            </Text>

            <View style={styles.bulletPoints}>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • We collect crop images for disease detection
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • Location data helps provide field-specific recommendations
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • Your personal information is never shared with third parties
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • You can request deletion of your data at any time
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • Data is encrypted and stored securely
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Important Disclaimers
            </Text>
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
              Please understand the limitations of our AI-powered service.
            </Text>

            <View style={styles.bulletPoints}>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • AI analysis may not be 100% accurate
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • Always consult agricultural experts for critical decisions
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • We are not liable for crop losses or agricultural damages
              </Text>
              <Text
                style={[styles.bulletPoint, { color: colors.textSecondary }]}
              >
                • Service requires internet connectivity
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Checkboxes */}
        <View
          style={[
            styles.checkboxContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: acceptedTerms
                    ? colors.primary
                    : colors.border,
                  borderColor: colors.border,
                },
              ]}
            >
              {acceptedTerms && (
                <Check size={16} color="#ffffff" strokeWidth={2} />
              )}
            </View>
            <Text style={[styles.checkboxText, { color: colors.text }]}>
              I accept the Terms & Conditions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: acceptedPrivacy
                    ? colors.primary
                    : colors.border,
                  borderColor: colors.border,
                },
              ]}
            >
              {acceptedPrivacy && (
                <Check size={16} color="#ffffff" strokeWidth={2} />
              )}
            </View>
            <Text style={[styles.checkboxText, { color: colors.text }]}>
              I accept the Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View
          style={[styles.buttonContainer, { backgroundColor: colors.surface }]}
        >
          <TouchableOpacity
            style={[styles.declineButton, { borderColor: colors.border }]}
            onPress={handleDecline}
            activeOpacity={0.7}
          >
            <X size={20} color={colors.textSecondary} strokeWidth={2} />
            <Text
              style={[
                styles.declineButtonText,
                { color: colors.textSecondary },
              ]}
            >
              Decline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.acceptButton,
              {
                backgroundColor:
                  acceptedTerms && acceptedPrivacy
                    ? colors.primary
                    : colors.border,
              },
            ]}
            onPress={handleAccept}
            activeOpacity={0.7}
            disabled={!acceptedTerms || !acceptedPrivacy}
          >
            <Check size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.acceptButtonText}>Accept & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoints: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  checkboxContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});
