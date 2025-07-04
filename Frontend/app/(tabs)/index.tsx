import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Camera,
  Image as ImageIcon,
  Leaf,
  TrendingUp,
  Shield,
  Award,
  ArrowRight,
  Sun,
  Droplets,
  LogOut,
  BarChart3,
  MapPin,
  Users,
  Activity,
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedScrollView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';

// Import admin dashboard component
import AdminDashboard from '@/components/AdminDashboard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t } = useLanguage();
  const { user, signOut, isAdmin, loading } = useAuth();
  const { colors } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Debug logging
  console.log('🏠 HomeScreen render:', {
    hasUser: !!user,
    isAdmin,
    loading,
    userEmail: user?.email,
  });

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 16, color: colors.textSecondary }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!user) {
    console.log('❌ No user found, redirecting to sign-in');
    // Use setTimeout to avoid state update during render
    setTimeout(() => {
      router.replace('/(auth)/sign-in');
    }, 0);
    return null; // Keep this to avoid rendering the screen while redirecting
  }

  // Show admin dashboard if user is admin
  if (isAdmin) {
    console.log('👑 Showing admin dashboard');
    return <AdminDashboard />;
  }

  console.log('👤 Showing regular user home screen');

  // Regular user home screen
  const quickActions = [
    {
      id: 'camera',
      title: t('takePhoto'),
      subtitle: t('captureImage'),
      icon: Camera,
      color: '#059669',
      gradient: ['#059669', '#10b981'] as const,
      onPress: () => router.push('/scan' as any),
    },
    {
      id: 'gallery',
      title: t('fromGallery'),
      subtitle: t('selectExisting'),
      icon: ImageIcon,
      color: '#2563eb',
      gradient: ['#2563eb', '#3b82f6'] as const,
      onPress: () => router.push('/scan' as any),
    },
  ];

  const features = [
    {
      icon: Leaf,
      title: t('diseaseDetection'),
      description: t('diseaseDetectionDesc'),
      color: '#059669',
    },
    {
      icon: Shield,
      title: t('instantAnalysis'),
      description: t('instantAnalysisDesc'),
      color: '#2563eb',
      onPress: () => router.push('/scan' as any),
    },
    {
      icon: TrendingUp,
      title: t('treatmentRecommendations'),
      description: t('treatmentRecommendationsDesc'),
      color: '#7c3aed',
    },
  ];

  const stats = [
    { label: t('scansToday'), value: '12', icon: Sun, color: '#f59e0b' },
    { label: t('healthyPlants'), value: '89%', icon: Leaf, color: '#059669' },
    {
      label: t('waterLevel'),
      value: t('good'),
      icon: Droplets,
      color: '#2563eb',
    },
  ];

  return (
    <ThemedScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
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
          <View style={styles.headerActions}>
            <View style={styles.logoContainer}>
              <Leaf size={40} color="#ffffff" strokeWidth={2} />
            </View>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <LogOut size={20} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('quickScan')}
        </Text>
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('todaysOverview')}
        </Text>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${stat.color}20` },
                ]}
              >
                <stat.icon size={24} color={stat.color} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('howItWorks')}
        </Text>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.featureCard, { backgroundColor: colors.surface }]}
            activeOpacity={0.8}
            onPress={feature.onPress}
          >
            <View
              style={[
                styles.featureIconContainer,
                { backgroundColor: `${feature.color}20` },
              ]}
            >
              <feature.icon size={24} color={feature.color} strokeWidth={2} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text
                style={[
                  styles.featureDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {feature.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sample Detection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('sampleDetection')}
        </Text>
        <View style={[styles.sampleCard, { backgroundColor: colors.surface }]}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=400',
            }}
            style={styles.sampleImage}
          />
          <View style={styles.sampleContent}>
            <View style={styles.sampleHeader}>
              <Text style={[styles.sampleTitle, { color: colors.text }]}>
                {t('healthyTomatoPlant')}
              </Text>
              <View style={styles.confidenceBadge}>
                <Award size={12} color="#ffffff" strokeWidth={2} />
                <Text style={styles.confidenceText}>94%</Text>
              </View>
            </View>
            <Text
              style={[
                styles.sampleDescription,
                { color: colors.textSecondary },
              ]}
            >
              {t('healthyPlantDesc')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'flex-start',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 12,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statIconContainer: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  featureCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featureIconContainer: {
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sampleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sampleImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  sampleContent: {
    padding: 20,
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sampleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});
