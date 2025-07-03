# Supabase Setup Guide for Agri-sol App

## 🎯 Quick Start Summary

**For Development (Today):**

1. Create Supabase project → Get URL & keys
2. Run SQL commands in Supabase → Create all tables
3. Update `.env` file → Add your credentials
4. Replace mock auth → Enable real authentication
5. Test signup/login → Verify everything works

**For Production (Tomorrow):**

1. Create production project
2. Run same SQL commands
3. Update environment variables
4. Deploy with production credentials

---

## Phase 1: Project Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click **"New Project"**
4. Choose your organization
5. Fill in project details:
   - **Name**: `agri-sol-dev`
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Choose closest region
6. Click **"Create new project"**
7. Wait ~2 minutes for setup

### Step 2: Get Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJ...` (long string)
   - **service_role key**: `eyJ...` (keep secret!)

---

## Phase 2: Database Setup

### Step 3: Create All Tables

Go to **Database** → **SQL Editor** and run each SQL block:

#### A. User Profiles Table

```sql
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

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### C. Crops Table

```sql
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

CREATE TRIGGER update_crops_updated_at
    BEFORE UPDATE ON crops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### D. Scan History Table

```sql
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

CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_scan_date ON scan_history(scan_date);
```

#### E. User Sessions Table

```sql
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

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_date ON user_sessions(session_start);
```

### Step 4: Enable Row Level Security

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
```

### Step 5: Create Security Policies

```sql
-- Profiles policies
CREATE POLICY "Users can read their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

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

### Step 6: Add Sample Data

```sql
-- Add sample crops
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

### Step 7: Create Your Admin User

**IMPORTANT:** Replace `your-email@example.com` with your actual email:

```sql
-- Create admin user (first register in app, then run this)
INSERT INTO admin_users (id, email, role, permissions, is_active)
SELECT
    auth.users.id,
    'your-email@example.com',
    'super_admin',
    '{"manage_users": true, "manage_content": true, "view_analytics": true, "manage_admins": true}',
    true
FROM auth.users
WHERE auth.users.email = 'your-email@example.com';
```

---

## Phase 3: Environment Configuration

### Step 8: Update Your .env File

Edit `Frontend/.env`:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Admin Configuration
EXPO_PUBLIC_ADMIN_EMAIL=your-email@example.com

# ML Service Configuration (existing)
EXPO_PUBLIC_ML_API_URL=http://localhost:5000
EXPO_PUBLIC_ML_API_KEY=your_ml_api_key_here
```

### Step 9: Fix AuthContext (Remove Mock Authentication)

Edit `contexts/AuthContext.tsx` and replace the `signIn` function:

```typescript
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};
```

**Remove the entire mock users section!**

---

## Phase 4: Add Admin Features

### Step 10: Create Admin Hook

Create `hooks/useAdmin.ts`:

```typescript
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
```

### Step 11: Create Admin Service

Create `services/adminService.ts`:

```typescript
import { supabase } from '../contexts/AuthContext';

export const adminService = {
  // User management
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getUserAnalytics() {
    const { data, error } = await supabase
      .from('profiles')
      .select('country, farmer_type, created_at')
      .eq('is_active', true);

    return { data, error };
  },

  // Crop management
  async getAllCrops() {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .order('created_at', { ascending: false });

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
      .from('crops')
      .insert([cropData])
      .select();

    return { data, error };
  },

  async updateCrop(id: string, updates: any) {
    const { data, error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', id)
      .select();

    return { data, error };
  },

  async deleteCrop(id: string) {
    const { data, error } = await supabase
      .from('crops')
      .update({ is_active: false })
      .eq('id', id);

    return { data, error };
  },

  // Analytics
  async getScanAnalytics() {
    const { data, error } = await supabase
      .from('scan_history')
      .select('crop_type, disease_detected, scan_date, confidence_score')
      .order('scan_date', { ascending: false });

    return { data, error };
  },
};
```

---

## Phase 5: Testing

### Step 12: Test Everything

1. **Test Environment**: `cd Frontend && npx expo start`
2. **Test Registration**: Use your sign-up form with a new email
3. **Test Login**: Use the same credentials
4. **Check Database**: Go to Supabase dashboard → Table Editor → profiles
5. **Test Admin**:
   - Register with your admin email
   - Run the admin SQL query
   - Check admin_users table

### Step 13: Common Issues & Solutions

**Issue**: `EXPO_PUBLIC_SUPABASE_URL is not properly configured`
**Solution**: Check your `.env` file has correct URL without quotes

**Issue**: Registration not working
**Solution**: Check RLS policies are created correctly

**Issue**: Can't see admin features
**Solution**: Make sure admin_users table has your user ID

---

## Phase 6: Production (Tomorrow)

### Step 14: Production Setup

1. **Create Production Project**: Name it `agri-sol-prod`
2. **Run Same SQL**: Copy all SQL commands from above
3. **Update Environment**: Create production `.env`
4. **Deploy**: Use production credentials

### Step 15: Production Environment

```env
# Production .env
EXPO_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
EXPO_PUBLIC_ADMIN_EMAIL=your-production-admin@example.com
```

---

## 🔒 Security Checklist

- ✅ RLS enabled on all tables
- ✅ Proper policies for user data
- ✅ Admin permissions controlled
- ✅ `.env` file in `.gitignore`
- ✅ Service role key kept secret
- ✅ Regular admin access audits

---

## 🎯 Next Steps

1. **Build Admin Dashboard**: Create admin screens in your app
2. **Add Analytics**: User stats, scan analytics, location data
3. **Crop Management**: Admin can add/edit crops
4. **Monitoring**: Set up alerts and backups
5. **Scale**: Upgrade Supabase plan as needed

---

## 🆘 Support

**Common Commands:**

- Start app: `cd Frontend && npx expo start`
- Check logs: Supabase Dashboard → Logs
- View tables: Supabase Dashboard → Table Editor
- Test SQL: Supabase Dashboard → SQL Editor

**If something breaks:**

1. Check Supabase logs
2. Verify environment variables
3. Test RLS policies
4. Check network connectivity

Your Agri-sol app is now ready with a complete backend! 🌱

**Happy coding! 🚀**
