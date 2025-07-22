# 🗄️ **Database Setup Guide - Fix Map Error**

## 🚨 **Current Error**

The map is showing this error:

```
Error fetching map data: Error: Location data error: Could not find the function public.get_scan_count_by_location without parameters in the schema cache.
```

## ✅ **Solution: Set Up Database Functions**

### **Step 1: Access Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**

### **Step 2: Run the Database Setup Script**

Copy and paste this entire script into the SQL Editor:

```sql
-- Supabase Functions for Map Data
-- Run these in your Supabase SQL Editor

-- Function to get scan count by location
CREATE OR REPLACE FUNCTION public.get_scan_count_by_location()
RETURNS TABLE (
  location_name TEXT,
  scan_count BIGINT,
  healthy_count BIGINT,
  disease_count BIGINT,
  latitude DECIMAL,
  longitude DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(sh.location, 'Unknown') as location_name,
    COUNT(*) as scan_count,
    COUNT(CASE WHEN sh.status = 'healthy' THEN 1 END) as healthy_count,
    COUNT(CASE WHEN sh.status = 'disease' THEN 1 END) as disease_count,
    AVG(sh.latitude) as latitude,
    AVG(sh.longitude) as longitude
  FROM scan_history sh
  WHERE sh.location IS NOT NULL
  GROUP BY sh.location
  ORDER BY scan_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get disease distribution
CREATE OR REPLACE FUNCTION public.get_disease_distribution()
RETURNS TABLE (
  disease_name TEXT,
  disease_count BIGINT,
  crop_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sh.disease as disease_name,
    COUNT(*) as disease_count,
    sh.crop as crop_type
  FROM scan_history sh
  WHERE sh.status = 'disease'
  GROUP BY sh.disease, sh.crop
  ORDER BY disease_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent scans with location
CREATE OR REPLACE FUNCTION public.get_recent_scans_with_location(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  crop TEXT,
  disease TEXT,
  confidence INTEGER,
  status TEXT,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  scan_date DATE,
  scan_time TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sh.id,
    p.email as user_email,
    sh.crop,
    sh.disease,
    sh.confidence,
    sh.status,
    sh.location,
    sh.latitude,
    sh.longitude,
    sh.date as scan_date,
    sh.time as scan_time
  FROM scan_history sh
  LEFT JOIN profiles p ON sh.user_id = p.id
  ORDER BY sh.date DESC, sh.time DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analytics summary
CREATE OR REPLACE FUNCTION public.get_analytics_summary()
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
  WITH disease_stats AS (
    SELECT
      disease,
      COUNT(*) as count
    FROM scan_history
    WHERE status = 'disease'
    GROUP BY disease
    ORDER BY count DESC
    LIMIT 1
  ),
  location_stats AS (
    SELECT
      location,
      COUNT(*) as count
    FROM scan_history
    WHERE location IS NOT NULL
    GROUP BY location
    ORDER BY count DESC
    LIMIT 1
  )
  SELECT
    (SELECT COUNT(*) FROM scan_history) as total_scans,
    (SELECT COUNT(*) FROM scan_history WHERE status = 'healthy') as total_healthy_scans,
    (SELECT COUNT(*) FROM scan_history WHERE status = 'disease') as total_diseased_scans,
    (SELECT COUNT(DISTINCT user_id) FROM scan_history) as unique_users,
    (SELECT COUNT(DISTINCT location) FROM scan_history WHERE location IS NOT NULL) as active_locations,
    (SELECT disease FROM disease_stats) as top_disease,
    (SELECT count FROM disease_stats) as disease_count,
    (SELECT location FROM location_stats) as most_active_location,
    (SELECT count FROM location_stats) as location_scan_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Step 3: Create Required Tables**

Run this script to create the necessary tables:

```sql
-- Create scan_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  image_url TEXT,
  disease TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  status TEXT CHECK (status IN ('healthy', 'disease')),
  crop TEXT NOT NULL,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Step 4: Insert Sample Data**

Run this script to add sample data for testing:

