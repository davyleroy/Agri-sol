import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useScanCountByLocation } from '../../hooks/useSupabaseRPC';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Rwanda coordinates and districts
const RWANDA_COORDINATES = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 1.5,
  longitudeDelta: 1.5,
};

const DISTRICT_COORDINATES = {
  'Kigali': { latitude: -1.9441, longitude: 30.0619 },
  'Huye': { latitude: -2.5967, longitude: 29.7389 },
  'Musanze': { latitude: -1.4998, longitude: 29.6344 },
  'Rubavu': { latitude: -1.6734, longitude: 29.3489 },
  'Rusizi': { latitude: -2.4608, longitude: 29.3267 },
  'Karongi': { latitude: -2.0744, longitude: 29.3497 },
  'Nyagatare': { latitude: -1.2976, longitude: 30.3216 },
  'Gatsibo': { latitude: -1.4300, longitude: 30.3500 },
  'Kayonza': { latitude: -1.7500, longitude: 30.5000 },
  'Rwamagana': { latitude: -1.9486, longitude: 30.4347 },
  'Bugesera': { latitude: -2.1667, longitude: 30.1667 },
  'Kirehe': { latitude: -2.5000, longitude: 30.5000 },
  'Ngoma': { latitude: -2.2500, longitude: 30.5000 },
  'Gisagara': { latitude: -2.5833, longitude: 29.8500 },
  'Nyanza': { latitude: -2.3500, longitude: 29.7500 },
  'Muhanga': { latitude: -2.0833, longitude: 29.7500 },
  'Kamonyi': { latitude: -2.0000, longitude: 29.9167 },
  'Ruhango': { latitude: -2.1667, longitude: 29.8333 },
  'Nyanza': { latitude: -2.3500, longitude: 29.7500 },
  'Huye': { latitude: -2.5967, longitude: 29.7389 },
  'Nyamagabe': { latitude: -2.5000, longitude: 29.5000 },
  'Gisagara': { latitude: -2.5833, longitude: 29.8500 },
  'Nyaruguru': { latitude: -2.7500, longitude: 29.5000 },
  'Muhanga': { latitude: -2.0833, longitude: 29.7500 },
  'Kamonyi': { latitude: -2.0000, longitude: 29.9167 },
  'Ruhango': { latitude: -2.1667, longitude: 29.8333 },
  'Nyanza': { latitude: -2.3500, longitude: 29.7500 },
  'Rusizi': { latitude: -2.4608, longitude: 29.3267 },
  'Nyamasheke': { latitude: -2.5000, longitude: 29.0000 },
  'Karongi': { latitude: -2.0744, longitude: 29.3497 },
  'Rubavu': { latitude: -1.6734, longitude: 29.3489 },
  'Rutsiro': { latitude: -1.7500, longitude: 29.2500 },
  'Nyabihu': { latitude: -1.5833, longitude: 29.5000 },
  'Ngororero': { latitude: -1.8333, longitude: 29.5000 },
  'Rusizi': { latitude: -2.4608, longitude: 29.3267 },
  'Nyamasheke': { latitude: -2.5000, longitude: 29.0000 },
  'Karongi': { latitude: -2.0744, longitude: 29.3497 },
  'Rubavu': { latitude: -1.6734, longitude: 29.3489 },
  'Rutsiro': { latitude: -1.7500, longitude: 29.2500 },
  'Nyabihu': { latitude: -1.5833, longitude: 29.5000 },
  'Ngororero': { latitude: -1.8333, longitude: 29.5000 },
};

interface MapMarker {
  id: string;
  coordinate: {
  latitude: number;
  longitude: number;
  };
  title: string;
  description: string;
  scanCount: number;
  healthyCount: number;
  diseasedCount: number;
  healthRate: number;
}

export default function InteractiveLocationMap() {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  
  const {
    data: locationData,
    loading,
    error,
    refetch,
  } = useScanCountByLocation();

  const markers: MapMarker[] = React.useMemo(() => {
    if (!locationData) return [];

    return locationData
      .filter((location) => {
        const coords = DISTRICT_COORDINATES[location.location_name as keyof typeof DISTRICT_COORDINATES];
        return coords && location.scan_count > 0;
      })
      .map((location) => {
        const coords = DISTRICT_COORDINATES[location.location_name as keyof typeof DISTRICT_COORDINATES];
        const healthRate = location.scan_count > 0 
          ? (location.healthy_count / location.scan_count) * 100 
          : 0;

        return {
          id: location.location_name,
          coordinate: coords!,
          title: location.location_name,
          description: `${location.scan_count} scans`,
          scanCount: location.scan_count,
          healthyCount: location.healthy_count,
          diseasedCount: location.disease_count,
          healthRate: healthRate,
        };
      });
  }, [locationData]);

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

  const handleMarkerPress = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  const handleCalloutPress = () => {
    if (selectedMarker) {
      Alert.alert(
        selectedMarker.title,
        `Total Scans: ${selectedMarker.scanCount}\n` +
        `Healthy: ${selectedMarker.healthyCount}\n` +
        `Diseased: ${selectedMarker.diseasedCount}\n` +
        `Health Rate: ${selectedMarker.healthRate.toFixed(1)}%`,
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading map: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rwanda Scan Map</Text>
        <View style={styles.controls}>
            <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'standard' && styles.activeButton]}
            onPress={() => setMapType('standard')}
            >
            <MaterialIcons name="map" size={20} color={mapType === 'standard' ? '#fff' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'satellite' && styles.activeButton]}
            onPress={() => setMapType('satellite')}
              >
            <MaterialIcons name="satellite" size={20} color={mapType === 'satellite' ? '#fff' : '#666'} />
            </TouchableOpacity>
        </View>
      </View>

      <MapView
        style={styles.map}
        initialRegion={RWANDA_COORDINATES}
        mapType={mapType}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {markers.map((marker) => (
              <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => handleMarkerPress(marker)}
              >
                <View
                  style={[
                styles.marker,
                    {
                  backgroundColor: getMarkerColor(marker.healthRate),
                  width: getMarkerSize(marker.scanCount),
                  height: getMarkerSize(marker.scanCount),
                },
                  ]}
            />
            <Callout onPress={handleCalloutPress}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                <Text style={styles.calloutText}>
                  {marker.scanCount} scans
                    </Text>
                <Text style={styles.calloutText}>
                  {marker.healthRate.toFixed(1)}% healthy
                    </Text>
                  </View>
                </Callout>
              </Marker>
        ))}
      </MapView>

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
            <Text style={styles.legendText}>Diseased (<60%)</Text>
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
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  mapTypeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  activeButton: {
    backgroundColor: '#22c55e',
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
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
