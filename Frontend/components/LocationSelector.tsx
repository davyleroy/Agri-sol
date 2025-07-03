import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MapPin, Globe } from 'lucide-react-native';
import {
  getCountriesForDropdown,
  getProvincesForDropdown,
  getDistrictsForProvince,
  getSectorsForDistrict,
} from '@/services/locationService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export interface LocationData {
  country: string;
  province?: string;
  district?: string;
  sector?: string;
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  error?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const { currentLanguage, t } = useLanguage();
  const { colors } = useTheme();

  const [provinces, setProvinces] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [districts, setDistricts] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [sectors, setSectors] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const countries = getCountriesForDropdown();

  // Initialize provinces on component mount
  useEffect(() => {
    const provincesData = getProvincesForDropdown();
    setProvinces(provincesData);
  }, []);

  // Update districts when province changes
  useEffect(() => {
    if (value.province) {
      const districtsData = getDistrictsForProvince(value.province);
      setDistricts(districtsData);

      // Reset district and sector if current district is no longer valid
      if (
        value.district &&
        !districtsData.find((d) => d.value === value.district)
      ) {
        onChange({
          ...value,
          district: '',
          sector: '',
        });
      }
    } else {
      setDistricts([]);
      setSectors([]);
    }
  }, [value.province]);

  // Update sectors when district changes
  useEffect(() => {
    if (value.province && value.district) {
      const sectorsData = getSectorsForDistrict(value.province, value.district);
      setSectors(sectorsData);

      // Reset sector if current sector is no longer valid
      if (value.sector && !sectorsData.find((s) => s.value === value.sector)) {
        onChange({
          ...value,
          sector: '',
        });
      }
    } else {
      setSectors([]);
    }
  }, [value.province, value.district]);

  const handleCountryChange = (country: string) => {
    onChange({
      country,
      province: undefined,
      district: undefined,
      sector: undefined,
    });
  };

  const handleProvinceChange = (province: string) => {
    onChange({
      ...value,
      province,
      district: undefined,
      sector: undefined,
    });
  };

  const handleDistrictChange = (district: string) => {
    onChange({
      ...value,
      district,
      sector: undefined,
    });
  };

  const handleSectorChange = (sector: string) => {
    onChange({
      ...value,
      sector,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Globe size={20} color={colors.text} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('location.country')}
          </Text>
        </View>
        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Picker
            selectedValue={value.country}
            onValueChange={handleCountryChange}
            style={[styles.picker, { color: colors.text }]}
            dropdownIconColor={colors.text}
          >
            <Picker.Item
              label={t('location.selectCountry')}
              value=""
              color={colors.textSecondary}
            />
            {countries.map((country) => (
              <Picker.Item
                key={country.value}
                label={country.label}
                value={country.value}
                color={colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>

      {value.country === 'RW' && (
        <>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={colors.text} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('location.province')}
              </Text>
            </View>
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Picker
                selectedValue={value.province || ''}
                onValueChange={handleProvinceChange}
                style={[styles.picker, { color: colors.text }]}
                dropdownIconColor={colors.text}
              >
                <Picker.Item
                  label={t('location.selectProvince')}
                  value=""
                  color={colors.textSecondary}
                />
                {provinces.map((province) => (
                  <Picker.Item
                    key={province.value}
                    label={province.label}
                    value={province.value}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {value.province && districts.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <MapPin size={18} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('location.district')}
                </Text>
              </View>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Picker
                  selectedValue={value.district || ''}
                  onValueChange={handleDistrictChange}
                  style={[styles.picker, { color: colors.text }]}
                  dropdownIconColor={colors.text}
                >
                  <Picker.Item
                    label={t('location.selectDistrict')}
                    value=""
                    color={colors.textSecondary}
                  />
                  {districts.map((district) => (
                    <Picker.Item
                      key={district.value}
                      label={district.label}
                      value={district.value}
                      color={colors.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {value.district && sectors.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <MapPin size={16} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('location.sector')}
                </Text>
              </View>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Picker
                  selectedValue={value.sector || ''}
                  onValueChange={handleSectorChange}
                  style={[styles.picker, { color: colors.text }]}
                  dropdownIconColor={colors.text}
                >
                  <Picker.Item
                    label={t('location.selectSector')}
                    value=""
                    color={colors.textSecondary}
                  />
                  {sectors.map((sector) => (
                    <Picker.Item
                      key={sector.value}
                      label={sector.label}
                      value={sector.value}
                      color={colors.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </>
      )}

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 64,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    minWidth: 100,
    maxWidth: 300,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
});
