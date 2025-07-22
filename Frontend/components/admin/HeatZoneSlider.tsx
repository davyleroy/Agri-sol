import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface HeatZoneSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function HeatZoneSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 5,
}: HeatZoneSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const sliderWidth = 200; // Approximate slider width
    const percentage = Math.max(
      0,
      Math.min(100, (locationX / sliderWidth) * 100),
    );
    const newValue = Math.round(percentage / step) * step;
    onValueChange(Math.max(min, Math.min(max, newValue)));
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onValueChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onValueChange(newValue);
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return '#ef4444'; // Red for high intensity
    if (intensity >= 60) return '#f59e0b'; // Orange for medium intensity
    if (intensity >= 40) return '#eab308'; // Yellow for low-medium intensity
    return '#22c55e'; // Green for low intensity
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <MaterialIcons
          name="whatshot"
          size={16}
          color={getIntensityColor(value)}
        />
        <Text style={styles.label}>Heat Zone Intensity: {value}%</Text>
      </View>

      <View style={styles.sliderContainer}>
        <TouchableOpacity
          style={styles.decrementButton}
          onPress={handleDecrement}
          disabled={value <= min}
        >
          <MaterialIcons
            name="remove"
            size={16}
            color={value <= min ? '#9ca3af' : '#6b7280'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sliderTrack}
          onPress={handleSliderPress}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.sliderFill,
              {
                width: `${((value - min) / (max - min)) * 100}%`,
                backgroundColor: getIntensityColor(value),
              },
            ]}
          />
          <View
            style={[
              styles.sliderThumb,
              {
                left: `${((value - min) / (max - min)) * 100}%`,
                backgroundColor: getIntensityColor(value),
              },
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.incrementButton}
          onPress={handleIncrement}
          disabled={value >= max}
        >
          <MaterialIcons
            name="add"
            size={16}
            color={value >= max ? '#9ca3af' : '#6b7280'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.intensityLabels}>
        <Text style={styles.intensityLabel}>Low</Text>
        <Text style={styles.intensityLabel}>Medium</Text>
        <Text style={styles.intensityLabel}>High</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decrementButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  incrementButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  intensityLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
});
