import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Camera,
  Save,
  Leaf,
  TrendingUp,
} from 'lucide-react-native';

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const { disease, confidence, recommendation } = params;

  // Mock additional data
  const additionalInfo = {
    severity: disease === 'Healthy Plant' ? 'None' : 'Medium',
    affectedArea: disease === 'Healthy Plant' ? '0%' : '15%',
    treatmentUrgency: disease === 'Healthy Plant' ? 'None' : 'Moderate',
    estimatedRecovery: disease === 'Healthy Plant' ? 'N/A' : '2-3 weeks',
  };

  const recommendations = [
    {
      title: 'Immediate Action',
      action: disease === 'Healthy Plant' 
        ? 'Continue regular maintenance routine'
        : 'Remove affected leaves and apply appropriate treatment',
      icon: AlertTriangle,
      color: disease === 'Healthy Plant' ? '#059669' : '#f59e0b',
    },
    {
      title: 'Prevention',
      action: 'Ensure proper spacing and air circulation around plants',
      icon: Leaf,
      color: '#059669',
    },
    {
      title: 'Monitoring',
      action: 'Check plants weekly for signs of disease progression',
      icon: TrendingUp,
      color: '#2563eb',
    },
  ];

  const isHealthy = disease === 'Healthy Plant';
  const confidenceNum = parseInt(confidence as string);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Agrisol Analysis Results:\n\nDetected: ${disease}\nConfidence: ${confidence}%\nRecommendation: ${recommendation}\n\nAnalyzed with Agrisol - AI-Powered Crop Health Monitor`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSave = () => {
    Alert.alert(
      'Analysis Saved',
      'Your scan results have been saved to your history.',
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = () => {
    if (isHealthy) return '#059669';
    return '#dc2626';
  };

  const getStatusIcon = () => {
    return isHealthy ? CheckCircle : AlertTriangle;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={isHealthy ? ['#059669', '#10b981'] : ['#dc2626', '#ef4444']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.statusIcon}>
            {React.createElement(getStatusIcon(), {
              size: 48,
              color: '#ffffff',
              strokeWidth: 2,
            })}
          </View>
          <Text style={styles.resultTitle}>Analysis Complete</Text>
          <Text style={styles.resultSubtitle}>
            {isHealthy ? 'Great news!' : 'Issue detected'}
          </Text>
        </View>
      </LinearGradient>

      {/* Sample Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: isHealthy
              ? 'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=400'
              : 'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&w=400',
          }}
          style={styles.cropImage}
        />
      </View>

      {/* Main Results Card */}
      <View style={styles.resultsCard}>
        <View style={styles.mainResult}>
          <Text style={styles.diseaseTitle}>{disease}</Text>
          <View style={styles.confidenceContainer}>
            <View style={[styles.confidenceBar, { backgroundColor: getStatusColor() }]}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${confidenceNum}%`, backgroundColor: '#ffffff' },
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>{confidence}% Confidence</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Severity</Text>
            <Text style={[styles.detailValue, { color: getStatusColor() }]}>
              {additionalInfo.severity}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Affected Area</Text>
            <Text style={styles.detailValue}>{additionalInfo.affectedArea}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Urgency</Text>
            <Text style={styles.detailValue}>{additionalInfo.treatmentUrgency}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Recovery Time</Text>
            <Text style={styles.detailValue}>{additionalInfo.estimatedRecovery}</Text>
          </View>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={[styles.recIcon, { backgroundColor: `${rec.color}20` }]}>
              <rec.icon size={20} color={rec.color} strokeWidth={2} />
            </View>
            <View style={styles.recContent}>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.recDescription}>{rec.action}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Detailed Recommendation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Analysis</Text>
        <View style={styles.detailedCard}>
          <Text style={styles.detailedText}>{recommendation}</Text>
          
          {!isHealthy && (
            <View style={styles.warningContainer}>
              <AlertTriangle size={16} color="#f59e0b" strokeWidth={2} />
              <Text style={styles.warningText}>
                Monitor your plant closely and consider consulting with a local agricultural expert for severe cases.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/scan')}>
          <Camera size={20} color="#ffffff" strokeWidth={2} />
          <Text style={styles.primaryButtonText}>New Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSave}>
          <Save size={20} color="#059669" strokeWidth={2} />
          <Text style={styles.secondaryButtonText}>Save Result</Text>
        </TouchableOpacity>
      </View>

      {/* Guide Link */}
      <TouchableOpacity
        style={styles.guideLink}
        onPress={() => router.push('/guide')}
      >
        <BookOpen size={20} color="#6b7280" strokeWidth={2} />
        <Text style={styles.guideLinkText}>View Crop Care Guide</Text>
      </TouchableOpacity>

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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  statusIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    padding: 16,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginTop: -30,
  },
  cropImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  resultsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mainResult: {
    alignItems: 'center',
    marginBottom: 20,
  },
  diseaseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  confidenceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  recommendationCard: {
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
  recIcon: {
    borderRadius: 10,
    padding: 8,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  recDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  detailedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  detailedText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  guideLinkText: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
  bottomSpacing: {
    height: 30,
  },
});