```sql
-- Insert sample data for testing
INSERT INTO scan_history (user_id, date, time, disease, confidence, status, crop, location, latitude, longitude) VALUES
-- Sample data for Kigali
('00000000-0000-0000-0000-000000000001', '2024-01-15', '10:30:00', 'Early Blight', 85, 'disease', 'Tomato', 'Kigali', -1.9441, 30.0619),
('00000000-0000-0000-0000-000000000002', '2024-01-15', '11:15:00', 'Healthy Plant', 92, 'healthy', 'Potato', 'Kigali', -1.9441, 30.0619),
('00000000-0000-0000-0000-000000000003', '2024-01-15', '12:00:00', 'Late Blight', 78, 'disease', 'Tomato', 'Kigali', -1.9441, 30.0619),
('00000000-0000-0000-0000-000000000004', '2024-01-15', '13:45:00', 'Healthy Plant', 95, 'healthy', 'Bean', 'Kigali', -1.9441, 30.0619),
('00000000-0000-0000-0000-000000000005', '2024-01-15', '14:20:00', 'Early Blight', 82, 'disease', 'Tomato', 'Kigali', -1.9441, 30.0619),

-- Sample data for Huye
('00000000-0000-0000-0000-000000000006', '2024-01-15', '09:30:00', 'Leaf Spot', 88, 'disease', 'Maize', 'Huye', -2.5833, 29.7500),
('00000000-0000-0000-0000-000000000007', '2024-01-15', '10:45:00', 'Healthy Plant', 94, 'healthy', 'Bean', 'Huye', -2.5833, 29.7500),
('00000000-0000-0000-0000-000000000008', '2024-01-15', '11:30:00', 'Powdery Mildew', 76, 'disease', 'Tomato', 'Huye', -2.5833, 29.7500),

-- Sample data for Musanze
('00000000-0000-0000-0000-000000000009', '2024-01-15', '08:15:00', 'Healthy Plant', 96, 'healthy', 'Potato', 'Musanze', -1.5000, 29.6333),
('00000000-0000-0000-0000-000000000010', '2024-01-15', '09:00:00', 'Bacterial Spot', 81, 'disease', 'Tomato', 'Musanze', -1.5000, 29.6333),
('00000000-0000-0000-0000-000000000011', '2024-01-15', '10:30:00', 'Healthy Plant', 93, 'healthy', 'Maize', 'Musanze', -1.5000, 29.6333),

-- Sample data for Rubavu
('00000000-0000-0000-0000-000000000012', '2024-01-15', '07:45:00', 'Early Blight', 79, 'disease', 'Tomato', 'Rubavu', -1.7000, 29.2333),
('00000000-0000-0000-0000-000000000013', '2024-01-15', '08:30:00', 'Healthy Plant', 97, 'healthy', 'Bean', 'Rubavu', -1.7000, 29.2333),

-- Sample data for Karongi
('00000000-0000-0000-0000-000000000014', '2024-01-15', '06:15:00', 'Late Blight', 83, 'disease', 'Potato', 'Karongi', -2.1667, 29.4000),
('00000000-0000-0000-0000-000000000015', '2024-01-15', '07:00:00', 'Healthy Plant', 91, 'healthy', 'Maize', 'Karongi', -2.1667, 29.4000);

-- Insert sample admin user
INSERT INTO profiles (id, email, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@agrisol.com', 'admin'),
('00000000-0000-0000-0000-000000000002', 'user1@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000003', 'user2@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000004', 'user3@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000005', 'user4@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000006', 'user5@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000007', 'user6@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000008', 'user7@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000009', 'user8@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000010', 'user9@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000011', 'user10@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000012', 'user11@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000013', 'user12@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000014', 'user13@agrisol.com', 'user'),
('00000000-0000-0000-0000-000000000015', 'user14@agrisol.com', 'user')
ON CONFLICT (id) DO NOTHING;
```

### **Step 5: Verify Functions**

Run this query to verify the functions were created:

```sql
-- Check if functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_scan_count_by_location',
  'get_disease_distribution',
  'get_recent_scans_with_location',
  'get_analytics_summary'
);
```

### **Step 6: Test the Functions**

Run these test queries:

```sql
-- Test location data
SELECT * FROM get_scan_count_by_location();

-- Test disease distribution
SELECT * FROM get_disease_distribution();

-- Test analytics summary
SELECT * FROM get_analytics_summary();
```

## 🔧 **Troubleshooting**

### **If you get permission errors:**

1. Go to **Authentication > Policies** in Supabase
2. Make sure RLS (Row Level Security) is properly configured
3. Add policies for the `scan_history` and `profiles` tables

### **If functions don't work:**

1. Check the **Logs** section in Supabase for errors
2. Verify your database connection in the app
3. Make sure your Supabase URL and API key are correct

### **If data doesn't appear:**

1. Check if the sample data was inserted correctly
2. Verify the table structure matches the functions
3. Test the functions individually in SQL Editor

## ✅ **Expected Results**

After running the setup:

1. **Map should load** without the error
2. **Sample data** should appear on the map
3. **Analytics** should show real numbers
4. **Heatmap** should display disease hotspots

## 🎯 **Next Steps**

1. **Test the map** - Open your app and check if the error is gone
2. **Add real data** - Replace sample data with actual scan data
3. **Customize locations** - Add more districts and coordinates
4. **Set up RLS policies** - Configure proper security policies

---

**🎉 Once you run these scripts, the map error should be resolved and you'll see the interactive disease heatmap working properly!**
