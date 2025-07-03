import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createClient,
  SupabaseClient,
  User,
  Session,
} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Validate environment variables
if (
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL === 'your_supabase_url_here'
) {
  console.warn(
    'EXPO_PUBLIC_SUPABASE_URL is not properly configured. Please update your .env file.'
  );
}

if (
  !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here'
) {
  console.warn(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY is not properly configured. Please update your .env file.'
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
  phone_number: string;
  country: string;
  province?: string;
  district?: string;
  sector?: string;
  farmer_type: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    profileData?: UserProfileData
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    profileData?: UserProfileData
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
      // Create user profile with additional data
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
        .insert([profileRecord]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't return the error immediately, as the user account was created successfully
        // The profile can be updated later
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
