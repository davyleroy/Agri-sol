# 🎯 Admin Dashboard & Map Integration Setup

## 🚨 **Current Issue**

Your admin dashboard is showing empty data because the Supabase RPC functions don't exist yet. Let's fix this!

## 🔧 **Step 1: Create Database Functions**

Go to your **Supabase Dashboard** → **SQL Editor** and run these functions:

### **1. Analytics Summary Function**

```sql
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS TABLE (
    total_scans BIGINT,
    total_healthy_scans BIGINT,
    total_diseased_scans BIGINT,
    unique_users BIGINT,
    active_locations BIGINT,
    top_disease TEXT,
    disease_count BIGINT,
    most_active_location TEXT,
    location_scan_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(COUNT(sh.id), 0) as total_scans,
        COALESCE(COUNT(CASE WHEN sh.health_status = 'healthy' THEN 1 END), 0) as total_healthy_scans,
        COALESCE(COUNT(CASE WHEN sh.health_status = 'diseased' THEN 1 END), 0) as total_diseased_scans,
        COALESCE(COUNT(DISTINCT sh.user_id), 0) as unique_users,
        COALESCE(COUNT(DISTINCT sh.location_data->>'district'), 0) as active_locations,
        COALESCE(
            (SELECT disease_name
             FROM scan_history
             WHERE disease_name IS NOT NULL
             GROUP BY disease_name
             ORDER BY COUNT(*) DESC
             LIMIT 1), 'None'
        ) as top_disease,
        COALESCE(
            (SELECT COUNT(*)
             FROM scan_history
             WHERE disease_name = (
                 SELECT disease_name
                 FROM scan_history
                 WHERE disease_name IS NOT NULL
                 GROUP BY disease_name
                 ORDER BY COUNT(*) DESC
                 LIMIT 1
             )), 0
        ) as disease_count,
        COALESCE(
            (SELECT location_data->>'district'
             FROM scan_history
             GROUP BY location_data->>'district'
             ORDER BY COUNT(*) DESC
             LIMIT 1), 'No data'
        ) as most_active_location,
        COALESCE(
            (SELECT COUNT(*)
             FROM scan_history
             WHERE location_data->>'district' = (
                 SELECT location_data->>'district'
                 FROM scan_history
                 GROUP BY location_data->>'district'
                 ORDER BY COUNT(*) DESC
                 LIMIT 1
             )), 0
        ) as location_scan_count
    FROM scan_history sh;
END;
$$ LANGUAGE plpgsql;
```

### **2. Recent Scans Function**

```sql
CREATE OR REPLACE FUNCTION get_recent_scans(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    scan_id UUID,
    crop_type TEXT,
    disease_detected TEXT,
    confidence_score DECIMAL,
    location_name TEXT,
    days_ago INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sh.id as scan_id,
        sh.crop_type,
        COALESCE(sh.disease_name, 'Healthy') as disease_detected,
        COALESCE(sh.confidence_score, 0.0) as confidence_score,
        COALESCE(sh.location_data->>'district', 'Unknown') as location_name,
        EXTRACT(DAY FROM (NOW() - sh.created_at))::INTEGER as days_ago
    FROM scan_history sh
    ORDER BY sh.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### **3. Location Leaderboard Function**

```sql
CREATE OR REPLACE FUNCTION get_location_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    location_name TEXT,
    total_scans BIGINT,
    healthy_scans BIGINT,
    diseased_scans BIGINT,
    health_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(sh.location_data->>'district', 'Unknown') as location_name,
        COUNT(sh.id) as total_scans,
        COUNT(CASE WHEN sh.health_status = 'healthy' THEN 1 END) as healthy_scans,
        COUNT(CASE WHEN sh.health_status = 'diseased' THEN 1 END) as diseased_scans,
        CASE
            WHEN COUNT(sh.id) > 0 THEN
                ROUND((COUNT(CASE WHEN sh.health_status = 'healthy' THEN 1 END)::DECIMAL / COUNT(sh.id)::DECIMAL) * 100, 1)
            ELSE 0.0
        END as health_rate
    FROM scan_history sh
    GROUP BY sh.location_data->>'district'
    ORDER BY total_scans DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### **4. Disease Tracking Function**

```sql
CREATE OR REPLACE FUNCTION get_disease_tracking_by_location(location_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    disease_name TEXT,
    location_name TEXT,
    case_count BIGINT,
    last_detected TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sh.disease_name,
        COALESCE(sh.location_data->>'district', 'Unknown') as location_name,
        COUNT(sh.id) as case_count,
        MAX(sh.created_at) as last_detected
    FROM scan_history sh
    WHERE sh.disease_name IS NOT NULL
    AND (location_filter IS NULL OR sh.location_data->>'district' = location_filter)
    GROUP BY sh.disease_name, sh.location_data->>'district'
    ORDER BY case_count DESC;
END;
$$ LANGUAGE plpgsql;
```

### **5. User Scan History Function**

