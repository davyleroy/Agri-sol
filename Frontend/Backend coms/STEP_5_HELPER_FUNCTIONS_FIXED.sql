-- 🔧 STEP 5: Helper Functions for Location Analytics and Leaderboards (FIXED VERSION)
-- This creates all the query functions your frontend will need, using actual table columns

-- 📊 Get location leaderboard (top locations by scan count)
CREATE OR REPLACE FUNCTION get_location_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    rank INTEGER,
    location_name TEXT,
    location_hierarchy TEXT,
    province TEXT,
    district TEXT,
    sector TEXT,
    total_scans INTEGER,
    healthy_scans INTEGER,
    diseased_scans INTEGER,
    unique_users INTEGER,
    last_scan_date TIMESTAMP WITH TIME ZONE,
    disease_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY la.total_scans DESC)::INTEGER as rank,
        (CASE 
            WHEN la.sector IS NOT NULL THEN la.sector
            WHEN la.district IS NOT NULL THEN la.district
            WHEN la.province IS NOT NULL THEN la.province
            ELSE 'Unknown'
        END)::TEXT as location_name,
        -- Build hierarchy dynamically
        (CASE 
            WHEN la.province IS NOT NULL THEN
                CASE 
                    WHEN la.district IS NOT NULL THEN
                        CASE 
                            WHEN la.sector IS NOT NULL THEN la.province || '>' || la.district || '>' || la.sector
                            ELSE la.province || '>' || la.district
                        END
                    ELSE la.province
                END
            ELSE 'Unknown'
        END)::TEXT as location_hierarchy,
        la.province,
        la.district,
        la.sector,
        la.total_scans,
        la.healthy_scans,
        la.disease_scans as diseased_scans,
        la.total_users as unique_users,
        la.last_scan_at as last_scan_date,
        CASE 
            WHEN la.total_scans > 0 THEN 
                ROUND((la.disease_scans::NUMERIC / la.total_scans::NUMERIC) * 100, 2)
            ELSE 0
        END as disease_rate
    FROM location_analytics la
    WHERE la.total_scans > 0
    ORDER BY la.total_scans DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 📈 Get analytics summary for admin dashboard
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS TABLE(
    total_scans BIGINT,
    total_healthy_scans BIGINT,
    total_diseased_scans BIGINT,
    unique_users BIGINT,
    active_locations INTEGER,
    top_disease TEXT,
    disease_count BIGINT,
    most_active_location TEXT,
    location_scan_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(la.total_scans), 0) as total_scans,
        COALESCE(SUM(la.healthy_scans), 0) as total_healthy_scans,
        COALESCE(SUM(la.disease_scans), 0) as total_diseased_scans,
        COALESCE(SUM(la.total_users), 0) as unique_users,
        COUNT(*)::INTEGER as active_locations,
        (SELECT dt.disease_name FROM disease_tracking dt ORDER BY dt.occurrence_count DESC LIMIT 1) as top_disease,
        (SELECT dt.occurrence_count FROM disease_tracking dt ORDER BY dt.occurrence_count DESC LIMIT 1) as disease_count,
        (SELECT 
            CASE 
                WHEN la2.sector IS NOT NULL THEN la2.sector
                WHEN la2.district IS NOT NULL THEN la2.district
                WHEN la2.province IS NOT NULL THEN la2.province
                ELSE 'Unknown'
            END
         FROM location_analytics la2 
         ORDER BY la2.total_scans DESC 
         LIMIT 1) as most_active_location,
        (SELECT la3.total_scans FROM location_analytics la3 ORDER BY la3.total_scans DESC LIMIT 1) as location_scan_count
    FROM location_analytics la
    WHERE la.total_scans > 0;
END;
$$ LANGUAGE plpgsql;

