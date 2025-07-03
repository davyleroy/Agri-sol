import { useState, useEffect } from 'react';
import { supabase } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: {
    manage_users: boolean;
    manage_content: boolean;
    view_analytics: boolean;
    manage_admins?: boolean;
  };
  is_active: boolean;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setAdminData(null);
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user?.id)
        .eq('is_active', true)
        .single();

      if (error) {
        setIsAdmin(false);
        setAdminData(null);
      } else {
        setIsAdmin(true);
        setAdminData(data);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, adminData, loading, checkAdminStatus };
};
