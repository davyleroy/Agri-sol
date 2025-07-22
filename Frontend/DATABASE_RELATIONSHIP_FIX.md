# 🔧 **Database Relationship Fix Guide**

## 🚨 **Current Error**

```
Error fetching scan data: {"code":"PGRST200","details":"Searched for a foreign key relationship between 'scan_history' and 'profiles' in the schema 'public'...(truncated)...","hint":null,"message":"Could not find a relationship between 'scan_history' and 'profiles' in the schema cache"}
```

## ✅ **Solution: Fix Database Relationships**

### **Step 1: Access Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**

### **Step 2: Create Proper Tables with Relationships**

Run this complete script to fix the database structure:

```sql
-- 🔧 COMPLETE DATABASE FIX SCRIPT
-- Run this in your Supabase SQL Editor

-- 1. Drop existing tables if they exist (be careful with production data!)
DROP TABLE IF EXISTS scan_history CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create profiles table first
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create scan_history table with proper foreign key
CREATE TABLE scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    image_url TEXT,
    disease TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    status TEXT CHECK (status IN ('healthy', 'disease')),
    crop TEXT NOT NULL,
    location TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_date ON scan_history(date);
CREATE INDEX idx_scan_history_status ON scan_history(status);
CREATE INDEX idx_profiles_email ON profiles(email);

-- 5. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- Profiles policies
CREATE POLICY "Users can read their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin' AND is_active = true
        )
    );

-- Scan history policies
CREATE POLICY "Users can read their own scan history" ON scan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scan history" ON scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all scan history" ON scan_history
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin' AND is_active = true
        )
    );

-- 7. Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Insert sample data for testing
INSERT INTO profiles (id, email, full_name, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@agrisol.com', 'Admin User', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'user@agrisol.com', 'Test User', 'user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO scan_history (user_id, date, time, disease, confidence, status, crop, location, latitude, longitude) VALUES
    ('00000000-0000-0000-0000-000000000002', CURRENT_DATE, CURRENT_TIME, 'Early Blight', 85, 'disease', 'Tomato', 'Kigali', -1.9441, 30.0619),
    ('00000000-0000-0000-0000-000000000002', CURRENT_DATE, CURRENT_TIME, 'Healthy Plant', 92, 'healthy', 'Potato', 'Musanze', -1.9441, 30.0619)
ON CONFLICT DO NOTHING;
```

### **Step 3: Verify the Fix**

Run this query to test the relationship:

```sql
-- Test the relationship
SELECT
    sh.id,
    sh.disease,
    sh.confidence,
    sh.status,
    sh.crop,
    sh.location,
    p.email as user_email
FROM scan_history sh
LEFT JOIN profiles p ON sh.user_id = p.id
ORDER BY sh.created_at DESC
LIMIT 5;
```

### **Step 4: Update Your App Code**

The app code has already been updated to handle both scenarios:

- ✅ **With profiles relationship** (preferred)
- ✅ **Without profiles relationship** (fallback)
- ✅ **Mock data** (if database is unavailable)

### **Step 5: Test the Mobile App**

1. **Restart your Expo development server:**

   ```bash
   cd Frontend
   npx expo start --clear
   ```

2. **Test the admin dashboard** - should now load without errors

3. **Test the history screen** - should display scan history properly

## 🎯 **Expected Results**

After running this fix:

- ✅ No more relationship errors
- ✅ Admin dashboard loads with real data
- ✅ History screen works properly
- ✅ Fallback data if database is unavailable
- ✅ Proper user authentication and authorization

## 🔍 **Troubleshooting**

If you still see errors:

1. **Check Supabase logs** in the dashboard
2. **Verify RLS policies** are working correctly
3. **Test with a simple query** first
4. **Clear app cache** and restart

The mobile app should now work smoothly without the database relationship errors! 🚀📱
