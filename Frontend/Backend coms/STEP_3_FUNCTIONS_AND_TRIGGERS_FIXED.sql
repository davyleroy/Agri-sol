-- 🔧 STEP 3: Functions and Triggers for Automatic Analytics Updates (FIXED VERSION)
-- This creates the core logic that automatically updates analytics when new scans are added

-- 📊 Function to update location analytics when a new scan is recorded
CREATE OR REPLACE FUNCTION update_location_analytics()
RETURNS TRIGGER AS $$
DECLARE
    location_key TEXT;
    existing_record RECORD;
BEGIN
    -- Build location hierarchy key from available columns
    -- Check what location columns actually exist and build accordingly
    IF NEW.province IS NOT NULL THEN
        IF NEW.district IS NOT NULL THEN
            IF NEW.sector IS NOT NULL THEN
                location_key := NEW.province || '>' || NEW.district || '>' || NEW.sector;
            ELSE
                location_key := NEW.province || '>' || NEW.district;
            END IF;
        ELSE
            location_key := NEW.province;
        END IF;
    ELSE
        -- Fallback if no location data
        location_key := 'Unknown';
    END IF;
    
    -- Check if record exists in location_analytics
    SELECT * INTO existing_record 
    FROM location_analytics 
    WHERE location_hierarchy = location_key;
    
    IF existing_record IS NULL THEN
        -- Create new analytics record
        INSERT INTO location_analytics (
            location_hierarchy,
            province,
            district,
            sector,
            total_scans,
            healthy_scans,
            diseased_scans,
            unique_users,
            last_scan_date,
            created_at,
            updated_at
        ) VALUES (
            location_key,
            NEW.province,
            NEW.district,
            NEW.sector,
            1,
            CASE WHEN NEW.disease_detected = 'Healthy' OR NEW.disease_detected IS NULL THEN 1 ELSE 0 END,
            CASE WHEN NEW.disease_detected != 'Healthy' AND NEW.disease_detected IS NOT NULL THEN 1 ELSE 0 END,
            1, -- We'll update this with a separate query
            NEW.created_at,
            NOW(),
            NOW()
        );
        
        -- Update unique users count
        UPDATE location_analytics 
        SET unique_users = (
            SELECT COUNT(DISTINCT user_id) 
            FROM scan_history 
            WHERE (province = NEW.province OR (province IS NULL AND NEW.province IS NULL))
              AND (district = NEW.district OR (district IS NULL AND NEW.district IS NULL))
              AND (sector = NEW.sector OR (sector IS NULL AND NEW.sector IS NULL))
        )
        WHERE location_hierarchy = location_key;
        
    ELSE
        -- Update existing analytics record
        UPDATE location_analytics 
        SET 
            total_scans = total_scans + 1,
            healthy_scans = healthy_scans + CASE WHEN NEW.disease_detected = 'Healthy' OR NEW.disease_detected IS NULL THEN 1 ELSE 0 END,
            diseased_scans = diseased_scans + CASE WHEN NEW.disease_detected != 'Healthy' AND NEW.disease_detected IS NOT NULL THEN 1 ELSE 0 END,
            unique_users = (
                SELECT COUNT(DISTINCT user_id) 
                FROM scan_history 
                WHERE (province = NEW.province OR (province IS NULL AND NEW.province IS NULL))
                  AND (district = NEW.district OR (district IS NULL AND NEW.district IS NULL))
                  AND (sector = NEW.sector OR (sector IS NULL AND NEW.sector IS NULL))
            ),
            last_scan_date = GREATEST(last_scan_date, NEW.created_at),
            updated_at = NOW()
        WHERE location_hierarchy = location_key;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 📊 Function to update disease tracking when a new scan is recorded
CREATE OR REPLACE FUNCTION update_disease_tracking()
RETURNS TRIGGER AS $$
DECLARE
    location_key TEXT;
    existing_disease_record RECORD;
BEGIN
    -- Only track if there's actually a disease detected
    IF NEW.disease_detected IS NULL OR NEW.disease_detected = 'Healthy' THEN
        RETURN NEW;
    END IF;
    
    -- Build location hierarchy key
    IF NEW.province IS NOT NULL THEN
        IF NEW.district IS NOT NULL THEN
            IF NEW.sector IS NOT NULL THEN
                location_key := NEW.province || '>' || NEW.district || '>' || NEW.sector;
            ELSE
                location_key := NEW.province || '>' || NEW.district;
            END IF;
        ELSE
            location_key := NEW.province;
        END IF;
    ELSE
        location_key := 'Unknown';
    END IF;
    
    -- Check if this disease already exists for this location
    SELECT * INTO existing_disease_record 
    FROM disease_tracking 
    WHERE location_hierarchy = location_key 
      AND disease_name = NEW.disease_detected;
    
    IF existing_disease_record IS NULL THEN
        -- Create new disease tracking record
        INSERT INTO disease_tracking (
            location_hierarchy,
            province,
            district,
            sector,
            disease_name,
            occurrence_count,
            severity_average,
            first_detected,
            last_detected,
            created_at,
            updated_at
        ) VALUES (
            location_key,
            NEW.province,
            NEW.district,
            NEW.sector,
            NEW.disease_detected,
            1,
            COALESCE(NEW.confidence_score, 0.5), -- Default confidence if not provided
            NEW.created_at,
            NEW.created_at,
            NOW(),
            NOW()
        );
    ELSE
        -- Update existing disease tracking record
        UPDATE disease_tracking 
        SET 
            occurrence_count = occurrence_count + 1,
            severity_average = (severity_average * occurrence_count + COALESCE(NEW.confidence_score, 0.5)) / (occurrence_count + 1),
            last_detected = GREATEST(last_detected, NEW.created_at),
            updated_at = NOW()
        WHERE location_hierarchy = location_key 
          AND disease_name = NEW.disease_detected;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 🔗 Create triggers to automatically call these functions