-- 🦠 Get disease tracking by location (if disease_tracking table exists)
CREATE OR REPLACE FUNCTION get_disease_tracking_by_location(location_filter TEXT DEFAULT NULL)
RETURNS TABLE(
    location_name TEXT,
    location_hierarchy TEXT,
    province TEXT,
    district TEXT,
    sector TEXT,
    disease_name TEXT,
    occurrence_count INTEGER,
    severity_average NUMERIC,
    first_detected TIMESTAMP WITH TIME ZONE,
    last_detected TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if disease_tracking table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'disease_tracking' AND table_schema = 'public') THEN
        RETURN QUERY
        SELECT 
            CASE 
                WHEN dt.sector IS NOT NULL THEN dt.sector
                WHEN dt.district IS NOT NULL THEN dt.district
                WHEN dt.province IS NOT NULL THEN dt.province
                ELSE 'Unknown'
            END as location_name,
            -- Build hierarchy dynamically
            CASE 
                WHEN dt.province IS NOT NULL THEN
                    CASE 
                        WHEN dt.district IS NOT NULL THEN
                            CASE 
                                WHEN dt.sector IS NOT NULL THEN dt.province || '>' || dt.district || '>' || dt.sector
                                ELSE dt.province || '>' || dt.district
                            END
                        ELSE dt.province
                    END
                ELSE 'Unknown'
            END as location_hierarchy,
            dt.province,
            dt.district,
            dt.sector,
            dt.disease_name,
            dt.occurrence_count,
            ROUND(dt.severity_average, 3) as severity_average,
            dt.first_detected,
            dt.last_detected
        FROM disease_tracking dt
        WHERE 
            (location_filter IS NULL OR 
             dt.province ILIKE '%' || location_filter || '%' OR
             dt.district ILIKE '%' || location_filter || '%' OR
             dt.sector ILIKE '%' || location_filter || '%')
        ORDER BY dt.occurrence_count DESC, dt.last_detected DESC;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 👤 Get user scan history with location info
