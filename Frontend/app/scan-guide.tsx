import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ThemedScrollView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  Image as ImageIcon,
  CheckCircle,
  FlipHorizontal,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

export default function ScanGuideScreen() {
  const { colors } = useTheme();

  const steps = [
    {
      id: 1,
      title: 'Grant Permission',
      description:
        'Allow Agrisol to access your camera so we can analyse crop images.',
      icon: Camera,
    },
    {
      id: 2,
      title: 'Position the Leaf',
      description:
        'Place the affected leaf in the centre of the frame under good lighting.',
      icon: FlipHorizontal,
    },
    {
      id: 3,
      title: 'Capture or Upload',
      description:
        'Tap the shutter button or choose a photo from your gallery.',
      icon: ImageIcon,
    },
    {
      id: 4,
      title: 'Get Instant Results',
      description:
        'Agrisol detects diseases and recommends treatments in seconds.',
      icon: Zap,
    },
  ];

  return (
    <ThemedScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <Camera size={40} color="#ffffff" strokeWidth={2} />
        <Text style={styles.headerTitle}>How to Scan</Text>
        <Text style={styles.headerSubtitle}>
          Follow these simple steps to diagnose your crops
        </Text>
      </LinearGradient>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step) => (
          <View
            key={step.id}
            style={[styles.stepCard, { backgroundColor: colors.surface }]}
          >
            <View
              style={[
                styles.stepIconContainer,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <step.icon size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {step.title}
              </Text>
              <Text
                style={[
                  styles.stepDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {step.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 6,
    textAlign: 'center',
  },
  stepsContainer: {
    padding: 20,
    gap: 16,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  stepIconContainer: {
    borderRadius: 12,
    padding: 10,
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
