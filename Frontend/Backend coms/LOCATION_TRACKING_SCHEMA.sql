-- Location Tracking and Scan History Schema
-- This file contains all the SQL commands needed to set up location tracking

-- =============================================
-- 1. SCAN HISTORY TABLE
-- =============================================
-- Stores every scan with location data
CREATE TABLE scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_type VARCHAR(50) NOT NULL,
    predicted_disease VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    treatment_urgency VARCHAR(20) NOT NULL,
    
    -- Location data (hierarchical)
    country VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    location_string TEXT NOT NULL, -- Full location as "District, Province, Country"
    
    -- Coordinates (if available)
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Image metadata
    image_path TEXT,
    image_size_bytes INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. LOCATION ANALYTICS TABLE
-- =============================================
-- Aggregated location data for leaderboard
CREATE TABLE location_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_string TEXT NOT NULL UNIQUE, -- "District, Province, Country"
    
    -- Hierarchical location data
    country VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    
    -- Analytics data
    total_scans INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    healthy_scans INTEGER DEFAULT 0,
    disease_scans INTEGER DEFAULT 0,
    
    -- Recent activity
    scans_last_7_days INTEGER DEFAULT 0,
    scans_last_30_days INTEGER DEFAULT 0,
    active_users_last_7_days INTEGER DEFAULT 0,
    active_users_last_30_days INTEGER DEFAULT 0,
    
    -- Health metrics
    healthy_percentage DECIMAL(5,2) DEFAULT 0,
    most_common_disease VARCHAR(100),
    most_common_crop VARCHAR(50),
    
    -- Growth metrics
    growth_rate_7_days DECIMAL(5,2) DEFAULT 0,
    growth_rate_30_days DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    last_scan_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. USER LOCATIONS TABLE
-- =============================================
-- User's preferred/registered locations
CREATE TABLE user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Location data
    country VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    location_string TEXT NOT NULL, -- Full location as "District, Province, Country"
    
    -- Coordinates (if available)
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Metadata
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one primary location per user
    UNIQUE(user_id, is_primary) WHERE is_primary = TRUE
);

-- =============================================
-- 4. DISEASE TRACKING TABLE
-- =============================================
-- Track disease patterns by location
CREATE TABLE disease_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_string TEXT NOT NULL,
    crop_type VARCHAR(50) NOT NULL,
    disease_name VARCHAR(100) NOT NULL,
    
    -- Metrics
    total_cases INTEGER DEFAULT 0,
    cases_last_7_days INTEGER DEFAULT 0,
    cases_last_30_days INTEGER DEFAULT 0,
    severity_distribution JSONB, -- {"Low": 10, "Medium": 5, "High": 2}
    
    -- Timestamps
    first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique tracking per location-crop-disease combination
    UNIQUE(location_string, crop_type, disease_name)
);

-- =============================================
-- 5. INDEXES FOR PERFORMANCE
-- =============================================

-- Scan history indexes
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_location ON scan_history(location_string);
CREATE INDEX idx_scan_history_created_at ON scan_history(created_at);
CREATE INDEX idx_scan_history_crop_type ON scan_history(crop_type);
CREATE INDEX idx_scan_history_disease ON scan_history(predicted_disease);

-- Location analytics indexes
CREATE INDEX idx_location_analytics_location ON location_analytics(location_string);
CREATE INDEX idx_location_analytics_total_scans ON location_analytics(total_scans);
CREATE INDEX idx_location_analytics_country ON location_analytics(country);
CREATE INDEX idx_location_analytics_province ON location_analytics(province);
CREATE INDEX idx_location_analytics_district ON location_analytics(district);

-- User locations indexes
CREATE INDEX idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX idx_user_locations_location ON user_locations(location_string);
CREATE INDEX idx_user_locations_primary ON user_locations(is_primary) WHERE is_primary = TRUE;

-- Disease tracking indexes
CREATE INDEX idx_disease_tracking_location ON disease_tracking(location_string);
CREATE INDEX idx_disease_tracking_crop ON disease_tracking(crop_type);
CREATE INDEX idx_disease_tracking_disease ON disease_tracking(disease_name);

