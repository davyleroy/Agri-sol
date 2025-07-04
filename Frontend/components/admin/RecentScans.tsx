import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Clock,
  MapPin,
  Leaf,
  AlertTriangle,
  Eye,
  Filter,
  Calendar,
} from 'lucide-react-native';

interface ScanData {
  id: string;
  user_id: string;
  crop_type: string;
  disease_detected: string;
  scan_date: string;
  confidence_score: number;
  location?: string;
  image_url?: string;
}

interface RecentScansProps {
  scans: ScanData[];
}

export default function RecentScans({ scans }: RecentScansProps) {
  const [filter, setFilter] = useState<'all' | 'healthy' | 'disease'>('all');

  // Mock data if scans are empty
  const mockScans = [
    {
      id: '1',
      user_id: 'user1',
      crop_type: 'Tomato',
      disease_detected: 'Late Blight',
      scan_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      confidence_score: 0.87,
      location: 'Kigali, Rwanda',
      image_url:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      user_id: 'user2',
      crop_type: 'Beans',
      disease_detected: 'Healthy',
      scan_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      confidence_score: 0.92,
      location: 'Musanze, Rwanda',
      image_url:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      user_id: 'user3',
      crop_type: 'Potato',
      disease_detected: 'Early Blight',
      scan_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      confidence_score: 0.78,
      location: 'Huye, Rwanda',
      image_url:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '4',
      user_id: 'user4',
      crop_type: 'Maize',
      disease_detected: 'Healthy',
      scan_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      confidence_score: 0.89,
      location: 'Nyagatare, Rwanda',
      image_url:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '5',
      user_id: 'user5',
      crop_type: 'Tomato',
      disease_detected: 'Bacterial Wilt',
      scan_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      confidence_score: 0.83,
      location: 'Rubavu, Rwanda',
      image_url:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const displayScans = scans.length > 0 ? scans : mockScans;

  const filteredScans = displayScans.filter((scan) => {
    if (filter === 'all') return true;
    if (filter === 'healthy')
      return (
        scan.disease_detected === 'Healthy' ||
        scan.disease_detected === 'No Disease'
      );
    if (filter === 'disease')
      return (
        scan.disease_detected !== 'Healthy' &&
        scan.disease_detected !== 'No Disease'
      );
    return true;
  });

  const filterOptions = [
    { id: 'all', label: 'All Scans', count: displayScans.length },
    {
      id: 'healthy',
      label: 'Healthy',
      count: displayScans.filter(
        (s) =>
          s.disease_detected === 'Healthy' ||
          s.disease_detected === 'No Disease',
      ).length,
    },
    {
      id: 'disease',
      label: 'Disease',
      count: displayScans.filter(
        (s) =>
          s.disease_detected !== 'Healthy' &&
          s.disease_detected !== 'No Disease',
      ).length,
    },
  ];

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const scanDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - scanDate.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const getStatusColor = (disease: string) => {
    if (disease === 'Healthy' || disease === 'No Disease') return '#10b981';
    return '#dc2626';
  };

  const getStatusIcon = (disease: string) => {
    if (disease === 'Healthy' || disease === 'No Disease') {
      return <Leaf size={16} color="#10b981" strokeWidth={2} />;
    }
    return <AlertTriangle size={16} color="#dc2626" strokeWidth={2} />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.6) return '#f59e0b';
    return '#dc2626';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Clock size={20} color="#1f2937" strokeWidth={2} />
          <Text style={styles.headerTitle}>Recent Scans</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={16} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterTab,
              filter === option.id && styles.activeFilterTab,
            ]}
            onPress={() => setFilter(option.id as any)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === option.id && styles.activeFilterTabText,
              ]}
            >
              {option.label}
            </Text>
            <View
              style={[
                styles.filterCount,
                filter === option.id && styles.activeFilterCount,
              ]}
            >
              <Text
                style={[
                  styles.filterCountText,
                  filter === option.id && styles.activeFilterCountText,
                ]}
              >
                {option.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scans List */}
      <ScrollView style={styles.scansList} showsVerticalScrollIndicator={false}>
        {filteredScans.map((scan) => (
          <View key={scan.id} style={styles.scanCard}>
            <View style={styles.scanHeader}>
              <View style={styles.scanImage}>
                <Image
                  source={{
                    uri: scan.image_url || 'https://via.placeholder.com/60x60',
                  }}
                  style={styles.cropImage}
                />
                <View style={styles.cropTypeOverlay}>
                  <Text style={styles.cropTypeText}>{scan.crop_type}</Text>
                </View>
              </View>

              <View style={styles.scanInfo}>
                <View style={styles.scanTitle}>
                  <Text style={styles.scanDisease}>
                    {scan.disease_detected}
                  </Text>
                  {getStatusIcon(scan.disease_detected)}
                </View>
                <View style={styles.scanMeta}>
                  <MapPin size={12} color="#6b7280" strokeWidth={2} />
                  <Text style={styles.scanLocation}>
                    {scan.location || 'Unknown Location'}
                  </Text>
                </View>
                <View style={styles.scanDetails}>
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>Confidence:</Text>
                    <View
                      style={[
                        styles.confidenceBadge,
                        {
                          backgroundColor: getConfidenceColor(
                            scan.confidence_score,
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.confidenceText}>
                        {Math.round(scan.confidence_score * 100)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.scanTime}>
                    {getTimeAgo(scan.scan_date)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.viewButton}>
                <Eye size={16} color="#059669" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredScans.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#d1d5db" strokeWidth={1} />
            <Text style={styles.emptyStateText}>No scans found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'all'
                ? 'No scans have been recorded yet'
                : `No ${filter} scans found`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Summary Footer */}
      <View style={styles.summaryFooter}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{filteredScans.length}</Text>
          <Text style={styles.summaryLabel}>Total Scans</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {Math.round(
              (filteredScans.reduce(
                (sum, scan) => sum + scan.confidence_score,
                0,
              ) /
                filteredScans.length) *
                100,
            ) || 0}
            %
          </Text>
          <Text style={styles.summaryLabel}>Avg Confidence</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {
              filteredScans.filter(
                (scan) =>
                  scan.disease_detected === 'Healthy' ||
                  scan.disease_detected === 'No Disease',
              ).length
            }
          </Text>
          <Text style={styles.summaryLabel}>Healthy</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  activeFilterTab: {
    backgroundColor: '#059669',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  filterCount: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  activeFilterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  activeFilterCountText: {
    color: '#ffffff',
  },
  scansList: {
    maxHeight: 400,
  },
  scanCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanImage: {
    position: 'relative',
  },
  cropImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  cropTypeOverlay: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    backgroundColor: '#059669',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cropTypeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  scanInfo: {
    flex: 1,
  },
  scanTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  scanDisease: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  scanLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  scanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  confidenceBadge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scanTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
