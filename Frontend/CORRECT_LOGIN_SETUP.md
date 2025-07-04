# 🔧 Fix Login Issue - Correct Registration Order

## 🚨 **PROBLEM**: You ran SQL first, now have admin record but no password!

## ✅ **SOLUTION**: Clean up and do it in the right order

### **Step 1: Clean Up Invalid Records**

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- 🧹 Clean up the admin record without auth user
DELETE FROM admin_users WHERE email = 'd.nkurunziz@alustudent.com';

-- 🧹 Also clean up any orphaned profile records
DELETE FROM profiles WHERE email = 'd.nkurunziz@alustudent.com';

-- ✅ Verify cleanup - should return 0 results
SELECT * FROM admin_users WHERE email = 'd.nkurunziz@alustudent.com';
SELECT * FROM profiles WHERE email = 'd.nkurunziz@alustudent.com';
```

### **Step 2: Register Through Your App**

1. **Open your app** (make sure it's running: `npx expo start`)
2. **Go to Sign Up page**
3. **Register with**:
   - Email: `d.nkurunziz@alustudent.com`
   - Password: `your-secure-password`
   - Full Name: `Your Name`
   - Fill in other details as needed
4. **Complete registration** - this creates the auth.users record with password

### **Step 3: Now Run the Admin Creation SQL**

After successful registration, go back to **SQL Editor** and run:

```sql
-- ✅ Now create admin record (linking to existing auth user)
INSERT INTO admin_users (id, email, role, permissions, is_active)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'd.nkurunziz@alustudent.com'),
    'd.nkurunziz@alustudent.com',
    'super_admin',
    '{"manage_users": true, "manage_content": true, "view_analytics": true, "manage_admins": true}',
    true
);

-- ✅ Verify everything worked
SELECT
    au.id,
    au.email,
    au.role,
    u.email as auth_email,
    u.created_at as auth_created
FROM admin_users au
JOIN auth.users u ON au.id = u.id
WHERE au.email = 'd.nkurunziz@alustudent.com';
```

### **Step 4: Test Login**

1. **Go to Sign In page**
2. **Login with**:
   - Email: `d.nkurunziz@alustudent.com`
   - Password: `your-secure-password` (same as registration)
3. **You should see**: Admin Dashboard (not blank screen!)

## 🔍 **Alternative: Check What Actually Exists**

First, let's see what you actually have in your database:

```sql
-- 🔍 Check auth.users table
SELECT id, email, created_at FROM auth.users WHERE email = 'd.nkurunziz@alustudent.com';

-- 🔍 Check admin_users table
SELECT * FROM admin_users WHERE email = 'd.nkurunziz@alustudent.com';

-- 🔍 Check profiles table
SELECT * FROM profiles WHERE email = 'd.nkurunziz@alustudent.com';
```

**If you see**:

- ✅ **auth.users has record** → You can login! Just need to create admin_users record
- ❌ **auth.users is empty** → Need to register first
- ❌ **admin_users exists but auth.users empty** → Clean up and start fresh

## 🎯 **Quick Decision Guide**

### **If you already registered in the app:**

- Skip Step 1 (cleanup)
- Go straight to Step 3 (create admin record)

### **If you never registered in the app:**

- Do all steps 1-4 in order

### **If you're not sure:**

- Run the "Check What Actually Exists" queries first
- Then follow the appropriate path

## 🔐 **Password Reset Option**

If you somehow have an auth.users record but forgot the password:

```sql
-- 🔄 Reset password (this will send reset email)
-- Run this in your app console or create a simple script:
```

```javascript
// In your app console or temporary script:
import { supabase } from './contexts/AuthContext';

async function resetPassword() {
  const { error } = await supabase.auth.resetPasswordForEmail(
    'd.nkurunziz@alustudent.com',
  );
  console.log('Reset email sent:', error ? error.message : 'Success');
}
```

## 📱 **Expected Result After Fix**

**Login Flow:**

1. Enter email: `d.nkurunziz@alustudent.com`
2. Enter password: `your-password`
3. See console logs:
   ```
   🔄 Auth state changed: SIGNED_IN
   🔍 Checking admin status for user: [uuid]
   ✅ User is admin: { role: "super_admin", ... }
   👑 Showing admin dashboard
   ```
4. **Admin Dashboard appears** with all features working!

## 🆘 **If Still Stuck**

1. **Check console** for any error messages
2. **Verify in Supabase** → Authentication → Users (should see your user)
3. **Check database tables** using the SQL queries above
4. **Try password reset** if you have the auth record but wrong password

The key is: **Authentication user must exist first, then link admin record to it!** 🔐
