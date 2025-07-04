-- 🔥 EMERGENCY FIX: Add missing full_name column to admin_users table
-- This fixes the "Could not find the 'full_name' column" error

-- Add the missing column
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update your existing admin record to have a full_name
UPDATE admin_users 
SET full_name = 'Admin User' 
WHERE email = 'd.nkurunziz@alustudent.com' AND full_name IS NULL;

-- Verify the fix worked
SELECT id, email, full_name, role FROM admin_users WHERE email = 'd.nkurunziz@alustudent.com';

-- Also verify the table structure now includes full_name
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position; 