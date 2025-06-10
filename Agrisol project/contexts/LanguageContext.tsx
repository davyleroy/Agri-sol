import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'rw',
    name: 'Kinyarwanda',
    nativeName: 'Ikinyarwanda',
    flag: '🇷🇼',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = '@agrisol_language';

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    home: 'Home',
    scan: 'Scan',
    history: 'History',
    guide: 'Guide',
    settings: 'Settings',
    
    // Home Screen
    welcomeToAgrisol: 'Welcome to',
    appTitle: 'Agrisol',
    appSubtitle: 'AI-Powered Crop Health Monitor',
    quickScan: 'Quick Scan',
    takePhoto: 'Take Photo',
    captureImage: 'Capture crop image',
    fromGallery: 'From Gallery',
    selectExisting: 'Select existing photo',
    todaysOverview: "Today's Overview",
    scansToday: 'Scans Today',
    healthyPlants: 'Healthy Plants',
    waterLevel: 'Water Level',
    good: 'Good',
    howItWorks: 'How It Works',
    diseaseDetection: 'Disease Detection',
    diseaseDetectionDesc: 'AI-powered identification of crop diseases and pests',
    instantAnalysis: 'Instant Analysis',
    instantAnalysisDesc: 'Get results in seconds with high accuracy',
    treatmentRecommendations: 'Treatment Recommendations',
    treatmentRecommendationsDesc: 'Personalized care instructions for your crops',
    sampleDetection: 'Sample Detection',
    healthyTomatoPlant: 'Healthy Tomato Plant',
    healthyPlantDesc: 'Your plant appears healthy. Continue with regular maintenance and monitoring.',
    
    // Scan Screen
    scanYourCrop: 'Scan Your Crop',
    scanSubtitle: 'Choose how you\'d like to capture or select your crop image',
    chooseFromGallery: 'Choose from Gallery',
    selectFromGallery: 'Select existing photo from gallery',
    tipsForBetter: 'Tips for Better Results',
    ensureGoodLighting: 'Ensure good lighting',
    focusOnAffected: 'Focus on affected areas',
    keepCameraStady: 'Keep camera steady',
    cameraAccessRequired: 'Camera Access Required',
    cameraPermissionDesc: 'We need camera access to capture images of your crops for analysis.',
    grantPermission: 'Grant Permission',
    positionPlantCenter: 'Position the plant leaf in the center',
    
    // Results Screen
    analysisComplete: 'Analysis Complete',
    greatNews: 'Great news!',
    issueDetected: 'Issue detected',
    confidence: 'Confidence',
    severity: 'Severity',
    affectedArea: 'Affected Area',
    urgency: 'Urgency',
    recoveryTime: 'Recovery Time',
    recommendations: 'Recommendations',
    detailedAnalysis: 'Detailed Analysis',
    immediateAction: 'Immediate Action',
    prevention: 'Prevention',
    monitoring: 'Monitoring',
    newScan: 'New Scan',
    saveResult: 'Save Result',
    viewCropCareGuide: 'View Crop Care Guide',
    analysisSaved: 'Analysis saved successfully',
    
    // History Screen
    scanHistory: 'Scan History',
    trackCropHealth: 'Track your crop health over time',
    totalScans: 'Total Scans',
    issuesFound: 'Issues Found',
    all: 'All',
    healthy: 'Healthy',
    issues: 'Issues',
    noScansFound: 'No scans found',
    noScansMatch: 'No scans match your current filter. Try selecting a different filter.',
    
    // Guide Screen
    cropCareGuide: 'Crop Care Guide',
    essentialKnowledge: 'Essential knowledge for healthy crops',
    diseases: 'Diseases',
    careTips: 'Care Tips',
    planting: 'Planting',
    symptoms: 'Symptoms',
    treatment: 'Treatment',
    wateringBestPractices: 'Watering Best Practices',
    sunlightRequirements: 'Sunlight Requirements',
    pestPrevention: 'Pest Prevention',
    soilHealth: 'Soil Health',
    recommendedCrops: 'Recommended Crops',
    activities: 'Activities',
    
    // Settings Screen
    language: 'Language',
    selectLanguage: 'Select Language',
    about: 'About',
    version: 'Version',
    developer: 'Developer',
    contact: 'Contact',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    rateApp: 'Rate App',
    shareApp: 'Share App',
    
    // Common
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    ok: 'OK',
    error: 'Error',
    loading: 'Loading...',
    retry: 'Retry',
    none: 'None',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    // Diseases
    earlyBlight: 'Early Blight',
    powderyMildew: 'Powdery Mildew',
    bacterialSpot: 'Bacterial Spot',
    leafSpot: 'Leaf Spot',
    healthyPlant: 'Healthy Plant',
    
    // Crops
    tomato: 'Tomato',
    potato: 'Potato',
    pepper: 'Pepper',
    bean: 'Bean',
    lettuce: 'Lettuce',
    spinach: 'Spinach',
    radishes: 'Radishes',
    peas: 'Peas',
    onions: 'Onions',
    carrots: 'Carrots',
    herbs: 'Herbs',
    beans: 'Beans',
    squash: 'Squash',
    corn: 'Corn',
  },
  
  rw: {
    // Navigation
    home: 'Ahabanza',
    scan: 'Gusuzuma',
    history: 'Amateka',
    guide: 'Ubuyobozi',
    settings: 'Igenamiterere',
    
    // Home Screen
    welcomeToAgrisol: 'Murakaza neza kuri',
    appTitle: 'Agrisol',
    appSubtitle: 'Isuzuma ry\'Ubuzima bw\'Ibihingwa Rishingiye kuri AI',
    quickScan: 'Gusuzuma Byihuse',
    takePhoto: 'Fata Ifoto',
    captureImage: 'Fata ifoto y\'igihingwa',
    fromGallery: 'Kuva mu Bafoto',
    selectExisting: 'Hitamo ifoto isanzwe',
    todaysOverview: 'Incamake y\'Uyu Munsi',
    scansToday: 'Isuzuma ry\'Uyu Munsi',
    healthyPlants: 'Ibihingwa Bifite Ubuzima',
    waterLevel: 'Urwego rw\'Amazi',
    good: 'Byiza',
    howItWorks: 'Uburyo Bikora',
    diseaseDetection: 'Kumenya Indwara',
    diseaseDetectionDesc: 'Kumenya indwara z\'ibihingwa n\'udukoko bishingiye kuri AI',
    instantAnalysis: 'Isuzuma Ryihuse',
    instantAnalysisDesc: 'Bonera ibisubizo mu masegonda make n\'ukuri gukomeye',
    treatmentRecommendations: 'Inama zo Kuvura',
    treatmentRecommendationsDesc: 'Amabwiriza yo kwita ku bihingwa byawe',
    sampleDetection: 'Urugero rw\'Isuzuma',
    healthyTomatoPlant: 'Inyanya Ifite Ubuzima',
    healthyPlantDesc: 'Igihingwa cyawe gisa nk\'aho gifite ubuzima. Komeza kwita ku gihingwa mu buryo busanzwe.',
    
    // Scan Screen
    scanYourCrop: 'Suzuma Igihingwa Cyawe',
    scanSubtitle: 'Hitamo uburyo ushaka gufata cyangwa guhitamo ifoto y\'igihingwa cyawe',
    chooseFromGallery: 'Hitamo mu Bafoto',
    selectFromGallery: 'Hitamo ifoto isanzwe mu bafoto',
    tipsForBetter: 'Amabwiriza yo Kubona Ibisubizo Byiza',
    ensureGoodLighting: 'Menya ko hari urumuri rwiza',
    focusOnAffected: 'Yibanze ku bice byangiritse',
    keepCameraStady: 'Fata kamera neza',
    cameraAccessRequired: 'Hakenewe Uruhushya rwa Kamera',
    cameraPermissionDesc: 'Dukeneye uruhushya rwa kamera kugira ngo dufate amafoto y\'ibihingwa byawe kugira ngo tubisuzume.',
    grantPermission: 'Tanga Uruhushya',
    positionPlantCenter: 'Shyira ikibabi cy\'igihingwa hagati',
    
    // Results Screen
    analysisComplete: 'Isuzuma Ryarangiye',
    greatNews: 'Amakuru meza!',
    issueDetected: 'Ikibazo cyagaragaye',
    confidence: 'Kwizera',
    severity: 'Ubukana',
    affectedArea: 'Agace Kangiritse',
    urgency: 'Kwihutisha',
    recoveryTime: 'Igihe cyo Gukira',
    recommendations: 'Inama',
    detailedAnalysis: 'Isuzuma Ryimbitse',
    immediateAction: 'Igikorwa Cyihuse',
    prevention: 'Kwirinda',
    monitoring: 'Gukurikirana',
    newScan: 'Isuzuma Rishya',
    saveResult: 'Bika Ibisubizo',
    viewCropCareGuide: 'Reba Ubuyobozi bwo Kwita ku Bihingwa',
    analysisSaved: 'Isuzuma ryabitswe neza',
    
    // History Screen
    scanHistory: 'Amateka y\'Isuzuma',
    trackCropHealth: 'Kurikirana ubuzima bw\'ibihingwa byawe mu gihe',
    totalScans: 'Isuzuma Ryose',
    issuesFound: 'Ibibazo Byabonetse',
    all: 'Byose',
    healthy: 'Bifite Ubuzima',
    issues: 'Ibibazo',
    noScansFound: 'Nta suzuma ryabonetse',
    noScansMatch: 'Nta suzuma rihuye n\'icyo wahisemo. Gerageza guhitamo ikindi.',
    
    // Guide Screen
    cropCareGuide: 'Ubuyobozi bwo Kwita ku Bihingwa',
    essentialKnowledge: 'Ubumenyi bukenewe mu kwita ku bihingwa',
    diseases: 'Indwara',
    careTips: 'Amabwiriza yo Kwita',
    planting: 'Gutera',
    symptoms: 'Ibimenyetso',
    treatment: 'Ubuvuzi',
    wateringBestPractices: 'Uburyo Bwiza bwo Guhira',
    sunlightRequirements: 'Ibikenewe by\'Urumuri',
    pestPrevention: 'Kwirinda Udukoko',
    soilHealth: 'Ubuzima bw\'Ubutaka',
    recommendedCrops: 'Ibihingwa Byasabwa',
    activities: 'Ibikorwa',
    
    // Settings Screen
    language: 'Ururimi',
    selectLanguage: 'Hitamo Ururimi',
    about: 'Ibyerekeye',
    version: 'Verisiyo',
    developer: 'Uwateje',
    contact: 'Kuvugana',
    privacyPolicy: 'Politiki y\'Ibanga',
    termsOfService: 'Amabwiriza yo Gukoresha',
    rateApp: 'Tanga Amanota',
    shareApp: 'Sangiza Porogaramu',
    
    // Common
    close: 'Funga',
    save: 'Bika',
    cancel: 'Kuraguza',
    ok: 'Yego',
    error: 'Ikosa',
    loading: 'Gutangiza...',
    retry: 'Ongera ugerageze',
    none: 'Nta na kimwe',
    high: 'Byinshi',
    medium: 'Hagati',
    low: 'Bike',
    
    // Diseases
    earlyBlight: 'Indwara y\'Amababi Yambere',
    powderyMildew: 'Indwara y\'Ifu',
    bacterialSpot: 'Indwara ya Bagiteri',
    leafSpot: 'Amababi Yangiritse',
    healthyPlant: 'Igihingwa Gifite Ubuzima',
    
    // Crops
    tomato: 'Inyanya',
    potato: 'Ikirayi',
    pepper: 'Urusenda',
    bean: 'Ibigori',
    lettuce: 'Saladi',
    spinach: 'Epinari',
    radishes: 'Radisi',
    peas: 'Amaru',
    onions: 'Igitunguru',
    carrots: 'Karoti',
    herbs: 'Ibimera by\'Ubuvuzi',
    beans: 'Ibigori',
    squash: 'Igikoma',
    corn: 'Ibigori',
  },
  
  fr: {
    // Navigation
    home: 'Accueil',
    scan: 'Scanner',
    history: 'Historique',
    guide: 'Guide',
    settings: 'Paramètres',
    
    // Home Screen
    welcomeToAgrisol: 'Bienvenue sur',
    appTitle: 'Agrisol',
    appSubtitle: 'Moniteur de Santé des Cultures Alimenté par IA',
    quickScan: 'Scan Rapide',
    takePhoto: 'Prendre Photo',
    captureImage: 'Capturer image de culture',
    fromGallery: 'Depuis Galerie',
    selectExisting: 'Sélectionner photo existante',
    todaysOverview: 'Aperçu d\'Aujourd\'hui',
    scansToday: 'Scans Aujourd\'hui',
    healthyPlants: 'Plantes Saines',
    waterLevel: 'Niveau d\'Eau',
    good: 'Bon',
    howItWorks: 'Comment Ça Marche',
    diseaseDetection: 'Détection de Maladies',
    diseaseDetectionDesc: 'Identification des maladies et ravageurs des cultures alimentée par IA',
    instantAnalysis: 'Analyse Instantanée',
    instantAnalysisDesc: 'Obtenez des résultats en secondes avec une grande précision',
    treatmentRecommendations: 'Recommandations de Traitement',
    treatmentRecommendationsDesc: 'Instructions de soins personnalisées pour vos cultures',
    sampleDetection: 'Détection d\'Échantillon',
    healthyTomatoPlant: 'Plant de Tomate Sain',
    healthyPlantDesc: 'Votre plante semble saine. Continuez avec l\'entretien régulier et la surveillance.',
    
    // Scan Screen
    scanYourCrop: 'Scanner Votre Culture',
    scanSubtitle: 'Choisissez comment vous souhaitez capturer ou sélectionner votre image de culture',
    chooseFromGallery: 'Choisir de la Galerie',
    selectFromGallery: 'Sélectionner photo existante de la galerie',
    tipsForBetter: 'Conseils pour de Meilleurs Résultats',
    ensureGoodLighting: 'Assurez un bon éclairage',
    focusOnAffected: 'Concentrez-vous sur les zones affectées',
    keepCameraStady: 'Gardez la caméra stable',
    cameraAccessRequired: 'Accès Caméra Requis',
    cameraPermissionDesc: 'Nous avons besoin d\'accès à la caméra pour capturer des images de vos cultures pour analyse.',
    grantPermission: 'Accorder Permission',
    positionPlantCenter: 'Positionnez la feuille de la plante au centre',
    
    // Results Screen
    analysisComplete: 'Analyse Terminée',
    greatNews: 'Excellente nouvelle!',
    issueDetected: 'Problème détecté',
    confidence: 'Confiance',
    severity: 'Sévérité',
    affectedArea: 'Zone Affectée',
    urgency: 'Urgence',
    recoveryTime: 'Temps de Récupération',
    recommendations: 'Recommandations',
    detailedAnalysis: 'Analyse Détaillée',
    immediateAction: 'Action Immédiate',
    prevention: 'Prévention',
    monitoring: 'Surveillance',
    newScan: 'Nouveau Scan',
    saveResult: 'Sauvegarder Résultat',
    viewCropCareGuide: 'Voir Guide de Soins des Cultures',
    analysisSaved: 'Analyse sauvegardée avec succès',
    
    // History Screen
    scanHistory: 'Historique des Scans',
    trackCropHealth: 'Suivez la santé de vos cultures au fil du temps',
    totalScans: 'Total des Scans',
    issuesFound: 'Problèmes Trouvés',
    all: 'Tous',
    healthy: 'Saines',
    issues: 'Problèmes',
    noScansFound: 'Aucun scan trouvé',
    noScansMatch: 'Aucun scan ne correspond à votre filtre actuel. Essayez de sélectionner un filtre différent.',
    
    // Guide Screen
    cropCareGuide: 'Guide de Soins des Cultures',
    essentialKnowledge: 'Connaissances essentielles pour des cultures saines',
    diseases: 'Maladies',
    careTips: 'Conseils de Soins',
    planting: 'Plantation',
    symptoms: 'Symptômes',
    treatment: 'Traitement',
    wateringBestPractices: 'Meilleures Pratiques d\'Arrosage',
    sunlightRequirements: 'Exigences de Lumière du Soleil',
    pestPrevention: 'Prévention des Ravageurs',
    soilHealth: 'Santé du Sol',
    recommendedCrops: 'Cultures Recommandées',
    activities: 'Activités',
    
    // Settings Screen
    language: 'Langue',
    selectLanguage: 'Sélectionner Langue',
    about: 'À Propos',
    version: 'Version',
    developer: 'Développeur',
    contact: 'Contact',
    privacyPolicy: 'Politique de Confidentialité',
    termsOfService: 'Conditions d\'Utilisation',
    rateApp: 'Noter l\'App',
    shareApp: 'Partager l\'App',
    
    // Common
    close: 'Fermer',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    ok: 'OK',
    error: 'Erreur',
    loading: 'Chargement...',
    retry: 'Réessayer',
    none: 'Aucun',
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
    
    // Diseases
    earlyBlight: 'Mildiou Précoce',
    powderyMildew: 'Oïdium',
    bacterialSpot: 'Tache Bactérienne',
    leafSpot: 'Tache Foliaire',
    healthyPlant: 'Plante Saine',
    
    // Crops
    tomato: 'Tomate',
    potato: 'Pomme de terre',
    pepper: 'Poivron',
    bean: 'Haricot',
    lettuce: 'Laitue',
    spinach: 'Épinard',
    radishes: 'Radis',
    peas: 'Petits pois',
    onions: 'Oignons',
    carrots: 'Carottes',
    herbs: 'Herbes',
    beans: 'Haricots',
    squash: 'Courge',
    corn: 'Maïs',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguageCode = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguageCode) {
        const savedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguageCode);
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, language.code);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const languageTranslations = translations[currentLanguage.code as keyof typeof translations] || translations.en;
    let translation = languageTranslations[key as keyof typeof languageTranslations] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{{${paramKey}}}`, paramValue);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};