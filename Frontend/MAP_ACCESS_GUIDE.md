# 🗺️ **AgriSol Map Integration Guide**

## 📱 **How to Access the Map Functionality**

### **1. Admin Dashboard Access**

#### **Step 1: Open the App**

- Launch your AgriSol app on your mobile device
- Sign in with an admin account (email containing "admin")

#### **Step 2: Access Admin Dashboard**

- The app will automatically show the **Admin Dashboard** for admin users
- You'll see analytics metrics at the top

#### **Step 3: View the Map**

- Scroll down to the **"Disease Heatmap & User Locations"** section
- Tap **"Show Map"** to display the interactive map
- The map shows disease hotspots and user locations

### **2. Web Access**

#### **Direct URL Access**

- Open your web browser
- Navigate to: `http://localhost:8084/admin-map-test`
- This will show the full admin map dashboard

## 🔐 **Admin Access Setup**

### **For Admin Users:**

1. **Email-based Admin Detection**
   - Users with email containing "admin" get admin access
   - Example: `admin@agrisol.com`, `user.admin@example.com`

2. **Database Admin Role**
   - Set `role = 'admin'` in the `profiles` table
   - This provides full admin privileges

### **For Regular Users:**

- **No map access** - Map functionality is admin-only
- Regular users see the standard home screen with scan features

## 🎯 **Map Features Available**

### **✅ Currently Working:**

1. **📊 Analytics Dashboard**
   - Healthy Rate: Real-time percentage
   - Disease Rate: Real-time percentage
   - Unique Users: Active farmer count
   - Top Disease: Most common disease with case count

2. **🗺️ Interactive Map**
   - Disease hotspots visualization
   - User location tracking
   - Click markers for scan details
   - Real-time data updates

3. **📍 Location Analytics**
   - Most Active Location tracking
   - Scan count by location
   - Geographic disease spread

4. **📱 Multi-Platform Support**
   - Mobile app (React Native)
   - Web browser (Leaflet maps)
   - Responsive design

5. **🌍 Multi-Language Support**
   - English (EN)
   - Kinyarwanda (RW)
   - French (FR)

### **🔄 Coming Soon:**

1. **📈 Advanced Analytics**
   - Disease trend analysis
   - Geographic heat maps
   - Time-based filtering

2. **📊 Export Features**
   - Export scan data to CSV
   - Generate PDF reports
   - Share analytics

## 🚀 **Quick Start Guide**

### **For Admins:**

1. Open the app with admin account
2. View analytics metrics at the top
3. Scroll to **"Disease Heatmap & User Locations"**
4. Tap **"Show Map"** to view interactive map
5. Click markers for detailed scan information

### **For Web Users:**

1. Open browser
2. Go to `http://localhost:8084/admin-map-test`
3. View full interactive map
4. Access all admin features

## 🔧 **Troubleshooting**

### **Admin Dashboard Not Showing:**

- Ensure your email contains "admin"
- Check database role settings
- Restart the app

### **Map Not Loading:**

- Check internet connection
- Ensure Supabase is configured
- Verify database tables exist

### **Web Map Issues:**

- Use a modern browser (Chrome, Firefox, Safari)
- Enable JavaScript
- Check for browser console errors

## 📋 **Database Requirements**

Ensure your Supabase database has these tables:

```sql
-- Scan history table
CREATE TABLE scan_history (
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

-- User profiles with role
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 **Next Steps**

1. **Test the Admin Dashboard**
   - Try accessing with admin account
   - Test map toggle functionality
   - Verify analytics data loading

2. **Set Up Admin Users**
   - Create admin accounts in database
   - Test admin functionality
   - Verify access controls

3. **Add Sample Data**
   - Insert test scan records
   - Add location data
   - Test map markers

4. **Customize Map Features**
   - Adjust map styling
   - Add custom markers
   - Implement clustering

## 📞 **Support**

If you encounter issues:

1. **Check the console logs** for error messages
2. **Verify database connectivity** with Supabase
3. **Test on different devices** (mobile, web)
4. **Contact the development team** for assistance

---

**🎉 The map is now integrated into the admin dashboard!**

The map functionality is now part of the admin analytics dashboard, providing a comprehensive view of disease occurrence, user locations, and real-time scan data. Regular users do not have access to the map - it's exclusively for admin monitoring and analytics.
