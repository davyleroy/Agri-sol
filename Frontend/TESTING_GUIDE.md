# 🧪 Agri-sol App Testing Guide

## Overview

This guide will help you thoroughly test the Agri-sol mobile app, including all the enhanced features and admin dashboard functionality.

## 🚀 Prerequisites

### 1. Environment Setup

```bash
# Navigate to Frontend directory
cd Frontend

# Install all dependencies
npm install

# Check for any missing dependencies
npm audit

# Start the development server
npm start
```

### 2. Backend Connection

- Ensure your Flask backend is running on `http://localhost:5000`
- Verify Supabase connection is active
- Check that all environment variables are properly configured

### 3. Admin Access Setup

Make sure you have admin access configured:

- **Method 1**: Update `app.json` with your admin email
- **Method 2**: Use email ending with `@admin.agrisol.app`
- **Method 3**: Add your email to the `admin_users` table in Supabase

## 📱 Testing Checklist

### Phase 1: Basic App Functionality

#### 1.1 Authentication Testing

- [ ] **Sign Up Flow**
  - Test with valid email and password
  - Test with invalid email format
  - Test with weak password
  - Test with mismatched passwords
  - Verify profile creation with location data
  - Test farmer type selection

- [ ] **Sign In Flow**
  - Test with valid credentials
  - Test with invalid credentials
  - Test "Remember Me" functionality
  - Test "Forgot Password" flow

- [ ] **Admin Access**
  - Sign in with admin email
  - Verify admin dashboard loads instead of regular home
  - Test admin-only features are accessible

#### 1.2 Core App Features

- [ ] **Plant Scanning**
  - Test camera functionality
  - Test gallery image selection
  - Test crop type selection
  - Test disease detection results
  - Verify location tracking works
  - Test offline mode (if applicable)

- [ ] **Scan History**
  - View previous scans
  - Filter by crop type
  - Filter by health status
  - Test scan details view

- [ ] **User Settings**
  - Language switching (English/Kinyarwanda)
  - Dark mode toggle
  - Profile information update
  - Location settings

### Phase 2: Enhanced Features Testing

#### 2.1 Location Analytics

- [ ] **Interactive Map**
  - Test map loading and Rwanda boundaries
  - Test different view modes (scans, health, risk)
  - Test location pin clicking
  - Test zoom and pan functionality
  - Test cluster expansion
  - Verify data tooltips display correctly

- [ ] **Location Leaderboard**
  - Test sorting by different metrics (scans, users, growth)
  - Test search functionality
  - Test filtering (all, high-risk, trending, healthy)
  - Test real-time updates
  - Test pull-to-refresh

#### 2.2 Analytics Panels

- [ ] **Recent Activity Panel**
  - Test real-time activity feed
  - Test filtering by health status
  - Test auto-refresh functionality
  - Test summary metrics accuracy

- [ ] **Disease Trends Panel**
  - Test different view modes (overview, diseases, alerts)
  - Test trend analysis
  - Test disease risk scoring
  - Test alert system

- [ ] **User Growth Panel**
  - Test growth metrics
  - Test user segmentation
  - Test engagement metrics
  - Test user journey tracking

#### 2.3 Admin Dashboard

- [ ] **Overview Stats**
  - Test total user count
  - Test scan analytics
  - Test health/disease ratios
  - Test top disease detection

- [ ] **Responsive Design**
  - Test on different screen sizes
  - Test mobile layout
  - Test tablet layout
  - Test desktop layout (if applicable)

### Phase 3: Performance & Reliability Testing

#### 3.1 Data Management

- [ ] **Caching System**
  - Test AsyncStorage caching
  - Test cache expiration
  - Test cache refresh
  - Test offline data access

- [ ] **Real-time Updates**
  - Test auto-refresh intervals
  - Test manual refresh
  - Test background updates
  - Test network connectivity changes

#### 3.2 Error Handling

- [ ] **Network Errors**
  - Test with no internet connection
  - Test with slow connection
  - Test with intermittent connection
  - Test API timeout handling

- [ ] **Data Fallbacks**
  - Test mock data loading
  - Test empty state handling
  - Test error message display
  - Test retry mechanisms

### Phase 4: Integration Testing

#### 4.1 Backend Integration

