import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedScrollView } from '@/components/ThemedView';
import { SUPPORTED_CROPS, CropType } from '@/services/mlService';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

export default function CropSelectionScreen() {
  const { colors } = useTheme();

  const handleSelect = (crop: CropType) => {
    router.push({
      pathname: '/scan',
      params: { cropId: crop.id, cropChosen: '1' },
    } as any);
  };

  return (
    <ThemedScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Select Crop</Text>
        {SUPPORTED_CROPS.map((crop) => (
          <TouchableOpacity
            key={crop.id}
            style={[styles.card, { backgroundColor: colors.surface }]}
            activeOpacity={0.8}
            onPress={() => handleSelect(crop)}
          >
            <Text style={[styles.cardIcon]}>{crop.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {crop.name}
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                {' '}
                {crop.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 14,
  },
});
