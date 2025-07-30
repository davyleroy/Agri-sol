import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Trash2, AlertTriangle, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  visible,
  onClose,
}: DeleteAccountModalProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { deleteAccount } = useAuth();

  const [step, setStep] = useState(1);
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      Alert.alert(t('error'), t('typeDeleteToConfirm'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteAccount();

      if (error) {
        Alert.alert(t('error'), t('deleteAccountError'));
      } else {
        Alert.alert(t('success'), t('accountDeleted'), [
          {
            text: t('ok'),
            onPress: () => {
              onClose();
              router.replace('/(auth)/sign-in');
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert(t('error'), t('deleteAccountError'));
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setConfirmationText('');
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View
        style={[styles.iconContainer, { backgroundColor: colors.warningLight }]}
      >
        <AlertTriangle size={48} color={colors.warning} strokeWidth={2} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {t('deleteAccount')}
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('deleteAccountWarning')}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cancelButton,
            { borderColor: colors.border },
          ]}
          onPress={handleClose}
        >
          <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
            {t('cancel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.continueButton,
            { backgroundColor: colors.warning },
          ]}
          onPress={() => setStep(2)}
        >
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>
            {t('continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View
        style={[styles.iconContainer, { backgroundColor: colors.warningLight }]}
      >
        <Trash2 size={48} color={colors.warning} strokeWidth={2} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {t('deleteAccount')}
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('deleteAccountWarning2')}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cancelButton,
            { borderColor: colors.border },
          ]}
          onPress={() => setStep(1)}
        >
          <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
            {t('goBack')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.continueButton,
            { backgroundColor: colors.warning },
          ]}
          onPress={() => setStep(3)}
        >
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>
            {t('continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View
        style={[styles.iconContainer, { backgroundColor: colors.dangerLight }]}
      >
        <Trash2 size={48} color={colors.danger} strokeWidth={2} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {t('deleteAccount')}
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('typeDeleteToConfirm')}
      </Text>

      <TextInput
        style={[
          styles.textInput,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
          },
        ]}
        value={confirmationText}
        onChangeText={setConfirmationText}
        placeholder={t('deleteConfirmation')}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cancelButton,
            { borderColor: colors.border },
          ]}
          onPress={() => setStep(2)}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
            {t('cancel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.deleteButton,
            {
              backgroundColor:
                confirmationText === 'DELETE' ? colors.danger : colors.border,
            },
          ]}
          onPress={handleDeleteAccount}
          disabled={loading || confirmationText !== 'DELETE'}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              {t('deleteAccount')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[styles.modalContainer, { backgroundColor: colors.surface }]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  textInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  continueButton: {
    borderWidth: 0,
  },
  deleteButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
