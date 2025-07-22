import React from 'react';
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
  CheckCircle,
  AlertTriangle,
  Info,
  Share2,
  BookOpen,
  MapPin,
  Clock,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface PredictionCardProps {
  image: string;
  crop: string;
  disease: string;
  confidence: number;
  status: 'healthy' | 'disease';
  location?: string;
  timestamp: string;
  onViewGuide?: () => void;
  onShare?: () => void;
}

export default function PredictionCard({
  image,
  crop,
  disease,
  confidence,
  status,
  location,
  timestamp,
  onViewGuide,
  onShare,
}: PredictionCardProps) {
  const { colors } = useTheme();
  const { t, currentLanguage } = useLanguage();

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
      Anthracnose: {
        en: 'Anthracnose',
        rw: "Ubutarumikazi bw'Anthracnose",
        fr: 'Anthracnose',
      },
      'Septoria Leaf Spot': {
        en: 'Septoria Leaf Spot',
        rw: "Amaro y'Ibihingwa ya Septoria",
        fr: 'Tache septorienne',
      },
      'Target Spot': {
        en: 'Target Spot',
        rw: "Amaro y'Ibihingwa ya Target",
        fr: 'Tache cible',
      },
      'Yellow Leaf Curl Virus': {
        en: 'Yellow Leaf Curl Virus',
        rw: "Virus y'Ibihingwa by'Umukungugu",
        fr: 'Virus de la feuille jaune',
      },
      'Mosaic Virus': {
        en: 'Mosaic Virus',
        rw: "Virus y'Ibihingwa by'Mosaic",
        fr: 'Virus de la mosaïque',
      },
      Healthy: {
        en: 'Healthy',
        rw: 'Bikomeye',
        fr: 'Sain',
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
      Pepper: {
        en: 'Pepper',
        rw: 'Uruhuhe',
        fr: 'Poivron',
      },
      Cucumber: {
        en: 'Cucumber',
        rw: 'Konkombre',
        fr: 'Concombre',
      },
      Squash: {
        en: 'Squash',
        rw: 'Squash',
        fr: 'Courge',
      },
    };

    return cropTranslations[crop]?.[currentLanguage.code] || crop;
  };

  const getStatusColor = () => {
    return status === 'healthy' ? '#059669' : '#dc2626';
  };

  const getStatusIcon = () => {
    return status === 'healthy' ? CheckCircle : AlertTriangle;
  };

  const getConfidenceColor = () => {
    if (confidence >= 90) return '#059669';
    if (confidence >= 70) return '#f59e0b';
    return '#dc2626';
  };

  const getConfidenceText = () => {
    if (confidence >= 90) return t('highConfidence') || 'High Confidence';
    if (confidence >= 70) return t('mediumConfidence') || 'Medium Confidence';
    return t('lowConfidence') || 'Low Confidence';
  };

  const getTreatmentUrgency = () => {
    if (status === 'healthy') return null;

    if (confidence >= 90) {
      return {
        level: t('immediate') || 'Immediate',
        color: '#dc2626',
        description: t('immediateTreatment') || 'Immediate treatment required',
      };
    }
    if (confidence >= 70) {
      return {
        level: t('urgent') || 'Urgent',
        color: '#f59e0b',
        description: t('urgentTreatment') || 'Treatment needed soon',
      };
    }
    return {
      level: t('monitor') || 'Monitor',
      color: '#6b7280',
      description: t('monitorClosely') || 'Monitor closely for symptoms',
    };
  };

  const handleViewGuide = () => {
    if (onViewGuide) {
      onViewGuide();
    } else {
      Alert.alert(
        t('guide') || 'Guide',
        t('guideNotAvailable') || 'Guide feature not available yet',
      );
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      Alert.alert(
        t('share') || 'Share',
        t('shareNotAvailable') || 'Share feature not available yet',
      );
    }
  };

  const StatusIcon = getStatusIcon();
  const treatmentUrgency = getTreatmentUrgency();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <LinearGradient
        colors={
          status === 'healthy' ? ['#059669', '#10b981'] : ['#dc2626', '#ef4444']
        }
        style={styles.header}
      >
        <StatusIcon size={24} color="#ffffff" strokeWidth={2} />
        <Text style={styles.headerTitle}>
          {status === 'healthy'
            ? t('healthyPlant') || 'Healthy Plant'
            : t('diseaseDetected') || 'Disease Detected'}
        </Text>
      </LinearGradient>

      {/* Image */}
      <Image source={{ uri: image }} style={styles.image} />

      {/* Content */}
      <View style={styles.content}>
        {/* Crop and Disease */}
        <View style={styles.mainInfo}>
          <Text style={[styles.cropText, { color: colors.text }]}>
            {getCropTranslation(crop)}
          </Text>
          <Text style={[styles.diseaseText, { color: colors.textSecondary }]}>
            {getDiseaseTranslation(disease)}
          </Text>
        </View>

        {/* Confidence */}
        <View style={styles.confidenceContainer}>
          <View
            style={[styles.confidenceBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.confidenceFill,
                {
                  backgroundColor: getConfidenceColor(),
                  width: `${confidence}%`,
                },
              ]}
            />
          </View>
          <View style={styles.confidenceInfo}>
            <Text
              style={[styles.confidenceValue, { color: getConfidenceColor() }]}
            >
              {confidence}%
            </Text>
            <Text
              style={[styles.confidenceLabel, { color: colors.textSecondary }]}
            >
              {getConfidenceText()}
            </Text>
          </View>
        </View>

        {/* Treatment Urgency */}
        {treatmentUrgency && (
          <View style={styles.urgencyContainer}>
            <View
              style={[
                styles.urgencyBadge,
                { backgroundColor: `${treatmentUrgency.color}20` },
              ]}
            >
              <AlertTriangle
                size={16}
                color={treatmentUrgency.color}
                strokeWidth={2}
              />
              <Text
                style={[styles.urgencyText, { color: treatmentUrgency.color }]}
              >
                {treatmentUrgency.level}
              </Text>
            </View>
            <Text
              style={[
                styles.urgencyDescription,
                { color: colors.textSecondary },
              ]}
            >
              {treatmentUrgency.description}
            </Text>
          </View>
        )}

        {/* Location and Time */}
        <View style={styles.metadata}>
          {location && (
            <View style={styles.metadataItem}>
              <MapPin size={14} color={colors.textSecondary} strokeWidth={2} />
              <Text
                style={[styles.metadataText, { color: colors.textSecondary }]}
              >
                {location}
              </Text>
            </View>
          )}
          <View style={styles.metadataItem}>
            <Clock size={14} color={colors.textSecondary} strokeWidth={2} />
            <Text
              style={[styles.metadataText, { color: colors.textSecondary }]}
            >
              {timestamp}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleViewGuide}
          >
            <BookOpen size={16} color="#ffffff" strokeWidth={2} />
            <Text style={styles.actionButtonText}>
              {t('viewGuide') || 'View Guide'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.border }]}
            onPress={handleShare}
          >
            <Share2 size={16} color={colors.textSecondary} strokeWidth={2} />
            <Text
              style={[styles.actionButtonText, { color: colors.textSecondary }]}
            >
              {t('share') || 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  mainInfo: {
    marginBottom: 16,
  },
  cropText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  diseaseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confidenceLabel: {
    fontSize: 14,
  },
  urgencyContainer: {
    marginBottom: 16,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 6,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  urgencyDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  metadata: {
    marginBottom: 16,
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
