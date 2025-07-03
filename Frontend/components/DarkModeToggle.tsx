import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface DarkModeToggleProps {
  compact?: boolean;
  style?: any;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  compact = false,
  style,
}) => {
  const { isDarkMode, toggleDarkMode, colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        compact && styles.compactContainer,
        { backgroundColor: colors.surface },
        style,
      ]}
      onPress={toggleDarkMode}
      activeOpacity={0.7}
    >
      {isDarkMode ? (
        <Moon size={compact ? 18 : 20} color={colors.text} strokeWidth={2} />
      ) : (
        <Sun size={compact ? 18 : 20} color={colors.text} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 44,
    minHeight: 44,
  },
  compactContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 36,
    minHeight: 36,
  },
});
