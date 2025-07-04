-- 🔧 STEP 2: Create Indexes (CORRECTED VERSION)
-- This version checks for column existence before creating indexes

DO $$ 
BEGIN
    -- 📊 Index for scan_history table (check what columns actually exist)
    
    -- Create index on user_id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'scan_history' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
        RAISE NOTICE '✅ Created index on scan_history.user_id';
    END IF;
    
    -- Create index on created_at if it exists  
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'scan_history' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_scan_history_created_at ON scan_history(created_at);
        RAISE NOTICE '✅ Created index on scan_history.created_at';
    END IF;
    
    -- Create index on location columns (check different possible names)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'scan_history' AND column_name = 'location_string') THEN
        CREATE INDEX IF NOT EXISTS idx_scan_history_location ON scan_history(location_string);
        RAISE NOTICE '✅ Created index on scan_history.location_string';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'scan_history' AND column_name = 'location') THEN
        CREATE INDEX IF NOT EXISTS idx_scan_history_location ON scan_history(location);
        RAISE NOTICE '✅ Created index on scan_history.location';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'scan_history' AND column_name = 'province') THEN
        CREATE INDEX IF NOT EXISTS idx_scan_history_province ON scan_history(province);
        RAISE NOTICE '✅ Created index on scan_history.province';
    END IF;
    
    -- Create index on disease_detected if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'scan_history' AND column_name = 'disease_detected') THEN
        CREATE INDEX IF NOT EXISTS idx_scan_history_disease ON scan_history(disease_detected);
        RAISE NOTICE '✅ Created index on scan_history.disease_detected';
    END IF;
    
    -- 📊 Index for location_analytics table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'location_analytics' AND column_name = 'location_hierarchy') THEN
        CREATE INDEX IF NOT EXISTS idx_location_analytics_hierarchy ON location_analytics(location_hierarchy);
        RAISE NOTICE '✅ Created index on location_analytics.location_hierarchy';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'location_analytics' AND column_name = 'total_scans') THEN
        CREATE INDEX IF NOT EXISTS idx_location_analytics_scans ON location_analytics(total_scans DESC);
        RAISE NOTICE '✅ Created index on location_analytics.total_scans';
    END IF;
    
    -- 📊 Index for user_locations table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_locations' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
        RAISE NOTICE '✅ Created index on user_locations.user_id';
    END IF;
    
    -- 📊 Index for disease_tracking table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'disease_tracking' AND column_name = 'location_hierarchy') THEN
        CREATE INDEX IF NOT EXISTS idx_disease_tracking_location ON disease_tracking(location_hierarchy);
        RAISE NOTICE '✅ Created index on disease_tracking.location_hierarchy';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'disease_tracking' AND column_name = 'disease_name') THEN
        CREATE INDEX IF NOT EXISTS idx_disease_tracking_disease ON disease_tracking(disease_name);
        RAISE NOTICE '✅ Created index on disease_tracking.disease_name';
    END IF;
    
    RAISE NOTICE '🎉 Step 2 completed: All applicable indexes created successfully!';
    
END $$; 