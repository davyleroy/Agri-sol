import { supabase } from '../contexts/AuthContext';

export interface NotificationSettings {
  id?: string;
  admin_id?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  daily_quota_limit: number;
  notification_frequency_minutes: number;
  is_active: boolean;
}

export interface AdminNotification {
  id: string;
  admin_id: string;
  notification_type: 'quota_exceeded' | 'disease_outbreak';
  crop_type?: string;
  disease_count?: number;
  message: string;
  is_read: boolean;
  sent_via: 'app' | 'email' | 'sms';
  created_at: string;
}

export interface DailyQuota {
  crop_type: string;
  disease_count: number;
  quota_date: string;
  last_notification_at?: string;
}

export const notificationService = {
  // Get unread notifications for current admin
  async getUnreadNotifications(): Promise<{
    data: AdminNotification[] | null;
    error: any;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('admin_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return { data: null, error };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      return { error };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { error };
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('admin_id', user.id)
        .eq('is_read', false);

      return { error };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { error };
    }
  },

  // Get notification settings for current admin
  async getNotificationSettings(): Promise<{
    data: NotificationSettings | null;
    error: any;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('admin_notification_settings')
        .select('*')
        .eq('admin_id', user.id)
        .single();

      // If no settings exist, return default settings
      if (!data && !error) {
        return {
          data: {
            email_notifications: true,
            sms_notifications: false,
            daily_quota_limit: 10,
            notification_frequency_minutes: 30,
            is_active: true,
          },
          error: null,
        };
      }

      return { data, error };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return { data: null, error };
    }
  },

  // Update notification settings
  async updateNotificationSettings(
    settings: Partial<NotificationSettings>,
  ): Promise<{ data: NotificationSettings | null; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('admin_notification_settings')
        .upsert({
          admin_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return { data: null, error };
    }
  },

  // Get current daily disease quotas
  async getDailyDiseaseQuotas(): Promise<{
    data: DailyQuota[] | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_daily_disease_quotas');
      return { data, error };
    } catch (error) {
      console.error('Error fetching daily disease quotas:', error);
      return { data: null, error };
    }
  },

  // Get notification count for badge
  async getUnreadCount(): Promise<{ count: number; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { count: 0, error: 'User not authenticated' };
      }

      const { count, error } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', user.id)
        .eq('is_read', false);

      return { count: count || 0, error };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { count: 0, error };
    }
  },

  // Test notification (for development)
  async createTestNotification(): Promise<{ error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase.from('admin_notifications').insert({
        admin_id: user.id,
        notification_type: 'quota_exceeded',
        crop_type: 'Tomato',
        disease_count: 12,
        message:
          '🧪 Test notification: Daily disease quota exceeded for Tomato: 12 cases detected today',
        sent_via: 'app',
      });

      return { error };
    } catch (error) {
      console.error('Error creating test notification:', error);
      return { error };
    }
  },
};