-- =============================================
-- 6. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update location analytics when scan is added
CREATE OR REPLACE FUNCTION update_location_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update location analytics
    INSERT INTO location_analytics (
        location_string, 
        country, 
        province, 
        district, 
        sector,
        total_scans,
        healthy_scans,
        disease_scans,
        last_scan_at,
        most_common_crop
    )
    VALUES (
        NEW.location_string,
        NEW.country,
        NEW.province,
        NEW.district,
        NEW.sector,
        1,
        CASE WHEN NEW.predicted_disease ILIKE '%healthy%' THEN 1 ELSE 0 END,
        CASE WHEN NEW.predicted_disease NOT ILIKE '%healthy%' THEN 1 ELSE 0 END,
        NEW.created_at,
        NEW.crop_type
    )
    ON CONFLICT (location_string) DO UPDATE SET
        total_scans = location_analytics.total_scans + 1,
        healthy_scans = location_analytics.healthy_scans + 
            CASE WHEN NEW.predicted_disease ILIKE '%healthy%' THEN 1 ELSE 0 END,
        disease_scans = location_analytics.disease_scans + 
            CASE WHEN NEW.predicted_disease NOT ILIKE '%healthy%' THEN 1 ELSE 0 END,
        last_scan_at = NEW.created_at,
        last_updated = NOW(),
        healthy_percentage = ROUND(
            (location_analytics.healthy_scans + 
             CASE WHEN NEW.predicted_disease ILIKE '%healthy%' THEN 1 ELSE 0 END) * 100.0 / 
            (location_analytics.total_scans + 1), 2
        );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for scan history
CREATE TRIGGER trigger_update_location_analytics
    AFTER INSERT ON scan_history
    FOR EACH ROW
    EXECUTE FUNCTION update_location_analytics();

-- Function to update disease tracking
CREATE OR REPLACE FUNCTION update_disease_tracking()
RETURNS TRIGGER AS $$
BEGIN
    -- Update disease tracking
    INSERT INTO disease_tracking (
        location_string,
        crop_type,
        disease_name,
        total_cases,
        cases_last_7_days,
        cases_last_30_days,
        first_detected,
        last_detected
    )
    VALUES (
        NEW.location_string,
        NEW.crop_type,
        NEW.predicted_disease,
        1,
        1,
        1,
        NEW.created_at,
        NEW.created_at
    )
    ON CONFLICT (location_string, crop_type, disease_name) DO UPDATE SET
        total_cases = disease_tracking.total_cases + 1,
        last_detected = NEW.created_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for disease tracking
CREATE TRIGGER trigger_update_disease_tracking
    AFTER INSERT ON scan_history
    FOR EACH ROW
    EXECUTE FUNCTION update_disease_tracking();

-- =============================================
-- 7. RLS (ROW LEVEL SECURITY) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only see their own scan history
CREATE POLICY "Users can view own scan history" ON scan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan history" ON scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only manage their own locations
CREATE POLICY "Users can manage own locations" ON user_locations
    FOR ALL USING (auth.uid() = user_id);

-- Location analytics is readable by all authenticated users
CREATE POLICY "Authenticated users can view location analytics" ON location_analytics
    FOR SELECT TO authenticated USING (true);

-- Disease tracking is readable by all authenticated users
CREATE POLICY "Authenticated users can view disease tracking" ON disease_tracking
    FOR SELECT TO authenticated USING (true);

-- Admins can view all data
CREATE POLICY "Admins can view all scan history" ON scan_history
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- =============================================
-- 8. HELPER FUNCTIONS
-- =============================================

