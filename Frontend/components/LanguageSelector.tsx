import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Languages } from 'lucide-react-native';
import {
  useLanguage,
  SUPPORTED_LANGUAGES,
  Language,
} from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface LanguageSelectorProps {
  showLabel?: boolean;
  compact?: boolean;
  style?: any;
}

// Helper function to get flag display
const getFlagDisplay = (language: Language) => {
  if (Platform.OS === 'web') {
    // For web, use text fallbacks if emoji doesn't render
    const flagMap: { [key: string]: string } = {
      en: '🇺🇸',
      rw: '🇷🇼',
      fr: '🇫🇷',
    };

    // Try emoji first, fallback to text codes
    const emojiFlag = flagMap[language.code] || language.flag;

    // If emoji doesn't render (check if it's a single character), use text
    if (emojiFlag.length === 2) {
      return emojiFlag; // Emoji flag
    } else {
      // Fallback to text codes
      const textFlags: { [key: string]: string } = {
        en: 'US',
        rw: 'RW',
        fr: 'FR',
      };
      return textFlags[language.code] || language.code.toUpperCase();
    }
  }
  return language.flag;
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  showLabel = true,
  compact = false,
  style,
}) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const { colors, isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLanguageSelect = async (language: Language) => {
    await setLanguage(language);
    setShowDropdown(false);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.selector,
          compact && styles.compactSelector,
          { backgroundColor: colors.surface },
        ]}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Languages size={compact ? 18 : 20} color={colors.textSecondary} />
        {showLabel && !compact && (
          <Text style={[styles.selectorText, { color: colors.text }]}>
            {currentLanguage.nativeName}
          </Text>
        )}
        {compact && (
          <Text
            style={[
              styles.flagText,
              Platform.OS === 'web' && styles.webFlagText,
            ]}
          >
            {getFlagDisplay(currentLanguage)}
          </Text>
        )}
      </TouchableOpacity>

      {showDropdown && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              borderColor: colors.border,
            },
          ]}
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.dropdownItem,
                { borderBottomColor: colors.border },
                currentLanguage.code === language.code && {
                  backgroundColor: colors.primary + '20',
                },
              ]}
              onPress={() => handleLanguageSelect(language)}
            >
              <Text
                style={[styles.flag, Platform.OS === 'web' && styles.webFlag]}
              >
                {getFlagDisplay(language)}
              </Text>
              <View style={styles.languageInfo}>
                <Text
                  style={[
                    styles.languageName,
                    { color: isDarkMode ? '#f9fafb' : '#1f2937' },
                  ]}
                >
                  {language.nativeName}
                </Text>
                <Text
                  style={[
                    styles.languageCode,
                    { color: isDarkMode ? '#9ca3af' : '#6b7280' },
                  ]}
                >
                  {language.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showDropdown && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowDropdown(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  compactSelector: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectorText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  flagText: {
    marginLeft: 4,
    fontSize: 16,
  },
  webFlagText: {
    fontSize: 18, // Slightly larger for web
    fontFamily:
      Platform.OS === 'web'
        ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : undefined,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
    minWidth: 200,
    maxWidth: 250,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  webFlag: {
    fontSize: 22, // Slightly larger for web
    fontFamily:
      Platform.OS === 'web'
        ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : undefined,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageCode: {
    fontSize: 12,
    marginTop: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});
