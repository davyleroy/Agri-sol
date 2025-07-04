import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAnalyticsSummary, useRecentScans } from '../hooks/useSupabaseRPC';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  color = '#22c55e',
}: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export default function AdminDashboard() {
  const {
    data: summaryData,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useAnalyticsSummary();

  const {
    data: recentScans,
    loading: scansLoading,
    error: scansError,
    refetch: refetchScans,
  } = useRecentScans(5);

  const summary = useMemo(() => summaryData?.[0] || null, [summaryData]);

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchScans()]);
  };

  const isLoading = summaryLoading || scansLoading;
  const hasError = summaryError || scansError;

  const diseaseRate = useMemo(() => {
    if (!summary || summary.total_scans === 0) return '0.0';
    return ((summary.total_diseased_scans / summary.total_scans) * 100).toFixed(
      1,
    );
  }, [summary]);

  const healthyRate = useMemo(() => {
    if (!summary || summary.total_scans === 0) return '0.0';
    return ((summary.total_healthy_scans / summary.total_scans) * 100).toFixed(
      1,
    );
  }, [summary]);

  if (isLoading && !summary) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (hasError && !summary) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error: {summaryError || scansError}
        </Text>
        <Text style={styles.errorSubtext} onPress={handleRefresh}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={['#22c55e']}
          tintColor="#22c55e"
        />
      }
    >
      <Text style={styles.title}>Analytics Dashboard</Text>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Scans"
          value={summary?.total_scans.toLocaleString() || '0'}
          subtitle="All time"
          color="#3b82f6"
        />
        <StatCard
          title="Active Locations"
          value={summary?.active_locations || 0}
          subtitle="With scan data"
          color="#8b5cf6"
        />
        <StatCard
          title="Healthy Rate"
          value={`${healthyRate}%`}
          subtitle={`${summary?.total_healthy_scans || 0} healthy scans`}
          color="#22c55e"
        />
        <StatCard
          title="Disease Rate"
          value={`${diseaseRate}%`}
          subtitle={`${summary?.total_diseased_scans || 0} diseased scans`}
          color="#ef4444"
        />
        <StatCard
          title="Unique Users"
          value={summary?.unique_users || 0}
          subtitle="Active farmers"
          color="#f59e0b"
        />
        <StatCard
          title="Top Disease"
          value={summary?.top_disease || 'None'}
          subtitle={`${summary?.disease_count || 0} cases`}
          color="#ec4899"
        />
      </View>

      {/* Most Active Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Active Location</Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationName}>
            {summary?.most_active_location || 'No data'}
          </Text>
          <Text style={styles.locationScans}>
            {summary?.location_scan_count || 0} scans
          </Text>
        </View>
      </View>

      {/* Recent Scans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        {recentScans && recentScans.length > 0 ? (
          recentScans.map((scan) => (
            <View key={scan.scan_id} style={styles.recentScanItem}>
              <View style={styles.scanInfo}>
                <Text style={styles.cropType}>{scan.crop_type}</Text>
                <Text style={styles.diseaseText}>{scan.disease_detected}</Text>
                <Text style={styles.locationText}>{scan.location_name}</Text>
              </View>
              <View style={styles.scanMeta}>
                <Text style={styles.confidence}>
                  {(scan.confidence_score * 100).toFixed(0)}%
                </Text>
                <Text style={styles.daysAgo}>{scan.days_ago}d ago</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No recent scans</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 20,
    paddingBottom: 16,
  },
  statsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  section: {
    margin: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationScans: {
    fontSize: 14,
    color: '#64748b',
  },
  recentScanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  scanInfo: {
    flex: 1,
  },
  cropType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  diseaseText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  scanMeta: {
    alignItems: 'flex-end',
  },
  confidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  daysAgo: {
    fontSize: 12,
    color: '#94a3b8',
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
  noDataText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
  },
});