DROP TRIGGER IF EXISTS trigger_update_location_analytics ON scan_history;
CREATE TRIGGER trigger_update_location_analytics
    AFTER INSERT ON scan_history
    FOR EACH ROW
    EXECUTE FUNCTION update_location_analytics();

DROP TRIGGER IF EXISTS trigger_update_disease_tracking ON scan_history;
CREATE TRIGGER trigger_update_disease_tracking
    AFTER INSERT ON scan_history
    FOR EACH ROW
    EXECUTE FUNCTION update_disease_tracking();

-- 🧹 Function to recalculate all analytics (useful for data cleanup)
CREATE OR REPLACE FUNCTION recalculate_location_analytics()
RETURNS void AS $$
BEGIN
    -- Clear existing analytics
    DELETE FROM location_analytics;
    DELETE FROM disease_tracking;
    
    -- Rebuild analytics from scan_history
    INSERT INTO location_analytics (
        location_hierarchy,
        province,
        district,
        sector,
        total_scans,
        healthy_scans,
        diseased_scans,
        unique_users,
        last_scan_date,
        created_at,
        updated_at
    )
    SELECT 
        CASE 
            WHEN sh.province IS NOT NULL THEN
                CASE 
                    WHEN sh.district IS NOT NULL THEN
                        CASE 
                            WHEN sh.sector IS NOT NULL THEN sh.province || '>' || sh.district || '>' || sh.sector
                            ELSE sh.province || '>' || sh.district
                        END
                    ELSE sh.province
                END
            ELSE 'Unknown'
        END as location_hierarchy,
        sh.province,
        sh.district,
        sh.sector,
        COUNT(*) as total_scans,
        COUNT(*) FILTER (WHERE sh.disease_detected = 'Healthy' OR sh.disease_detected IS NULL) as healthy_scans,
        COUNT(*) FILTER (WHERE sh.disease_detected != 'Healthy' AND sh.disease_detected IS NOT NULL) as diseased_scans,
        COUNT(DISTINCT sh.user_id) as unique_users,
        MAX(sh.created_at) as last_scan_date,
        NOW() as created_at,
        NOW() as updated_at
    FROM scan_history sh
    GROUP BY sh.province, sh.district, sh.sector;
    
    -- Rebuild disease tracking
    INSERT INTO disease_tracking (
        location_hierarchy,
        province,
        district,
        sector,
        disease_name,
        occurrence_count,
        severity_average,
        first_detected,
        last_detected,
        created_at,
        updated_at
    )
    SELECT 
        CASE 
            WHEN sh.province IS NOT NULL THEN
                CASE 
                    WHEN sh.district IS NOT NULL THEN
                        CASE 
                            WHEN sh.sector IS NOT NULL THEN sh.province || '>' || sh.district || '>' || sh.sector
                            ELSE sh.province || '>' || sh.district
                        END
                    ELSE sh.province
                END
            ELSE 'Unknown'
        END as location_hierarchy,
        sh.province,
        sh.district,
        sh.sector,
        sh.disease_detected,
        COUNT(*) as occurrence_count,
        AVG(COALESCE(sh.confidence_score, 0.5)) as severity_average,
        MIN(sh.created_at) as first_detected,
        MAX(sh.created_at) as last_detected,
        NOW() as created_at,
        NOW() as updated_at
    FROM scan_history sh
    WHERE sh.disease_detected IS NOT NULL 
      AND sh.disease_detected != 'Healthy'
    GROUP BY sh.province, sh.district, sh.sector, sh.disease_detected;
    
END;
$$ LANGUAGE plpgsql;

-- ✅ Test that the functions were created successfully (FIXED VERSION)
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines
WHERE routine_name IN ('update_location_analytics', 'update_disease_tracking', 'recalculate_location_analytics')
  AND routine_schema = 'public'
ORDER BY routine_name;

-- ✅ Test that the triggers were created successfully
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE trigger_name IN ('trigger_update_location_analytics', 'trigger_update_disease_tracking')
ORDER BY trigger_name;

-- 🎉 Success message
SELECT '✅ Step 3 completed: Functions and triggers created successfully!' as status; 