import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AdminMapDashboardWeb from '../components/admin/AdminMapDashboardWeb';
import type { MapDataPoint } from '../types/map';

export default function AdminMapTestScreen() {
  const router = useRouter();

  const handleMarkerPress = (data: MapDataPoint) => {
    console.log('Marker pressed:', data);
    // You can navigate to a detail screen here
  };

  const handleExport = () => {
    console.log('Export requested');
    // Implement export functionality
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Admin Map Dashboard</Text>
      </View>

      <AdminMapDashboardWeb
        onMarkerPress={handleMarkerPress}
        onExport={handleExport}
      />
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
