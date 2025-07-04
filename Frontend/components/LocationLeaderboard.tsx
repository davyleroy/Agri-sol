import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocationLeaderboard } from '../hooks/useSupabaseRPC';
import type { LocationLeaderboardEntry } from '../types/supabase';

interface LocationLeaderboardProps {
  limit?: number;
}

export default function LocationLeaderboard({
  limit = 10,
}: LocationLeaderboardProps) {
  const {
    data: leaderboard,
    loading,
    error,
    refetch,
  } = useLocationLeaderboard(limit);

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh leaderboard');
    }
  };

  const renderLeaderboardItem = ({
    item,
  }: {
    item: LocationLeaderboardEntry;
  }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>#{item.rank}</Text>
      </View>

      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.location_name}</Text>
        <Text style={styles.locationHierarchy}>{item.location_hierarchy}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statValue}>{item.total_scans}</Text>
        <Text style={styles.statLabel}>Scans</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text
          style={[
            styles.statValue,
            { color: item.disease_rate > 50 ? '#ef4444' : '#22c55e' },
          ]}
        >
          {' '}
          {item.disease_rate.toFixed(1)}%
        </Text>
        <Text style={styles.statLabel}>Disease Rate</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext} onPress={handleRefresh}>
          Tap to retry
        </Text>
      </View>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No location data available</Text>
        <Text style={styles.emptySubtext}>
          Scan some plants to see locations here!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Locations by Activity</Text>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => `${item.rank}-${item.location_name}`}
        renderItem={renderLeaderboardItem}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#22c55e']}
            tintColor="#22c55e"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 16,
    paddingBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  locationHierarchy: {
    fontSize: 12,
    color: '#64748b',
  },
  statsContainer: {
    alignItems: 'center',
    marginLeft: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#22c55e',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