```sql
CREATE OR REPLACE FUNCTION get_user_scan_history(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    scan_id UUID,
    crop_type TEXT,
    health_status TEXT,
    disease_name TEXT,
    confidence_score DECIMAL,
    location_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sh.id as scan_id,
        sh.crop_type,
        sh.health_status,
        COALESCE(sh.disease_name, 'None') as disease_name,
        COALESCE(sh.confidence_score, 0.0) as confidence_score,
        COALESCE(sh.location_data->>'district', 'Unknown') as location_name,
        sh.created_at
    FROM scan_history sh
    WHERE sh.user_id = user_uuid
    ORDER BY sh.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### **6. Scan Count by Location Function**

```sql
CREATE OR REPLACE FUNCTION get_scan_count_by_location()
RETURNS TABLE (
    location_name TEXT,
    total_scans BIGINT,
    healthy_count BIGINT,
    diseased_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(sh.location_data->>'district', 'Unknown') as location_name,
        COUNT(sh.id) as total_scans,
        COUNT(CASE WHEN sh.health_status = 'healthy' THEN 1 END) as healthy_count,
        COUNT(CASE WHEN sh.health_status = 'diseased' THEN 1 END) as diseased_count
    FROM scan_history sh
    GROUP BY sh.location_data->>'district'
    ORDER BY total_scans DESC;
END;
$$ LANGUAGE plpgsql;
```

### **7. Location Search Function**

```sql
CREATE OR REPLACE FUNCTION search_locations(search_term TEXT)
RETURNS TABLE (
    location_name TEXT,
    total_scans BIGINT,
    health_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(sh.location_data->>'district', 'Unknown') as location_name,
        COUNT(sh.id) as total_scans,
        CASE
            WHEN COUNT(sh.id) > 0 THEN
                ROUND((COUNT(CASE WHEN sh.health_status = 'healthy' THEN 1 END)::DECIMAL / COUNT(sh.id)::DECIMAL) * 100, 1)
            ELSE 0.0
        END as health_rate
    FROM scan_history sh
    WHERE sh.location_data->>'district' ILIKE '%' || search_term || '%'
    GROUP BY sh.location_data->>'district'
    ORDER BY total_scans DESC;
END;
$$ LANGUAGE plpgsql;
```

## 🗺️ **Step 2: Add Sample Data for Testing**

Run this to add some test data:

```sql
-- Insert sample scan data
INSERT INTO scan_history (user_id, crop_type, health_status, disease_name, confidence_score, location_data, created_at) VALUES
-- Healthy scans
(gen_random_uuid(), 'Tomatoes', 'healthy', NULL, 0.95, '{"district": "Kigali", "province": "Kigali City"}', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'Beans', 'healthy', NULL, 0.92, '{"district": "Huye", "province": "Southern Province"}', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'Maize', 'healthy', NULL, 0.88, '{"district": "Musanze", "province": "Northern Province"}', NOW() - INTERVAL '3 days'),

-- Diseased scans
(gen_random_uuid(), 'Tomatoes', 'diseased', 'Early Blight', 0.87, '{"district": "Kigali", "province": "Kigali City"}', NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), 'Beans', 'diseased', 'Anthracnose', 0.91, '{"district": "Huye", "province": "Southern Province"}', NOW() - INTERVAL '4 hours'),
(gen_random_uuid(), 'Potatoes', 'diseased', 'Late Blight', 0.89, '{"district": "Musanze", "province": "Northern Province"}', NOW() - INTERVAL '6 hours'),
(gen_random_uuid(), 'Tomatoes', 'diseased', 'Early Blight', 0.85, '{"district": "Kigali", "province": "Kigali City"}', NOW() - INTERVAL '12 hours'),
(gen_random_uuid(), 'Beans', 'diseased', 'Anthracnose', 0.93, '{"district": "Huye", "province": "Southern Province"}', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'Maize', 'diseased', 'Northern Corn Leaf Blight', 0.86, '{"district": "Musanze", "province": "Northern Province"}', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'Potatoes', 'diseased', 'Late Blight', 0.90, '{"district": "Rubavu", "province": "Western Province"}', NOW() - INTERVAL '3 days');
```

## 🗺️ **Step 3: Map Integration Setup**

### **Install Map Dependencies**

```bash
cd Frontend
npm install react-native-maps expo-location
```

### **Update app.json for Maps**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
        }
      ]
    ]
  }
}
```

## 🧪 **Step 4: Test the Dashboard**

1. **Restart your app**: `npx expo start --clear`
2. **Go to admin dashboard**: You should now see real data!
3. **Check the metrics**: Should show actual numbers instead of zeros

## 🎯 **Expected Results**

After running these functions, your dashboard should show:

- ✅ **Total Scans**: 10 (or more)
- ✅ **Active Locations**: 4 (Kigali, Huye, Musanze, Rubavu)
- ✅ **Healthy Rate**: ~30% (3 healthy out of 10 total)
- ✅ **Disease Rate**: ~70% (7 diseased out of 10 total)
- ✅ **Unique Users**: 10 (one per scan)
- ✅ **Top Disease**: "Early Blight" or "Anthracnose"
- ✅ **Most Active Location**: "Kigali" with 3 scans

## 🗺️ **Map Features to Add**

1. **Interactive Rwanda Map** with location pins
2. **Heat map visualization** showing scan density
3. **Disease outbreak tracking** with color-coded zones
4. **Location-based analytics** with click-to-view details

Let me know when you've run these SQL functions and I'll help you set up the map integration! 🚀