-- Function to get location leaderboard data
CREATE OR REPLACE FUNCTION get_location_leaderboard(
    sort_by TEXT DEFAULT 'total_scans',
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    location_string TEXT,
    country VARCHAR(100),
    province VARCHAR(100),
    district VARCHAR(100),
    total_scans INTEGER,
    total_users INTEGER,
    healthy_percentage DECIMAL(5,2),
    growth_rate_7_days DECIMAL(5,2),
    last_scan_at TIMESTAMP WITH TIME ZONE,
    most_common_disease VARCHAR(100),
    most_common_crop VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        la.location_string,
        la.country,
        la.province,
        la.district,
        la.total_scans,
        la.total_users,
        la.healthy_percentage,
        la.growth_rate_7_days,
        la.last_scan_at,
        la.most_common_disease,
        la.most_common_crop
    FROM location_analytics la
    ORDER BY 
        CASE 
            WHEN sort_by = 'total_scans' THEN la.total_scans
            WHEN sort_by = 'total_users' THEN la.total_users
            WHEN sort_by = 'growth_rate' THEN la.growth_rate_7_days::INTEGER
            ELSE la.total_scans
        END DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh location analytics (run daily)
CREATE OR REPLACE FUNCTION refresh_location_analytics()
RETURNS VOID AS $$
BEGIN
    -- Update user counts
    UPDATE location_analytics 
    SET 
        total_users = (
            SELECT COUNT(DISTINCT user_id) 
            FROM scan_history 
            WHERE scan_history.location_string = location_analytics.location_string
        ),
        active_users_last_7_days = (
            SELECT COUNT(DISTINCT user_id) 
            FROM scan_history 
            WHERE scan_history.location_string = location_analytics.location_string
            AND scan_history.created_at >= NOW() - INTERVAL '7 days'
        ),
        active_users_last_30_days = (
            SELECT COUNT(DISTINCT user_id) 
            FROM scan_history 
            WHERE scan_history.location_string = location_analytics.location_string
            AND scan_history.created_at >= NOW() - INTERVAL '30 days'
        ),
        scans_last_7_days = (
            SELECT COUNT(*) 
            FROM scan_history 
            WHERE scan_history.location_string = location_analytics.location_string
            AND scan_history.created_at >= NOW() - INTERVAL '7 days'
        ),
        scans_last_30_days = (
            SELECT COUNT(*) 
            FROM scan_history 
            WHERE scan_history.location_string = location_analytics.location_string
            AND scan_history.created_at >= NOW() - INTERVAL '30 days'
        ),
        last_updated = NOW();
        
    -- Calculate growth rates
    UPDATE location_analytics
    SET 
        growth_rate_7_days = CASE 
            WHEN (total_scans - scans_last_7_days) > 0 THEN
                ROUND((scans_last_7_days::DECIMAL / (total_scans - scans_last_7_days)) * 100, 2)
            ELSE 0
        END,
        growth_rate_30_days = CASE 
            WHEN (total_scans - scans_last_30_days) > 0 THEN
                ROUND((scans_last_30_days::DECIMAL / (total_scans - scans_last_30_days)) * 100, 2)
            ELSE 0
        END;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. SAMPLE DATA (OPTIONAL - for testing)
-- =============================================

-- Insert sample locations for testing (uncomment if needed)
/*
INSERT INTO location_analytics (
    location_string, country, province, district, 
    total_scans, total_users, healthy_scans, disease_scans, healthy_percentage
) VALUES 
    ('Nyagatare, Eastern Province, Rwanda', 'Rwanda', 'Eastern Province', 'Nyagatare', 45, 12, 30, 15, 66.67),
    ('Musanze, Northern Province, Rwanda', 'Rwanda', 'Northern Province', 'Musanze', 38, 10, 28, 10, 73.68),
    ('Huye, Southern Province, Rwanda', 'Rwanda', 'Southern Province', 'Huye', 32, 8, 20, 12, 62.50),
    ('Rubavu, Western Province, Rwanda', 'Rwanda', 'Western Province', 'Rubavu', 28, 7, 22, 6, 78.57),
    ('Gasabo, Kigali City, Rwanda', 'Rwanda', 'Kigali City', 'Gasabo', 25, 6, 15, 10, 60.00);
*/

-- =============================================
-- 10. VERIFICATION QUERIES
-- =============================================

-- Check if tables were created successfully
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('scan_history', 'location_analytics', 'user_locations', 'disease_tracking');

-- Check if indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('scan_history', 'location_analytics', 'user_locations', 'disease_tracking');

-- Check if functions were created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('update_location_analytics', 'update_disease_tracking', 'get_location_leaderboard', 'refresh_location_analytics'); 