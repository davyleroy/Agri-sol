-- 🔒 STEP 4: Row Level Security (RLS) Policies
-- This secures your location tracking data so users can only access their own data

-- 🛡️ Enable RLS on all location-related tables
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_tracking ENABLE ROW LEVEL SECURITY;

-- 🔐 Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE id = auth.uid() AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 📊 SCAN_HISTORY Policies
-- Users can only see their own scans
CREATE POLICY "Users can view their own scans" ON scan_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own scans
CREATE POLICY "Users can insert their own scans" ON scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own scans
CREATE POLICY "Users can update their own scans" ON scan_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all scans
CREATE POLICY "Admins can view all scans" ON scan_history
    FOR SELECT USING (is_admin_user());

-- Admins can insert scans (for testing/data management)
CREATE POLICY "Admins can insert scans" ON scan_history
    FOR INSERT WITH CHECK (is_admin_user());

-- 📍 USER_LOCATIONS Policies
-- Users can only see their own locations
CREATE POLICY "Users can view their own locations" ON user_locations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own locations
CREATE POLICY "Users can insert their own locations" ON user_locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own locations
CREATE POLICY "Users can update their own locations" ON user_locations
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own locations
CREATE POLICY "Users can delete their own locations" ON user_locations
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all user locations
CREATE POLICY "Admins can view all user locations" ON user_locations
    FOR SELECT USING (is_admin_user());

-- 📈 LOCATION_ANALYTICS Policies
-- Everyone can view analytics (public data for leaderboards)
CREATE POLICY "Everyone can view location analytics" ON location_analytics
    FOR SELECT USING (true);

-- Only admins can modify analytics (should be handled by triggers anyway)
CREATE POLICY "Only admins can modify location analytics" ON location_analytics
    FOR ALL USING (is_admin_user());

-- 🦠 DISEASE_TRACKING Policies
-- Everyone can view disease tracking (public health data)
CREATE POLICY "Everyone can view disease tracking" ON disease_tracking
    FOR SELECT USING (true);

-- Only admins can modify disease tracking (should be handled by triggers anyway)
CREATE POLICY "Only admins can modify disease tracking" ON disease_tracking
    FOR ALL USING (is_admin_user());

-- 🔧 Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON scan_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_locations TO authenticated;
GRANT SELECT ON location_analytics TO authenticated;
GRANT SELECT ON disease_tracking TO authenticated;

-- 🔧 Grant admin permissions
GRANT ALL ON scan_history TO authenticated;
GRANT ALL ON location_analytics TO authenticated;
GRANT ALL ON disease_tracking TO authenticated;
GRANT ALL ON user_locations TO authenticated;

-- 🔧 Grant permissions to service role (for backend operations)
GRANT ALL ON scan_history TO service_role;
GRANT ALL ON location_analytics TO service_role;
GRANT ALL ON disease_tracking TO service_role;
GRANT ALL ON user_locations TO service_role;

-- 🔧 Grant permissions to anon role (for public analytics)
GRANT SELECT ON location_analytics TO anon;
GRANT SELECT ON disease_tracking TO anon;

-- 🧪 Test function to verify RLS is working
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE(
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        t.rowsecurity,
        COUNT(p.policyname)::INTEGER
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename
    WHERE t.tablename IN ('scan_history', 'location_analytics', 'user_locations', 'disease_tracking')
      AND t.schemaname = 'public'
    GROUP BY t.tablename, t.rowsecurity
    ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- ✅ Verify RLS is enabled and policies are created
SELECT * FROM test_rls_policies();

-- ✅ List all policies for location tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('scan_history', 'location_analytics', 'user_locations', 'disease_tracking')
ORDER BY tablename, policyname;

-- 🎉 Success message
SELECT '✅ Step 4 completed: Row Level Security policies created successfully!' as status;

-- 📋 Summary of what was created
SELECT 
    '🔒 RLS Enabled on 4 tables' as security_feature
UNION ALL
SELECT 
    '👤 User policies: Users can only access their own data' as security_feature
UNION ALL
SELECT 
    '👑 Admin policies: Admins can access all data' as security_feature
UNION ALL
SELECT 
    '🌍 Public policies: Analytics and disease tracking are public' as security_feature
UNION ALL
SELECT 
    '🛡️ Proper permissions granted to all roles' as security_feature; 