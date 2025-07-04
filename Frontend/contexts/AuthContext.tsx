import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createClient,
  SupabaseClient,
  User,
  Session,
} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const adminEmail =
  Constants.expoConfig?.extra?.adminEmail || 'admin@agrisol.app';

// Validate environment variables
if (
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL === 'your_supabase_url_here'
) {
  console.warn(
    'EXPO_PUBLIC_SUPABASE_URL is not properly configured. Please update your .env file.',
  );
}

if (
  !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here'
) {
  console.warn(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY is not properly configured. Please update your .env file.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

interface UserProfileData {
  full_name: string;
  email: string;
  phone_number?: string;
  country?: string;
  province?: string;
  district?: string;
  sector?: string;
  farmer_type?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    profileData?: UserProfileData,
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = (email: string) => {
    return email === adminEmail || email.includes('@admin.agrisol.app');
  };

  const verifyAdminInDatabase = async (userId: string) => {
    try {
      console.log('🔍 Checking admin status for user:', userId);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.log('❌ Admin check error:', error.message);
        return false;
      }

      if (data) {
        console.log('✅ User is admin:', data);
        return true;
      }

      return false;
    } catch (error) {
      console.log('❌ Admin verification failed:', error);
      return false;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // First check email pattern quickly
        const emailBasedAdmin = checkAdminStatus(session.user.email || '');
        setIsAdmin(emailBasedAdmin); // Set initial admin status

        // Then verify in database asynchronously (don't await here)
        verifyAdminInDatabase(session.user.id)
          .then((databaseAdmin) => {
            const isUserAdmin = emailBasedAdmin || databaseAdmin;
            console.log('🔐 Admin status:', {
              emailBasedAdmin,
              databaseAdmin,
              final: isUserAdmin,
            });
            setIsAdmin(isUserAdmin);
          })
          .catch((err) => {
            console.log('❌ Failed to verify admin in database:', err);
          });
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // First check email pattern quickly
        const emailBasedAdmin = checkAdminStatus(session.user.email || '');
        setIsAdmin(emailBasedAdmin); // Set initial admin status

        // Then verify in database asynchronously (don't await here)
        verifyAdminInDatabase(session.user.id)
          .then((databaseAdmin) => {
            const isUserAdmin = emailBasedAdmin || databaseAdmin;
            console.log('🔐 Admin status:', {
              emailBasedAdmin,
              databaseAdmin,
              final: isUserAdmin,
            });
            setIsAdmin(isUserAdmin);
          })
          .catch((err) => {
            console.log('❌ Failed to verify admin in database:', err);
          });
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    profileData?: UserProfileData,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data.user) {
      const userIsAdmin = checkAdminStatus(email);

      try {
        if (userIsAdmin) {
          // Create admin user record
          const adminRecord = {
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: 'admin',
            permissions: {
              manage_users: true,
              manage_content: true,
              view_analytics: true,
              manage_admins: false,
            },
            is_active: true,
            created_at: new Date().toISOString(),
          };

          const { error: adminError } = await supabase
            .from('admin_users')
            .upsert([adminRecord]);

          if (adminError) {
            console.error('Error creating admin user:', adminError);
          }
        } else {
          // Create regular user profile
          const profileRecord = {
            id: data.user.id,
            full_name: profileData?.full_name || fullName,
            email: profileData?.email || email,
            phone_number: profileData?.phone_number || '',
            country: profileData?.country || '',
            province: profileData?.province || '',
            district: profileData?.district || '',
            sector: profileData?.sector || '',
            farmer_type: profileData?.farmer_type || '',
            created_at: new Date().toISOString(),
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([profileRecord]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
      } catch (err) {
        console.error('Error in profile/admin creation:', err);
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
