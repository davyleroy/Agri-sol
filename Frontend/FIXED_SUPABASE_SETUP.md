# 🔧 FIXED Supabase Setup - No More Errors!

## 🚨 **CRITICAL FIX FOR INFINITE RECURSION ERROR**

### **Step 1: Drop and Recreate Problematic Policies**

Go to **Supabase Dashboard** → **SQL Editor** and run this **IMMEDIATELY**:

```sql
-- 🔥 EMERGENCY FIX: Drop all problematic policies
DROP POLICY IF EXISTS "Admins can read admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all scan history" ON scan_history;
DROP POLICY IF EXISTS "Admins can read all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can manage crops" ON crops;

-- 🔥 ALSO: Temporarily disable RLS on admin_users to break the recursion
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
```

### **Step 2: Create SAFE Admin Policies (No Recursion)**

```sql
-- ✅ SAFE: Enable RLS back on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ✅ SAFE: Simple admin_users policies (no self-reference)
CREATE POLICY "Anyone can read admin_users for auth check" ON admin_users
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can check admin status" ON admin_users
    FOR SELECT USING (auth.role() = 'authenticated');

-- ✅ SAFE: Fixed profiles policies
CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM admin_users WHERE is_active = true
        )
    );

-- ✅ SAFE: Fixed scan history policies
CREATE POLICY "Admins can read all scan history" ON scan_history
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM admin_users WHERE is_active = true
        )
    );

-- ✅ SAFE: Fixed crops policies
CREATE POLICY "Admins can manage crops" ON crops
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM admin_users WHERE is_active = true
        )
    );
```

### **Step 3: Create Your Admin User (CRITICAL)**

**🔥 IMPORTANT**: Run this AFTER you register with `d.nkurunziz@alustudent.com`:

```sql
-- First, check if your user exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'd.nkurunziz@alustudent.com';

-- If user exists, create admin record (replace the UUID with actual ID from above)
INSERT INTO admin_users (id, email, role, permissions, is_active)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'd.nkurunziz@alustudent.com'),
    'd.nkurunziz@alustudent.com',
    'super_admin',
    '{"manage_users": true, "manage_content": true, "view_analytics": true, "manage_admins": true}',
    true
);
```

## 📋 **COMPLETE STEP-BY-STEP CHECKLIST**

### **Phase 1: Fix Database Issues** ✅

1. **Go to Supabase Dashboard**
2. **Click SQL Editor**
3. **Copy-paste the EMERGENCY FIX** (Step 1 above)
4. **Run it** → This will stop the recursion error
5. **Copy-paste the SAFE policies** (Step 2 above)
6. **Run it** → This creates working policies

### **Phase 2: Fix Admin Authentication** ✅

1. **Register in your app** with email: `d.nkurunziz@alustudent.com`
2. **Go back to SQL Editor**
3. **Run the admin creation query** (Step 3 above)
4. **Verify in admin_users table** → You should see your entry

### **Phase 3: Fix App Configuration** ✅

Update your environment to match the new admin email:

```json
// app.json should already have this (you changed it):
{
  "expo": {
    "extra": {
      "adminEmail": "d.nkurunziz@alustudent.com"
    }
  }
}
```

### **Phase 4: Test Everything** ✅

1. **Restart your app**: `npx expo start`
2. **Clear cache**: Press `r` in terminal to reload
3. **Login with**: `d.nkurunziz@alustudent.com`
4. **You should see**: **Admin Dashboard** (not blank screen)

## 🔍 **WHY THE BLANK SCREEN HAPPENED**

The blank screen occurs because:

1. **Admin detection fails** due to database errors
2. **AuthContext.tsx** can't determine if user is admin
3. **App gets confused** and shows nothing

## 🔍 **WHY USER WASN'T IN SUPABASE**

The user creation failed because:

1. **RLS policies blocked** profile creation
2. **Infinite recursion** prevented database operations
3. **Authentication completed** but profile creation failed

## 🛠️ **VERIFY YOUR FIX**

After running the fixes above, check:

### **Check 1: User in Database**

```sql
-- In Supabase SQL Editor:
SELECT * FROM auth.users WHERE email = 'd.nkurunziz@alustudent.com';
SELECT * FROM profiles WHERE email = 'd.nkurunziz@alustudent.com';
SELECT * FROM admin_users WHERE email = 'd.nkurunziz@alustudent.com';
```

### **Check 2: App Behavior**

- ✅ Login successful
- ✅ Admin dashboard appears (not blank)
- ✅ Can see statistics and data
- ✅ No console errors

### **Check 3: Database Tables**

Go to **Database** → **Table Editor**:

- ✅ `auth.users` → Your user exists
- ✅ `profiles` → Your profile exists
- ✅ `admin_users` → Your admin record exists

## 🔄 **IF STILL HAVING ISSUES**

### **Nuclear Option - Reset Everything**:

```sql
-- ⚠️ DANGER: Only if nothing else works
DELETE FROM admin_users WHERE email = 'd.nkurunziz@alustudent.com';
DELETE FROM profiles WHERE email = 'd.nkurunziz@alustudent.com';
-- Don't delete from auth.users - let the app handle that
```

Then restart registration process.

## 🎯 **EXPECTED RESULT**

After fixing everything:

1. **Login** with `d.nkurunziz@alustudent.com`
2. **See Admin Dashboard** with:
   - Dark header "Admin Dashboard"
   - Quick stats cards (Users, Scans, Healthy, Diseases)
   - Tab navigation (Overview, Map, Analytics, Locations)
   - Real data or mock data for testing

## 🆘 **EMERGENCY CONTACT PLAN**

If errors persist:

1. **Screenshot** any new error messages
2. **Check Supabase logs**: Dashboard → Logs
3. **Check app console**: Development tools
4. **Verify** all SQL commands ran successfully

The infinite recursion error should be **completely eliminated** after Step 1-2 above! 🚀
