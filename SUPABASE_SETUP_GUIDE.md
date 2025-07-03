# Supabase Setup Guide for Agri-sol App

## Overview

This guide will help you set up Supabase with complete database schema, authentication, and admin functionality for your Agri-sol agricultural app.

## Phase 1: Project Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `agri-sol-dev` (for development)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (probably Europe/US)
6. Click "Create new project"
7. Wait for setup to complete (~2 minutes)

### Step 2: Get Project Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public key** (starts with `eyJ`)
   - **service_role key** (starts with `eyJ`) - Keep this SECRET!

## Phase 2: Database Schema Setup

### Step 3: Create Database Tables

Go to **Database** → **SQL Editor** and run these SQL commands:

#### A. User Profiles Table

```sql
-- Create user profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    country TEXT NOT NULL,
    province TEXT,
    district TEXT,
    sector TEXT,
    farmer_type TEXT CHECK (farmer_type IN ('Small Scale', 'Medium Scale', 'Large Scale', 'Commercial')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### B. Admin Users Table

```sql
-- Create admin users table
CREATE TABLE admin_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin',
    permissions JSONB DEFAULT '{"manage_users": true, "manage_content": true, "view_analytics": true}',
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### C. Crops Management Table

```sql
-- Create crops table for admin management
CREATE TABLE crops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    category TEXT NOT NULL,
    description TEXT,
    growing_season TEXT,
    common_diseases JSONB,
    care_instructions TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger for crops
CREATE TRIGGER update_crops_updated_at
    BEFORE UPDATE ON crops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### D. Scan History Table

```sql
-- Create scan history table
CREATE TABLE scan_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    crop_type TEXT NOT NULL,
    disease_detected TEXT,
    confidence_score FLOAT,
    image_url TEXT,
    scan_result JSONB,
    treatment_recommendation TEXT,
    location_lat FLOAT,
    location_lng FLOAT,
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for better performance
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_scan_date ON scan_history(scan_date);
```

#### E. User Sessions Table (for analytics)

```sql
-- Create user sessions table for analytics
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    device_info JSONB,
    app_version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for analytics queries
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_date ON user_sessions(session_start);
```

### Step 4: Set Up Row Level Security (RLS)

#### A. Enable RLS on all tables

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
```

#### B. Create RLS Policies

```sql
-- Profiles policies
CREATE POLICY "Users can read their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- Admin users policies
CREATE POLICY "Admins can read admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- Crops policies
CREATE POLICY "Anyone can read active crops" ON crops
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage crops" ON crops
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- Scan history policies
CREATE POLICY "Users can read their own scan history" ON scan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scan history" ON scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all scan history" ON scan_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- User sessions policies
CREATE POLICY "Users can read their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );
```

### Step 5: Create Initial Admin User

```sql
-- Insert your email as the first admin (replace with your actual email)
INSERT INTO admin_users (id, email, role, permissions, is_active)
VALUES (
    gen_random_uuid(),
    'your-email@example.com',
    'super_admin',
    '{"manage_users": true, "manage_content": true, "view_analytics": true, "manage_admins": true}',
    true
);
```

### Step 6: Add Sample Crops Data

```sql
-- Insert sample crops for testing
INSERT INTO crops (name, scientific_name, category, description, growing_season, common_diseases, care_instructions, is_active) VALUES
('Beans', 'Phaseolus vulgaris', 'Legume', 'Common bean varieties grown in Rwanda', 'March-May, September-November',
 '["Bean Rust", "Anthracnose", "Angular Leaf Spot"]',
 'Plant in well-drained soil with good organic matter. Water regularly but avoid waterlogging.', true),

('Maize', 'Zea mays', 'Cereal', 'Corn crop widely cultivated in Rwanda', 'March-June, September-December',
 '["Maize Streak", "Corn Borer", "Leaf Blight"]',
 'Plant in rows with proper spacing. Apply fertilizer and ensure adequate water supply.', true),

('Potato', 'Solanum tuberosum', 'Tuber', 'Important staple crop in Rwanda highlands', 'March-May, September-November',
 '["Late Blight", "Early Blight", "Potato Virus Y"]',
 'Plant in ridges or raised beds. Ensure good drainage and apply appropriate fertilizers.', true),

('Tomato', 'Solanum lycopersicum', 'Fruit', 'Popular vegetable crop', 'Year-round with proper care',
 '["Blight", "Bacterial Wilt", "Mosaic Virus"]',
 'Support with stakes or cages. Regular watering and pest management required.', true);
```

