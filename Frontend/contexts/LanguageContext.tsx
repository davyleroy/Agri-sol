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

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

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
    diseaseDetectionDesc:
      'AI-powered identification of crop diseases and pests',
    instantAnalysis: 'Instant Analysis',
    instantAnalysisDesc: 'Get results in seconds with high accuracy',
    treatmentRecommendations: 'Treatment Recommendations',
    treatmentRecommendationsDesc:
      'Personalized care instructions for your crops',
    sampleDetection: 'Sample Detection',
    healthyTomatoPlant: 'Healthy Tomato Plant',
    healthyPlantDesc:
      'Your plant appears healthy. Continue with regular maintenance and monitoring.',

    // Auth Screens
    welcomeBack: 'Welcome • Bienvenue • Murakaza neza',
    signInToContinue: 'Sign in to continue your farming journey',
    createAccount: 'Create Account',
    joinAgrisolCommunity: 'Join the Agrisol community',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signingIn: 'Signing In...',
    creatingAccount: 'Creating Account...',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    accountCreated: 'Account created successfully! Welcome to Agrisol.',
    signUpError: 'Sign Up Error',
    signInError: 'Sign In Error',
    fillAllFields: 'Please fill all required fields',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',

    // Location fields
    location: {
      country: 'Country',
      province: 'Province',
      district: 'District',
      sector: 'Sector',
      selectCountry: 'Select Country',
      selectProvince: 'Select Province',
      selectDistrict: 'Select District',
      selectSector: 'Select Sector',
    },

    // Farmer types
    farmerType: 'Farmer Type',
    selectFarmerType: 'Select your farming scale',
    smallScaleFarmer: 'Small Scale Farmer',
    mediumScaleFarmer: 'Medium Scale Farmer',
    largeScaleFarmer: 'Large Scale Farmer',
    commercialFarmer: 'Commercial Farmer',
    smallScaleDesc: 'Growing crops on less than 5 acres',
    mediumScaleDesc: 'Growing crops on 5-50 acres',
    largeScaleDesc: 'Growing crops on 50+ acres',
    commercialDesc: 'Commercial farming operations',

    // Profile
    profile: 'Profile',
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    farmingInfo: 'Farming Information',
    accountSettings: 'Account Settings',

    // Scan Screen
    scanYourCrop: 'Scan Your Crop',
    scanSubtitle: "Choose how you'd like to capture or select your crop image",
    chooseFromGallery: 'Choose from Gallery',
    selectFromGallery: 'Select existing photo from gallery',
    tipsForBetter: 'Tips for Better Results',
    ensureGoodLighting: 'Ensure good lighting',
    focusOnAffected: 'Focus on affected areas',
    keepCameraStady: 'Keep camera steady',
    cameraAccessRequired: 'Camera Access Required',
    cameraPermissionDesc:
      'We need camera access to capture images of your crops for analysis.',
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
    noScansMatch:
      'No scans match your current filter. Try selecting a different filter.',

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
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    switchToDark: 'Switch to dark theme',
    switchToLight: 'Switch to light theme',
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
    success: 'Success',
    loading: 'Loading...',
    retry: 'Retry',
    none: 'None',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    or: 'or',

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
    lettuce: 'Lettuce',
    spinach: 'Spinach',
    radishes: 'Radishes',
    peas: 'Peas',
    onions: 'Onions',
    carrots: 'Carrots',
    herbs: 'Herbs',
    beans: 'Beans',
    potatoes: 'Potatoes',
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
    appSubtitle: "Isuzuma ry'Ubuzima bw'Ibihingwa Rishingiye kuri AI",
    quickScan: 'Gusuzuma Byihuse',
    takePhoto: 'Fata Ifoto',
    captureImage: "Fata ifoto y'igihingwa",
    fromGallery: 'Kuva mu Bafoto',
    selectExisting: 'Hitamo ifoto isanzwe',
    todaysOverview: "Incamake y'Uyu Munsi",
    scansToday: "Isuzuma ry'Uyu Munsi",
    healthyPlants: 'Ibihingwa Bifite Ubuzima',
    waterLevel: "Urwego rw'Amazi",
    good: 'Byiza',
    howItWorks: 'Uburyo Bikora',
    diseaseDetection: 'Kumenya Indwara',
    diseaseDetectionDesc:
      "Kumenya indwara z'ibihingwa n'udukoko bishingiye kuri AI",
    instantAnalysis: 'Isuzuma Ryihuse',
    instantAnalysisDesc: "Bonera ibisubizo mu masegonda make n'ukuri gukomeye",
    treatmentRecommendations: 'Inama zo Kuvura',
    treatmentRecommendationsDesc: 'Amabwiriza yo kwita ku bihingwa byawe',
    sampleDetection: "Urugero rw'Isuzuma",
    healthyTomatoPlant: 'Inyanya Ifite Ubuzima',
    healthyPlantDesc:
      "Igihingwa cyawe gisa nk'aho gifite ubuzima. Komeza kwita ku gihingwa mu buryo busanzwe.",

    // Auth Screens
    welcomeBack: 'Welcome • Bienvenue • Murakaza neza',
    signInToContinue: "Injira ukomeze urugendo rwawe rw'ubuhinzi",
    createAccount: 'Kurema Konti',
    joinAgrisolCommunity: 'Kwinjira mu muryango wa Agrisol',
    fullName: 'Amazina Yose',
    phoneNumber: 'Nimero ya Telefoni',
    emailAddress: 'Aderesi ya Email',
    password: "Ijambo ry'Ibanga",
    confirmPassword: "Emeza Ijambo ry'Ibanga",
    signIn: 'Kwinjira',
    signUp: 'Kwiyandikisha',
    signingIn: 'Kwinjira...',
    creatingAccount: 'Kurema Konti...',
    forgotPassword: "Wibagiwe Ijambo ry'Ibanga?",
    dontHaveAccount: 'Ntufite konti?',
    alreadyHaveAccount: 'Usanzwe ufite konti?',
    accountCreated: 'Konti yaremwe neza! Murakaza neza kuri Agrisol.',
    signUpError: 'Ikosa ryo Kwiyandikisha',
    signInError: 'Ikosa ryo Kwinjira',
    fillAllFields: 'Nyamuneka uzuza amashami yose akenewe',
    passwordsDoNotMatch: "Amagambo y'ibanga ntabwo asa",
    passwordTooShort: "Ijambo ry'ibanga rigomba kuba rifite byibuze inyuguti 6",

    // Location fields
    location: {
      country: 'Igihugu',
      province: 'Intara',
      district: 'Akarere',
      sector: 'Umurenge',
      selectCountry: 'Hitamo Igihugu',
      selectProvince: 'Hitamo Intara',
      selectDistrict: 'Hitamo Akarere',
      selectSector: 'Hitamo Umurenge',
    },

    // Farmer types
    farmerType: "Ubwoko bw'Umuhinzi",
    selectFarmerType: "Hitamo urwego rw'ubuhinzi bwawe",
    smallScaleFarmer: "Umuhinzi w'Urwego Ruto",
    mediumScaleFarmer: "Umuhinzi w'Urwego Rwo Hagati",
    largeScaleFarmer: "Umuhinzi w'Urwego Runini",
    commercialFarmer: "Umuhinzi w'Ubucuruzi",
    smallScaleDesc: 'Guhinga ku butaka buke buri munsi ya hekitari 2',
    mediumScaleDesc: "Guhinga ku butaka bw'hekitari 2-20",
    largeScaleDesc: 'Guhinga ku butaka burenga hekitari 20',
    commercialDesc: "Ibikorwa by'ubuhinzi bw'ubucuruzi",

    // Profile
    profile: 'Umwirondoro',
    editProfile: 'Guhindura Umwirondoro',
    personalInfo: "Amakuru y'Umuntu ku Giti Cye",
    farmingInfo: "Amakuru y'Ubuhinzi",
    accountSettings: "Igenamiterere ry'Konti",

    // Scan Screen
    scanYourCrop: 'Suzuma Igihingwa Cyawe',
    scanSubtitle:
      "Hitamo uburyo ushaka gufata cyangwa guhitamo ifoto y'igihingwa cyawe",
    chooseFromGallery: 'Hitamo mu Bafoto',
    selectFromGallery: 'Hitamo ifoto isanzwe mu bafoto',
    tipsForBetter: 'Amabwiriza yo Kubona Ibisubizo Byiza',
    ensureGoodLighting: 'Menya ko hari urumuri rwiza',
    focusOnAffected: 'Yibanze ku bice byangiritse',
    keepCameraStady: 'Fata kamera neza',
    cameraAccessRequired: 'Hakenewe Uruhushya rwa Kamera',
    cameraPermissionDesc:
      "Dukeneye uruhushya rwa kamera kugira ngo dufate amafoto y'ibihingwa byawe kugira ngo tubisuzume.",
    grantPermission: 'Tanga Uruhushya',
    positionPlantCenter: "Shyira ikibabi cy'igihingwa hagati",

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
    scanHistory: "Amateka y'Isuzuma",
    trackCropHealth: "Kurikirana ubuzima bw'ibihingwa byawe mu gihe",
    totalScans: 'Isuzuma Ryose',
    issuesFound: 'Ibibazo Byabonetse',
    all: 'Byose',
    healthy: 'Bifite Ubuzima',
    issues: 'Ibibazo',
    noScansFound: 'Nta suzuma ryabonetse',
    noScansMatch:
      "Nta suzuma rihuye n'icyo wahisemo. Gerageza guhitamo ikindi.",

    // Guide Screen
    cropCareGuide: 'Ubuyobozi bwo Kwita ku Bihingwa',
    essentialKnowledge: 'Ubumenyi bukenewe mu kwita ku bihingwa',
    diseases: 'Indwara',
    careTips: 'Amabwiriza yo Kwita',
    planting: 'Gutera',
    symptoms: 'Ibimenyetso',
    treatment: 'Ubuvuzi',
    wateringBestPractices: 'Uburyo Bwiza bwo Guhira',
    sunlightRequirements: "Ibikenewe by'Urumuri",
    pestPrevention: 'Kwirinda Udukoko',
    soilHealth: "Ubuzima bw'Ubutaka",
    recommendedCrops: 'Ibihingwa Byasabwa',
    activities: 'Ibikorwa',

    // Settings Screen
    language: 'Ururimi',
    selectLanguage: 'Hitamo Ururimi',
    darkMode: 'Kugaragara mumwumwijima<',
    lightMode: 'Kugaragara Mumucyo',
    switchToDark: 'Hindura mumwumwijima',
    switchToLight: 'Hindura mumucyo',
    about: 'Ibyerekeye',
    version: 'Verisiyo',
    developer: 'Uwayikoze',
    contact: 'Kuvugana',
    privacyPolicy: "Politiki y'Ibanga",
    termsOfService: 'Amabwiriza yo Gukoresha',
    rateApp: 'Tanga Amanota',
    shareApp: 'Sangiza Porogaramu',

    // Common
    close: 'Funga',
    save: 'Bika',
    cancel: 'Kuraguza',
    ok: 'Yego',
    error: 'Ikosa',
    success: 'Byakunze',
    or: 'cyangwa',
    loading: 'Gutangiza...',
    retry: 'Ongera ugerageze',
    none: 'Nta na kimwe',
    high: 'Byinshi',
    medium: 'Hagati',
    low: 'Bike',

    // Diseases
    earlyBlight: "Indwara y'Amababi Yambere",
    powderyMildew: "Indwara y'Ifu",
    bacterialSpot: 'Indwara ya Bagiteri',
    leafSpot: 'Amababi Yangiritse',
    healthyPlant: 'Igihingwa Gifite Ubuzima',

    // Crops
    tomato: 'Inyanya',
    potato: 'Ikirayi',
    pepper: 'Urusenda',
    lettuce: 'Saladi',
    spinach: 'Epinari',
    radishes: 'Radisi',
    peas: 'Amashaza',
    onions: 'Igitunguru',
    carrots: 'Karoti',
    herbs: "Ibimera by'Ubuvuzi",
    beans: 'ibishyimbo',
    potatoes: 'ibirayi',
    squash: 'Igikoma',
    corn: 'Ibigori',
    maize: 'Ibigori',
  },

  fr: {
    // Navigation
    home: 'Accueil',
    scan: 'Scanner',
    history: 'Historique',
    guide: 'Guide',
    settings: 'Paramètres',

    // Home Screen
    welcomeToAgrisol: 'Bienvenue à',
    appTitle: 'Agrisol',
    appSubtitle: 'Moniteur de Santé des Cultures Alimenté par IA',
    quickScan: 'Scan Rapide',
    takePhoto: 'Prendre une Photo',
    captureImage: 'Capturer une image de culture',
    fromGallery: 'Depuis la Galerie',
    selectExisting: 'Sélectionner une photo existante',
    todaysOverview: 'Aperçu du Jour',
    scansToday: "Scans d'Aujourd'hui",
    healthyPlants: 'Plantes Saines',
    waterLevel: "Niveau d'Eau",
    good: 'Bon',
    howItWorks: 'Comment ça Marche',
    diseaseDetection: 'Détection de Maladies',
    diseaseDetectionDesc:
      'Identification alimentée par IA des maladies et ravageurs des cultures',
    instantAnalysis: 'Analyse Instantanée',
    instantAnalysisDesc:
      'Obtenez des résultats en quelques secondes avec une haute précision',
    treatmentRecommendations: 'Recommandations de Traitement',
    treatmentRecommendationsDesc:
      'Instructions de soins personnalisées pour vos cultures',
    sampleDetection: "Détection d'Échantillon",
    healthyTomatoPlant: 'Plant de Tomate Sain',
    healthyPlantDesc:
      "Votre plante semble saine. Continuez avec l'entretien régulier et la surveillance.",

    // Auth Screens
    welcomeBack: 'Welcome • Bienvenue • Murakaza neza',
    signInToContinue: 'Connectez-vous pour continuer votre parcours agricole',
    createAccount: 'Créer un Compte',
    joinAgrisolCommunity: 'Rejoignez la communauté Agrisol',
    fullName: 'Nom Complet',
    phoneNumber: 'Numéro de Téléphone',
    emailAddress: 'Adresse E-mail',
    password: 'Mot de Passe',
    confirmPassword: 'Confirmer le Mot de Passe',
    signIn: 'Se Connecter',
    signUp: "S'Inscrire",
    signingIn: 'Connexion...',
    creatingAccount: 'Création de Compte...',
    forgotPassword: 'Mot de Passe Oublié?',
    dontHaveAccount: "Vous n'avez pas de compte?",
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    accountCreated: 'Compte créé avec succès! Bienvenue à Agrisol.',
    signUpError: "Erreur d'Inscription",
    signInError: 'Erreur de Connexion',
    fillAllFields: 'Veuillez remplir tous les champs requis',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',

    // Location fields
    location: {
      country: 'Pays',
      province: 'Province',
      district: 'District',
      sector: 'Secteur',
      selectCountry: 'Sélectionner le Pays',
      selectProvince: 'Sélectionner la Province',
      selectDistrict: 'Sélectionner le District',
      selectSector: 'Sélectionner le Secteur',
    },

    // Farmer types
    farmerType: "Type d'Agriculteur",
    selectFarmerType: "Sélectionnez votre échelle d'agriculture",
    smallScaleFarmer: 'Petit Agriculteur',
    mediumScaleFarmer: 'Agriculteur Moyen',
    largeScaleFarmer: 'Grand Agriculteur',
    commercialFarmer: 'Agriculteur Commercial',
    smallScaleDesc: 'Culture sur moins de 2 hectares',
    mediumScaleDesc: 'Culture sur 2-20 hectares',
    largeScaleDesc: 'Culture sur plus de 20 hectares',
    commercialDesc: 'Opérations agricoles commerciales',

    // Profile
    profile: 'Profil',
    editProfile: 'Modifier le Profil',
    personalInfo: 'Informations Personnelles',
    farmingInfo: 'Informations Agricoles',
    accountSettings: 'Paramètres du Compte',

    // Scan Screen
    scanYourCrop: 'Scanner Votre Culture',
    scanSubtitle:
      'Choisissez comment vous souhaitez capturer ou sélectionner votre image de culture',
    chooseFromGallery: 'Choisir de la Galerie',
    selectFromGallery: 'Sélectionner photo existante de la galerie',
    tipsForBetter: 'Conseils pour de Meilleurs Résultats',
    ensureGoodLighting: 'Assurez un bon éclairage',
    focusOnAffected: 'Concentrez-vous sur les zones affectées',
    keepCameraStady: 'Gardez la caméra stable',
    cameraAccessRequired: 'Accès Caméra Requis',
    cameraPermissionDesc:
      "Nous avons besoin d'accès à la caméra pour capturer des images de vos cultures pour analyse.",
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
    noScansMatch:
      'Aucun scan ne correspond à votre filtre actuel. Essayez de sélectionner un filtre différent.',

    // Guide Screen
    cropCareGuide: 'Guide de Soins des Cultures',
    essentialKnowledge: 'Connaissances essentielles pour des cultures saines',
    diseases: 'Maladies',
    careTips: 'Conseils de Soins',
    planting: 'Plantation',
    symptoms: 'Symptômes',
    treatment: 'Traitement',
    wateringBestPractices: "Meilleures Pratiques d'Arrosage",
    sunlightRequirements: 'Exigences de Lumière du Soleil',
    pestPrevention: 'Prévention des Ravageurs',
    soilHealth: 'Santé du Sol',
    recommendedCrops: 'Cultures Recommandées',
    activities: 'Activités',

    // Settings Screen
    language: 'Langue',
    selectLanguage: 'Sélectionner Langue',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    switchToDark: 'Passer au thème sombre',
    switchToLight: 'Passer au thème clair',
    about: 'À Propos',
    version: 'Version',
    developer: 'Développeur',
    contact: 'Contact',
    privacyPolicy: 'Politique de Confidentialité',
    termsOfService: "Conditions d'Utilisation",
    rateApp: "Noter l'App",
    shareApp: "Partager l'App",

    // Common
    close: 'Fermer',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    ok: 'OK',
    error: 'Erreur',
    success: 'Succès',
    or: 'ou',
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
    potatoes: 'Pommes de terre',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES[0]
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguageCode = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguageCode) {
        const savedLanguage = SUPPORTED_LANGUAGES.find(
          (lang) => lang.code === savedLanguageCode
        );
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
    const languageTranslations =
      translations[currentLanguage.code as keyof typeof translations] ||
      translations.en;

    // Handle nested keys like 'location.country'
    let translation: any = languageTranslations;
    const keys = key.split('.');

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        translation = key; // Return the key if not found
        break;
      }
    }

    // Ensure we have a string
    if (typeof translation !== 'string') {
      translation = key;
    }

    // Replace parameters in translation
    if (params && typeof translation === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{{${paramKey}}}`, paramValue);
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, setLanguage, t, isLoading }}
    >
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
