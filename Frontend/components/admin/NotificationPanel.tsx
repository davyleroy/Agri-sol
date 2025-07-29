import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
} from 'lucide-react-native';
import {
  notificationService,
  AdminNotification,
} from '../../services/notificationService';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const { width } = Dimensions.get('window');

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    loadNotifications();
    // Check for new notifications every 2 minutes
    const interval = setInterval(loadNotifications, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [notificationsResult, countResult] = await Promise.all([
        notificationService.getUnreadNotifications(),
        notificationService.getUnreadCount(),
      ]);

      if (notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }

      if (countResult.count !== undefined) {
        setUnreadCount(countResult.count);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNotificationPress = async (notification: AdminNotification) => {
    try {
      await notificationService.markAsRead(notification.id);

      Alert.alert('🚨 Disease Alert', notification.message, [
        { text: 'OK', onPress: () => loadNotifications() },
        {
          text: 'View Details',
          onPress: () => {
            // You can navigate to a detailed view here
            console.log('Navigate to detailed view for:', notification);
          },
        },
      ]);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.createTestNotification();
      Alert.alert(
        'Test Notification',
        'Test notification created successfully!',
      );
      loadNotifications();
    } catch (error) {
      console.error('Error creating test notification:', error);
      Alert.alert('Error', 'Failed to create test notification');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quota_exceeded':
        return AlertTriangle;
      case 'disease_outbreak':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'quota_exceeded':
        return '#dc2626';
      case 'disease_outbreak':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Don't render anything if no unread notifications
  if (unreadCount === 0) {
    return null;
  }

  return (
    <>
      {/* Notification Badge */}
      <TouchableOpacity
        style={[styles.notificationBadge, { backgroundColor: colors.primary }]}
        onPress={() => setShowModal(true)}
      >
        <Bell size={16} color="#ffffff" />
        <Text style={styles.badgeText}>{unreadCount}</Text>
      </TouchableOpacity>

      {/* Notification Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Disease Alerts ({unreadCount})
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => loadNotifications(true)}
              >
                <RefreshCw size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Refresh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={handleMarkAllAsRead}
              >
                <CheckCircle size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Mark All Read</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                onPress={handleTestNotification}
              >
                <AlertTriangle size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Test Alert</Text>
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView
              style={styles.notificationsList}
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Loading notifications...
                  </Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Bell size={48} color={colors.textSecondary} />
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    No unread notifications
                  </Text>
                </View>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(
                    notification.notification_type,
                  );
                  const iconColor = getNotificationColor(
                    notification.notification_type,
                  );

                  return (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        { backgroundColor: colors.surface },
                      ]}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <View style={styles.notificationIcon}>
                        <IconComponent size={20} color={iconColor} />
                      </View>

                      <View style={styles.notificationContent}>
                        <Text
                          style={[
                            styles.notificationMessage,
                            { color: colors.text },
                          ]}
                        >
                          {notification.message}
                        </Text>

                        {notification.crop_type && (
                          <View style={styles.notificationMeta}>
                            <Text
                              style={[
                                styles.notificationCrop,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {notification.crop_type}
                            </Text>
                            {notification.disease_count && (
                              <Text
                                style={[
                                  styles.notificationCount,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                {notification.disease_count} cases
                              </Text>
                            )}
                          </View>
                        )}

                        <Text
                          style={[
                            styles.notificationTime,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {formatTimeAgo(notification.created_at)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    zIndex: 1000,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationCrop: {
    fontSize: 12,
    fontWeight: '500',
  },
  notificationCount: {
    fontSize: 12,
  },
  notificationTime: {
    fontSize: 11,
  },
});
