import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Camera, Image as ImageIcon, Leaf, TrendingUp, Shield, Award, ArrowRight, Sun, Droplets } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t } = useLanguage();

  const quickActions = [
    {
      id: 'camera',
      title: t('takePhoto'),
      subtitle: t('captureImage'),
      icon: Camera,
      color: '#059669',
      gradient: ['#059669', '#10b981'],
      onPress: () => router.push('/scan'),
    },
    {
      id: 'gallery',
      title: t('fromGallery'),
      subtitle: t('selectExisting'),
      icon: ImageIcon,
      color: '#2563eb',
      gradient: ['#2563eb', '#3b82f6'],
      onPress: () => router.push('/scan'),
    },
  ];

  const features = [
    {
      icon: Leaf,
      title: t('diseaseDetection'),
      description: t('diseaseDetectionDesc'),
    },
    {
      icon: Shield,
      title: t('instantAnalysis'),
      description: t('instantAnalysisDesc'),
    },
    {
      icon: TrendingUp,
      title: t('treatmentRecommendations'),
      description: t('treatmentRecommendationsDesc'),
    },
  ];

  const stats = [
    { label: t('scansToday'), value: '12', icon: Sun },
    { label: t('healthyPlants'), value: '89%', icon: Leaf },
    { label: t('waterLevel'), value: t('good'), icon: Droplets },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#059669', '#10b981', '#34d399']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>{t('welcomeToAgrisol')}</Text>
            <Text style={styles.appTitle}>{t('appTitle')}</Text>
            <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
          </View>
          <View style={styles.logoContainer}>
            <Leaf size={40} color="#ffffff" strokeWidth={2} />
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('quickScan')}</Text>
        <View style={styles.actionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={action.gradient}
                style={styles.actionGradient}
              >
                <action.icon size={32} color="#ffffff" strokeWidth={2} />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <ArrowRight size={20} color="#ffffff" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('todaysOverview')}</Text>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <stat.icon size={24} color="#059669" strokeWidth={2} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('howItWorks')}</Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <feature.icon size={24} color="#059669" strokeWidth={2} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Sample Image */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('sampleDetection')}</Text>
        <View style={styles.sampleCard}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=400',
            }}
            style={styles.sampleImage}
          />
          <View style={styles.sampleContent}>
            <View style={styles.sampleHeader}>
              <Text style={styles.sampleTitle}>{t('healthyTomatoPlant')}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>94%</Text>
              </View>
            </View>
            <Text style={styles.sampleDescription}>
              {t('healthyPlantDesc')}
            </Text>
          </View>
        </View>
      </View>

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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '500',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featureIconContainer: {
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    padding: 8,
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  sampleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sampleImage: {
    width: '100%',
    height: 200,
  },
  sampleContent: {
    padding: 16,
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  confidenceBadge: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sampleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});