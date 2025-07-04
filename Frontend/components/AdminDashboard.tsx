import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BarChart3,
  Users,
  MapPin,
  Activity,
  TrendingUp,
  AlertTriangle,
  Leaf,
  Eye,
  Calendar,
  LogOut,
  Shield,
  Settings,
} from 'lucide-react-native';
import { adminService } from '@/services/adminService';
import { supabase } from '@/contexts/AuthContext';

// Import sub-components
import StatsOverview from './admin/StatsOverview';
import RwandaMap from './admin/RwandaMap';
import DiseaseAnalytics from './admin/DiseaseAnalytics';
import LocationLeaderboard from './admin/LocationLeaderboard';
import RecentScans from './admin/RecentScans';

const { width, height } = Dimensions.get('window');

interface AdminDashboardProps {
  onSignOut: () => void;
}

export default function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'map' | 'analytics' | 'locations'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalScans: 0,
    healthyScans: 0,
    diseaseScans: 0,
    topDiseases: [] as any[],
    topLocations: [] as any[],
    recentScans: [] as any[],
    scansByLocation: [] as any[],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all dashboard data
      const [usersResponse, scansResponse, scanAnalyticsResponse] =
        await Promise.all([
          adminService.getAllUsers(),
          adminService.getScanAnalytics(),
          supabase
            .from('scan_history')
            .select('*')
            .order('scan_date', { ascending: false })
            .limit(100),
        ]);

      const users = usersResponse.data || [];
      const scans = scansResponse.data || [];
      const allScans = scanAnalyticsResponse.data || [];

      // Calculate stats
      const totalUsers = users.length;
      const totalScans = scans.length;
      const healthyScans = scans.filter(
        (scan: any) =>
          scan.disease_detected === 'Healthy' ||
          scan.disease_detected === 'No Disease',
      ).length;
      const diseaseScans = totalScans - healthyScans;

      // Group diseases
      const diseaseGroups = scans.reduce((acc: any, scan: any) => {
        if (scan.disease_detected && scan.disease_detected !== 'Healthy') {
          acc[scan.disease_detected] = (acc[scan.disease_detected] || 0) + 1;
        }
        return acc;
      }, {});

      const topDiseases = Object.entries(diseaseGroups)
        .map(([disease, count]) => ({ disease, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      // Group by location (assuming we have location data)
      const locationGroups = users.reduce((acc: any, user: any) => {
        const location = `${user.district}, ${user.province}`;
        if (user.district && user.province) {
          acc[location] = (acc[location] || 0) + 1;
        }
        return acc;
      }, {});

      const topLocations = Object.entries(locationGroups)
        .map(([location, count]) => ({ location, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10);

      // Recent scans (mock data for now)
      const recentScans = allScans.slice(0, 10);

      // Scans by location for map
      const scansByLocation = topLocations.map((loc: any) => ({
        ...loc,
        healthyCount: Math.floor(Math.random() * loc.count),
        diseaseCount: Math.floor(Math.random() * loc.count),
        coordinates: getLocationCoordinates(loc.location),
      }));

      setDashboardData({
        totalUsers,
        totalScans,
        healthyScans,
        diseaseScans,
        topDiseases,
        topLocations,
        recentScans,
        scansByLocation,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationCoordinates = (location: string) => {
    // Mock coordinates for Rwanda locations
    const coordinates: { [key: string]: { lat: number; lng: number } } = {
      'Kigali, Kigali City': { lat: -1.9706, lng: 30.1044 },
      'Musanze, Northern Province': { lat: -1.4833, lng: 29.6333 },
      'Nyarugenge, Kigali City': { lat: -1.9536, lng: 30.0605 },
      'Gasabo, Kigali City': { lat: -1.9394, lng: 30.1256 },
      'Huye, Southern Province': { lat: -2.5964, lng: 29.7386 },
    };
    return coordinates[location] || { lat: -1.9706, lng: 30.1044 };
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'map', label: 'Map View', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'locations', label: 'Locations', icon: Users },
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <View>
            <StatsOverview data={dashboardData} />
            <RecentScans scans={dashboardData.recentScans} />
          </View>
        );
      case 'map':
        return <RwandaMap data={dashboardData.scansByLocation} />;
      case 'analytics':
        return <DiseaseAnalytics data={dashboardData} />;
      case 'locations':
        return <LocationLeaderboard locations={dashboardData.topLocations} />;
      default:
        return <StatsOverview data={dashboardData} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1f2937', '#374151', '#4b5563']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Agrisol Analytics & Management
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={20} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={onSignOut}>
              <LogOut size={20} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStatCard}>
          <Users size={20} color="#2563eb" strokeWidth={2} />
          <Text style={styles.quickStatNumber}>{dashboardData.totalUsers}</Text>
          <Text style={styles.quickStatLabel}>Total Users</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Eye size={20} color="#059669" strokeWidth={2} />
          <Text style={styles.quickStatNumber}>{dashboardData.totalScans}</Text>
          <Text style={styles.quickStatLabel}>Total Scans</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Leaf size={20} color="#10b981" strokeWidth={2} />
          <Text style={styles.quickStatNumber}>
            {dashboardData.healthyScans}
          </Text>
          <Text style={styles.quickStatLabel}>Healthy</Text>
        </View>
        <View style={styles.quickStatCard}>
          <AlertTriangle size={20} color="#dc2626" strokeWidth={2} />
          <Text style={styles.quickStatNumber}>
            {dashboardData.diseaseScans}
          </Text>
          <Text style={styles.quickStatLabel}>Diseases</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <tab.icon
              size={18}
              color={activeTab === tab.id ? '#ffffff' : '#6b7280'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -12,
    gap: 8,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  quickStatLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});
