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
  BookOpen,
  Leaf,
  Droplets,
  Sun,
  Bug,
  Shield,
  Calendar,
  ChevronRight,
  Heart,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function GuideScreen() {
  const [selectedCategory, setSelectedCategory] = useState('diseases');

  const categories = [
    { id: 'diseases', label: 'Diseases', icon: AlertCircle },
    { id: 'care', label: 'Care Tips', icon: Heart },
    { id: 'calendar', label: 'Planting', icon: Calendar },
  ];

  const diseases = [
    {
      id: '1',
      name: 'Early Blight',
      crop: 'Tomato, Potato',
      severity: 'High',
      image: 'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: ['Dark spots on leaves', 'Yellowing around spots', 'Leaf drop'],
      treatment: 'Apply copper-based fungicide, remove affected leaves',
      prevention: 'Ensure good air circulation, avoid overhead watering',
    },
    {
      id: '2',
      name: 'Powdery Mildew',
      crop: 'Various crops',
      severity: 'Medium',
      image: 'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: ['White powdery coating', 'Stunted growth', 'Leaf distortion'],
      treatment: 'Apply sulfur-based fungicide, improve ventilation',
      prevention: 'Plant resistant varieties, maintain proper spacing',
    },
    {
      id: '3',
      name: 'Bacterial Spot',
      crop: 'Pepper, Tomato',
      severity: 'Medium',
      image: 'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
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
    {
      id: '3',
      title: 'Pest Prevention',
      icon: Bug,
      color: '#dc2626',
      tips: [
        'Inspect plants regularly',
        'Encourage beneficial insects',
        'Use companion planting',
        'Remove infected plants promptly',
      ],
    },
    {
      id: '4',
      title: 'Soil Health',
      icon: Leaf,
      color: '#059669',
      tips: [
        'Test soil pH regularly',
        'Add organic matter to soil',
        'Practice crop rotation',
        'Avoid walking on wet soil',
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
      crops: ['Beans', 'Squash', 'Corn'],
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
        <View key={disease.id} style={styles.diseaseCard}>
          <Image source={{ uri: disease.image }} style={styles.diseaseImage} />
          
          <View style={styles.diseaseContent}>
            <View style={styles.diseaseHeader}>
              <Text style={styles.diseaseName}>{disease.name}</Text>
              <View 
                style={[
                  styles.severityBadge, 
                  { backgroundColor: getSeverityColor(disease.severity) }
                ]}
              >
                <Text style={styles.severityText}>{disease.severity}</Text>
              </View>
            </View>
            
            <Text style={styles.diseaseCrop}>Affects: {disease.crop}</Text>
            
            <View style={styles.diseaseSection}>
              <Text style={styles.sectionTitle}>Symptoms:</Text>
              {disease.symptoms.map((symptom, index) => (
                <View key={index} style={styles.symptomItem}>
                  <AlertCircle size={12} color="#dc2626" strokeWidth={2} />
                  <Text style={styles.symptomText}>{symptom}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.diseaseSection}>
              <Text style={styles.sectionTitle}>Treatment:</Text>
              <Text style={styles.treatmentText}>{disease.treatment}</Text>
            </View>
            
            <View style={styles.diseaseSection}>
              <Text style={styles.sectionTitle}>Prevention:</Text>
              <Text style={styles.preventionText}>{disease.prevention}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCareTips = () => (
    <View style={styles.contentContainer}>
      {careTips.map((tip) => (
        <View key={tip.id} style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={[styles.tipIconContainer, { backgroundColor: `${tip.color}20` }]}>
              <tip.icon size={24} color={tip.color} strokeWidth={2} />
            </View>
            <Text style={styles.tipTitle}>{tip.title}</Text>
          </View>
          
          <View style={styles.tipsList}>
            {tip.tips.map((tipText, index) => (
              <View key={index} style={styles.tipItem}>
                <CheckCircle size={14} color={tip.color} strokeWidth={2} />
                <Text style={styles.tipText}>{tipText}</Text>
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
        <View key={index} style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Calendar size={20} color="#059669" strokeWidth={2} />
            <Text style={styles.calendarMonth}>{month.month}</Text>
          </View>
          
          <View style={styles.calendarSection}>
            <Text style={styles.calendarSectionTitle}>Recommended Crops:</Text>
            <View style={styles.cropsContainer}>
              {month.crops.map((crop, cropIndex) => (
                <View key={cropIndex} style={styles.cropTag}>
                  <Text style={styles.cropText}>{crop}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.calendarSection}>
            <Text style={styles.calendarSectionTitle}>Activities:</Text>
            {month.activities.map((activity, actIndex) => (
              <View key={actIndex} style={styles.activityItem}>
                <CheckCircle size={12} color="#059669" strokeWidth={2} />
                <Text style={styles.activityText}>{activity}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (selectedCategory) {
      case 'diseases':
        return renderDiseases();
      case 'care':
        return renderCareTips();
      case 'calendar':
        return renderCalendar();
      default:
        return renderDiseases();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#059669', '#10b981']}
        style={styles.header}
      >
        <BookOpen size={32} color="#ffffff" strokeWidth={2} />
        <Text style={styles.title}>Crop Care Guide</Text>
        <Text style={styles.subtitle}>Essential knowledge for healthy crops</Text>
      </LinearGradient>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              selectedCategory === category.id && styles.activeTab,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <category.icon 
              size={20} 
              color={selectedCategory === category.id ? '#ffffff' : '#6b7280'} 
              strokeWidth={2} 
            />
            <Text
              style={[
                styles.tabText,
                selectedCategory === category.id && styles.activeTabText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {renderContent()}

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
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    gap: 6,
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
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  diseaseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  diseaseImage: {
    width: '100%',
    height: 120,
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
  },
  severityBadge: {
    borderRadius: 8,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  symptomText: {
    fontSize: 14,
    color: '#6b7280',
  },
  treatmentText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  preventionText: {
    fontSize: 14,
    color: '#6b7280',
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  tipIconContainer: {
    borderRadius: 12,
    padding: 8,
  },
  tipTitle: {
    fontSize: 16,
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
    color: '#6b7280',
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  calendarSection: {
    marginBottom: 12,
  },
  calendarSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cropTag: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cropText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  activityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomSpacing: {
    height: 20,
  },
});