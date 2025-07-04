import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  AlertTriangle,
  Leaf,
  TrendingUp,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DiseaseAnalyticsProps {
  data: {
    topDiseases: any[];
    topLocations: any[];
    totalScans: number;
    healthyScans: number;
    diseaseScans: number;
  };
}

export default function DiseaseAnalytics({ data }: DiseaseAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'week' | 'month' | 'year'
  >('month');

  const { topDiseases, topLocations, totalScans, healthyScans, diseaseScans } =
    data;

  // Mock data for more detailed analytics
  const diseasesByMonth = [
    { month: 'Jan', diseases: 45, healthy: 120 },
    { month: 'Feb', diseases: 38, healthy: 145 },
    { month: 'Mar', diseases: 52, healthy: 134 },
    { month: 'Apr', diseases: 61, healthy: 128 },
    { month: 'May', diseases: 47, healthy: 156 },
    { month: 'Jun', diseases: 39, healthy: 167 },
  ];

  const diseaseCategories = [
    { category: 'Fungal', count: 85, color: '#dc2626', percentage: 45 },
    { category: 'Bacterial', count: 52, color: '#f59e0b', percentage: 28 },
    { category: 'Viral', count: 31, color: '#7c3aed', percentage: 16 },
    { category: 'Nutritional', count: 20, color: '#2563eb', percentage: 11 },
  ];

  const cropDiseases = [
    {
      crop: 'Tomato',
      diseases: ['Late Blight', 'Early Blight', 'Bacterial Wilt'],
      count: 78,
    },
    {
      crop: 'Beans',
      diseases: ['Bean Rust', 'Anthracnose', 'Bacterial Blight'],
      count: 65,
    },
    {
      crop: 'Potato',
      diseases: ['Late Blight', 'Scab', 'Blackleg'],
      count: 43,
    },
    { crop: 'Maize', diseases: ['Leaf Spot', 'Stem Borer', 'Rust'], count: 29 },
  ];

  const timeframes = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  const getMonthProgress = (diseases: number, healthy: number) => {
    const total = diseases + healthy;
    return total > 0 ? (diseases / total) * 100 : 0;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Time Filter */}
      <View style={styles.timeFilter}>
        {timeframes.map((timeframe) => (
          <TouchableOpacity
            key={timeframe.id}
            style={[
              styles.timeButton,
              selectedTimeframe === timeframe.id && styles.activeTimeButton,
            ]}
            onPress={() => setSelectedTimeframe(timeframe.id as any)}
          >
            <Text
              style={[
                styles.timeButtonText,
                selectedTimeframe === timeframe.id &&
                  styles.activeTimeButtonText,
              ]}
            >
              {timeframe.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Disease Trend Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <BarChart3 size={20} color="#1f2937" strokeWidth={2} />
          <Text style={styles.chartTitle}>Disease Trends</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartContent}>
            {diseasesByMonth.map((month, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.healthyBar,
                      { height: (month.healthy / 200) * 100 },
                    ]}
                  />
                  <View
                    style={[
                      styles.diseaseBar,
                      { height: (month.diseases / 200) * 100 },
                    ]}
                  />
                </View>
                <Text style={styles.monthLabel}>{month.month}</Text>
                <Text style={styles.monthValue}>
                  {month.diseases + month.healthy}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Healthy</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
            <Text style={styles.legendText}>Disease</Text>
          </View>
        </View>
      </View>

      {/* Disease Categories */}
      <View style={styles.categoriesContainer}>
        <View style={styles.sectionHeader}>
          <PieChart size={20} color="#1f2937" strokeWidth={2} />
          <Text style={styles.sectionTitle}>Disease Categories</Text>
        </View>
        <View style={styles.categoriesGrid}>
          {diseaseCategories.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: `${category.color}20` },
                  ]}
                >
                  <AlertTriangle
                    size={16}
                    color={category.color}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.categoryPercentage}>
                  {category.percentage}%
                </Text>
              </View>
              <Text style={styles.categoryName}>{category.category}</Text>
              <Text style={styles.categoryCount}>{category.count} cases</Text>
              <View style={styles.categoryProgressBar}>
                <View
                  style={[
                    styles.categoryProgress,
                    {
                      width: `${category.percentage}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Top Diseases */}
      <View style={styles.topDiseasesContainer}>
        <View style={styles.sectionHeader}>
          <Activity size={20} color="#1f2937" strokeWidth={2} />
          <Text style={styles.sectionTitle}>Most Common Diseases</Text>
        </View>
        <View style={styles.diseasesList}>
          {topDiseases.slice(0, 8).map((disease, index) => (
            <View key={index} style={styles.diseaseCard}>
              <View style={styles.diseaseRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.diseaseInfo}>
                <Text style={styles.diseaseName}>{disease.disease}</Text>
                <Text style={styles.diseaseCount}>
                  {disease.count} cases detected
                </Text>
              </View>
              <View style={styles.diseaseMetrics}>
                <View style={styles.metricItem}>
                  <TrendingUp size={12} color="#dc2626" strokeWidth={2} />
                  <Text style={styles.metricValue}>
                    +{Math.floor(Math.random() * 20)}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Crop-specific Diseases */}
      <View style={styles.cropDiseasesContainer}>
        <View style={styles.sectionHeader}>
          <Leaf size={20} color="#1f2937" strokeWidth={2} />
          <Text style={styles.sectionTitle}>Diseases by Crop Type</Text>
        </View>
        <View style={styles.cropDiseasesList}>
          {cropDiseases.map((crop, index) => (
            <View key={index} style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <Text style={styles.cropName}>{crop.crop}</Text>
                <Text style={styles.cropCount}>{crop.count} cases</Text>
              </View>
              <View style={styles.cropDiseases}>
                {crop.diseases.map((disease, diseaseIndex) => (
                  <View key={diseaseIndex} style={styles.diseaseTag}>
                    <Text style={styles.diseaseTagText}>{disease}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Location-Disease Correlation */}
      <View style={styles.locationCorrelationContainer}>
        <View style={styles.sectionHeader}>
          <MapPin size={20} color="#1f2937" strokeWidth={2} />
          <Text style={styles.sectionTitle}>High-Risk Locations</Text>
        </View>
        <View style={styles.locationList}>
          {topLocations.slice(0, 5).map((location, index) => (
            <View key={index} style={styles.locationCard}>
              <View style={styles.locationRank}>
                <Text style={styles.locationRankText}>{index + 1}</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.location}</Text>
                <Text style={styles.locationStats}>
                  {location.count} total scans •{' '}
                  {Math.floor(Math.random() * 40 + 20)}% disease rate
                </Text>
              </View>
              <View style={styles.riskIndicator}>
                <View
                  style={[
                    styles.riskDot,
                    {
                      backgroundColor:
                        index < 2
                          ? '#dc2626'
                          : index < 4
                            ? '#f59e0b'
                            : '#10b981',
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeFilter: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTimeButton: {
    backgroundColor: '#059669',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTimeButtonText: {
    color: '#ffffff',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chartContent: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
  },
  chartBar: {
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    width: 24,
    height: 120,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  healthyBar: {
    width: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  diseaseBar: {
    width: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  monthLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  monthValue: {
    fontSize: 10,
    color: '#9ca3af',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 76) / 2,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    borderRadius: 8,
    padding: 6,
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 2,
  },
  topDiseasesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  diseasesList: {
    gap: 12,
  },
  diseaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  diseaseRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  diseaseCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  diseaseMetrics: {
    alignItems: 'flex-end',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  cropDiseasesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cropDiseasesList: {
    gap: 12,
  },
  cropCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cropCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  cropDiseases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  diseaseTag: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  diseaseTagText: {
    fontSize: 10,
    color: '#6b7280',
  },
  locationCorrelationContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationList: {
    gap: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  locationRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  locationStats: {
    fontSize: 12,
    color: '#6b7280',
  },
  riskIndicator: {
    alignItems: 'flex-end',
  },
  riskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bottomSpacing: {
    height: 20,
  },
});
