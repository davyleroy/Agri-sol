import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  AlertCircle,
  CheckCircle,
  Calendar,
  Droplets,
  Sun,
  Leaf,
  Bug,
  Search,
  Filter,
  Info,
} from 'lucide-react-native';
import { ThemedScrollView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Disease {
  id: string;
  name: string;
  name_rw: string;
  name_fr: string;
  crop: string;
  crop_rw: string;
  crop_fr: string;
  severity: 'High' | 'Medium' | 'Low';
  image: string;
  symptoms: string[];
  symptoms_rw: string[];
  symptoms_fr: string[];
  treatment: string;
  treatment_rw: string;
  treatment_fr: string;
  prevention: string;
  prevention_rw: string;
  prevention_fr: string;
  keywords: string[];
}

interface CareTip {
  id: string;
  title: string;
  title_rw: string;
  title_fr: string;
  icon: any;
  color: string;
  tips: string[];
  tips_rw: string[];
  tips_fr: string[];
}

export default function GuideScreen() {
  const [activeTab, setActiveTab] = useState<'diseases' | 'tips' | 'calendar'>(
    'diseases',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const { colors } = useTheme();
  const { t, currentLanguage } = useLanguage();

  const diseases: Disease[] = [
    {
      id: '1',
      name: 'Early Blight',
      name_rw: 'Ubutarumikazi bwo Mu ntangiriro',
      name_fr: 'Mildiou précoce',
      crop: 'Tomato, Potato',
      crop_rw: 'Inyanya, Ibirayi',
      crop_fr: 'Tomate, Pomme de terre',
      severity: 'High',
      image:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: [
        'Brown spots with concentric rings',
        'Yellowing leaves',
        'Fruit rot',
        'Stunted growth',
      ],
      symptoms_rw: [
        "Amaro y'umukara afite imirongo",
        "Ibihingwa by'umukara",
        "Kubora kw'ibyatsi",
        'Kutagira imikuru',
      ],
      symptoms_fr: [
        'Taches brunes avec anneaux concentriques',
        'Feuilles jaunissantes',
        'Pourriture des fruits',
        'Croissance ralentie',
      ],
      treatment:
        'Apply copper-based fungicide, remove affected leaves, improve air circulation',
      treatment_rw:
        "Koresha umuti w'ubutarumikazi wa copper, kuraho ibihingwa by'ubwoko, kunoza umwuka",
      treatment_fr:
        "Appliquer un fongicide à base de cuivre, enlever les feuilles affectées, améliorer la circulation d'air",
      prevention:
        'Crop rotation, proper spacing, avoid overhead watering, use resistant varieties',
      prevention_rw:
        "Guhindura ibihingwa, kugira ibyereke, kurenga amazi hejuru, gukoresha ubwoko bw'ubwoko",
      prevention_fr:
        "Rotation des cultures, espacement approprié, éviter l'arrosage par-dessus, utiliser des variétés résistantes",
      keywords: [
        'early blight',
        'tomato',
        'potato',
        'fungal',
        'brown spots',
        'yellow leaves',
      ],
    },
    {
      id: '2',
      name: 'Late Blight',
      name_rw: 'Ubutarumikazi bwo Mu nyuma',
      name_fr: 'Mildiou tardif',
      crop: 'Tomato, Potato',
      crop_rw: 'Inyanya, Ibirayi',
      crop_fr: 'Tomate, Pomme de terre',
      severity: 'High',
      image:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: [
        'Water-soaked lesions on leaves',
        'White fungal growth in humid conditions',
        'Rapid spread in cool, wet weather',
        'Dark lesions on stems',
      ],
      symptoms_rw: [
        "Amaro y'amazi ku bihingwa",
        "Ubutarumikazi bw'umukara mu mwuka",
        'Kwaguka vuba mu kiruhuko, amazi',
        "Amaro y'umukara ku bihingwa",
      ],
      symptoms_fr: [
        "Lésions imbibées d'eau sur les feuilles",
        'Croissance fongique blanche en conditions humides',
        'Propagation rapide par temps frais et humide',
        'Lésions sombres sur les tiges',
      ],
      treatment:
        'Apply fungicides immediately, remove infected plants, improve drainage',
      treatment_rw:
        "Koresha umuti w'ubutarumikazi vuba, kuraho ibihingwa by'ubwoko, kunoza amazi",
      treatment_fr:
        'Appliquer des fongicides immédiatement, enlever les plantes infectées, améliorer le drainage',
      prevention:
        'Plant resistant varieties, avoid overhead irrigation, maintain good air circulation',
      prevention_rw:
        "Gutera ubwoko bw'ubwoko, kurenga amazi hejuru, kunoza umwuka",
      prevention_fr:
        "Planter des variétés résistantes, éviter l'irrigation par-dessus, maintenir une bonne circulation d'air",
      keywords: [
        'late blight',
        'tomato',
        'potato',
        'phytophthora',
        'water soaked',
        'fungal',
      ],
    },
    {
      id: '3',
      name: 'Powdery Mildew',
      name_rw: "Ubutarumikazi bw'Umukungugu",
      name_fr: 'Oïdium',
      crop: 'Cucumber, Squash, Melon',
      crop_rw: 'Konkombre, Squash, Melon',
      crop_fr: 'Concombre, Courge, Melon',
      severity: 'Medium',
      image:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: [
        'White powdery coating on leaves',
        'Stunted growth',
        'Leaf distortion',
        'Reduced fruit production',
      ],
      symptoms_rw: [
        "Umukungugu w'umukara ku bihingwa",
        'Kutagira imikuru',
        'Guhindura ibihingwa',
        "Kugabanuka kw'ibyatsi",
      ],
      symptoms_fr: [
        'Revêtement poudreux blanc sur les feuilles',
        'Croissance ralentie',
        'Distorsion des feuilles',
        'Réduction de la production de fruits',
      ],
      treatment:
        'Apply sulfur-based fungicide, improve ventilation, remove affected leaves',
      treatment_rw:
        "Koresha umuti w'ubutarumikazi wa sulfur, kunoza umwuka, kuraho ibihingwa by'ubwoko",
      treatment_fr:
        'Appliquer un fongicide à base de soufre, améliorer la ventilation, enlever les feuilles affectées',
      prevention:
        'Plant resistant varieties, maintain proper spacing, avoid overhead watering',
      prevention_rw:
        "Gutera ubwoko bw'ubwoko, kugira ibyereke, kurenga amazi hejuru",
      prevention_fr:
        "Planter des variétés résistantes, maintenir un espacement approprié, éviter l'arrosage par-dessus",
      keywords: [
        'powdery mildew',
        'cucumber',
        'squash',
        'melon',
        'white powder',
        'fungal',
      ],
    },
    {
      id: '4',
      name: 'Bacterial Spot',
      name_rw: "Amaro y'Ibihingwa by'Ubwoko",
      name_fr: 'Tache bactérienne',
      crop: 'Pepper, Tomato',
      crop_rw: 'Uruhuhe, Inyanya',
      crop_fr: 'Poivron, Tomate',
      severity: 'Medium',
      image:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: [
        'Small dark spots with yellow halos',
        'Fruit lesions',
        'Leaf drop in severe cases',
        'Stunted plant growth',
      ],
      symptoms_rw: [
        "Amaro mato y'umukara afite umukara",
        'Amaro ku byatsi',
        "Kugwa kw'ibihingwa mu bihe by'ubwoko",
        "Kutagira imikuru y'ibihingwa",
      ],
      symptoms_fr: [
        'Petites taches sombres avec halos jaunes',
        'Lésions sur les fruits',
        'Chute des feuilles dans les cas graves',
        'Croissance ralentie des plantes',
      ],
      treatment:
        'Use copper sprays, remove infected plants, avoid overhead irrigation',
      treatment_rw:
        "Koresha amazi ya copper, kuraho ibihingwa by'ubwoko, kurenga amazi hejuru",
      treatment_fr:
        "Utiliser des sprays de cuivre, enlever les plantes infectées, éviter l'irrigation par-dessus",
      prevention:
        'Use certified seeds, practice crop rotation, maintain plant spacing',
      prevention_rw:
        "Gukoresha imbuto z'ubwoko, guhindura ibihingwa, kugira ibyereke",
      prevention_fr:
        "Utiliser des semences certifiées, pratiquer la rotation des cultures, maintenir l'espacement des plantes",
      keywords: [
        'bacterial spot',
        'pepper',
        'tomato',
        'bacterial',
        'dark spots',
        'yellow halo',
      ],
    },
    {
      id: '5',
      name: 'Anthracnose',
      name_rw: "Ubutarumikazi bw'Anthracnose",
      name_fr: 'Anthracnose',
      crop: 'Bean, Tomato, Pepper',
      crop_rw: 'Ibishyimbo, Inyanya, Uruhuhe',
      crop_fr: 'Haricot, Tomate, Poivron',
      severity: 'Medium',
      image:
        'https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: [
        'Circular brown lesions on leaves',
        'Sunken spots on fruits',
        'Dark lesions on stems',
        'Premature fruit drop',
      ],
      symptoms_rw: [
        "Amaro y'umukara ku bihingwa",
        'Amaro ku byatsi',
        "Amaro y'umukara ku bihingwa",
        "Kugwa kw'ibyatsi mbere y'igihe",
      ],
      symptoms_fr: [
        'Lésions brunes circulaires sur les feuilles',
        'Taches enfoncées sur les fruits',
        'Lésions sombres sur les tiges',
        'Chute prématurée des fruits',
      ],
      treatment:
        'Apply fungicides, remove infected plant parts, improve air circulation',
      treatment_rw:
        "Koresha umuti w'ubutarumikazi, kuraho ibice by'ibihingwa by'ubwoko, kunoza umwuka",
      treatment_fr:
        "Appliquer des fongicides, enlever les parties infectées des plantes, améliorer la circulation d'air",
      prevention:
        'Use disease-free seeds, practice crop rotation, avoid overhead watering',
      prevention_rw:
        'Gukoresha imbuto zitagira ubwoko, guhindura ibihingwa, kurenga amazi hejuru',
      prevention_fr:
        "Utiliser des semences exemptes de maladies, pratiquer la rotation des cultures, éviter l'arrosage par-dessus",
      keywords: [
        'anthracnose',
        'bean',
        'tomato',
        'pepper',
        'fungal',
        'circular lesions',
      ],
    },
    {
      id: '6',
      name: 'Leaf Spot',
      name_rw: "Amaro y'Ibihingwa",
      name_fr: 'Tache foliaire',
      crop: 'Tomato, Pepper, Bean',
      crop_rw: 'Inyanya, Uruhuhe, Ibishyimbo',
      crop_fr: 'Tomate, Poivron, Haricot',
      severity: 'Low',
      image:
        'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&w=300',
      symptoms: [
        'Small dark spots on leaves',
        'Yellow halos around spots',
        'Leaf yellowing and drop',
        'Reduced photosynthesis',
      ],
      symptoms_rw: [
        "Amaro mato y'umukara ku bihingwa",
        'Umukara ku bihingwa',
        "Ibihingwa by'umukara no kugwa",
        "Kugabanuka kw'ibihingwa",
      ],
      symptoms_fr: [
        'Petites taches sombres sur les feuilles',
        'Halos jaunes autour des taches',
        'Jaunissement et chute des feuilles',
        'Réduction de la photosynthèse',
      ],
      treatment:
        'Remove affected leaves, apply fungicides, improve plant spacing',
      treatment_rw:
        "Kuraho ibihingwa by'ubwoko, koresha umuti w'ubutarumikazi, kunoza ibyereke",
      treatment_fr:
        "Enlever les feuilles affectées, appliquer des fongicides, améliorer l'espacement des plantes",
      prevention:
        'Avoid overhead watering, maintain good air circulation, use resistant varieties',
      prevention_rw:
        "Kurenga amazi hejuru, kunoza umwuka, gukoresha ubwoko bw'ubwoko",
      prevention_fr:
        "Éviter l'arrosage par-dessus, maintenir une bonne circulation d'air, utiliser des variétés résistantes",
      keywords: [
        'leaf spot',
        'tomato',
        'pepper',
        'bean',
        'dark spots',
        'fungal',
      ],
    },
  ];

  const careTips: CareTip[] = [
    {
      id: '1',
      title: 'Watering Best Practices',
      title_rw: 'Uburyo bwiza bwo Kuvomerera',
      title_fr: "Meilleures pratiques d'arrosage",
      icon: Droplets,
      color: '#2563eb',
      tips: [
        'Water early morning or late evening',
        'Water at soil level, not on leaves',
        'Check soil moisture before watering',
        'Use mulch to retain moisture',
        'Avoid overhead watering to prevent diseases',
      ],
      tips_rw: [
        'Kuvomerera mu gitondo cyangwa nimugoroba',
        'Kuvomerera ku butaka, si ku bihingwa',
        "Kureba amazi y'ubutaka mbere yo kuvomerera",
        'Gukoresha mulch kugira amazi',
        'Kurenga amazi hejuru kugira ubwoko',
      ],
      tips_fr: [
        'Arroser tôt le matin ou tard le soir',
        'Arroser au niveau du sol, pas sur les feuilles',
        "Vérifier l'humidité du sol avant d'arroser",
        "Utiliser du paillis pour retenir l'humidité",
        "Éviter l'arrosage par-dessus pour prévenir les maladies",
      ],
    },
    {
      id: '2',
      title: 'Sunlight Requirements',
      title_rw: 'Ibikenewe kuri Izuba',
      title_fr: 'Besoins en lumière solaire',
      icon: Sun,
      color: '#f59e0b',
      tips: [
        'Most vegetables need 6-8 hours of direct sunlight',
        'Observe your garden throughout the day',
        'Consider plant spacing for optimal light',
        'Some crops tolerate partial shade',
        'Rotate crops to maximize sun exposure',
      ],
      tips_rw: [
        "Ibihingwa by'ibyatsi bikenewe amasaha 6-8 y'izuba",
        'Kureba umurima wawe uko umunsi ugenze',
        'Kureba ibyereke kugira izuba',
        'Ibihingwa bimwe bihagije izuba',
        'Guhindura ibihingwa kugira izuba',
      ],
      tips_fr: [
        'La plupart des légumes ont besoin de 6-8 heures de lumière solaire directe',
        'Observer votre jardin tout au long de la journée',
        "Considérer l'espacement des plantes pour une lumière optimale",
        "Certaines cultures tolèrent l'ombre partielle",
        "Faire pivoter les cultures pour maximiser l'exposition au soleil",
      ],
    },
    {
      id: '3',
      title: 'Soil Health Management',
      title_rw: "Gukurikirana Ubuzima bw'Ubutaka",
      title_fr: 'Gestion de la santé du sol',
      icon: Leaf,
      color: '#059669',
      tips: [
        'Test soil pH regularly',
        'Add organic matter to improve soil structure',
        'Practice crop rotation to prevent nutrient depletion',
        'Use cover crops to protect soil',
        'Avoid over-tilling to preserve soil structure',
      ],
      tips_rw: [
        "Kureba pH y'ubutaka buri gihe",
        "Kongeramo ibintu by'ubwoko kunoza ubutaka",
        'Guhindura ibihingwa kugira amashyaka',
        "Gukoresha ibihingwa by'ubwoko kugira ubutaka",
        'Kurenga guhinga cyane kugira ubutaka',
      ],
      tips_fr: [
        'Tester le pH du sol régulièrement',
        'Ajouter de la matière organique pour améliorer la structure du sol',
        "Pratiquer la rotation des cultures pour prévenir l'épuisement des nutriments",
        'Utiliser des cultures de couverture pour protéger le sol',
        'Éviter le sur-labourage pour préserver la structure du sol',
      ],
    },
  ];

  const plantingCalendar = [
    {
      month: 'January',
      month_rw: 'Mutarama',
      month_fr: 'Janvier',
      crops: ['Lettuce', 'Spinach', 'Radishes'],
      crops_rw: ['Lettuce', 'Spinach', 'Radishes'],
      crops_fr: ['Laitue', 'Épinards', 'Radis'],
      activities: ['Prepare soil', 'Plan garden layout'],
      activities_rw: ['Kugira ubutaka', 'Gutegura umurima'],
      activities_fr: ['Préparer le sol', 'Planifier la disposition du jardin'],
    },
    {
      month: 'February',
      month_rw: 'Gashyantare',
      month_fr: 'Février',
      crops: ['Peas', 'Onions', 'Carrots'],
      crops_rw: ['Peas', 'Onions', 'Carrots'],
      crops_fr: ['Pois', 'Oignons', 'Carottes'],
      activities: ['Start seeds indoors', 'Prune fruit trees'],
      activities_rw: ['Gutangira imbuto mu nzu', "Gusatura ibiti by'ibyatsi"],
      activities_fr: [
        "Commencer les semences à l'intérieur",
        'Tailler les arbres fruitiers',
      ],
    },
    {
      month: 'March',
      month_rw: 'Werurwe',
      month_fr: 'Mars',
      crops: ['Tomatoes', 'Peppers', 'Herbs'],
      crops_rw: ['Inyanya', 'Uruhuhe', 'Imiti'],
      crops_fr: ['Tomates', 'Poivrons', 'Herbes'],
      activities: ['Transplant seedlings', 'Apply mulch'],
      activities_rw: ['Guhindura ibihingwa', 'Gukoresha mulch'],
      activities_fr: ['Transplanter les semis', 'Appliquer du paillis'],
    },
    {
      month: 'April',
      month_rw: 'Mata',
      month_fr: 'Avril',
      crops: ['Beans', 'Potatoes', 'Squash', 'Corn'],
      crops_rw: ['Ibishyimbo', 'Ibirayi', 'Squash', 'Ibigori'],
      crops_fr: ['Haricots', 'Pommes de terre', 'Courges', 'Maïs'],
      activities: ['Direct sow warm crops', 'Install supports'],
      activities_rw: ["Gutera ibihingwa by'ubwoko", 'Gushyira ibintu'],
      activities_fr: [
        'Semer directement les cultures chaudes',
        'Installer les supports',
      ],
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const getLocalizedText = (text: string, text_rw: string, text_fr: string) => {
    switch (currentLanguage.code) {
      case 'rw':
        return text_rw;
      case 'fr':
        return text_fr;
      default:
        return text;
    }
  };

  const getLocalizedArray = (
    array: string[],
    array_rw: string[],
    array_fr: string[],
  ) => {
    switch (currentLanguage.code) {
      case 'rw':
        return array_rw;
      case 'fr':
        return array_fr;
      default:
        return array;
    }
  };

  // Filter diseases based on search query and selected crop
  const filteredDiseases = useMemo(() => {
    let filtered = diseases;

    if (searchQuery) {
      filtered = filtered.filter(
        (disease) =>
          disease.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          disease.crop.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCrop) {
      filtered = filtered.filter((disease) =>
        disease.crop.toLowerCase().includes(selectedCrop.toLowerCase()),
      );
    }

    return filtered;
  }, [searchQuery, selectedCrop]);

  const renderDiseases = () => (
    <View style={styles.contentContainer}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('searchDiseases') || 'Search diseases...'}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Crop Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cropFilter}
        >
          <TouchableOpacity
            style={[
              styles.cropFilterButton,
              {
                backgroundColor:
                  selectedCrop === null ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedCrop(null)}
          >
            <Text
              style={[
                styles.cropFilterText,
                {
                  color:
                    selectedCrop === null
                      ? colors.surface
                      : colors.textSecondary,
                },
              ]}
            >
              {t('allCrops') || 'All Crops'}
            </Text>
          </TouchableOpacity>
          {['Tomato', 'Potato', 'Bean', 'Pepper', 'Cucumber'].map((crop) => (
            <TouchableOpacity
              key={crop}
              style={[
                styles.cropFilterButton,
                {
                  backgroundColor:
                    selectedCrop === crop ? colors.primary : colors.border,
                },
              ]}
              onPress={() =>
                setSelectedCrop(selectedCrop === crop ? null : crop)
              }
            >
              <Text
                style={[
                  styles.cropFilterText,
                  {
                    color:
                      selectedCrop === crop
                        ? colors.surface
                        : colors.textSecondary,
                  },
                ]}
              >
                {getLocalizedText(crop, crop, crop)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredDiseases.map((disease) => (
        <View
          key={disease.id}
          style={[styles.diseaseCard, { backgroundColor: colors.surface }]}
        >
          <Image source={{ uri: disease.image }} style={styles.diseaseImage} />

          <View style={styles.diseaseContent}>
            <View style={styles.diseaseHeader}>
              <Text style={[styles.diseaseName, { color: colors.text }]}>
                {getLocalizedText(
                  disease.name,
                  disease.name_rw,
                  disease.name_fr,
                )}
              </Text>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(disease.severity) },
                ]}
              >
                <Text style={styles.severityText}>{disease.severity}</Text>
              </View>
            </View>

            <Text style={[styles.diseaseCrop, { color: colors.textSecondary }]}>
              {t('affects') || 'Affects'}:{' '}
              {getLocalizedText(disease.crop, disease.crop_rw, disease.crop_fr)}
            </Text>

            <View style={styles.diseaseSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('symptoms') || 'Symptoms'}:
              </Text>
              {getLocalizedArray(
                disease.symptoms,
                disease.symptoms_rw,
                disease.symptoms_fr,
              ).map((symptom, index) => (
                <View key={index} style={styles.symptomItem}>
                  <AlertCircle size={12} color="#dc2626" strokeWidth={2} />
                  <Text
                    style={[
                      styles.symptomText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {symptom}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.diseaseSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('treatment') || 'Treatment'}:
              </Text>
              <Text
                style={[styles.treatmentText, { color: colors.textSecondary }]}
              >
                {getLocalizedText(
                  disease.treatment,
                  disease.treatment_rw,
                  disease.treatment_fr,
                )}
              </Text>
            </View>

            <View style={styles.diseaseSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('prevention') || 'Prevention'}:
              </Text>
              <Text
                style={[styles.preventionText, { color: colors.textSecondary }]}
              >
                {getLocalizedText(
                  disease.prevention,
                  disease.prevention_rw,
                  disease.prevention_fr,
                )}
              </Text>
            </View>
          </View>
        </View>
      ))}

      {filteredDiseases.length === 0 && (
        <View style={styles.emptyContainer}>
          <Search size={48} color="#6b7280" strokeWidth={1} />
          <Text style={styles.emptyTitle}>
            {t('noDiseasesFound') || 'No diseases found'}
          </Text>
          <Text style={styles.emptyText}>
            {t('tryDifferentSearch') ||
              'Try a different search term or crop filter.'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderCareTips = () => (
    <View style={styles.contentContainer}>
      {careTips.map((tip) => (
        <View
          key={tip.id}
          style={[styles.tipCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.tipHeader}>
            <View
              style={[
                styles.tipIconContainer,
                { backgroundColor: `${tip.color}20` },
              ]}
            >
              <tip.icon size={24} color={tip.color} strokeWidth={2} />
            </View>
            <Text style={[styles.tipTitle, { color: colors.text }]}>
              {getLocalizedText(tip.title, tip.title_rw, tip.title_fr)}
            </Text>
          </View>

          <View style={styles.tipsList}>
            {getLocalizedArray(tip.tips, tip.tips_rw, tip.tips_fr).map(
              (tipText, index) => (
                <View key={index} style={styles.tipItem}>
                  <CheckCircle size={14} color={tip.color} strokeWidth={2} />
                  <Text
                    style={[styles.tipText, { color: colors.textSecondary }]}
                  >
                    {tipText}
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCalendar = () => (
    <View style={styles.contentContainer}>
      {plantingCalendar.map((month, index) => (
        <View
          key={index}
          style={[styles.calendarCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.calendarHeader}>
            <Calendar size={20} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.calendarMonth, { color: colors.text }]}>
              {getLocalizedText(month.month, month.month_rw, month.month_fr)}
            </Text>
          </View>

          <View style={styles.calendarSection}>
            <Text style={[styles.calendarSectionTitle, { color: colors.text }]}>
              {t('recommendedCrops') || 'Recommended Crops'}:
            </Text>
            <View style={styles.cropsContainer}>
              {getLocalizedArray(
                month.crops,
                month.crops_rw,
                month.crops_fr,
              ).map((crop, cropIndex) => (
                <View key={cropIndex} style={styles.cropTag}>
                  <Text style={[styles.cropText, { color: colors.primary }]}>
                    {crop}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.calendarSection}>
            <Text style={[styles.calendarSectionTitle, { color: colors.text }]}>
              {t('activities') || 'Activities'}:
            </Text>
            {getLocalizedArray(
              month.activities,
              month.activities_rw,
              month.activities_fr,
            ).map((activity, actIndex) => (
              <View key={actIndex} style={styles.activityItem}>
                <CheckCircle size={12} color="#059669" strokeWidth={2} />
                <Text
                  style={[styles.activityText, { color: colors.textSecondary }]}
                >
                  {activity}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'diseases':
        return renderDiseases();
      case 'tips':
        return renderCareTips();
      case 'calendar':
        return renderCalendar();
      default:
        return renderDiseases();
    }
  };

  const tabs = [
    { id: 'diseases', label: t('diseases') || 'Diseases', icon: Bug },
    { id: 'tips', label: t('careTips') || 'Care Tips', icon: Leaf },
    { id: 'calendar', label: t('planting') || 'Planting', icon: Calendar },
  ];

  return (
    <ThemedScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={['#059669', '#10b981']} style={styles.header}>
        <BookOpen size={32} color="#ffffff" strokeWidth={2} />
        <Text style={styles.title}>
          {t('cropCareGuide') || 'Crop Care Guide'}
        </Text>
        <Text style={styles.subtitle}>
          {t('essentialKnowledge') || 'Essential knowledge for healthy crops'}
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: colors.primary },
            ]}
            onPress={() =>
              setActiveTab(tab.id as 'diseases' | 'tips' | 'calendar')
            }
          >
            <tab.icon
              size={20}
              color={
                activeTab === tab.id ? colors.surface : colors.textSecondary
              }
              strokeWidth={2}
            />
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                activeTab === tab.id && { color: colors.surface },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  cropFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  cropFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cropFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  diseaseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  diseaseImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  diseaseContent: {
    padding: 16,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  severityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  diseaseCrop: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  diseaseSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  symptomText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  treatmentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  preventionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipIconContainer: {
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  calendarSection: {
    marginBottom: 12,
  },
  calendarSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropTag: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cropText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});
