import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  TrendingUp,
  Leaf,
  AlertTriangle,
  Clock,
  Filter,
  Search,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const [filter, setFilter] = useState('all');

  const historyData = [
    {
      id: '1',
      date: '2024-01-15',
      time: '14:30',
      image: 'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      disease: 'Healthy Plant',
      confidence: 94,
      status: 'healthy',
      crop: 'Tomato',
    },
    {
      id: '2',
      date: '2024-01-14',
      time: '09:15',
      image: 'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&w=300',
      disease: 'Early Blight',
      confidence: 87,
      status: 'disease',
      crop: 'Potato',
    },
    {
      id: '3',
      date: '2024-01-13',
      time: '16:45',
      image: 'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      disease: 'Healthy Plant',
      confidence: 92,
      status: 'healthy',
      crop: 'Bean',
    },
    {
      id: '4',
      date: '2024-01-12',
      time: '11:20',
      image: 'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&w=300',
      disease: 'Leaf Spot',
      confidence: 79,
      status: 'disease',
      crop: 'Tomato',
    },
  ];

  const stats = [
    {
      label: 'Total Scans',
      value: '24',
      icon: Search,
      color: '#2563eb',
    },
    {
      label: 'Healthy Plants',
      value: '18',
      icon: Leaf,
      color: '#059669',
    },
    {
      label: 'Issues Found',
      value: '6',
      icon: AlertTriangle,
      color: '#dc2626',
    },
  ];

  const filters = [
    { id: 'all', label: 'All', count: 24 },
    { id: 'healthy', label: 'Healthy', count: 18 },
    { id: 'disease', label: 'Issues', count: 6 },
  ];

  const filteredData = filter === 'all' 
    ? historyData 
    : historyData.filter(item => item.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#059669';
      case 'disease':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return Leaf;
      case 'disease':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#1f2937', '#374151']}
        style={styles.header}
      >
        <Text style={styles.title}>Scan History</Text>
        <Text style={styles.subtitle}>Track your crop health over time</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
              <stat.icon size={24} color={stat.color} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.id}
              style={[
                styles.filterButton,
                filter === filterItem.id && styles.activeFilterButton,
              ]}
              onPress={() => setFilter(filterItem.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === filterItem.id && styles.activeFilterText,
                ]}
              >
                {filterItem.label} ({filterItem.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* History List */}
      <View style={styles.historyContainer}>
        {filteredData.map((item) => {
          const StatusIcon = getStatusIcon(item.status);
          return (
            <TouchableOpacity key={item.id} style={styles.historyCard}>
              <Image source={{ uri: item.image }} style={styles.historyImage} />
              
              <View style={styles.historyContent}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>{item.crop}</Text>
                  <View style={styles.timeContainer}>
                    <Clock size={12} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                </View>
                
                <View style={styles.diseaseContainer}>
                  <StatusIcon 
                    size={16} 
                    color={getStatusColor(item.status)} 
                    strokeWidth={2} 
                  />
                  <Text style={styles.diseaseText}>{item.disease}</Text>
                </View>
                
                <View style={styles.historyFooter}>
                  <Text style={styles.dateText}>{item.date}</Text>
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceText}>
                      {item.confidence}% confidence
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <View style={styles.emptyContainer}>
          <Search size={48} color="#6b7280" strokeWidth={1} />
          <Text style={styles.emptyTitle}>No scans found</Text>
          <Text style={styles.emptyText}>
            No scans match your current filter. Try selecting a different filter.
          </Text>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statIcon: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  activeFilterButton: {
    backgroundColor: '#059669',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  historyContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  historyContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  diseaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  diseaseText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  confidenceContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  confidenceText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});