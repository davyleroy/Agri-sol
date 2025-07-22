import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import {
  useMapData,
  useMapAnalytics,
  useMapFilterOptions,
} from '../../hooks/useMapData';
import type {
  MapDataPoint,
  MapFilters,
  MapVisualizationMode,
} from '../../types/map';

const { width, height } = Dimensions.get('window');

// Rwanda coordinates
const RWANDA_COORDINATES = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 1.5,
  longitudeDelta: 1.5,
};

interface AdminMapDashboardProps {
  onMarkerPress?: (data: MapDataPoint) => void;
  onExport?: () => void;
}

export default function AdminMapDashboard({
  onMarkerPress,
  onExport,
}: AdminMapDashboardProps) {
  // State management
  const [filters, setFilters] = useState<MapFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    },
    diseases: [],
    crops: [],
    healthThreshold: [0, 100],
    districts: [],
    userTypes: ['all'],
  });

  const [visualizationMode, setVisualizationMode] =
    useState<MapVisualizationMode>({
      type: 'clusters',
      metric: 'scanCount',
      style: 'default',
    });

  const [selectedMarker, setSelectedMarker] = useState<MapDataPoint | null>(
    null,
  );
  const [mapRegion, setMapRegion] = useState<Region>(RWANDA_COORDINATES);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const mapRef = useRef<MapView>(null);

  // Data hooks
  const {
    data: mapData,
    loading: mapLoading,
    error: mapError,
    refetch: refetchMap,
  } = useMapData(filters);
  const { analytics, loading: analyticsLoading } = useMapAnalytics(filters);
  const { options: filterOptions } = useMapFilterOptions();

  // Memoized computed values
  const clusteredData = useMemo(() => {
    if (visualizationMode.type !== 'clusters') return mapData;

    // Simple clustering based on zoom level
    const zoomLevel = getZoomLevel(mapRegion.latitudeDelta);
    if (zoomLevel > 10) return mapData; // Show individual markers when zoomed in

    // Group nearby markers
    const clusters: MapDataPoint[][] = [];
    const clusterRadius = 0.1; // Degrees

    mapData.forEach((point) => {
      let addedToCluster = false;

      for (const cluster of clusters) {
        const clusterCenter = getClusterCenter(cluster);
        const distance = getDistance(point.location, clusterCenter);

        if (distance < clusterRadius) {
          cluster.push(point);
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        clusters.push([point]);
      }
    });

    return clusters.map((cluster, index) => {
      const center = getClusterCenter(cluster);
      const firstPoint = cluster[0];
      return {
        id: `cluster-${index}`,
        location: {
          name: `${cluster.length} locations`,
          latitude: center.latitude,
          longitude: center.longitude,
          district: firstPoint.location.district,
          province: firstPoint.location.province,
        },
        metrics: aggregateClusterMetrics(cluster),
        diseases: aggregateClusterDiseases(cluster),
        users: aggregateClusterUsers(cluster),
      };
    });
  }, [mapData, visualizationMode.type, mapRegion]);

  // Event handlers
  const handleMarkerPress = useCallback(
    (data: MapDataPoint) => {
      setSelectedMarker(data);
      onMarkerPress?.(data);
    },
    [onMarkerPress],
  );

  const handleMapRegionChange = useCallback((region: Region) => {
    setMapRegion(region);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<MapFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleVisualizationModeChange = useCallback(
    (mode: MapVisualizationMode) => {
      setVisualizationMode(mode);
    },
    [],
  );

  const handleRefresh = useCallback(async () => {
    await refetchMap();
  }, [refetchMap]);

  const handleExport = useCallback(() => {
    Alert.alert('Export Data', 'Choose export format:', [
      { text: 'CSV', onPress: () => exportToCSV() },
      { text: 'PDF', onPress: () => exportToPDF() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  // Utility functions
  const getZoomLevel = (latitudeDelta: number) => {
    return Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
  };

  const getClusterCenter = (cluster: MapDataPoint[]) => {
    const avgLat =
      cluster.reduce((sum, p) => sum + p.location.latitude, 0) / cluster.length;
    const avgLng =
      cluster.reduce((sum, p) => sum + p.location.longitude, 0) /
      cluster.length;
    return { latitude: avgLat, longitude: avgLng };
  };

  const getDistance = (point1: any, point2: any) => {
    const latDiff = point1.latitude - point2.latitude;
    const lngDiff = point1.longitude - point2.longitude;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  };

  const aggregateClusterMetrics = (cluster: MapDataPoint[]) => {
    const totalScans = cluster.reduce(
      (sum, p) => sum + p.metrics.totalScans,
      0,
    );
    const healthyScans = cluster.reduce(
      (sum, p) => sum + p.metrics.healthyScans,
      0,
    );
    const diseasedScans = cluster.reduce(
      (sum, p) => sum + p.metrics.diseasedScans,
      0,
    );

    return {
      totalScans,
      healthyScans,
      diseasedScans,
      healthRate: totalScans > 0 ? (healthyScans / totalScans) * 100 : 0,
      lastScanAt: new Date(),
    };
  };

  const aggregateClusterDiseases = (cluster: MapDataPoint[]) => {
    const diseaseMap = new Map<string, number>();

    cluster.forEach((point) => {
      point.diseases.forEach((disease) => {
        diseaseMap.set(
          disease.name,
          (diseaseMap.get(disease.name) || 0) + disease.count,
        );
      });
    });

    return Array.from(diseaseMap.entries()).map(([name, count]) => ({
      name,
      count,
      severity: (count <= 2 ? 'low' : count <= 5 ? 'medium' : 'high') as
        | 'low'
        | 'medium'
        | 'high',
    }));
  };

  const aggregateClusterUsers = (cluster: MapDataPoint[]) => {
    const activeCount = cluster.reduce(
      (sum, p) => sum + p.users.activeCount,
      0,
    );
    const totalCount = cluster.reduce((sum, p) => sum + p.users.totalCount, 0);

    return { activeCount, totalCount };
  };

  const getMarkerColor = (healthRate: number) => {
    if (healthRate >= 80) return '#22c55e'; // Green - Healthy
    if (healthRate >= 60) return '#f59e0b'; // Yellow - Moderate
    return '#ef4444'; // Red - Diseased
  };

  const getMarkerSize = (scanCount: number) => {
    if (scanCount >= 10) return 25;
    if (scanCount >= 5) return 20;
    return 15;
  };

  const exportToCSV = () => {
    // Implement CSV export
    Alert.alert('Export', 'CSV export functionality will be implemented');
  };

  const exportToPDF = () => {
    // Implement PDF export
    Alert.alert('Export', 'PDF export functionality will be implemented');
  };

  // Loading state
  if (mapLoading && !mapData.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading map data...</Text>
      </View>
    );
  }

  // Error state
  if (mapError) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load map data</Text>
        <Text style={styles.errorSubtext}>{mapError.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rwanda Crop Health Map</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.iconButton} onPress={handleRefresh}>
            <MaterialIcons name="refresh" size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleExport}>
            <MaterialIcons name="file-download" size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsFullscreen(!isFullscreen)}
          >
            <MaterialIcons
              name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={RWANDA_COORDINATES}
        onRegionChangeComplete={handleMapRegionChange}
        mapType="standard"
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {clusteredData.map((point) => (
          <Marker
            key={point.id}
            coordinate={point.location}
            onPress={() => handleMarkerPress(point)}
          >
            <View
              style={[
                styles.marker,
                {
                  backgroundColor: getMarkerColor(point.metrics.healthRate),
                  width: getMarkerSize(point.metrics.totalScans),
                  height: getMarkerSize(point.metrics.totalScans),
                },
              ]}
            />
            <Callout onPress={() => handleMarkerPress(point)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{point.location.name}</Text>
                <Text style={styles.calloutText}>
                  {point.metrics.totalScans} scans
                </Text>
                <Text style={styles.calloutText}>
                  {point.metrics.healthRate.toFixed(1)}% healthy
                </Text>
                {point.diseases.length > 0 && (
                  <Text style={styles.calloutText}>
                    Top disease: {point.diseases[0].name}
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Analytics Panel */}
      {!isFullscreen && (
        <View style={styles.analyticsPanel}>
          <Text style={styles.panelTitle}>Live Analytics</Text>
          {analyticsLoading ? (
            <ActivityIndicator size="small" color="#22c55e" />
          ) : (
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {analytics?.totalScans || 0}
                </Text>
                <Text style={styles.analyticsLabel}>Total Scans</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {analytics?.activeUsers || 0}
                </Text>
                <Text style={styles.analyticsLabel}>Active Users</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {analytics?.healthRate?.toFixed(1) || 0}%
                </Text>
                <Text style={styles.analyticsLabel}>Health Rate</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {analytics?.diseaseRate?.toFixed(1) || 0}%
                </Text>
                <Text style={styles.analyticsLabel}>Disease Rate</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Health Status</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.legendText}>Healthy (≥80%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Moderate (60-79%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Diseased (&lt;60%)</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  map: {
    flex: 1,
  },
  marker: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  callout: {
    width: 150,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: '#6b7280',
  },
  analyticsPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    alignItems: 'center',
    flex: 1,
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  legend: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
