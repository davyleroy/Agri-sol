import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  AlertCircle,
  CheckCircle,
  Calendar,
  Droplets,
  Sun,
  Leaf,
  Bug,
} from 'lucide-react-native';
import { ThemedScrollView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';

export default function GuideScreen() {
  const [activeTab, setActiveTab] = useState<'diseases' | 'tips' | 'calendar'>(
    'diseases',
  );
  const { colors } = useTheme();

  const diseases = [
    {
      id: '1',
      name: 'Early Blight',
      crop: 'Tomato, Potato',
      severity: 'High',
      image:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: [
        'Brown spots with concentric rings',
        'Yellowing leaves',
        'Fruit rot',
      ],
      treatment: 'Apply copper-based fungicide, remove affected leaves',
      prevention: 'Crop rotation, proper spacing, avoid overhead watering',
    },
    {
      id: '2',
      name: 'Powdery Mildew',
      crop: 'Cucumber, Squash',
      severity: 'Medium',
      image:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: ['White powdery coating', 'Stunted growth', 'Leaf distortion'],
      treatment: 'Apply sulfur-based fungicide, improve ventilation',
      prevention: 'Plant resistant varieties, maintain proper spacing',
    },
    {
      id: '3',
      name: 'Bacterial Spot',
      crop: 'Pepper, Tomato',
      severity: 'Medium',
      image:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: ['Small dark spots', 'Yellow halos', 'Fruit lesions'],
      treatment: 'Use copper sprays, remove infected plants',
      prevention: 'Use certified seeds, practice crop rotation',
    },
  ];

  const careTips = [
    {
      id: '1',
      title: 'Watering Best Practices',
      icon: Droplets,
      color: '#2563eb',
      tips: [
        'Water early morning or late evening',
        'Water at soil level, not on leaves',
        'Check soil moisture before watering',
        'Use mulch to retain moisture',
      ],
    },
    {
      id: '2',
      title: 'Sunlight Requirements',
      icon: Sun,
      color: '#f59e0b',
      tips: [
        'Most vegetables need 6-8 hours of direct sunlight',
        'Observe your garden throughout the day',
        'Consider plant spacing for optimal light',
        'Some crops tolerate partial shade',
      ],
    },
  ];

  const plantingCalendar = [
    {
      month: 'January',
      crops: ['Lettuce', 'Spinach', 'Radishes'],
      activities: ['Prepare soil', 'Plan garden layout'],
    },
    {
      month: 'February',
      crops: ['Peas', 'Onions', 'Carrots'],
      activities: ['Start seeds indoors', 'Prune fruit trees'],
    },
    {
      month: 'March',
      crops: ['Tomatoes', 'Peppers', 'Herbs'],
      activities: ['Transplant seedlings', 'Apply mulch'],
    },
    {
      month: 'April',
      crops: ['Beans', 'Potatoes', 'Squash', 'Corn'],
      activities: ['Direct sow warm crops', 'Install supports'],
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const renderDiseases = () => (
    <View style={styles.contentContainer}>
      {diseases.map((disease) => (
        <View
          key={disease.id}
          style={[styles.diseaseCard, { backgroundColor: colors.surface }]}
        >
          <Image source={{ uri: disease.image }} style={styles.diseaseImage} />

          <View style={styles.diseaseContent}>
            <View style={styles.diseaseHeader}>
              <Text style={[styles.diseaseName, { color: colors.text }]}>
                {disease.name}
              </Text>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(disease.severity) },
                ]}
              >
                <Text style={styles.severityText}>{disease.severity}</Text>
              </View>
            </View>

            <Text style={[styles.diseaseCrop, { color: colors.textSecondary }]}>
              Affects: {disease.crop}
            </Text>

            <View style={styles.diseaseSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Symptoms:
              </Text>
              {disease.symptoms.map((symptom, index) => (
                <View key={index} style={styles.symptomItem}>
                  <AlertCircle size={12} color="#dc2626" strokeWidth={2} />
                  <Text
                    style={[
                      styles.symptomText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {symptom}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.diseaseSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Treatment:
              </Text>
              <Text
                style={[styles.treatmentText, { color: colors.textSecondary }]}
              >
                {disease.treatment}
              </Text>
            </View>

            <View style={styles.diseaseSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Prevention:
              </Text>
              <Text
                style={[styles.preventionText, { color: colors.textSecondary }]}
              >
                {disease.prevention}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCareTips = () => (
    <View style={styles.contentContainer}>
      {careTips.map((tip) => (
        <View
          key={tip.id}
          style={[styles.tipCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.tipHeader}>
            <View
              style={[
                styles.tipIconContainer,
                { backgroundColor: `${tip.color}20` },
              ]}
            >
              <tip.icon size={24} color={tip.color} strokeWidth={2} />
            </View>
            <Text style={[styles.tipTitle, { color: colors.text }]}>
              {tip.title}
            </Text>
          </View>

          <View style={styles.tipsList}>
            {tip.tips.map((tipText, index) => (
              <View key={index} style={styles.tipItem}>
                <CheckCircle size={14} color={tip.color} strokeWidth={2} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  {tipText}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCalendar = () => (
    <View style={styles.contentContainer}>
      {plantingCalendar.map((month, index) => (
        <View
          key={index}
          style={[styles.calendarCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.calendarHeader}>
            <Calendar size={20} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.calendarMonth, { color: colors.text }]}>
              {month.month}
            </Text>
          </View>

          <View style={styles.calendarSection}>
            <Text style={[styles.calendarSectionTitle, { color: colors.text }]}>
              Recommended Crops:
            </Text>
            <View style={styles.cropsContainer}>
              {month.crops.map((crop, cropIndex) => (
                <View key={cropIndex} style={styles.cropTag}>
                  <Text style={[styles.cropText, { color: colors.primary }]}>
                    {crop}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.calendarSection}>
            <Text style={[styles.calendarSectionTitle, { color: colors.text }]}>
              Activities:
            </Text>
            {month.activities.map((activity, actIndex) => (
              <View key={actIndex} style={styles.activityItem}>
                <CheckCircle size={12} color="#059669" strokeWidth={2} />
                <Text
                  style={[styles.activityText, { color: colors.textSecondary }]}
                >
                  {activity}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'diseases':
        return renderDiseases();
      case 'tips':
        return renderCareTips();
      case 'calendar':
        return renderCalendar();
      default:
        return renderDiseases();
    }
  };

  const tabs = [
    { id: 'diseases', label: 'Diseases', icon: Bug },
    { id: 'tips', label: 'Care Tips', icon: Leaf },
    { id: 'calendar', label: 'Planting', icon: Calendar },
  ];

  return (
    <ThemedScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={['#059669', '#10b981']} style={styles.header}>
        <BookOpen size={32} color="#ffffff" strokeWidth={2} />
        <Text style={styles.title}>Crop Care Guide</Text>
        <Text style={styles.subtitle}>
          Essential knowledge for healthy crops
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: colors.primary },
            ]}
            onPress={() =>
              setActiveTab(tab.id as 'diseases' | 'tips' | 'calendar')
            }
          >
            <tab.icon
              size={20}
              color={
                activeTab === tab.id ? colors.surface : colors.textSecondary
              }
              strokeWidth={2}
            />
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                activeTab === tab.id && { color: colors.surface },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor moved to ThemedScrollView
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  diseaseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  diseaseImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  diseaseContent: {
    padding: 16,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  severityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  diseaseCrop: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  diseaseSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  symptomText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  treatmentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  preventionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  tipCard: {
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
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipIconContainer: {
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  calendarCard: {
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
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  calendarSection: {
    marginBottom: 12,
  },
  calendarSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropTag: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cropText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});