## Phase 3: Environment Configuration

### Step 7: Update Environment Variables

Create/update your `.env` file in the Frontend directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Admin Configuration (optional, for admin features)
EXPO_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com

# ML Service Configuration (existing)
EXPO_PUBLIC_ML_API_URL=http://localhost:5000
EXPO_PUBLIC_ML_API_KEY=your_ml_api_key_here
```

## Phase 4: Code Integration

### Step 8: Update AuthContext

Replace the mock authentication in your `AuthContext.tsx`:

```typescript
// Replace the signIn function with:
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};
```

### Step 9: Create Admin Hook

Create `Frontend/hooks/useAdmin.ts`:

```typescript
import { useState, useEffect } from "react";
import { supabase } from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";

export interface AdminUser {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
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
        .from("admin_users")
        .select("*")
        .eq("id", user?.id)
        .eq("is_active", true)
        .single();

      if (error) {
        console.log("Not an admin user");
        setIsAdmin(false);
        setAdminData(null);
      } else {
        setIsAdmin(true);
        setAdminData(data);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, adminData, loading, checkAdminStatus };
};
```

### Step 10: Create Admin Service

Create `Frontend/services/adminService.ts`:

```typescript
import { supabase } from "../contexts/AuthContext";

export const adminService = {
  // User management
  async getAllUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getUserAnalytics() {
    const { data, error } = await supabase
      .from("profiles")
      .select("country, farmer_type, created_at")
      .eq("is_active", true);

    return { data, error };
  },

  // Crop management
  async getAllCrops() {
    const { data, error } = await supabase
      .from("crops")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async addCrop(cropData: {
    name: string;
    scientific_name?: string;
    category: string;
    description?: string;
    growing_season?: string;
    common_diseases?: string[];
    care_instructions?: string;
    image_url?: string;
  }) {
    const { data, error } = await supabase
      .from("crops")
      .insert([cropData])
      .select();

    return { data, error };
  },

  async updateCrop(id: string, updates: any) {
    const { data, error } = await supabase
      .from("crops")
      .update(updates)
      .eq("id", id)
      .select();

    return { data, error };
  },

  async deleteCrop(id: string) {
    const { data, error } = await supabase
      .from("crops")
      .update({ is_active: false })
      .eq("id", id);

    return { data, error };
  },

  // Analytics
  async getScanAnalytics() {
    const { data, error } = await supabase
      .from("scan_history")
      .select("crop_type, disease_detected, scan_date, confidence_score")
      .order("scan_date", { ascending: false });

    return { data, error };
  },
};
```

## Phase 5: Testing & Deployment

### Step 11: Test the Setup

1. **Test User Registration**: Use your sign-up form
2. **Test Admin Access**: Sign in with your admin email
3. **Test Data Flow**: Create a scan record, view it in admin
4. **Test RLS**: Try accessing data from different user accounts

### Step 12: Production Setup (For Tomorrow's Deployment)

1. **Create Production Project**: Follow Step 1 again with name `agri-sol-prod`
2. **Run Same SQL**: Execute all the same SQL commands
3. **Update Environment**: Create production environment variables
4. **Update Admin Email**: Add your production admin email

## Important Security Notes

- ✅ **Never commit** `.env` files to git
- ✅ **Use RLS policies** for all sensitive data
- ✅ **Keep service_role key secret**
- ✅ **Regularly audit admin access**
- ✅ **Monitor usage** for suspicious activity

## Next Steps After Setup

1. **Create Admin Dashboard**: Build admin screens in your app
2. **Add Analytics Views**: Create charts and reports
3. **Implement Crop Management**: Allow admins to add/edit crops
4. **Set Up Monitoring**: Configure alerts and backups

Your Agri-sol app is now ready with a complete backend system! 🌱

## Quick Start Commands

1. Start your app: `cd Frontend && npx expo start`
2. Test registration with your sign-up form
3. Check database in Supabase dashboard
4. Test admin features once implemented

Need help? Check the Supabase logs in your dashboard for any errors.
