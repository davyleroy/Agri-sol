# 🔧 Admin Dashboard Setup Guide

## Overview

The Agrisol Admin Dashboard provides comprehensive analytics and management tools for monitoring crop health scanning activities, user engagement, and disease patterns across Rwanda.

## 🚀 Features

### 1. **Stats Overview**

- Real-time user statistics
- Scan analytics with health/disease breakdown
- Top diseases detection with visual charts
- Overall plant health summary

### 2. **Interactive Rwanda Map**

- Heat map visualization with 3 modes:
  - **Total Scans**: Shows scan density by location
  - **Health Status**: Green (healthy) to Red (diseased) zones
  - **Disease Risk**: Critical zones highlighting high disease areas
- Province-wise breakdown with statistics
- Click-to-view location details

### 3. **Disease Analytics**

- Time-based disease trend analysis
- Disease category breakdown (Fungal, Bacterial, Viral, Nutritional)
- Most common diseases with occurrence statistics
- Crop-specific disease patterns

### 4. **Location Leaderboard**

- Top performing locations ranking
- User activity metrics by region
- Growth rate tracking
- Health score indicators

### 5. **Recent Scans Monitor**

- Real-time scan activity feed
- Filter by health status (All, Healthy, Disease)
- Confidence score tracking
- Location-based scan distribution

## 🔐 Admin Access Setup

### Method 1: Email-based Admin Detection

1. Update `Frontend/app.json` to set your admin email:

```json
{
  "expo": {
    "extra": {
      "adminEmail": "your-admin-email@domain.com"
    }
  }
}
```

### Method 2: Domain-based Admin Detection

Any email ending with `@admin.agrisol.app` will automatically have admin access.

### Method 3: Database Configuration

Create admin users in your Supabase database:

```sql
-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  permissions JSONB DEFAULT '{"manage_users": true, "manage_content": true, "view_analytics": true}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin user
INSERT INTO admin_users (email, full_name, role)
VALUES ('admin@agrisol.app', 'Admin User', 'super_admin');
```

## 📊 Database Schema Requirements

### Required Tables:

1. **profiles** - User profiles
2. **scan_history** - Disease scan records
3. **admin_users** - Admin user management
4. **crops** - Crop information (optional)

### Sample Data Structure:

```sql
-- profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  district TEXT,
  province TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- scan_history table
CREATE TABLE scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  crop_type TEXT,
  disease_detected TEXT,
  confidence_score DECIMAL,
  location TEXT,
  scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎨 Color Coding System

### Health Status Colors:

- **Green (#10b981)**: Healthy plants (80%+ health rate)
- **Orange (#f59e0b)**: Mixed health (40-80% health rate)
- **Red (#dc2626)**: Critical zones (disease outbreak areas)

### Disease Risk Levels:

- **Low Risk**: Green zones with minimal disease detection
- **Medium Risk**: Yellow/Orange zones with moderate disease presence
- **High Risk**: Red zones requiring immediate intervention

## 🌍 Rwanda Geographic Coverage

### Provinces Supported:

1. **Kigali City** - Nyarugenge, Gasabo, Kicukiro
2. **Northern Province** - Musanze, Burera, Gakenke, Gicumbi, Rulindo
3. **Southern Province** - Huye, Nyamagabe, Gisagara, Nyaruguru, Muhanga, Kamonyi, Ruhango, Nyanza
4. **Eastern Province** - Rwamagana, Nyagatare, Gatsibo, Kayonza, Kirehe, Ngoma, Bugesera
5. **Western Province** - Karongi, Rutsiro, Rubavu, Nyabihu, Ngororero, Rusizi, Nyamasheke

## 🔧 Development Setup

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Configure Environment

Update your Supabase credentials in your environment or app.json:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "your-supabase-url",
      "supabaseAnonKey": "your-anon-key",
      "adminEmail": "admin@agrisol.app"
    }
  }
}
```

### 3. Start Development Server

```bash
npm start
```

## 📱 Testing Admin Features

### 1. Create Admin Account

- Register with email: `admin@agrisol.app`
- Or use your configured admin email

### 2. Access Dashboard

- Login with admin credentials
- Dashboard will automatically load instead of regular home screen

### 3. Test Features

- Navigate between Overview, Map, Analytics, and Locations tabs
- Interact with charts and location pins
- Filter data by time periods and health status

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Check Supabase URL and API key
   - Verify table permissions and RLS policies

2. **Admin Access Not Working**
   - Verify admin email configuration
   - Check database admin_users table
   - Ensure proper authentication flow

3. **Map Not Loading**
   - Check location data in database
   - Verify coordinate parsing functions
   - Ensure proper district/province mapping

4. **Charts Not Displaying**
   - Verify scan_history data structure
   - Check date formatting in database
   - Ensure proper data aggregation

## 📈 Analytics Metrics

### Key Performance Indicators:

- **User Engagement**: Active users per region
- **Scan Frequency**: Daily/weekly/monthly scan rates
- **Disease Detection**: Disease vs. healthy plant ratios
- **Geographic Patterns**: Disease hotspots and trends
- **Confidence Scores**: AI model accuracy tracking

### Data Visualization:

- **Bar Charts**: Disease trends over time
- **Heat Maps**: Geographic disease distribution
- **Pie Charts**: Disease category breakdown
- **Leaderboards**: Top-performing locations

## 🚦 Performance Optimization

### Best Practices:

1. **Data Pagination**: Limit large dataset queries
2. **Caching**: Cache frequently accessed data
3. **Lazy Loading**: Load components on demand
4. **Error Handling**: Graceful fallbacks for missing data

### Mock Data:

The dashboard includes fallback mock data for development and testing when database connections fail.

## 🔮 Future Enhancements

### Planned Features:

1. **Real-time Notifications**: Disease outbreak alerts
2. **Predictive Analytics**: AI-powered disease forecasting
3. **Export Functionality**: PDF/CSV report generation
4. **Mobile Optimization**: Responsive design improvements
5. **Multi-language Support**: Kinyarwanda localization

---

## 🆘 Support

For technical support or feature requests:

- Check the main README.md file
- Review the Supabase setup guide
- Contact the development team

**Happy Farming! 🌱**