CREATE OR REPLACE FUNCTION get_user_scan_history(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
    scan_id UUID,
    plant_type TEXT,
    disease_detected TEXT,
    confidence_score NUMERIC,
    location_name TEXT,
    province TEXT,
    district TEXT,
    sector TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    scan_date TIMESTAMP WITH TIME ZONE,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.id as scan_id,
        sh.plant_type,
        sh.disease_detected,
        sh.confidence_score,
        CASE 
            WHEN sh.sector IS NOT NULL THEN sh.sector
            WHEN sh.district IS NOT NULL THEN sh.district
            WHEN sh.province IS NOT NULL THEN sh.province
            ELSE 'Unknown'
        END as location_name,
        sh.province,
        sh.district,
        sh.sector,
        sh.latitude,
        sh.longitude,
        sh.created_at as scan_date,
        sh.image_url
    FROM scan_history sh
    WHERE sh.user_id = user_uuid
    ORDER BY sh.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 🌍 Get recent scans across all locations (for admin dashboard)
CREATE OR REPLACE FUNCTION get_recent_scans(limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
    scan_id UUID,
    user_id UUID,
    plant_type TEXT,
    disease_detected TEXT,
    confidence_score NUMERIC,
    location_name TEXT,
    province TEXT,
    district TEXT,
    sector TEXT,
    scan_date TIMESTAMP WITH TIME ZONE,
    days_ago INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.id as scan_id,
        sh.user_id,
        sh.plant_type,
        sh.disease_detected,
        sh.confidence_score,
        CASE 
            WHEN sh.sector IS NOT NULL THEN sh.sector
            WHEN sh.district IS NOT NULL THEN sh.district
            WHEN sh.province IS NOT NULL THEN sh.province
            ELSE 'Unknown'
        END as location_name,
        sh.province,
        sh.district,
        sh.sector,
        sh.created_at as scan_date,
        DATE_PART('day', NOW() - sh.created_at)::INTEGER as days_ago
    FROM scan_history sh
    ORDER BY sh.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 📊 Get location analytics for specific hierarchy level
CREATE OR REPLACE FUNCTION get_location_analytics_by_level(hierarchy_level TEXT DEFAULT 'all')
RETURNS TABLE(
    location_name TEXT,
    location_hierarchy TEXT,
    province TEXT,
    district TEXT,
    sector TEXT,
    total_scans INTEGER,
    healthy_scans INTEGER,
    diseased_scans INTEGER,
    unique_users INTEGER,
    disease_rate NUMERIC,
    last_scan_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN la.sector IS NOT NULL THEN la.sector
            WHEN la.district IS NOT NULL THEN la.district
            WHEN la.province IS NOT NULL THEN la.province
            ELSE 'Unknown'
        END as location_name,
        -- Build hierarchy dynamically
        CASE 
            WHEN la.province IS NOT NULL THEN
                CASE 
                    WHEN la.district IS NOT NULL THEN
                        CASE 
                            WHEN la.sector IS NOT NULL THEN la.province || '>' || la.district || '>' || la.sector
                            ELSE la.province || '>' || la.district
                        END
                    ELSE la.province
                END
            ELSE 'Unknown'
        END as location_hierarchy,
        la.province,
        la.district,
        la.sector,
        la.total_scans,
        la.healthy_scans,
        la.disease_scans as diseased_scans,
        la.total_users as unique_users,
        CASE 
            WHEN la.total_scans > 0 THEN 
                ROUND((la.disease_scans::NUMERIC / la.total_scans::NUMERIC) * 100, 2)
            ELSE 0
        END as disease_rate,
        la.last_scan_at as last_scan_date
    FROM location_analytics la
    WHERE 
        CASE 
            WHEN hierarchy_level = 'province' THEN la.district IS NULL AND la.sector IS NULL
            WHEN hierarchy_level = 'district' THEN la.district IS NOT NULL AND la.sector IS NULL
            WHEN hierarchy_level = 'sector' THEN la.sector IS NOT NULL
            ELSE TRUE
        END
        AND la.total_scans > 0
    ORDER BY la.total_scans DESC;
END;
$$ LANGUAGE plpgsql;

-- 🏆 Get location rankings by different metrics
CREATE OR REPLACE FUNCTION get_location_rankings(ranking_type TEXT DEFAULT 'scans', limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    rank INTEGER,
    location_name TEXT,
    location_hierarchy TEXT,
    province TEXT,
    district TEXT,
    sector TEXT,
    metric_value NUMERIC,
    metric_label TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (
            ORDER BY 
                CASE 
                    WHEN ranking_type = 'scans' THEN la.total_scans::NUMERIC
                    WHEN ranking_type = 'users' THEN la.total_users::NUMERIC
                    WHEN ranking_type = 'disease_rate' THEN 
                        CASE WHEN la.total_scans > 0 THEN (la.disease_scans::NUMERIC / la.total_scans::NUMERIC) * 100 ELSE 0 END
                    ELSE la.total_scans::NUMERIC
                END DESC
        )::INTEGER as rank,
        CASE 
            WHEN la.sector IS NOT NULL THEN la.sector
            WHEN la.district IS NOT NULL THEN la.district
            WHEN la.province IS NOT NULL THEN la.province
            ELSE 'Unknown'
        END as location_name,
        -- Build hierarchy dynamically
        CASE 
            WHEN la.province IS NOT NULL THEN
                CASE 
                    WHEN la.district IS NOT NULL THEN
                        CASE 
                            WHEN la.sector IS NOT NULL THEN la.province || '>' || la.district || '>' || la.sector
                            ELSE la.province || '>' || la.district
                        END
                    ELSE la.province
                END
            ELSE 'Unknown'
        END as location_hierarchy,
        la.province,
        la.district,
        la.sector,
        CASE 
            WHEN ranking_type = 'scans' THEN la.total_scans::NUMERIC
            WHEN ranking_type = 'users' THEN la.total_users::NUMERIC
            WHEN ranking_type = 'disease_rate' THEN 
                CASE WHEN la.total_scans > 0 THEN ROUND((la.disease_scans::NUMERIC / la.total_scans::NUMERIC) * 100, 2) ELSE 0 END
            ELSE la.total_scans::NUMERIC
        END as metric_value,
        CASE 
            WHEN ranking_type = 'scans' THEN 'Total Scans'
            WHEN ranking_type = 'users' THEN 'Unique Users'
            WHEN ranking_type = 'disease_rate' THEN 'Disease Rate %'
            ELSE 'Total Scans'
        END as metric_label
    FROM location_analytics la
    WHERE la.total_scans > 0
    ORDER BY metric_value DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 🔍 Search locations by name
CREATE OR REPLACE FUNCTION search_locations(search_term TEXT)
RETURNS TABLE(
    location_name TEXT,
    location_hierarchy TEXT,
    province TEXT,
    district TEXT,
    sector TEXT,
    total_scans INTEGER,
    match_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN la.sector IS NOT NULL THEN la.sector
            WHEN la.district IS NOT NULL THEN la.district
            WHEN la.province IS NOT NULL THEN la.province
            ELSE 'Unknown'
        END as location_name,
        -- Build hierarchy dynamically
        CASE 
            WHEN la.province IS NOT NULL THEN
                CASE 
                    WHEN la.district IS NOT NULL THEN
                        CASE 
                            WHEN la.sector IS NOT NULL THEN la.province || '>' || la.district || '>' || la.sector
                            ELSE la.province || '>' || la.district
                        END
                    ELSE la.province
                END
            ELSE 'Unknown'
        END as location_hierarchy,
        la.province,
        la.district,
        la.sector,
        la.total_scans,
        CASE 
            WHEN la.province ILIKE '%' || search_term || '%' THEN 'Province'
            WHEN la.district ILIKE '%' || search_term || '%' THEN 'District'
            WHEN la.sector ILIKE '%' || search_term || '%' THEN 'Sector'
            ELSE 'Other'
        END as match_type
    FROM location_analytics la
    WHERE 
        la.province ILIKE '%' || search_term || '%'
        OR la.district ILIKE '%' || search_term || '%'
        OR la.sector ILIKE '%' || search_term || '%'
    ORDER BY la.total_scans DESC;
END;
$$ LANGUAGE plpgsql;

-- ✅ Test the main functions (these should work even with empty tables)
SELECT 'Testing get_location_leaderboard...' as test_status;
SELECT * FROM get_location_leaderboard(5);

SELECT 'Testing get_analytics_summary...' as test_status;
SELECT * FROM get_analytics_summary();

SELECT 'Testing get_recent_scans...' as test_status;
SELECT * FROM get_recent_scans(3);

-- ✅ List all helper functions created
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines
WHERE routine_name LIKE 'get_%' OR routine_name LIKE 'search_%'
  AND routine_schema = 'public'
ORDER BY routine_name;

-- 🎉 Success message
SELECT '✅ Step 5 completed: Helper functions created successfully!' as status;

-- 📋 Summary of helper functions created
SELECT 
    '📊 get_location_leaderboard() - Top locations by scan count' as function_description
UNION ALL
SELECT 
    '📈 get_analytics_summary() - Overall statistics for admin dashboard' as function_description
UNION ALL
SELECT 
    '🦠 get_disease_tracking_by_location() - Disease patterns by location' as function_description
UNION ALL
SELECT 
    '👤 get_user_scan_history() - Individual user scan history' as function_description
UNION ALL
SELECT 
    '🌍 get_recent_scans() - Recent scans across all locations' as function_description
UNION ALL
SELECT 
    '📊 get_location_analytics_by_level() - Analytics by hierarchy level' as function_description
UNION ALL
SELECT 
    '🏆 get_location_rankings() - Rankings by different metrics' as function_description
UNION ALL
SELECT 
    '🔍 search_locations() - Search locations by name' as function_description; 