import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Leaf,
  AlertTriangle,
  Clock,
  Filter,
  Users,
  Eye,
  Shield,
} from 'lucide-react-native';
import { ThemedScrollView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/contexts/AuthContext';

interface ScanHistory {
  id: string;
  user_id: string;
  user_email: string;
  date: string;
  time: string;
  image_url: string;
  disease: string;
  confidence: number;
  status: 'healthy' | 'disease';
  crop: string;
  location?: string;
  notes?: string;
}

export default function HistoryScreen() {
  const [filter, setFilter] = useState('all');
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
      }
    };

    checkAdminStatus();
  }, [user]);

  // Fetch scan history
  useEffect(() => {
    fetchScanHistory();
  }, [user, showAllUsers]);

  const fetchScanHistory = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('scan_history')
        .select(
          `
          id,
          user_id,
          date,
          time,
          image_url,
          disease,
          confidence,
          status,
          crop,
          location,
          notes,
          profiles!inner(email)
        `,
        )
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      // If not admin or not showing all users, filter by current user
      if (!isAdmin || !showAllUsers) {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Error fetching scan history with profiles:', error);

        // Fallback: try without profiles relationship
        let fallbackQuery = supabase
          .from('scan_history')
          .select(
            `
            id,
            user_id,
            date,
            time,
            image_url,
            disease,
            confidence,
            status,
            crop,
            location,
            notes
          `,
          )
          .order('date', { ascending: false })
          .order('time', { ascending: false });

        // If not admin or not showing all users, filter by current user
        if (!isAdmin || !showAllUsers) {
          fallbackQuery = fallbackQuery.eq('user_id', user?.id);
        }

        const { data: fallbackData, error: fallbackError } =
          await fallbackQuery;

        if (fallbackError) {
          console.error('Error fetching scan history:', fallbackError);
          Alert.alert('Error', 'Failed to load scan history');
          return;
        }

        const formattedData: ScanHistory[] =
          fallbackData?.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            user_email: item.user_id || 'Unknown',
            date: item.date,
            time: item.time,
            image_url: item.image_url,
            disease: item.disease,
            confidence: item.confidence,
            status: item.status,
            crop: item.crop,
            location: item.location,
            notes: item.notes,
          })) || [];

        setScanHistory(formattedData);
        return;
      }

      const formattedData: ScanHistory[] =
        data?.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          user_email: item.profiles?.email || item.user_id || 'Unknown',
          date: item.date,
          time: item.time,
          image_url: item.image_url,
          disease: item.disease,
          confidence: item.confidence,
          status: item.status,
          crop: item.crop,
          location: item.location,
          notes: item.notes,
        })) || [];

      setScanHistory(formattedData);
    } catch (error) {
      console.error('Error fetching scan history:', error);
      Alert.alert('Error', 'Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = [
    {
      label: t('totalScans') || 'Total Scans',
      value: scanHistory.length.toString(),
      icon: Search,
      color: '#2563eb',
    },
    {
      label: t('healthyPlants') || 'Healthy Plants',
      value: scanHistory
        .filter((item) => item.status === 'healthy')
        .length.toString(),
      icon: Leaf,
      color: '#059669',
    },
    {
      label: t('issuesFound') || 'Issues Found',
      value: scanHistory
        .filter((item) => item.status === 'disease')
        .length.toString(),
      icon: AlertTriangle,
      color: '#dc2626',
    },
  ];

  const filters = [
    { id: 'all', label: t('all') || 'All', count: scanHistory.length },
    {
      id: 'healthy',
      label: t('healthy') || 'Healthy',
      count: scanHistory.filter((item) => item.status === 'healthy').length,
    },
    {
      id: 'disease',
      label: t('issues') || 'Issues',
      count: scanHistory.filter((item) => item.status === 'disease').length,
    },
  ];

  const filteredData =
    filter === 'all'
      ? scanHistory
      : scanHistory.filter((item) => item.status === filter);

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

  const getDiseaseTranslation = (disease: string) => {
    const diseaseTranslations: { [key: string]: { [key: string]: string } } = {
      'Early Blight': {
        en: 'Early Blight',
        rw: 'Ubutarumikazi bwo Mu ntangiriro',
        fr: 'Mildiou précoce',
      },
      'Late Blight': {
        en: 'Late Blight',
        rw: 'Ubutarumikazi bwo Mu nyuma',
        fr: 'Mildiou tardif',
      },
      'Healthy Plant': {
        en: 'Healthy Plant',
        rw: 'Ibihingwa Bikomeye',
        fr: 'Plante saine',
      },
      'Leaf Spot': {
        en: 'Leaf Spot',
        rw: "Amaro y'Ibihingwa",
        fr: 'Tache foliaire',
      },
      'Powdery Mildew': {
        en: 'Powdery Mildew',
        rw: "Ubutarumikazi bw'Umukungugu",
        fr: 'Oïdium',
      },
      'Bacterial Spot': {
        en: 'Bacterial Spot',
        rw: "Amaro y'Ibihingwa by'Ubwoko",
        fr: 'Tache bactérienne',
      },
    };

    return diseaseTranslations[disease]?.[currentLanguage.code] || disease;
  };

  const getCropTranslation = (crop: string) => {
    const cropTranslations: { [key: string]: { [key: string]: string } } = {
      Tomato: {
        en: 'Tomato',
        rw: 'Inyanya',
        fr: 'Tomate',
      },
      Potato: {
        en: 'Potato',
        rw: 'Ibirayi',
        fr: 'Pomme de terre',
      },
      Bean: {
        en: 'Bean',
        rw: 'Ibishyimbo',
        fr: 'Haricot',
      },
      Maize: {
        en: 'Maize',
        rw: 'Ibigori',
        fr: 'Maïs',
      },
    };

    return cropTranslations[crop]?.[currentLanguage.code] || crop;
  };

  return (
    <ThemedScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={['#1f2937', '#374151']} style={styles.header}>
        <Text style={styles.title}>{t('scanHistory') || 'Scan History'}</Text>
        <Text style={styles.subtitle}>
          {t('trackCropHealth') || 'Track your crop health over time'}
        </Text>

        {/* Admin Controls */}
        {isAdmin && (
          <View style={styles.adminControls}>
            <TouchableOpacity
              style={[
                styles.adminButton,
                {
                  backgroundColor: showAllUsers
                    ? colors.primary
                    : colors.border,
                },
              ]}
              onPress={() => setShowAllUsers(!showAllUsers)}
            >
              <Users
                size={16}
                color={showAllUsers ? colors.surface : colors.textSecondary}
              />
              <Text
                style={[
                  styles.adminButtonText,
                  {
                    color: showAllUsers ? colors.surface : colors.textSecondary,
                  },
                ]}
              >
                {showAllUsers
                  ? t('myScans') || 'My Scans'
                  : t('allUsers') || 'All Users'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[styles.statCard, { backgroundColor: colors.surface }]}
          >
            <View
              style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}
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

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.id}
              style={[
                styles.filterButton,
                filter === filterItem.id && styles.activeFilterButton,
                filter === filterItem.id && { backgroundColor: colors.primary },
              ]}
              onPress={() => setFilter(filterItem.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: colors.textSecondary },
                  filter === filterItem.id && { color: colors.surface },
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('loading') || 'Loading...'}
            </Text>
          </View>
        ) : (
          filteredData.map((item) => {
            const StatusIcon = getStatusIcon(item.status);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.historyCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.historyImage}
                />

                <View style={styles.historyContent}>
                  <View style={styles.historyHeader}>
                    <Text style={[styles.historyTitle, { color: colors.text }]}>
                      {getCropTranslation(item.crop)}
                    </Text>
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
                    <Text
                      style={[
                        styles.diseaseText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {getDiseaseTranslation(item.disease)}
                    </Text>
                  </View>

                  {/* Admin: Show user email */}
                  {isAdmin && showAllUsers && (
                    <View style={styles.userContainer}>
                      <Shield size={12} color="#6b7280" strokeWidth={2} />
                      <Text
                        style={[
                          styles.userText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.user_email}
                      </Text>
                    </View>
                  )}

                  <View style={styles.historyFooter}>
                    <Text
                      style={[styles.dateText, { color: colors.textSecondary }]}
                    >
                      {item.date}
                    </Text>
                    <View style={styles.confidenceContainer}>
                      <Text style={styles.confidenceText}>
                        {item.confidence}% {t('confidence') || 'confidence'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <View style={styles.emptyContainer}>
          <Search size={48} color="#6b7280" strokeWidth={1} />
          <Text style={styles.emptyTitle}>
            {t('noScansFound') || 'No scans found'}
          </Text>
          <Text style={styles.emptyText}>
            {t('noScansMatchFilter') ||
              'No scans match your current filter. Try selecting a different filter.'}
          </Text>
        </View>
      )}

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
  adminControls: {
    marginTop: 16,
    alignItems: 'center',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  adminButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  historyContent: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 8,
    gap: 8,
  },
  diseaseText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  userText: {
    fontSize: 12,
    color: '#6b7280',
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
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
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
