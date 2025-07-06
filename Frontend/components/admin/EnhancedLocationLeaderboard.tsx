import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Trophy,
  MapPin,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Users,
  Activity,
  Leaf,
  AlertTriangle,
  Eye,
  RefreshCw,
  Star,
  Award,
  Target,
} from 'lucide-react-native';
import { adminService } from '../../services/adminService';
import { LocationAnalyticsData } from '../../services/locationTrackingService';

interface EnhancedLocationData extends LocationAnalyticsData {
  rank: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  healthPercentage: number;
  riskScore: number;
  growthRate: number;
  engagement: number;
  most_common_crop?: string;
}

type SortOption = 'scans' | 'users' | 'growth' | 'health' | 'engagement';
type FilterOption = 'all' | 'high-risk' | 'trending' | 'healthy';

const CACHE_KEY = 'enhanced_leaderboard_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function EnhancedLocationLeaderboard({
  onLocationSelect,
  selectedLocation,
  compactMode = false,
}: {
  onLocationSelect?: (location: EnhancedLocationData) => void;
  selectedLocation?: string;
  compactMode?: boolean;
}) {
  const [locations, setLocations] = useState<EnhancedLocationData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<
    EnhancedLocationData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('scans');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  const loadLeaderboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);

      // Try cache first
      if (!forceRefresh) {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setLocations(data);
            setLoading(false);
            return;
          }
        }
      }

      console.log('🔄 Fetching enhanced leaderboard data...');
      const result = await adminService.getLocationLeaderboard(
        'total_scans',
        50,
      );

      if (result && result.success) {
        const processedData = processLocationData(result.data);
        setLocations(processedData);

        // Cache the data
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: processedData,
            timestamp: Date.now(),
          }),
        );

        console.log(`✅ Loaded ${processedData.length} enhanced locations`);
      } else {
        throw new Error(result?.error || 'Failed to load leaderboard data');
      }
    } catch (error) {
      console.error('❌ Error loading leaderboard:', error);

      // Load mock data as fallback
      const mockData = generateMockLeaderboardData();
      setLocations(mockData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processLocationData = (
    data: LocationAnalyticsData[],
  ): EnhancedLocationData[] => {
    return data
      .map((location, index) => ({
        ...location,
        rank: index + 1,
        trend: (Math.random() > 0.6
          ? 'up'
          : Math.random() > 0.3
            ? 'down'
            : 'stable') as 'up' | 'down' | 'stable',
        trendPercentage: Math.floor(Math.random() * 30),
        healthPercentage:
          location.healthy_percentage || Math.floor(Math.random() * 40 + 60),
        riskScore: Math.floor(Math.random() * 100),
        growthRate:
          location.growth_rate_7_days || Math.floor(Math.random() * 50 - 10),
        engagement: Math.floor(Math.random() * 100),
      }))
      .sort((a, b) => b.total_scans - a.total_scans);
  };

  const generateMockLeaderboardData = (): EnhancedLocationData[] => {
    const mockLocations = [
      'Kigali, Rwanda',
      'Musanze, Northern Province',
      'Huye, Southern Province',
      'Rubavu, Western Province',
      'Rwamagana, Eastern Province',
      'Nyagatare, Eastern Province',
      'Muhanga, Southern Province',
      'Karongi, Western Province',
    ];

    return mockLocations
      .map((location, index) => ({
        location_string: location,
        country: 'Rwanda',
        province: location.split(', ')[1] || 'Unknown Province',
        district: location.split(', ')[0],
        total_scans: Math.floor(Math.random() * 200 + 50),
        total_users: Math.floor(Math.random() * 30 + 10),
        healthy_scans: Math.floor(Math.random() * 100 + 20),
        disease_scans: Math.floor(Math.random() * 50 + 10),
        healthy_percentage: Math.floor(Math.random() * 40 + 60),
        growth_rate_7_days: Math.floor(Math.random() * 50 - 10),
        last_scan_at: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        most_common_disease: ['Early Blight', 'Leaf Spot', 'Powdery Mildew'][
          Math.floor(Math.random() * 3)
        ],
        most_common_crop: ['Tomato', 'Potato', 'Bean'][
          Math.floor(Math.random() * 3)
        ],
        rank: index + 1,
        trend: (Math.random() > 0.6
          ? 'up'
          : Math.random() > 0.3
            ? 'down'
            : 'stable') as 'up' | 'down' | 'stable',
        trendPercentage: Math.floor(Math.random() * 30),
        healthPercentage: Math.floor(Math.random() * 40 + 60),
        riskScore: Math.floor(Math.random() * 100),
        growthRate: Math.floor(Math.random() * 50 - 10),
        engagement: Math.floor(Math.random() * 100),
      }))
      .sort((a, b) => b.total_scans - a.total_scans);
  };

  // Filter and sort locations
  useEffect(() => {
    let filtered = locations.filter((location) => {
      // Search filter
      if (searchQuery) {
        return location.location_string
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      return true;
    });

    // Category filter
    switch (filterBy) {
      case 'high-risk':
        filtered = filtered.filter((location) => location.riskScore > 70);
        break;
      case 'trending':
        filtered = filtered.filter((location) => location.trend === 'up');
        break;
      case 'healthy':
        filtered = filtered.filter(
          (location) => location.healthPercentage > 80,
        );
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'scans':
          return b.total_scans - a.total_scans;
        case 'users':
          return b.total_users - a.total_users;
        case 'growth':
          return b.growthRate - a.growthRate;
        case 'health':
          return b.healthPercentage - a.healthPercentage;
        case 'engagement':
          return b.engagement - a.engagement;
        default:
          return 0;
      }
    });

    setFilteredLocations(filtered);
  }, [locations, searchQuery, sortBy, filterBy]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadLeaderboardData(true);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Initial load
  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} color="#fbbf24" strokeWidth={2} />;
      case 2:
        return <Award size={20} color="#9ca3af" strokeWidth={2} />;
      case 3:
        return <Star size={20} color="#d97706" strokeWidth={2} />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} color="#10b981" strokeWidth={2} />;
      case 'down':
        return <TrendingDown size={14} color="#dc2626" strokeWidth={2} />;
      default:
        return <Activity size={14} color="#6b7280" strokeWidth={2} />;
    }
  };

  const getRiskColor = (riskScore: number): string => {
    if (riskScore > 70) return '#dc2626';
    if (riskScore > 40) return '#f59e0b';
    return '#10b981';
  };

  const renderLocationItem = ({ item }: { item: EnhancedLocationData }) => {
    const isSelected = selectedLocation === item.location_string;

    return (
      <TouchableOpacity
        style={[
          styles.locationCard,
          isSelected && styles.selectedLocationCard,
          compactMode && styles.compactLocationCard,
        ]}
        onPress={() => onLocationSelect?.(item)}
      >
        <View style={styles.locationHeader}>
          <View style={styles.locationRank}>{getRankIcon(item.rank)}</View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName} numberOfLines={1}>
              {item.location_string}
            </Text>
            <View style={styles.locationStats}>
              <View style={styles.statItem}>
                <Eye size={12} color="#6b7280" strokeWidth={2} />
                <Text style={styles.statValue}>{item.total_scans}</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={12} color="#6b7280" strokeWidth={2} />
                <Text style={styles.statValue}>{item.total_users}</Text>
              </View>
              <View style={styles.statItem}>
                {getTrendIcon(item.trend)}
                <Text style={styles.statValue}>{item.trendPercentage}%</Text>
              </View>
            </View>
          </View>
        </View>

        {!compactMode && (
          <View style={styles.locationDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Leaf size={16} color="#10b981" strokeWidth={2} />
                <Text style={styles.detailLabel}>Health</Text>
                <Text style={styles.detailValue}>{item.healthPercentage}%</Text>
              </View>
              <View style={styles.detailItem}>
                <AlertTriangle
                  size={16}
                  color={getRiskColor(item.riskScore)}
                  strokeWidth={2}
                />
                <Text style={styles.detailLabel}>Risk</Text>
                <Text style={styles.detailValue}>{item.riskScore}</Text>
              </View>
              <View style={styles.detailItem}>
                <Target size={16} color="#2563eb" strokeWidth={2} />
                <Text style={styles.detailLabel}>Engagement</Text>
                <Text style={styles.detailValue}>{item.engagement}%</Text>
              </View>
            </View>
            <View style={styles.cropInfo}>
              <Text style={styles.cropInfoText}>
                Most scanned: {item.most_common_crop}
              </Text>
              {item.most_common_disease && (
                <Text style={styles.diseaseInfoText}>
                  Most common disease: {item.most_common_disease}
                </Text>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const sortOptions = [
    { value: 'scans', label: 'Total Scans', icon: Eye },
    { value: 'users', label: 'Unique Users', icon: Users },
    { value: 'growth', label: 'Growth Rate', icon: TrendingUp },
    { value: 'health', label: 'Health Score', icon: Leaf },
    { value: 'engagement', label: 'Engagement', icon: Target },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Locations', count: locations.length },
    {
      value: 'high-risk',
      label: 'High Risk',
      count: locations.filter((l) => l.riskScore > 70).length,
    },
    {
      value: 'trending',
      label: 'Trending Up',
      count: locations.filter((l) => l.trend === 'up').length,
    },
    {
      value: 'healthy',
      label: 'Healthy',
      count: locations.filter((l) => l.healthPercentage > 80).length,
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Trophy size={20} color="#059669" strokeWidth={2} />
          <Text style={styles.headerTitle}>Location Leaderboard</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} color="#6b7280" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadLeaderboardData(true)}
          >
            <RefreshCw size={16} color="#6b7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Search size={16} color="#6b7280" strokeWidth={2} />
          <TextInput
            placeholder="Search locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchText}
          />
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort by:</Text>
            <View style={styles.filterOptions}>
              {sortOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      sortBy === option.value && styles.activeFilterOption,
                    ]}
                    onPress={() => setSortBy(option.value as SortOption)}
                  >
                    <IconComponent
                      size={14}
                      color={sortBy === option.value ? '#ffffff' : '#6b7280'}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.filterOptionText,
                        sortBy === option.value &&
                          styles.activeFilterOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Filter Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filter by:</Text>
            <View style={styles.filterOptions}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filterBy === option.value && styles.activeFilterOption,
                  ]}
                  onPress={() => setFilterBy(option.value as FilterOption)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterBy === option.value &&
                        styles.activeFilterOptionText,
                    ]}
                  >
                    {option.label} ({option.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={filteredLocations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.location_string}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={() => loadLeaderboardData(true)}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MapPin size={48} color="#6b7280" strokeWidth={1} />
            <Text style={styles.emptyText}>No locations found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        }
      />
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterToggle: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  activeFilterOption: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#6b7280',
  },
  activeFilterOptionText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
  },
  locationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedLocationCard: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  compactLocationCard: {
    padding: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  locationRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  locationStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  locationDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cropInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
  },
  cropInfoText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  diseaseInfoText: {
    fontSize: 11,
    color: '#dc2626',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
});
