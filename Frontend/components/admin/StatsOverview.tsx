import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Leaf,
  AlertTriangle,
  Calendar,
  BarChart3,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface StatsOverviewProps {
  data: {
    totalUsers: number;
    totalScans: number;
    healthyScans: number;
    diseaseScans: number;
    topDiseases: any[];
    topLocations: any[];
  };
}

export default function StatsOverview({ data }: StatsOverviewProps) {
  const { totalUsers, totalScans, healthyScans, diseaseScans, topDiseases } =
    data;

  const healthyPercentage =
    totalScans > 0 ? ((healthyScans / totalScans) * 100).toFixed(1) : 0;
  const diseasePercentage =
    totalScans > 0 ? ((diseaseScans / totalScans) * 100).toFixed(1) : 0;

  const statCards = [
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      change: '+12%',
      isPositive: true,
      icon: Users,
      color: '#2563eb',
      description: 'Active farmers on platform',
    },
    {
      title: 'Total Scans',
      value: totalScans.toString(),
      change: '+8%',
      isPositive: true,
      icon: Activity,
      color: '#059669',
      description: 'Disease detection scans',
    },
    {
      title: 'Healthy Plants',
      value: `${healthyPercentage}%`,
      change: '+3%',
      isPositive: true,
      icon: Leaf,
      color: '#10b981',
      description: 'Plants with no diseases',
    },
    {
      title: 'Disease Detection',
      value: `${diseasePercentage}%`,
      change: '-2%',
      isPositive: false,
      icon: AlertTriangle,
      color: '#dc2626',
      description: 'Plants requiring treatment',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${stat.color}20` },
                ]}
              >
                <stat.icon size={20} color={stat.color} strokeWidth={2} />
              </View>
              <View
                style={[
                  styles.changeContainer,
                  stat.isPositive
                    ? styles.positiveChange
                    : styles.negativeChange,
                ]}
              >
                {stat.isPositive ? (
                  <TrendingUp size={12} color="#10b981" strokeWidth={2} />
                ) : (
                  <TrendingDown size={12} color="#dc2626" strokeWidth={2} />
                )}
                <Text
                  style={[
                    styles.changeText,
                    { color: stat.isPositive ? '#10b981' : '#dc2626' },
                  ]}
                >
                  {stat.change}
                </Text>
              </View>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
            <Text style={styles.statDescription}>{stat.description}</Text>
          </View>
        ))}
      </View>

      {/* Disease Breakdown */}
      <View style={styles.diseaseSection}>
        <View style={styles.sectionHeader}>
          <BarChart3 size={20} color="#1f2937" strokeWidth={2} />
          <Text style={styles.sectionTitle}>Top Diseases Detected</Text>
        </View>
        <View style={styles.diseaseList}>
          {topDiseases.slice(0, 5).map((disease, index) => (
            <View key={index} style={styles.diseaseItem}>
              <View style={styles.diseaseInfo}>
                <Text style={styles.diseaseName}>{disease.disease}</Text>
                <Text style={styles.diseaseCount}>{disease.count} cases</Text>
              </View>
              <View style={styles.diseaseBar}>
                <View
                  style={[
                    styles.diseaseBarFill,
                    {
                      width: `${(disease.count / (topDiseases[0]?.count || 1)) * 100}%`,
                      backgroundColor: getBarColor(index),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Health Summary */}
      <View style={styles.healthSummary}>
        <Text style={styles.summaryTitle}>Overall Plant Health</Text>
        <View style={styles.healthBar}>
          <View
            style={[
              styles.healthBarSegment,
              { flex: healthyScans, backgroundColor: '#10b981' },
            ]}
          />
          <View
            style={[
              styles.healthBarSegment,
              { flex: diseaseScans, backgroundColor: '#dc2626' },
            ]}
          />
        </View>
        <View style={styles.healthLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>
              Healthy ({healthyPercentage}%)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
            <Text style={styles.legendText}>
              Diseased ({diseasePercentage}%)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const getBarColor = (index: number) => {
  const colors = ['#dc2626', '#f59e0b', '#10b981', '#2563eb', '#7c3aed'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    borderRadius: 8,
    padding: 6,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  positiveChange: {
    backgroundColor: '#f0fdf4',
  },
  negativeChange: {
    backgroundColor: '#fef2f2',
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 14,
  },
  diseaseSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
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
  diseaseList: {
    gap: 12,
  },
  diseaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  diseaseCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  diseaseBar: {
    flex: 2,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  diseaseBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  healthSummary: {
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
  healthBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  healthBarSegment: {
    height: '100%',
  },
  healthLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
});
