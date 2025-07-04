-- 🔍 First, let's check what columns actually exist in scan_history table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'scan_history'
ORDER BY ordinal_position;

-- 🔍 Also check the other tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('scan_history', 'location_analytics', 'user_locations', 'disease_tracking')
ORDER BY table_name, ordinal_position; 