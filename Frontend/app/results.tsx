import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalSearchParams, router } from 'expo-router';
import {
  CropType,
  SUPPORTED_CROPS,
  MLAnalysisResult,
} from '@/services/mlService';
import { ThemedScrollView } from '@/components/ThemedView';

export default function ResultsScreen() {
  const { colors } = useTheme();
  const { data, cropId, imageUri } = useLocalSearchParams<{
    data: string;
    cropId: string;
    imageUri?: string;
  }>();

  const crop: CropType | undefined = SUPPORTED_CROPS.find(
    (c) => c.id === cropId,
  );
  const analysis: MLAnalysisResult | null = useMemo(() => {
    if (data) {
      try {
        return JSON.parse(decodeURIComponent(data as string));
      } catch (err) {
        console.error('Failed to parse analysis data', err);
      }
    }
    return null;
  }, [data]);

  if (!analysis?.success || !analysis.prediction || !crop) {
    return (
      <ThemedScrollView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: colors.text }}>No result data</Text>
      </ThemedScrollView>
    );
  }

  const { prediction } = analysis;

  return (
    <ThemedScrollView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        {imageUri && (
          <Image source={{ uri: imageUri as string }} style={styles.image} />
        )}
        <Text style={[styles.cropName, { color: colors.text }]}>
          {crop.icon} {crop.name}
        </Text>
        <Text style={[styles.disease, { color: colors.text }]}>
          {prediction.disease}
        </Text>
        <Text style={[styles.confidence, { color: colors.textSecondary }]}>
          Confidence: {prediction.confidence}%
        </Text>
        <Text style={[styles.severity, { color: colors.textSecondary }]}>
          Severity: {prediction.severity}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recommendations
          </Text>
          {prediction.recommendations.map((rec, idx) => (
            <Text
              key={idx}
              style={[styles.recText, { color: colors.textSecondary }]}
            >
              • {rec}
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.surface, fontWeight: 'bold' }}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  disease: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  confidence: {
    fontSize: 16,
  },
  severity: {
    fontSize: 16,
  },
  section: {
    marginTop: 16,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recText: {
    fontSize: 14,
  },
  button: {
    marginTop: 24,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
});
