import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Supercluster from 'supercluster';
import {
  MapPin,
  Eye,
  Activity,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  Layers,
} from 'lucide-react-native';
import { adminService } from '../../services/adminService';
import { LocationAnalyticsData } from '../../services/locationTrackingService';

const { width, height } = Dimensions.get('window');

interface LocationWithCoordinates extends LocationAnalyticsData {
  latitude: number;
  longitude: number;
}

interface ClusterFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: LocationWithCoordinates & {
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
  };
}

type ViewMode = 'scans' | 'health' | 'risk';

interface InteractiveLocationMapProps {
  onLocationSelect?: (location: LocationWithCoordinates) => void;
  selectedLocation?: LocationWithCoordinates | null;
  height?: number;
}

const RWANDA_BOUNDS = {
  latitude: -1.9403,
  longitude: 29.8739,
  latitudeDelta: 2.5,
  longitudeDelta: 2.5,
};

const CACHE_KEY = 'location_map_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function InteractiveLocationMap({
  onLocationSelect,
  selectedLocation,
  height = 400,
}: InteractiveLocationMapProps) {
  const [locations, setLocations] = useState<LocationWithCoordinates[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('scans');
  const [zoom, setZoom] = useState(10);
  const [clusteredPoints, setClusteredPoints] = useState<ClusterFeature[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);
  const superclusterRef = useRef<Supercluster | null>(null);

  // Initialize supercluster
  useEffect(() => {
    superclusterRef.current = new Supercluster({
      radius: 40,
      maxZoom: 16,
      minZoom: 3,
      extent: 512,
      nodeSize: 64,
    });
  }, []);

  // Load cached data or fetch from API
  const loadLocationData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      if (!forceRefresh) {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            const locationsWithCoords = await addCoordinatesToLocations(data);
            setLocations(locationsWithCoords);
            updateClusters(locationsWithCoords);
            setLoading(false);
            return;
          }
        }
      }

      // Fetch fresh data from API
      console.log('📍 Fetching fresh location data...');
      const result = await adminService.getLocationLeaderboard(
        'total_scans',
        100,
      );

      if (result.success) {
        const locationsWithCoords = await addCoordinatesToLocations(
          result.data,
        );
        setLocations(locationsWithCoords);
        updateClusters(locationsWithCoords);

        // Cache the data
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: result.data,
            timestamp: Date.now(),
          }),
        );

        console.log(
          `✅ Loaded ${locationsWithCoords.length} locations with coordinates`,
        );
      } else {
        setError(result.error || 'Failed to load location data');
        console.error('❌ Error loading locations:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Error loading location data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add coordinates to locations (mock implementation for demo)
  const addCoordinatesToLocations = async (
    locations: LocationAnalyticsData[],
  ): Promise<LocationWithCoordinates[]> => {
    const coordinateMap = getRwandaCoordinates();

    return locations.map((location) => ({
      ...location,
      latitude:
        coordinateMap[location.location_string]?.latitude ||
        RWANDA_BOUNDS.latitude + (Math.random() - 0.5) * 0.5,
      longitude:
        coordinateMap[location.location_string]?.longitude ||
        RWANDA_BOUNDS.longitude + (Math.random() - 0.5) * 0.5,
    }));
  };

  // Update clusters based on current zoom and locations
  const updateClusters = (locationData: LocationWithCoordinates[]) => {
    if (!superclusterRef.current) return;

    const features: ClusterFeature[] = locationData.map((location) => ({
      geometry: {
        coordinates: [location.longitude, location.latitude],
      },
      properties: location,
    }));

    superclusterRef.current.load(features);

    const bounds = [
      RWANDA_BOUNDS.longitude - RWANDA_BOUNDS.longitudeDelta / 2,
      RWANDA_BOUNDS.latitude - RWANDA_BOUNDS.latitudeDelta / 2,
      RWANDA_BOUNDS.longitude + RWANDA_BOUNDS.longitudeDelta / 2,
      RWANDA_BOUNDS.latitude + RWANDA_BOUNDS.latitudeDelta / 2,
    ];

    const clusters = superclusterRef.current.getClusters(bounds, zoom);
    setClusteredPoints(clusters);
  };

  // Handle region change for clustering
  const handleRegionChange = (region: any) => {
    const newZoom = Math.round(
      Math.log(360 / region.longitudeDelta) / Math.LN2,
    );
    setZoom(newZoom);

    if (superclusterRef.current && locations.length > 0) {
      const bounds = [
        region.longitude - region.longitudeDelta / 2,
        region.latitude - region.latitudeDelta / 2,
        region.longitude + region.longitudeDelta / 2,
        region.latitude + region.latitudeDelta / 2,
      ];

      const clusters = superclusterRef.current.getClusters(bounds, newZoom);
      setClusteredPoints(clusters);
    }
  };

  // Handle cluster tap
  const handleClusterPress = (cluster: ClusterFeature) => {
    if (cluster.properties.cluster && superclusterRef.current) {
      const children = superclusterRef.current.getChildren(
        cluster.properties.cluster_id!,
      );
      const bounds = children.reduce(
        (acc, child) => {
          const [lng, lat] = child.geometry.coordinates;
          return [
            Math.min(acc[0], lng),
            Math.min(acc[1], lat),
            Math.max(acc[2], lng),
            Math.max(acc[3], lat),
          ];
        },
        [Infinity, Infinity, -Infinity, -Infinity],
      );

      const padding = 0.01;
      mapRef.current?.fitToCoordinates(
        children.map((child) => ({
          latitude: child.geometry.coordinates[1],
          longitude: child.geometry.coordinates[0],
        })),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        },
      );
    }
  };

  // Get marker color based on view mode
  const getMarkerColor = (location: LocationWithCoordinates): string => {
    switch (viewMode) {
      case 'scans':
        return location.total_scans > 50
          ? '#dc2626'
          : location.total_scans > 20
            ? '#f59e0b'
            : '#10b981';
      case 'health':
        return location.healthy_percentage > 80
          ? '#10b981'
          : location.healthy_percentage > 60
            ? '#f59e0b'
            : '#dc2626';
      case 'risk':
        const riskScore = (location.disease_scans / location.total_scans) * 100;
        return riskScore > 30
          ? '#dc2626'
          : riskScore > 15
            ? '#f59e0b'
            : '#10b981';
      default:
        return '#6b7280';
    }
  };

  // Get marker size based on total scans
  const getMarkerSize = (location: LocationWithCoordinates): number => {
    if (location.total_scans > 100) return 16;
    if (location.total_scans > 50) return 12;
    if (location.total_scans > 20) return 8;
    return 6;
  };

  // Initialize data loading
  useEffect(() => {
    loadLocationData();
  }, []);

  // Update clusters when locations change
  useEffect(() => {
    if (locations.length > 0) {
      updateClusters(locations);
    }
  }, [locations, zoom]);

  const viewModeButtons = [
    { mode: 'scans' as ViewMode, label: 'Total Scans', icon: Eye },
    { mode: 'health' as ViewMode, label: 'Health Status', icon: Activity },
    { mode: 'risk' as ViewMode, label: 'Disease Risk', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { height }, styles.centerContent]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading location data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { height }, styles.centerContent]}>
        <AlertTriangle size={48} color="#dc2626" strokeWidth={2} />
        <Text style={styles.errorText}>Failed to load map</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadLocationData(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {/* View Mode Selector */}
      <View style={styles.controlsContainer}>
        <View style={styles.viewModeContainer}>
          {viewModeButtons.map(({ mode, label, icon: Icon }) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewModeButton,
                viewMode === mode && styles.activeViewModeButton,
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Icon
                size={14}
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

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadLocationData(true)}
        >
          <RefreshCw size={16} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={RWANDA_BOUNDS}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={false}
        showsCompass={true}
        showsScale={true}
        toolbarEnabled={false}
      >
        {clusteredPoints.map((point, index) => {
          const [longitude, latitude] = point.geometry.coordinates;

          if (point.properties.cluster) {
            // Render cluster marker
            return (
              <Marker
                key={`cluster-${index}`}
                coordinate={{ latitude, longitude }}
                onPress={() => handleClusterPress(point)}
              >
                <View
                  style={[styles.clusterMarker, { backgroundColor: '#059669' }]}
                >
                  <Text style={styles.clusterText}>
                    {point.properties.point_count}
                  </Text>
                </View>
              </Marker>
            );
          } else {
            // Render individual location marker
            const location = point.properties;
            return (
              <Marker
                key={`location-${index}`}
                coordinate={{ latitude, longitude }}
                onPress={() => onLocationSelect?.(location)}
              >
                <View
                  style={[
                    styles.locationMarker,
                    {
                      backgroundColor: getMarkerColor(location),
                      width: getMarkerSize(location) + 8,
                      height: getMarkerSize(location) + 8,
                    },
                    selectedLocation?.location_string ===
                      location.location_string && styles.selectedMarker,
                  ]}
                >
                  <MapPin
                    size={getMarkerSize(location)}
                    color="#ffffff"
                    strokeWidth={2}
                  />
                </View>

                <Callout style={styles.callout}>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>
                      {location.location_string}
                    </Text>
                    <Text style={styles.calloutSubtitle}>
                      {location.total_scans} scans • {location.total_users}{' '}
                      users
                    </Text>
                    <Text style={styles.calloutHealth}>
                      {location.healthy_percentage}% healthy
                    </Text>
                  </View>
                </Callout>
              </Marker>
            );
          }
        })}
      </MapView>

      {/* Map Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>
            {viewMode === 'scans'
              ? 'Low Activity'
              : viewMode === 'health'
                ? 'Healthy'
                : 'Low Risk'}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>
            {viewMode === 'scans'
              ? 'Medium Activity'
              : viewMode === 'health'
                ? 'Mixed Health'
                : 'Medium Risk'}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#dc2626' }]} />
          <Text style={styles.legendText}>
            {viewMode === 'scans'
              ? 'High Activity'
              : viewMode === 'health'
                ? 'Needs Attention'
                : 'High Risk'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Mock coordinate data for Rwanda locations
const getRwandaCoordinates = () => ({
  'Kigali, Rwanda': { latitude: -1.9706, longitude: 30.1044 },
  'Musanze, Northern Province, Rwanda': {
    latitude: -1.4969,
    longitude: 29.6357,
  },
  'Huye, Southern Province, Rwanda': { latitude: -2.5963, longitude: 29.7392 },
  'Rubavu, Western Province, Rwanda': { latitude: -1.6792, longitude: 29.2692 },
  'Rwamagana, Eastern Province, Rwanda': {
    latitude: -1.9486,
    longitude: 30.4348,
  },
  'Nyagatare, Eastern Province, Rwanda': {
    latitude: -1.2919,
    longitude: 30.3314,
  },
  'Karongi, Western Province, Rwanda': {
    latitude: -1.9544,
    longitude: 29.3953,
  },
  'Gatsibo, Eastern Province, Rwanda': {
    latitude: -1.5831,
    longitude: 30.4275,
  },
  'Gicumbi, Northern Province, Rwanda': {
    latitude: -1.7053,
    longitude: 30.1156,
  },
  'Muhanga, Southern Province, Rwanda': {
    latitude: -2.0853,
    longitude: 29.7447,
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  activeViewModeButton: {
    backgroundColor: '#059669',
  },
  viewModeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeViewModeText: {
    color: '#ffffff',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  map: {
    flex: 1,
  },
  clusterMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  clusterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationMarker: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedMarker: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  callout: {
    minWidth: 150,
  },
  calloutContent: {
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  calloutHealth: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
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
});
