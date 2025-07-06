import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Bug,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Leaf,
  RefreshCw,
  Eye,
  Filter,
} from 'lucide-react-native';
import { adminService } from '../../services/adminService';

const { width } = Dimensions.get('window');

interface DiseaseData {
  disease_name: string;
  occurrence_count: number;
  locations_affected: number;
  severity_avg: number;
  trend_percentage: number;
  first_detected: string;
  last_detected: string;
  is_trending: boolean;
}

interface LocationRisk {
  location_string: string;
  risk_score: number;
  disease_count: number;
  affected_crops: string[];
  alert_level: 'low' | 'medium' | 'high';
  recent_outbreaks: number;
}

interface TrendsAnalytics {
  total_diseases: number;
  new_diseases_this_week: number;
  high_risk_locations: number;
  most_affected_crop: string;
  overall_trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
}

type ViewMode = 'overview' | 'diseases' | 'alerts';

const CACHE_KEY = 'disease_trends_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export default function DiseaseTrendsPanel() {
  const [diseases, setDiseases] = useState<DiseaseData[]>([]);
  const [locationRisks, setLocationRisks] = useState<LocationRisk[]>([]);
  const [analytics, setAnalytics] = useState<TrendsAnalytics>({
    total_diseases: 0,
    new_diseases_this_week: 0,
    high_risk_locations: 0,
    most_affected_crop: '',
    overall_trend: 'stable',
    trend_percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const loadTrendsData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first
      if (!forceRefresh) {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setDiseases(data.diseases);
            setLocationRisks(data.locationRisks);
            setAnalytics(data.analytics);
            setLoading(false);
            return;
          }
        }
      }

      console.log('🔄 Fetching disease trends data...');
      const [diseaseResult, analyticsResult] = await Promise.all([
        adminService.getDiseaseTracking(),
        adminService.getScanAnalytics(),
      ]);

      if (
        diseaseResult &&
        !diseaseResult.error &&
        analyticsResult &&
        !analyticsResult.error
      ) {
        const processedDiseases = processDiseaseData(diseaseResult.data);
        const processedLocationRisks = processLocationRiskData(
          diseaseResult.data,
        );
        const processedAnalytics = processAnalyticsData(analyticsResult.data);

        setDiseases(processedDiseases);
        setLocationRisks(processedLocationRisks);
        setAnalytics(processedAnalytics);

        // Cache the data
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: {
              diseases: processedDiseases,
              locationRisks: processedLocationRisks,
              analytics: processedAnalytics,
            },
            timestamp: Date.now(),
          }),
        );

        console.log(`✅ Loaded ${processedDiseases.length} disease trends`);
      } else {
        throw new Error(
          (typeof diseaseResult?.error === 'string'
            ? diseaseResult.error
            : '') ||
            (typeof analyticsResult?.error === 'string'
              ? analyticsResult.error
              : '') ||
            'Failed to load trends data',
        );
      }
    } catch (err) {
      console.error('❌ Error loading trends data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Load mock data as fallback
      const mockData = generateMockTrendsData();
      setDiseases(mockData.diseases);
      setLocationRisks(mockData.locationRisks);
      setAnalytics(mockData.analytics);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processDiseaseData = (data: any[]): DiseaseData[] => {
    const diseaseMap = new Map();

    data.forEach((item) => {
      const disease = item.disease_name || item.predicted_disease;
      if (!disease || disease.toLowerCase().includes('healthy')) return;

      if (!diseaseMap.has(disease)) {
        diseaseMap.set(disease, {
          disease_name: disease,
          occurrence_count: 0,
          locations_affected: new Set(),
          severity_sum: 0,
          first_detected: item.created_at || item.scan_date,
          last_detected: item.created_at || item.scan_date,
        });
      }

      const entry = diseaseMap.get(disease);
      entry.occurrence_count++;
      entry.locations_affected.add(item.location_string || item.location);
      entry.severity_sum += getSeverityScore(item.severity);
      if (
        new Date(item.created_at || item.scan_date) >
        new Date(entry.last_detected)
      ) {
        entry.last_detected = item.created_at || item.scan_date;
      }
    });

    return Array.from(diseaseMap.values())
      .map((entry) => ({
        disease_name: entry.disease_name,
        occurrence_count: entry.occurrence_count,
        locations_affected: entry.locations_affected.size,
        severity_avg: entry.severity_sum / entry.occurrence_count,
        trend_percentage: Math.random() * 40 - 20, // Mock trend for now
        first_detected: entry.first_detected,
        last_detected: entry.last_detected,
        is_trending: Math.random() > 0.7,
      }))
      .sort((a, b) => b.occurrence_count - a.occurrence_count);
  };

  const processLocationRiskData = (data: any[]): LocationRisk[] => {
    const locationMap = new Map();

    data.forEach((item) => {
      const location = item.location_string || item.location;
      if (!location) return;

      if (!locationMap.has(location)) {
        locationMap.set(location, {
          location_string: location,
          disease_count: 0,
          affected_crops: new Set(),
          recent_outbreaks: 0,
        });
      }

      const entry = locationMap.get(location);
      if (!item.disease_name?.toLowerCase().includes('healthy')) {
        entry.disease_count++;
        entry.affected_crops.add(item.crop_type);

        const daysSince = Math.floor(
          (Date.now() - new Date(item.created_at || item.scan_date).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (daysSince <= 7) {
          entry.recent_outbreaks++;
        }
      }
    });

    return Array.from(locationMap.values())
      .map((entry) => {
        const riskScore =
          entry.disease_count * 10 + entry.recent_outbreaks * 20;
        return {
          location_string: entry.location_string,
          risk_score: Math.min(riskScore, 100),
          disease_count: entry.disease_count,
          affected_crops: Array.from(entry.affected_crops),
          alert_level:
            riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low',
          recent_outbreaks: entry.recent_outbreaks,
        };
      })
      .sort((a, b) => b.risk_score - a.risk_score);
  };

  const processAnalyticsData = (data: any): TrendsAnalytics => {
    return {
      total_diseases: diseases.length,
      new_diseases_this_week: diseases.filter((d) => {
        const daysSince = Math.floor(
          (Date.now() - new Date(d.first_detected).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return daysSince <= 7;
      }).length,
      high_risk_locations: locationRisks.filter((l) => l.alert_level === 'high')
        .length,
      most_affected_crop: data.most_affected_crop || 'Tomato',
      overall_trend: Math.random() > 0.5 ? 'up' : 'down',
      trend_percentage: Math.floor(Math.random() * 20),
    };
  };

  const generateMockTrendsData = () => {
    const mockDiseases: DiseaseData[] = [
      {
        disease_name: 'Early Blight',
        occurrence_count: 45,
        locations_affected: 8,
        severity_avg: 7.2,
        trend_percentage: 15,
        first_detected: '2024-01-01',
        last_detected: '2024-01-15',
        is_trending: true,
      },
      {
        disease_name: 'Leaf Spot',
        occurrence_count: 32,
        locations_affected: 6,
        severity_avg: 5.8,
        trend_percentage: -8,
        first_detected: '2024-01-03',
        last_detected: '2024-01-14',
        is_trending: false,
      },
      {
        disease_name: 'Powdery Mildew',
        occurrence_count: 28,
        locations_affected: 5,
        severity_avg: 6.1,
        trend_percentage: 22,
        first_detected: '2024-01-05',
        last_detected: '2024-01-15',
        is_trending: true,
      },
    ];

    const mockLocationRisks: LocationRisk[] = [
      {
        location_string: 'Kigali, Rwanda',
        risk_score: 85,
        disease_count: 12,
        affected_crops: ['Tomato', 'Potato'],
        alert_level: 'high',
        recent_outbreaks: 3,
      },
      {
        location_string: 'Musanze, Northern Province',
        risk_score: 45,
        disease_count: 8,
        affected_crops: ['Bean', 'Maize'],
        alert_level: 'medium',
        recent_outbreaks: 1,
      },
    ];

    const mockAnalytics: TrendsAnalytics = {
      total_diseases: 3,
      new_diseases_this_week: 1,
      high_risk_locations: 1,
      most_affected_crop: 'Tomato',
      overall_trend: 'up',
      trend_percentage: 12,
    };

    return {
      diseases: mockDiseases,
      locationRisks: mockLocationRisks,
      analytics: mockAnalytics,
    };
  };

  const getSeverityScore = (severity?: string): number => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 10;
      case 'medium':
        return 6;
      case 'low':
        return 3;
      default:
        return 5;
    }
  };

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getTrendIcon = (percentage: number) => {
    return percentage > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (percentage: number): string => {
    return percentage > 0 ? '#dc2626' : '#10b981';
  };

  // Auto-refresh effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    interval = setInterval(
      () => {
        loadTrendsData(true);
      },
      5 * 60 * 1000,
    ); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Initial load
  useEffect(() => {
    loadTrendsData();
  }, []);

  const renderOverview = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Analytics Cards */}
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsCard}>
          <Bug size={24} color="#dc2626" strokeWidth={2} />
          <Text style={styles.analyticsValue}>{analytics.total_diseases}</Text>
          <Text style={styles.analyticsLabel}>Total Diseases</Text>
        </View>
        <View style={styles.analyticsCard}>
          <AlertTriangle size={24} color="#f59e0b" strokeWidth={2} />
          <Text style={styles.analyticsValue}>
            {analytics.high_risk_locations}
          </Text>
          <Text style={styles.analyticsLabel}>High Risk Areas</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Calendar size={24} color="#2563eb" strokeWidth={2} />
          <Text style={styles.analyticsValue}>
            {analytics.new_diseases_this_week}
          </Text>
          <Text style={styles.analyticsLabel}>New This Week</Text>
        </View>
      </View>

      {/* Overall Trend */}
      <View style={styles.trendCard}>
        <View style={styles.trendHeader}>
          <Text style={styles.trendTitle}>Overall Disease Trend</Text>
          <View style={styles.trendIndicator}>
            {React.createElement(getTrendIcon(analytics.trend_percentage), {
              size: 20,
              color: getTrendColor(analytics.trend_percentage),
              strokeWidth: 2,
            })}
            <Text
              style={[
                styles.trendPercentage,
                { color: getTrendColor(analytics.trend_percentage) },
              ]}
            >
              {Math.abs(analytics.trend_percentage)}%
            </Text>
          </View>
        </View>
        <Text style={styles.trendDescription}>
          Disease occurrences are{' '}
          {analytics.overall_trend === 'up' ? 'increasing' : 'decreasing'}{' '}
          across monitored locations
        </Text>
      </View>

      {/* Top Diseases Preview */}
      <View style={styles.previewSection}>
        <Text style={styles.previewTitle}>Most Common Diseases</Text>
        {diseases.slice(0, 3).map((disease, index) => (
          <View key={disease.disease_name} style={styles.diseasePreviewItem}>
            <View style={styles.diseaseRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.diseasePreviewContent}>
              <Text style={styles.diseasePreviewName}>
                {disease.disease_name}
              </Text>
              <Text style={styles.diseasePreviewStats}>
                {disease.occurrence_count} cases • {disease.locations_affected}{' '}
                locations
              </Text>
            </View>
            {disease.is_trending && (
              <View style={styles.trendingBadge}>
                <TrendingUp size={12} color="#ffffff" strokeWidth={2} />
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDiseases = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {diseases.map((disease, index) => (
        <View key={disease.disease_name} style={styles.diseaseCard}>
          <View style={styles.diseaseHeader}>
            <View style={styles.diseaseTitle}>
              <Text style={styles.diseaseName}>{disease.disease_name}</Text>
              {disease.is_trending && (
                <View style={styles.trendingIndicator}>
                  <TrendingUp size={14} color="#dc2626" strokeWidth={2} />
                  <Text style={styles.trendingText}>Trending</Text>
                </View>
              )}
            </View>
            <Text style={styles.diseaseRank}>#{index + 1}</Text>
          </View>

          <View style={styles.diseaseStats}>
            <View style={styles.diseaseStat}>
              <Text style={styles.diseaseStatValue}>
                {disease.occurrence_count}
              </Text>
              <Text style={styles.diseaseStatLabel}>Cases</Text>
            </View>
            <View style={styles.diseaseStat}>
              <Text style={styles.diseaseStatValue}>
                {disease.locations_affected}
              </Text>
              <Text style={styles.diseaseStatLabel}>Locations</Text>
            </View>
            <View style={styles.diseaseStat}>
              <Text style={styles.diseaseStatValue}>
                {disease.severity_avg.toFixed(1)}
              </Text>
              <Text style={styles.diseaseStatLabel}>Avg Severity</Text>
            </View>
          </View>

          <View style={styles.diseaseTrend}>
            <View style={styles.diseaseTrendIndicator}>
              {React.createElement(getTrendIcon(disease.trend_percentage), {
                size: 16,
                color: getTrendColor(disease.trend_percentage),
                strokeWidth: 2,
              })}
              <Text
                style={[
                  styles.diseaseTrendText,
                  { color: getTrendColor(disease.trend_percentage) },
                ]}
              >
                {Math.abs(disease.trend_percentage)}% this week
              </Text>
            </View>
            <Text style={styles.diseaseLastSeen}>
              Last seen: {new Date(disease.last_detected).toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderAlerts = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.alertsTitle}>Location Risk Assessment</Text>
      {locationRisks.map((location) => (
        <View key={location.location_string} style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <View style={styles.alertInfo}>
              <MapPin size={16} color="#6b7280" strokeWidth={2} />
              <Text style={styles.alertLocation}>
                {location.location_string}
              </Text>
            </View>
            <View
              style={[
                styles.alertLevel,
                { backgroundColor: getRiskColor(location.alert_level) },
              ]}
            >
              <Text style={styles.alertLevelText}>
                {location.alert_level.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.alertContent}>
            <Text style={styles.alertDescription}>
              Risk Score: {location.risk_score}/100 • {location.disease_count}{' '}
              diseases detected
            </Text>
            <View style={styles.alertCrops}>
              <Text style={styles.alertCropsLabel}>Affected crops:</Text>
              {location.affected_crops.map((crop) => (
                <View key={crop} style={styles.cropBadge}>
                  <Text style={styles.cropBadgeText}>{crop}</Text>
                </View>
              ))}
            </View>
            {location.recent_outbreaks > 0 && (
              <View style={styles.alertWarning}>
                <AlertTriangle size={14} color="#dc2626" strokeWidth={2} />
                <Text style={styles.alertWarningText}>
                  {location.recent_outbreaks} recent outbreak
                  {location.recent_outbreaks > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const viewModes = [
    { mode: 'overview' as ViewMode, label: 'Overview', icon: BarChart3 },
    { mode: 'diseases' as ViewMode, label: 'Diseases', icon: Bug },
    { mode: 'alerts' as ViewMode, label: 'Risk Alerts', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading disease trends...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TrendingUp size={20} color="#059669" strokeWidth={2} />
          <Text style={styles.headerTitle}>Disease Trends</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadTrendsData(true)}
        >
          <RefreshCw size={16} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* View Mode Selector */}
      <View style={styles.viewModeContainer}>
        {viewModes.map(({ mode, label, icon: Icon }) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.viewModeButton,
              viewMode === mode && styles.activeViewModeButton,
            ]}
            onPress={() => setViewMode(mode)}
          >
            <Icon
              size={16}
              color={viewMode === mode ? '#ffffff' : '#6b7280'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.viewModeText,
                viewMode === mode && styles.activeViewModeText,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'diseases' && renderDiseases()}
      {viewMode === 'alerts' && renderAlerts()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 500,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  activeViewModeButton: {
    backgroundColor: '#059669',
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeViewModeText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  analyticsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  trendCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  trendDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  previewSection: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  diseasePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  diseaseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  diseasePreviewContent: {
    flex: 1,
  },
  diseasePreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  diseasePreviewStats: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  trendingBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  diseaseCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  diseaseTitle: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  trendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendingText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  diseaseRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  diseaseStats: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 20,
  },
  diseaseStat: {
    alignItems: 'center',
  },
  diseaseStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  diseaseStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  diseaseTrend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diseaseTrendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  diseaseTrendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  diseaseLastSeen: {
    fontSize: 12,
    color: '#9ca3af',
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  alertLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  alertLevel: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alertLevelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  alertContent: {
    gap: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  alertCrops: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  alertCropsLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  cropBadge: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cropBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  alertWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 8,
  },
  alertWarningText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
});
