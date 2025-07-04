import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Trophy,
  MapPin,
  Users,
  TrendingUp,
  Medal,
  Award,
  Star,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { adminService } from '../../services/adminService';
import { LocationAnalyticsData } from '../../services/locationTrackingService';

const { width } = Dimensions.get('window');

interface LocationData {
  location: string;
  count: number;
}

interface LocationLeaderboardProps {
  locations?: LocationData[]; // Made optional as we'll fetch data internally
}

export default function LocationLeaderboard({
  locations: propLocations,
}: LocationLeaderboardProps) {
  const [sortBy, setSortBy] = useState<
    'total_scans' | 'total_users' | 'growth_rate'
  >('total_scans');
  const [locations, setLocations] = useState<LocationAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch location leaderboard data
  const fetchLocationData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 Fetching location leaderboard data...');
      const result = await adminService.getLocationLeaderboard(sortBy, 50);

      if (result.success) {
        setLocations(result.data);
        console.log(`✅ Loaded ${result.data.length} locations`);
      } else {
        setError(result.error || 'Failed to fetch location data');
        console.error('❌ Failed to fetch locations:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Error fetching location data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount and when sort changes
  useEffect(() => {
    fetchLocationData();
  }, [sortBy]);

  // Enhanced location data with additional metrics
  const enhancedLocations = locations.map((location, index) => ({
    ...location,
    rank: index + 1,
    users: location.total_users,
    avgScansPerUser:
      location.total_users > 0
        ? Math.round(location.total_scans / location.total_users)
        : 0,
    growth: location.growth_rate_7_days,
    healthyRate: location.healthy_percentage,
    lastActivity: location.last_scan_at
      ? Math.floor(
          (Date.now() - new Date(location.last_scan_at).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0,
    location: location.location_string, // Map to expected property name
    count: location.total_scans, // Map to expected property name
  }));

  const sortOptions = [
    { id: 'total_scans', label: 'Total Scans', icon: Trophy },
    { id: 'total_users', label: 'User Activity', icon: Users },
    { id: 'growth_rate', label: 'Growth Rate', icon: TrendingUp },
  ];

  const sortedLocations = [...enhancedLocations].sort((a, b) => {
    switch (sortBy) {
      case 'total_scans':
        return b.count - a.count;
      case 'total_users':
        return b.users - a.users;
      case 'growth_rate':
        return b.growth - a.growth;
      default:
        return b.count - a.count;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} color="#f59e0b" strokeWidth={2} />;
      case 2:
        return <Medal size={20} color="#9ca3af" strokeWidth={2} />;
      case 3:
        return <Award size={20} color="#cd7c2f" strokeWidth={2} />;
      default:
        return <Star size={20} color="#6b7280" strokeWidth={2} />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#f59e0b';
      case 2:
        return '#9ca3af';
      case 3:
        return '#cd7c2f';
      default:
        return '#6b7280';
    }
  };

  const getHealthColor = (rate: number) => {
    if (rate >= 80) return '#10b981';
    if (rate >= 60) return '#84cc16';
    if (rate >= 40) return '#f59e0b';
    return '#dc2626';
  };

  // Handle loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading location data...</Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <AlertCircle size={48} color="#dc2626" strokeWidth={2} />
        <Text style={styles.errorText}>Failed to load location data</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchLocationData()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle empty state
  if (locations.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MapPin size={48} color="#6b7280" strokeWidth={2} />
        <Text style={styles.emptyText}>No location data available</Text>
        <Text style={styles.emptySubtext}>
          Scan some plants to see location analytics
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortButton,
              sortBy === option.id && styles.activeSortButton,
            ]}
            onPress={() => setSortBy(option.id as any)}
          >
            <option.icon
              size={16}
              color={sortBy === option.id ? '#ffffff' : '#6b7280'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.sortButtonText,
                sortBy === option.id && styles.activeSortButtonText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top 3 Podium */}
      <View style={styles.podiumContainer}>
        <Text style={styles.podiumTitle}>Top Performing Locations</Text>
        <View style={styles.podium}>
          {/* Reorder for podium effect: 2nd, 1st, 3rd */}
          {(() => {
            const podiumOrder = [
              sortedLocations[1], // 2nd place (left)
              sortedLocations[0], // 1st place (center)
              sortedLocations[2], // 3rd place (right)
            ];
            const rankOrder = [2, 1, 3]; // Corresponding ranks

            return podiumOrder.map((location, index) => {
              if (!location) return null;
              const actualRank = rankOrder[index];

              return (
                <View
                  key={index}
                  style={[
                    styles.podiumItem,
                    actualRank === 1 && styles.podiumFirst,
                  ]}
                >
                  <View
                    style={[
                      styles.podiumRank,
                      { backgroundColor: getRankColor(actualRank) },
                    ]}
                  >
                    {getRankIcon(actualRank)}
                  </View>
                  <View style={styles.podiumInfo}>
                    <Text style={styles.podiumLocation} numberOfLines={1}>
                      {location.location.split(',')[0]}
                    </Text>
                    <Text style={styles.podiumValue}>
                      {sortBy === 'total_scans'
                        ? `${location.count} scans`
                        : sortBy === 'total_users'
                          ? `${location.users} users`
                          : `+${location.growth}%`}
                    </Text>
                  </View>
                </View>
              );
            });
          })()}
        </View>
      </View>

      {/* Detailed Leaderboard */}
      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Complete Rankings</Text>
        <ScrollView
          style={styles.leaderboardList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchLocationData(true)}
              colors={['#059669']}
              tintColor="#059669"
            />
          }
        >
          {sortedLocations.map((location, index) => (
            <View key={index} style={styles.leaderboardItem}>
              <View style={styles.rankSection}>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: getRankColor(index + 1) },
                  ]}
                >
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
              </View>

              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <Text style={styles.locationName}>{location.location}</Text>
                  <View style={styles.locationBadges}>
                    {location.growth > 20 && (
                      <View style={styles.badge}>
                        <TrendingUp size={10} color="#10b981" strokeWidth={2} />
                        <Text style={styles.badgeText}>Hot</Text>
                      </View>
                    )}
                    {location.healthyRate > 85 && (
                      <View
                        style={[styles.badge, { backgroundColor: '#f0fdf4' }]}
                      >
                        <Text style={[styles.badgeText, { color: '#10b981' }]}>
                          Healthy
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.locationStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{location.count}</Text>
                    <Text style={styles.statLabel}>Total Scans</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{location.users}</Text>
                    <Text style={styles.statLabel}>Active Users</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {location.avgScansPerUser}
                    </Text>
                    <Text style={styles.statLabel}>Avg/User</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        { color: getHealthColor(location.healthyRate) },
                      ]}
                    >
                      {location.healthyRate}%
                    </Text>
                    <Text style={styles.statLabel}>Healthy</Text>
                  </View>
                </View>

                <View style={styles.locationFooter}>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(location.growth, 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      +{location.growth}% growth
                    </Text>
                  </View>
                  <Text style={styles.lastActivity}>
                    Active {location.lastActivity}d ago
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.detailsButton}>
                <ChevronRight size={16} color="#6b7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Summary Statistics */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary Statistics</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <MapPin size={20} color="#2563eb" strokeWidth={2} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryValue}>{locations.length}</Text>
              <Text style={styles.summaryLabel}>Total Locations</Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Users size={20} color="#059669" strokeWidth={2} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryValue}>
                {enhancedLocations.reduce((sum, loc) => sum + loc.users, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Active Users</Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <TrendingUp size={20} color="#f59e0b" strokeWidth={2} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryValue}>
                {Math.round(
                  enhancedLocations.reduce((sum, loc) => sum + loc.growth, 0) /
                    enhancedLocations.length,
                )}
                %
              </Text>
              <Text style={styles.summaryLabel}>Avg Growth</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  sortContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeSortButton: {
    backgroundColor: '#059669',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeSortButtonText: {
    color: '#ffffff',
  },
  podiumContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  podiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  podiumFirst: {
    transform: [{ scale: 1.1 }],
    marginTop: -8,
  },
  podiumRank: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  podiumInfo: {
    alignItems: 'center',
  },
  podiumLocation: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  podiumValue: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  leaderboardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  leaderboardList: {
    maxHeight: 400,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rankSection: {
    marginRight: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  locationSection: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  locationBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  locationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  lastActivity: {
    fontSize: 10,
    color: '#9ca3af',
  },
  detailsButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Loading, error, and empty state styles
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginTop: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
