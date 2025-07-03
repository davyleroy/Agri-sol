import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  showLabel = true,
  compact = false,
  style,
}) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const { colors } = useTheme();
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
        {compact && <Text style={styles.flagText}>{currentLanguage.flag}</Text>}
      </TouchableOpacity>

      {showDropdown && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.surface, borderColor: colors.border },
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
              <Text style={styles.flag}>{language.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: colors.text }]}>
                  {language.nativeName}
                </Text>
                <Text
                  style={[styles.languageCode, { color: colors.textSecondary }]}
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
