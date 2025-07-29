import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';

// Helper function to get flag display (same as in LanguageSelector)
const getFlagDisplay = (language: any) => {
  if (Platform.OS === 'web') {
    const flagMap: { [key: string]: string } = {
      en: '🇺🇸',
      rw: '🇷🇼',
      fr: '🇫🇷',
    };

    const emojiFlag = flagMap[language.code] || language.flag;

    if (emojiFlag.length === 2) {
      return emojiFlag;
    } else {
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

export const FlagTest: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flag Display Test</Text>
      <Text style={styles.platform}>Platform: {Platform.OS}</Text>

      {SUPPORTED_LANGUAGES.map((language) => (
        <View key={language.code} style={styles.flagRow}>
          <Text style={styles.flag}>{getFlagDisplay(language)}</Text>
          <Text style={styles.languageName}>{language.name}</Text>
          <Text style={styles.languageCode}>({language.code})</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  platform: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  flag: {
    fontSize: 24,
    marginRight: 10,
    fontFamily:
      Platform.OS === 'web'
        ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : undefined,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 5,
  },
  languageCode: {
    fontSize: 12,
    color: '#666',
  },
});
