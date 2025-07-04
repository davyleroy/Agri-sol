-- 🔍 Check what columns actually exist in our location tables
-- This will help us create the correct helper functions

SELECT 'location_analytics table columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'location_analytics' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'scan_history table columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'scan_history' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'disease_tracking table columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'disease_tracking' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'user_locations table columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_locations' AND table_schema = 'public'
ORDER BY ordinal_position; 