- [ ] **API Endpoints**
  - Test `/api/location/leaderboard`
  - Test `/api/location/analytics`
  - Test `/api/location/recent-scans`
  - Test `/api/disease/tracking`
  - Test `/api/user/analytics`

- [ ] **Database Operations**
  - Test scan history saving
  - Test user location updates
  - Test analytics data retrieval
  - Test admin user validation

#### 4.2 Cross-Platform Testing

- [ ] **iOS Testing**
  - Test on iPhone (if available)
  - Test on iPad (if available)
  - Test iOS-specific features

- [ ] **Android Testing**
  - Test on Android phone
  - Test on Android tablet
  - Test Android-specific features

## 🔧 Testing Commands

### Start Testing Environment

```bash
# Start Expo development server
npm start

# Start on specific platform
npm run ios     # For iOS simulator
npm run android # For Android emulator
npm run web     # For web browser
```

### Debugging Tools

```bash
# Enable debugging
# In Expo Go app: shake device -> Debug -> Enable debugging

# View console logs
# In browser: F12 -> Console tab

# React Native Debugger (recommended)
# Download from: https://github.com/jhen0409/react-native-debugger
```

## 📊 Test Data Setup

### Create Test Users

1. **Regular User**: `test.user@example.com`
2. **Admin User**: `admin@agrisol.app`
3. **Farmer User**: `farmer@example.com`

### Generate Test Scans

```javascript
// Use this in your app to generate test scan data
const generateTestScans = async () => {
  // Code to create multiple test scans with different crops and results
  // This will populate your analytics with realistic data
};
```

### Location Test Data

Test with these Rwanda locations:

- Kigali City, Nyarugenge District
- Northern Province, Musanze District
- Southern Province, Huye District
- Eastern Province, Nyagatare District
- Western Province, Rubavu District

## 🐛 Common Issues & Solutions

### Issue 1: Map Not Loading

**Solution**: Check network connection and verify location data exists

### Issue 2: Admin Dashboard Not Showing

**Solution**: Verify admin email configuration and check authentication

### Issue 3: Real-time Updates Not Working

**Solution**: Check WebSocket connection and API endpoints

### Issue 4: Cache Not Working

**Solution**: Clear AsyncStorage and restart app

## 📋 Test Results Template

### Test Session: [Date]

**Tester**: [Name]
**Platform**: [iOS/Android/Web]
**Build**: [Version]

#### Passed Tests:

- [ ] Authentication flows
- [ ] Core scanning features
- [ ] Location analytics
- [ ] Admin dashboard
- [ ] Performance metrics

#### Failed Tests:

- [ ] [Description of failure]
- [ ] [Steps to reproduce]
- [ ] [Expected vs actual behavior]

#### Notes:

- Performance observations
- User experience feedback
- Suggestions for improvement

## 🎯 Testing Priorities

### High Priority (Must Pass)

1. User authentication
2. Plant scanning functionality
3. Basic location tracking
4. Admin dashboard access

### Medium Priority (Should Pass)

1. Enhanced analytics
2. Real-time updates
3. Responsive design
4. Error handling

### Low Priority (Nice to Have)

1. Advanced filtering
2. Detailed animations
3. Complex interactions
4. Edge case handling

## 📈 Performance Benchmarks

### Target Metrics:

- **App Launch Time**: < 3 seconds
- **Scan Processing**: < 5 seconds
- **Map Loading**: < 2 seconds
- **Dashboard Refresh**: < 1 second
- **Memory Usage**: < 200MB

### Test These Scenarios:

1. App startup performance
2. Memory usage during extended use
3. Battery consumption
4. Network request efficiency
5. Storage usage optimization

## 🔄 Continuous Testing

### Automated Tests (Future)

- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for user flows
- Performance regression tests

### Manual Testing Schedule

- **Daily**: Basic functionality
- **Weekly**: Complete feature testing
- **Monthly**: Performance and regression testing
- **Release**: Full comprehensive testing

---

## 🆘 Need Help?

If you encounter issues during testing:

1. Check the console logs for error messages
2. Verify your network connection
3. Ensure backend services are running
4. Check environment variable configuration
5. Review the main README.md for setup instructions

**Happy Testing! 🌱**
