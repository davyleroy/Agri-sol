import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
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
import LeafletMap from './LeafletMap';
import HeatZoneSlider from './HeatZoneSlider';

// Free Leaflet map component - no API key required!
const WebMap = ({
  data,
  onMarkerClick,
  selectedMarker,
  heatZoneIntensity,
  showHeatZones,
  fullWidth,
}: {
  data: MapDataPoint[];
  onMarkerClick: (point: MapDataPoint) => void;
  selectedMarker: MapDataPoint | null;
  heatZoneIntensity: number;
  showHeatZones: boolean;
  fullWidth: boolean;
}) => {
  return (
    <LeafletMap
      data={data}
      onMarkerClick={onMarkerClick}
      selectedMarker={selectedMarker}
      heatZoneIntensity={heatZoneIntensity}
      showHeatZones={showHeatZones}
      fullWidth={fullWidth}
    />
  );
};

interface AdminMapDashboardWebProps {
  onMarkerPress?: (data: MapDataPoint) => void;
  onExport?: () => void;
}

export default function AdminMapDashboardWeb({
  onMarkerPress,
  onExport,
}: AdminMapDashboardWebProps) {
  const { width, height } = Dimensions.get('window');
  const isTablet = width > 768;
  const isLandscape = width > height;
  const isMobile = width < 768;

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showHeatZones, setShowHeatZones] = useState(true);
  const [heatZoneIntensity, setHeatZoneIntensity] = useState(50);
  const [isExpanded, setIsExpanded] = useState(false);

  // Data hooks
  const {
    data: mapData,
    loading: mapLoading,
    error: mapError,
    refetch: refetchMap,
  } = useMapData(filters);
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useMapAnalytics(filters);
  const { options: filterOptions, error: filterError } = useMapFilterOptions();

  // Event handlers
  const handleMarkerPress = useCallback(
    (data: MapDataPoint) => {
      setSelectedMarker(data);
      onMarkerPress?.(data);
    },
    [onMarkerPress],
  );

  const handleRefresh = useCallback(() => {
    refetchMap();
  }, [refetchMap]);

  const handleExport = useCallback(() => {
    onExport?.();
  }, [onExport]);

  const handleExpandToggle = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Utility functions
  const getMarkerColor = (healthRate: number) => {
    if (healthRate >= 80) return '#22c55e';
    if (healthRate >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const exportToCSV = () => {
    // CSV export implementation
    Alert.alert('Export', 'CSV export functionality coming soon!');
  };

  const exportToPDF = () => {
    // PDF export implementation
    Alert.alert('Export', 'PDF export functionality coming soon!');
  };

  // Loading state
  if (mapLoading) {
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
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      {/* Header */}
      <View style={[styles.header, isTablet && styles.tabletHeader]}>
        <Text style={[styles.title, isTablet && styles.tabletTitle]}>
          Rwanda Crop Health Dashboard
        </Text>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowMap(!showMap)}
          >
            <MaterialIcons
              name={showMap ? 'list' : 'map'}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleRefresh}>
            <MaterialIcons name="refresh" size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleExport}>
            <MaterialIcons name="file-download" size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleExpandToggle}
          >
            <MaterialIcons
              name={isExpanded ? 'fullscreen-exit' : 'fullscreen'}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Heat Zone Controls */}
      {showMap && (
        <View
          style={[
            styles.heatZoneControls,
            isTablet && styles.tabletHeatControls,
          ]}
        >
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                showHeatZones && styles.controlButtonActive,
              ]}
              onPress={() => setShowHeatZones(!showHeatZones)}
            >
              <MaterialIcons
                name="whatshot"
                size={16}
                color={showHeatZones ? '#ffffff' : '#6b7280'}
              />
              <Text
                style={[
                  styles.controlButtonText,
                  showHeatZones && styles.controlButtonTextActive,
                ]}
              >
                Heat Zones
              </Text>
            </TouchableOpacity>

            {showHeatZones && (
              <HeatZoneSlider
                value={heatZoneIntensity}
                onValueChange={setHeatZoneIntensity}
                min={0}
                max={100}
                step={5}
              />
            )}
          </View>
        </View>
      )}

      {/* Map or Data Grid */}
      {showMap ? (
        <View
          style={[
            styles.mapContainer,
            isTablet && styles.tabletMapContainer,
            isExpanded && styles.expandedMapContainer,
            isMobile && styles.mobileMapContainer,
          ]}
        >
          {/* Shrink Button - Only show when expanded */}
          {isExpanded && (
            <TouchableOpacity
              style={styles.shrinkButton}
              onPress={handleExpandToggle}
            >
              <MaterialIcons name="fullscreen-exit" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}

          {mapError ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={48} color="#dc2626" />
              <Text style={styles.errorTitle}>Failed to load map data</Text>
              <Text style={styles.errorMessage}>
                Location data error: Could not find the function
                public.get_scan_count_by_location without parameters in the
                schema cache.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetchMap()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : Platform.OS === 'web' ? (
            <WebMap
              data={mapData}
              onMarkerClick={handleMarkerPress}
              selectedMarker={selectedMarker}
              heatZoneIntensity={heatZoneIntensity}
              showHeatZones={showHeatZones}
              fullWidth={isExpanded}
            />
          ) : (
            <View style={styles.mapPlaceholder}>
              <MaterialIcons name="map" size={64} color="#6b7280" />
              <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
              <Text style={styles.mapPlaceholderSubtext}>
                Map view requires mobile app or native build
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView style={styles.dataGrid}>
          <Text style={styles.sectionTitle}>Location Data</Text>
          {mapData.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={[
                styles.dataCard,
                { borderLeftColor: getMarkerColor(point.metrics.healthRate) },
                selectedMarker?.id === point.id && styles.selectedCard,
              ]}
              onPress={() => handleMarkerPress(point)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.locationName}>{point.location.name}</Text>
                <View
                  style={[
                    styles.healthIndicator,
                    {
                      backgroundColor: getMarkerColor(point.metrics.healthRate),
                    },
                  ]}
                />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Total Scans:</Text>
                  <Text style={styles.metricValue}>
                    {point.metrics.totalScans}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Health Rate:</Text>
                  <Text style={styles.metricValue}>
                    {point.metrics.healthRate.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Diseased Scans:</Text>
                  <Text style={styles.metricValue}>
                    {point.metrics.diseasedScans}
                  </Text>
                </View>
                {point.diseases.length > 0 && (
                  <View style={styles.diseasesContainer}>
                    <Text style={styles.diseasesTitle}>Top Diseases:</Text>
                    {point.diseases.slice(0, 3).map((disease, index) => (
                      <Text key={index} style={styles.diseaseText}>
                        • {disease.name} ({disease.count} cases)
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Analytics Panel */}
      {!isExpanded && (
        <View
          style={[styles.analyticsPanel, isTablet && styles.tabletAnalytics]}
        >
          <Text style={styles.panelTitle}>Live Analytics</Text>
          {analyticsLoading ? (
            <ActivityIndicator size="small" color="#22c55e" />
          ) : (
            <View
              style={[
                styles.analyticsGrid,
                isTablet && styles.tabletAnalyticsGrid,
              ]}
            >
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
                  {analytics?.healthRate?.toFixed(1) || '0.0'}%
                </Text>
                <Text style={styles.analyticsLabel}>Health Rate</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {analytics?.diseaseRate?.toFixed(1) || '0.0'}%
                </Text>
                <Text style={styles.analyticsLabel}>Disease Rate</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Legend */}
      {!isExpanded && (
        <View style={[styles.legend, isTablet && styles.tabletLegend]}>
          <Text style={styles.legendTitle}>Health Status Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#22c55e' }]}
              />
              <Text style={styles.legendText}>Healthy (≥80%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#f59e0b' }]}
              />
              <Text style={styles.legendText}>Moderate (60-79%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#ef4444' }]}
              />
              <Text style={styles.legendText}>Diseased (&lt;60%)</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    width: '100%',
    minHeight: Platform.OS === 'web' ? 1200 : '100%', // Much taller for web
    height: Platform.OS === 'web' ? 'auto' : '100%',
  },
  tabletContainer: {
    maxWidth: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabletHeader: {
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabletTitle: {
    fontSize: 24,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  heatZoneControls: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabletHeatControls: {
    paddingHorizontal: 40,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  controlButtonActive: {
    backgroundColor: '#22c55e',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  controlButtonTextActive: {
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    minHeight: 600, // Increased minimum height
    height: Platform.OS === 'web' ? 800 : '100%', // Much larger for web
  },
  tabletMapContainer: {
    margin: 40,
    height: 800, // Increased from 600
    minHeight: 700,
  },
  expandedMapContainer: {
    margin: 0,
    borderRadius: 0,
    flex: 1,
    position: 'relative',
    height: '100vh', // Full viewport height when expanded
    minHeight: 900,
  },
  mobileMapContainer: {
    margin: 10,
    borderRadius: 8,
    minHeight: 500, // Increased for mobile too
    height: Platform.OS === 'web' ? 600 : '100%',
  },
  shrinkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  dataGrid: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  dataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardContent: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  diseasesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  diseasesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  diseaseText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  analyticsPanel: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tabletAnalytics: {
    paddingHorizontal: 40,
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
  tabletAnalyticsGrid: {
    justifyContent: 'space-around',
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
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tabletLegend: {
    paddingHorizontal: 40,
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
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
