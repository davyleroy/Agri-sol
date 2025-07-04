import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  MapPin,
  Thermometer,
  AlertTriangle,
  Leaf,
  TrendingUp,
  Info,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface LocationData {
  location: string;
  count: number;
  healthyCount: number;
  diseaseCount: number;
  coordinates: { lat: number; lng: number };
}

interface RwandaMapProps {
  data: LocationData[];
}

export default function RwandaMap({ data }: RwandaMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [heatmapMode, setHeatmapMode] = useState<
    'scans' | 'health' | 'disease'
  >('scans');

  const getLocationColor = (location: LocationData) => {
    const total = location.count;
    const healthy = location.healthyCount;
    const diseased = location.diseaseCount;

    if (total === 0) return '#e5e7eb';

    switch (heatmapMode) {
      case 'scans':
        // Green to red based on total scans
        const maxScans = Math.max(...data.map((d) => d.count));
        const intensity = total / maxScans;
        if (intensity > 0.8) return '#dc2626';
        if (intensity > 0.6) return '#f59e0b';
        if (intensity > 0.4) return '#eab308';
        if (intensity > 0.2) return '#84cc16';
        return '#10b981';

      case 'health':
        // Green for healthy, red for diseased
        const healthRatio = healthy / total;
        if (healthRatio > 0.8) return '#10b981';
        if (healthRatio > 0.6) return '#84cc16';
        if (healthRatio > 0.4) return '#eab308';
        if (healthRatio > 0.2) return '#f59e0b';
        return '#dc2626';

      case 'disease':
        // Red zones for high disease concentration
        const diseaseRatio = diseased / total;
        if (diseaseRatio > 0.8) return '#dc2626';
        if (diseaseRatio > 0.6) return '#f59e0b';
        if (diseaseRatio > 0.4) return '#eab308';
        if (diseaseRatio > 0.2) return '#84cc16';
        return '#10b981';

      default:
        return '#10b981';
    }
  };

  const getLocationSize = (location: LocationData) => {
    const maxScans = Math.max(...data.map((d) => d.count));
    const minSize = 20;
    const maxSize = 50;
    return minSize + (location.count / maxScans) * (maxSize - minSize);
  };

  const heatmapModes = [
    { id: 'scans', label: 'Total Scans', icon: TrendingUp },
    { id: 'health', label: 'Health Status', icon: Leaf },
    { id: 'disease', label: 'Disease Risk', icon: AlertTriangle },
  ];

  const rwandaProvinces = [
    {
      name: 'Northern Province',
      color: '#3b82f6',
      districts: ['Musanze', 'Burera', 'Gakenke', 'Gicumbi', 'Rulindo'],
    },
    {
      name: 'Southern Province',
      color: '#10b981',
      districts: [
        'Huye',
        'Nyamagabe',
        'Gisagara',
        'Nyaruguru',
        'Muhanga',
        'Kamonyi',
        'Ruhango',
        'Nyanza',
      ],
    },
    {
      name: 'Eastern Province',
      color: '#f59e0b',
      districts: [
        'Rwamagana',
        'Nyagatare',
        'Gatsibo',
        'Kayonza',
        'Kirehe',
        'Ngoma',
        'Bugesera',
      ],
    },
    {
      name: 'Western Province',
      color: '#7c3aed',
      districts: [
        'Karongi',
        'Rutsiro',
        'Rubavu',
        'Nyabihu',
        'Ngororero',
        'Rusizi',
        'Nyamasheke',
      ],
    },
    {
      name: 'Kigali City',
      color: '#dc2626',
      districts: ['Nyarugenge', 'Gasabo', 'Kicukiro'],
    },
  ];

  const mapData = data.map((location) => ({
    ...location,
    province:
      rwandaProvinces.find((p) =>
        p.districts.some((d) => location.location.includes(d)),
      )?.name || 'Unknown',
  }));

  return (
    <View style={styles.container}>
      {/* Heat Map Mode Selector */}
      <View style={styles.modeSelector}>
        {heatmapModes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeButton,
              heatmapMode === mode.id && styles.activeModeButton,
            ]}
            onPress={() => setHeatmapMode(mode.id as any)}
          >
            <mode.icon
              size={16}
              color={heatmapMode === mode.id ? '#ffffff' : '#6b7280'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.modeText,
                heatmapMode === mode.id && styles.activeModeText,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>Rwanda Agricultural Districts</Text>
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#10b981' }]}
              />
              <Text style={styles.legendText}>Low Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#f59e0b' }]}
              />
              <Text style={styles.legendText}>Medium Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#dc2626' }]}
              />
              <Text style={styles.legendText}>High Risk</Text>
            </View>
          </View>
        </View>

        {/* Simplified Map Representation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mapScrollContainer}
        >
          <View style={styles.mapView}>
            {mapData.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.locationPin,
                  {
                    backgroundColor: getLocationColor(location),
                    width: getLocationSize(location),
                    height: getLocationSize(location),
                    left: `${20 + (index % 3) * 25}%`,
                    top: `${20 + Math.floor(index / 3) * 25}%`,
                  },
                ]}
                onPress={() => setSelectedLocation(location)}
              >
                <MapPin size={12} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Location Info Panel */}
        {selectedLocation && (
          <View style={styles.locationInfo}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationName}>
                {selectedLocation.location}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedLocation(null)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.locationStats}>
              <View style={styles.statRow}>
                <TrendingUp size={16} color="#2563eb" strokeWidth={2} />
                <Text style={styles.statLabel}>Total Scans:</Text>
                <Text style={styles.statValue}>{selectedLocation.count}</Text>
              </View>
              <View style={styles.statRow}>
                <Leaf size={16} color="#10b981" strokeWidth={2} />
                <Text style={styles.statLabel}>Healthy Plants:</Text>
                <Text style={styles.statValue}>
                  {selectedLocation.healthyCount}
                </Text>
              </View>
              <View style={styles.statRow}>
                <AlertTriangle size={16} color="#dc2626" strokeWidth={2} />
                <Text style={styles.statLabel}>Disease Cases:</Text>
                <Text style={styles.statValue}>
                  {selectedLocation.diseaseCount}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Province Summary */}
      <View style={styles.provinceSummary}>
        <Text style={styles.summaryTitle}>Province Overview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.provinceList}>
            {rwandaProvinces.map((province) => {
              const provinceData = mapData.filter(
                (d) => d.province === province.name,
              );
              const totalScans = provinceData.reduce(
                (sum, d) => sum + d.count,
                0,
              );
              const healthyScans = provinceData.reduce(
                (sum, d) => sum + d.healthyCount,
                0,
              );
              const diseaseScans = provinceData.reduce(
                (sum, d) => sum + d.diseaseCount,
                0,
              );

              return (
                <View key={province.name} style={styles.provinceCard}>
                  <View
                    style={[
                      styles.provinceHeader,
                      { borderLeftColor: province.color },
                    ]}
                  >
                    <Text style={styles.provinceName}>{province.name}</Text>
                    <Text style={styles.provinceDistricts}>
                      {province.districts.length} districts
                    </Text>
                  </View>
                  <View style={styles.provinceStats}>
                    <View style={styles.provinceStat}>
                      <Text style={styles.provinceStatValue}>{totalScans}</Text>
                      <Text style={styles.provinceStatLabel}>Total Scans</Text>
                    </View>
                    <View style={styles.provinceStat}>
                      <Text
                        style={[styles.provinceStatValue, { color: '#10b981' }]}
                      >
                        {healthyScans}
                      </Text>
                      <Text style={styles.provinceStatLabel}>Healthy</Text>
                    </View>
                    <View style={styles.provinceStat}>
                      <Text
                        style={[styles.provinceStatValue, { color: '#dc2626' }]}
                      >
                        {diseaseScans}
                      </Text>
                      <Text style={styles.provinceStatLabel}>Disease</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeModeButton: {
    backgroundColor: '#059669',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeModeText: {
    color: '#ffffff',
  },
  mapContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mapLegend: {
    flexDirection: 'row',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280',
  },
  mapScrollContainer: {
    minWidth: width - 72,
  },
  mapView: {
    width: width - 72,
    height: 300,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    position: 'relative',
  },
  locationPin: {
    position: 'absolute',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  locationInfo: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
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
  },
  closeButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationStats: {
    gap: 6,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  provinceSummary: {
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
    marginBottom: 12,
  },
  provinceList: {
    flexDirection: 'row',
    gap: 12,
  },
  provinceCard: {
    width: 140,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  provinceHeader: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 8,
  },
  provinceName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  provinceDistricts: {
    fontSize: 10,
    color: '#6b7280',
  },
  provinceStats: {
    gap: 4,
  },
  provinceStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  provinceStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  provinceStatLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
});
