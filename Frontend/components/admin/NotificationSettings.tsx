import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Save,
  AlertTriangle,
} from 'lucide-react-native';
import {
  notificationService,
  NotificationSettings,
} from '../../services/notificationService';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface NotificationSettingsComponentProps {
  onClose?: () => void;
}

export default function NotificationSettingsComponent({
  onClose,
}: NotificationSettingsComponentProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    daily_quota_limit: 10,
    notification_frequency_minutes: 30,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Get screen dimensions for responsive design
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 400;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } =
        await notificationService.getNotificationSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const { error } =
        await notificationService.updateNotificationSettings(settings);
      if (error) {
        Alert.alert('Error', 'Failed to save notification settings');
      } else {
        Alert.alert('Success', 'Notification settings saved successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Auto-close modal after successful save
              if (onClose) {
                onClose();
              }
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.createTestNotification();
      Alert.alert('Test Notification', 'Test notification sent successfully!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading notification settings...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingHorizontal: isSmallScreen ? 12 : 16,
        },
      ]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Settings size={24} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notification Settings
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Configure disease alert preferences
        </Text>
      </View>

      {/* Email Notifications */}
      <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
        <View style={styles.settingHeader}>
          <Mail size={20} color={colors.primary} />
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Email Notifications
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: colors.textSecondary },
              ]}
            >
              Receive disease alerts via email
            </Text>
          </View>
          <Switch
            value={settings.email_notifications}
            onValueChange={(value) =>
              setSettings({ ...settings, email_notifications: value })
            }
            trackColor={{ false: colors.textSecondary, true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* SMS Notifications */}
      <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
        <View style={styles.settingHeader}>
          <MessageSquare size={20} color={colors.primary} />
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              SMS Notifications
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: colors.textSecondary },
              ]}
            >
              Receive disease alerts via SMS
            </Text>
          </View>
          <Switch
            value={settings.sms_notifications}
            onValueChange={(value) =>
              setSettings({ ...settings, sms_notifications: value })
            }
            trackColor={{ false: colors.textSecondary, true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Daily Quota Limit */}
      <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
        <View style={styles.settingHeader}>
          <AlertTriangle size={20} color={colors.primary} />
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Daily Quota Limit
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: colors.textSecondary },
              ]}
            >
              Alert when diseases exceed this limit per crop
            </Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.textSecondary,
              },
            ]}
            value={settings.daily_quota_limit.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 10;
              setSettings({ ...settings, daily_quota_limit: value });
            }}
            keyboardType="numeric"
            placeholder="10"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            diseases per crop per day
          </Text>
        </View>
      </View>

      {/* Notification Frequency */}
      <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
        <View style={styles.settingHeader}>
          <Bell size={20} color={colors.primary} />
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Notification Frequency
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: colors.textSecondary },
              ]}
            >
              Minimum time between notifications for same crop
            </Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.textSecondary,
              },
            ]}
            value={settings.notification_frequency_minutes.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 30;
              setSettings({
                ...settings,
                notification_frequency_minutes: value,
              });
            }}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            minutes
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          <Save size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>
            {saving ? 'Saving...' : 'Save & Close'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
          onPress={handleTestNotification}
        >
          <AlertTriangle size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>Send Test Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          How it works
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          • Notifications are triggered when disease scans exceed the daily
          quota limit{'\n'}• Each crop type (Tomato, Potato, Bean, Maize) has
          separate quotas{'\n'}• Frequency control prevents spam notifications
          {'\n'}• Only admin users receive these notifications{'\n'}• Quotas
          reset daily at midnight
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  settingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44,
  },
  inputLabel: {
    fontSize: 14,
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    minHeight: 48,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
