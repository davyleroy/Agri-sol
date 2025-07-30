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
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Comprehensive translations
const translations: { [key: string]: { [key: string]: string } } = {
  // Common
  loading: {
    en: 'Loading...',
    rw: 'Kurura...',
    fr: 'Chargement...',
  },
  // Authentication
  emailAddress: {
    en: 'Email Address',
    rw: 'Imeyili',
    fr: 'Adresse Email',
  },
  password: {
    en: 'Password',
    rw: 'Ijambo ryibanga',
    fr: 'Mot de Passe',
  },
  confirmPassword: {
    en: 'Confirm Password',
    rw: 'Emeza Ijambo ryibanga',
    fr: 'Confirmer le Mot de Passe',
  },
  signIn: {
    en: 'Sign In',
    rw: 'Injira',
    fr: 'Se Connecter',
  },
  signUp: {
    en: 'Sign Up',
    rw: 'Iyandikishe',
    fr: "S'inscrire",
  },
  signOut: {
    en: 'Sign Out',
    rw: 'Sohoka',
    fr: 'Se Déconnecter',
  },
  signingIn: {
    en: 'Signing In...',
    rw: 'Uraza...',
    fr: 'Connexion...',
  },
  signingUp: {
    en: 'Signing Up...',
    rw: 'Uraza...',
    fr: 'Inscription...',
  },
  welcomeBack: {
    en: 'Welcome Back',
    rw: 'Uraza',
    fr: 'Bon Retour',
  },
  signInToContinue: {
    en: 'Sign in to continue',
    rw: 'Injira kugira ngo ugerageze',
    fr: 'Connectez-vous pour continuer',
  },
  dontHaveAccount: {
    en: "Don't have an account? ",
    rw: 'Niba ufite konti? ',
    fr: "Vous n'avez pas de compte ? ",
  },
  alreadyHaveAccount: {
    en: 'Already have an account? ',
    rw: 'Urafite konti? ',
    fr: 'Vous avez déjà un compte ? ',
  },
  forgotPassword: {
    en: 'Forgot Password?',
    rw: 'Wibagiwe Ijambo ryibanga?',
    fr: 'Mot de Passe Oublié ?',
  },
  resetPassword: {
    en: 'Reset Password',
    rw: 'Subiramo Ijambo ryibanga',
    fr: 'Réinitialiser le Mot de Passe',
  },
  enterEmailAddress: {
    en: 'Please enter your email address',
    rw: 'Urugero imeyili yawe',
    fr: 'Veuillez entrer votre adresse email',
  },
  fillAllFields: {
    en: 'Please fill in all fields',
    rw: 'Urugero ibintu byose',
    fr: 'Veuillez remplir tous les champs',
  },
  passwordTooShort: {
    en: 'Password must be at least 6 characters',
    rw: 'Ijambo ryibanga rikenewe kuba inyuguti 6',
    fr: 'Le mot de passe doit contenir au moins 6 caractères',
  },
  passwordsDoNotMatch: {
    en: 'Passwords do not match',
    rw: 'Amagambo yibanga ntibuhura',
    fr: 'Les mots de passe ne correspondent pas',
  },
  signInError: {
    en: 'Sign In Error',
    rw: 'Ikibazo cyo Kwinjira',
    fr: 'Erreur de Connexion',
  },
  signUpError: {
    en: 'Sign Up Error',
    rw: 'Ikibazo cyo Kwiyandikisha',
    fr: "Erreur d'Inscription",
  },
  fullName: {
    en: 'Full Name',
    rw: 'Amazina Yose',
    fr: 'Nom Complet',
  },
  enterFullName: {
    en: 'Enter your full name',
    rw: 'Andika amazina yawe yose',
    fr: 'Entrez votre nom complet',
  },
  createAccount: {
    en: 'Create Account',
    rw: 'Reba Konti',
    fr: 'Créer un Compte',
  },
  joinAgrisolCommunity: {
    en: 'Join the Agrisol community',
    rw: 'Urugero umuryango wa Agrisol',
    fr: 'Rejoignez la communauté Agrisol',
  },
  phoneNumber: {
    en: 'Phone Number',
    rw: 'Telefoni',
    fr: 'Numéro de Téléphone',
  },
  farmerType: {
    en: 'Farmer Type',
    rw: 'Ubwoko bwUmworozi',
    fr: 'Type dAgriculteur',
  },
  selectFarmerType: {
    en: 'Select your farmer type',
    rw: 'Hitamo ubwoko bwawe bwumworozi',
    fr: 'Sélectionnez votre type dagriculteur',
  },
  location: {
    en: 'Location',
    rw: 'Aho',
    fr: 'Localisation',
  },
  creatingAccount: {
    en: 'Creating Account...',
    rw: 'Reka Konti...',
    fr: 'Création du Compte...',
  },
  accountCreated: {
    en: 'Account created successfully! Please check your email for verification.',
    rw: 'Konti yarebwe neza! Urugero reba imeyili yawe kugira ngo ugerageze.',
    fr: 'Compte créé avec succès ! Veuillez vérifier votre email pour la vérification.',
  },
  or: {
    en: 'or',
    rw: 'cyangwa',
    fr: 'ou',
  },
  resetPasswordInstructions: {
    en: 'Enter your email address and we will send you a password reset link',
    rw: 'Andika imeyili yawe kugira ngo dutumeho ijambo ryibanga',
    fr: 'Entrez votre adresse email et nous vous enverrons un lien de réinitialisation',
  },
  passwordResetSent: {
    en: 'Password reset link sent to your email',
    rw: 'Ijambo ryibanga ryatumwe kuri imeyili yawe',
    fr: 'Lien de réinitialisation envoyé à votre email',
  },
  sendResetLink: {
    en: 'Send Reset Link',
    rw: 'Ohereza Ijambo ryibanga',
    fr: 'Envoyer le Lien de Réinitialisation',
  },
  sending: {
    en: 'Sending...',
    rw: 'Uraza...',
    fr: 'Envoi...',
  },
  backToSignIn: {
    en: 'Back to Sign In',
    rw: 'Subira Kwinjira',
    fr: 'Retour à la Connexion',
  },
  error: {
    en: 'Error',
    rw: 'Ikibazo',
    fr: 'Erreur',
  },
  success: {
    en: 'Success',
    rw: 'Intsinzi',
    fr: 'Succès',
  },
  cancel: {
    en: 'Cancel',
    rw: 'Kureka',
    fr: 'Annuler',
  },
  save: {
    en: 'Save',
    rw: 'Bika',
    fr: 'Enregistrer',
  },
  delete: {
    en: 'Delete',
    rw: 'Siba',
    fr: 'Supprimer',
  },
  edit: {
    en: 'Edit',
    rw: 'Hindura',
    fr: 'Modifier',
  },
  close: {
    en: 'Close',
    rw: 'Funga',
    fr: 'Fermer',
  },
  ok: {
    en: 'OK',
    rw: 'OK',
    fr: 'OK',
  },
  yes: {
    en: 'Yes',
    rw: 'Yego',
    fr: 'Oui',
  },
  no: {
    en: 'No',
    rw: 'Oya',
    fr: 'Non',
  },

  // Navigation
  home: {
    en: 'Home',
    rw: 'Ahabanza',
    fr: 'Accueil',
  },
  scan: {
    en: 'Scan',
    rw: 'Shushanya',
    fr: 'Scanner',
  },
  history: {
    en: 'History',
    rw: 'Amateka',
    fr: 'Historique',
  },
  guide: {
    en: 'Guide',
    rw: 'Umucyo',
    fr: 'Guide',
  },
  settings: {
    en: 'Settings',
    rw: 'Igenamiterere',
    fr: 'Paramètres',
  },

  // Scan History
  scanHistory: {
    en: 'Scan History',
    rw: 'Amateka yo Gushushanya',
    fr: 'Historique des Scans',
  },
  trackCropHealth: {
    en: 'Track your crop health over time',
    rw: "Kurikirana ubuzima bw'ibihingwa mu gihe",
    fr: 'Suivez la santé de vos cultures dans le temps',
  },
  totalScans: {
    en: 'Total Scans',
    rw: "Umubare w'Amashushanya",
    fr: 'Total des Scans',
  },
  healthyPlants: {
    en: 'Healthy Plants',
    rw: 'Ibihingwa Bikomeye',
    fr: 'Plantes Saines',
  },
  issuesFound: {
    en: 'Issues Found',
    rw: 'Ibibazo Byabonetse',
    fr: 'Problèmes Trouvés',
  },
  all: {
    en: 'All',
    rw: 'Byose',
    fr: 'Tout',
  },
  healthy: {
    en: 'Healthy',
    rw: 'Bikomeye',
    fr: 'Sain',
  },
  issues: {
    en: 'Issues',
    rw: 'Ibibazo',
    fr: 'Problèmes',
  },
  confidence: {
    en: 'confidence',
    rw: 'kwizera',
    fr: 'confiance',
  },
  noScansFound: {
    en: 'No scans found',
    rw: 'Nta mashushanya yabonetse',
    fr: 'Aucun scan trouvé',
  },
  noScansMatchFilter: {
    en: 'No scans match your current filter. Try selecting a different filter.',
    rw: "Nta mashushanya ahura n'uburyo bwawe. Ongera ugerageza undi buryo.",
    fr: 'Aucun scan ne correspond à votre filtre actuel. Essayez de sélectionner un filtre différent.',
  },
  myScans: {
    en: 'My Scans',
    rw: 'Amashushanya Yanjye',
    fr: 'Mes Scans',
  },
  allUsers: {
    en: 'All Users',
    rw: 'Abantu Bose',
    fr: 'Tous les Utilisateurs',
  },

  // Prediction Card
  healthyPlant: {
    en: 'Healthy Plant',
    rw: 'Ibihingwa Bikomeye',
    fr: 'Plante Saine',
  },
  diseaseDetected: {
    en: 'Disease Detected',
    rw: 'Ubutarumikazi Bwabonetse',
    fr: 'Maladie Détectée',
  },
  highConfidence: {
    en: 'High Confidence',
    rw: 'Kwizera Hejuru',
    fr: 'Confiance Élevée',
  },
  mediumConfidence: {
    en: 'Medium Confidence',
    rw: 'Kwizera Hagati',
    fr: 'Confiance Moyenne',
  },
  lowConfidence: {
    en: 'Low Confidence',
    rw: 'Kwizera Hasi',
    fr: 'Confiance Faible',
  },
  immediate: {
    en: 'Immediate',
    rw: 'Vuba',
    fr: 'Immédiat',
  },
  urgent: {
    en: 'Urgent',
    rw: 'Ubutwari',
    fr: 'Urgent',
  },
  monitor: {
    en: 'Monitor',
    rw: 'Kurikirana',
    fr: 'Surveiller',
  },
  immediateTreatment: {
    en: 'Immediate treatment required',
    rw: 'Ubutumwa bwa vuba bukenewe',
    fr: 'Traitement immédiat requis',
  },
  urgentTreatment: {
    en: 'Treatment needed soon',
    rw: 'Ubutumwa bukenewe vuba',
    fr: 'Traitement nécessaire bientôt',
  },
  monitorClosely: {
    en: 'Monitor closely for symptoms',
    rw: 'Kurikirana neza ibimenyetso',
    fr: 'Surveiller de près les symptômes',
  },
  viewGuide: {
    en: 'View Guide',
    rw: 'Reba Umucyo',
    fr: 'Voir le Guide',
  },
  share: {
    en: 'Share',
    rw: 'Sangira',
    fr: 'Partager',
  },
  guideNotAvailable: {
    en: 'Guide feature not available yet',
    rw: 'Umucyo ntibushoboka kugeza ubu',
    fr: 'Fonction guide pas encore disponible',
  },
  shareNotAvailable: {
    en: 'Share feature not available yet',
    rw: 'Gusangira ntibushoboka kugeza ubu',
    fr: 'Fonction partage pas encore disponible',
  },

  // Guide
  cropCareGuide: {
    en: 'Crop Care Guide',
    rw: 'Umucyo wo Kurwanya Ibihingwa',
    fr: 'Guide de Soins des Cultures',
  },
  essentialKnowledge: {
    en: 'Essential knowledge for healthy crops',
    rw: "Ubumenyi bw'ingenzi kugira ibihingwa bikomeye",
    fr: 'Connaissances essentielles pour des cultures saines',
  },
  diseases: {
    en: 'Diseases',
    rw: 'Ubutarumikazi',
    fr: 'Maladies',
  },
  careTips: {
    en: 'Care Tips',
    rw: 'Inama zo Kurwanya',
    fr: 'Conseils de Soins',
  },
  planting: {
    en: 'Planting',
    rw: 'Gutera',
    fr: 'Plantation',
  },
  searchDiseases: {
    en: 'Search diseases...',
    rw: 'Shakisha ubutarumikazi...',
    fr: 'Rechercher des maladies...',
  },
  allCrops: {
    en: 'All Crops',
    rw: 'Ibihingwa Byose',
    fr: 'Toutes les Cultures',
  },
  affects: {
    en: 'Affects',
    rw: 'Bihura',
    fr: 'Affecte',
  },
  symptoms: {
    en: 'Symptoms',
    rw: 'Ibimenyetso',
    fr: 'Symptômes',
  },
  treatment: {
    en: 'Treatment',
    rw: 'Ubutumwa',
    fr: 'Traitement',
  },
  prevention: {
    en: 'Prevention',
    rw: 'Kurwanya',
    fr: 'Prévention',
  },
  noDiseasesFound: {
    en: 'No diseases found',
    rw: 'Nta butarumikazi bwabonetse',
    fr: 'Aucune maladie trouvée',
  },
  tryDifferentSearch: {
    en: 'Try a different search term or crop filter.',
    rw: "Ongera ugerageza ijambo rindi cyangwa uburyo bw'ibihingwa.",
    fr: 'Essayez un terme de recherche différent ou un filtre de culture.',
  },
  recommendedCrops: {
    en: 'Recommended Crops',
    rw: 'Ibihingwa Byemerwa',
    fr: 'Cultures Recommandées',
  },
  activities: {
    en: 'Activities',
    rw: 'Ibikorwa',
    fr: 'Activités',
  },

  // Settings
  settingsSubtitle: {
    en: 'Customize your app experience',
    rw: 'Hindura uburyo bwo gukoresha porogaramu',
    fr: "Personnalisez votre expérience d'application",
  },
  lightMode: {
    en: 'Light Mode',
    rw: "Uburyo bw'Umutekano",
    fr: 'Mode Clair',
  },
  darkMode: {
    en: 'Dark Mode',
    rw: "Uburyo bw'Umwijima",
    fr: 'Mode Sombre',
  },
  switchToLight: {
    en: 'Switch to light mode',
    rw: 'Hindura kuri umutekano',
    fr: 'Passer au mode clair',
  },
  switchToDark: {
    en: 'Switch to dark mode',
    rw: 'Hindura kuri umwijima',
    fr: 'Passer au mode sombre',
  },
  language: {
    en: 'Language',
    rw: 'Ururimi',
    fr: 'Langue',
  },
  selectLanguage: {
    en: 'Select Language',
    rw: 'Hitamo Ururimi',
    fr: 'Sélectionner la Langue',
  },
  about: {
    en: 'About',
    rw: 'Ibyerekeye',
    fr: 'À Propos',
  },
  developer: {
    en: 'Developer',
    rw: 'Umubyeyi',
    fr: 'Développeur',
  },
  contact: {
    en: 'Contact',
    rw: 'Twandikire',
    fr: 'Contact',
  },
  privacy: {
    en: 'Privacy',
    rw: 'Ibanga',
    fr: 'Confidentialité',
  },
  privacySubtitle: {
    en: 'Privacy policy and data protection',
    rw: "Politiki y'ibanga n'uburyo bwo kurwanya amakuru",
    fr: 'Politique de confidentialité et protection des données',
  },
  terms: {
    en: 'Terms',
    rw: 'Amabwiriza',
    fr: 'Conditions',
  },
  termsSubtitle: {
    en: 'Terms of service and usage',
    rw: 'Amabwiriza yo gukoresha',
    fr: "Conditions de service et d'utilisation",
  },
  rateApp: {
    en: 'Rate App',
    rw: 'Gerageza Porogaramu',
    fr: "Évaluer l'App",
  },
  rateAppSubtitle: {
    en: 'Rate us on the app store',
    rw: "Gerageza kuri ububiko bw'amaporogaramu",
    fr: "Évaluez-nous sur l'app store",
  },
  shareApp: {
    en: 'Share App',
    rw: 'Sangira Porogaramu',
    fr: "Partager l'App",
  },
  shareAppSubtitle: {
    en: 'Share with friends and family',
    rw: "Sangira na bagenzi n'umuryango",
    fr: 'Partager avec amis et famille',
  },
  feedback: {
    en: 'Feedback',
    rw: 'Ibisubizo',
    fr: 'Retour',
  },
  feedbackSubtitle: {
    en: 'Share your thoughts and suggestions',
    rw: 'Sangira ibitekerezo na ibyifuzo',
    fr: 'Partagez vos pensées et suggestions',
  },
  feedbackDescription: {
    en: 'Help us improve Agrisol by sharing your thoughts, suggestions, or reporting issues. Your feedback is valuable to us!',
    rw: 'Dufashe kunoza Agrisol ukusangira ibitekerezo, ibyifuzo, cyangwa ukureba ibibazo. Ibisubizo byawe birafite agaciro!',
    fr: 'Aidez-nous à améliorer Agrisol en partageant vos pensées, suggestions ou en signalant des problèmes. Votre retour est précieux pour nous !',
  },
  openForm: {
    en: 'Open Form',
    rw: 'Fungura Ifomu',
    fr: 'Ouvrir le Formulaire',
  },
  feedbackError: {
    en: 'Unable to open feedback form. Please try again later.',
    rw: 'Ntibishoboka gufungura ifomu yibisubizo. Ongera ugerageze nyuma.',
    fr: 'Impossible douvrir le formulaire de retour. Veuillez réessayer plus tard.',
  },
  logout: {
    en: 'Logout',
    rw: 'Sohoka',
    fr: 'Déconnexion',
  },
  // Terms and Privacy Agreement
  acceptTermsAndPrivacy: {
    en: 'Please accept Terms & Conditions and Privacy Policy',
    rw: 'Uvugire Amabwiriza & Igenamiterere nPolitiki yIbanga',
    fr: 'Veuillez accepter les Conditions et la Politique de Confidentialité',
  },
  termsRequired: {
    en: 'Terms Required',
    rw: 'Amabwiriza Birakenewe',
    fr: 'Conditions Requises',
  },
  termsRequiredMessage: {
    en: 'You must accept the Terms & Conditions and Privacy Policy to create an account.',
    rw: 'Ukeneye kuyemera Amabwiriza & Igenamiterere nPolitiki yIbanga kugira ngo urebe konti.',
    fr: 'Vous devez accepter les Conditions et la Politique de Confidentialité pour créer un compte.',
  },
  acceptTerms: {
    en: 'I accept the ',
    rw: 'Niyemera ',
    fr: 'Jaccepte les ',
  },
  acceptPrivacy: {
    en: 'I accept the ',
    rw: 'Niyemera ',
    fr: 'Jaccepte la ',
  },
  termsAndConditions: {
    en: 'Terms & Conditions',
    rw: 'Amabwiriza & Igenamiterere',
    fr: 'Conditions',
  },
  privacyPolicy: {
    en: 'Privacy Policy',
    rw: 'Politiki yIbanga',
    fr: 'Politique de Confidentialité',
  },
  appSubtitle: {
    en: 'AI-Powered Crop Health Monitor',
    rw: "Kurikirana Ubuzima bw'Ibihingwa na AI",
    fr: 'Moniteur de Santé des Cultures IA',
  },

  // Map
  map: {
    en: 'Map',
    rw: 'Ikarti',
    fr: 'Carte',
  },
  mapView: {
    en: 'Map View',
    rw: 'Reba Ikarti',
    fr: 'Vue Carte',
  },
  mapViewDescription: {
    en: 'Access different map views and analytics',
    rw: "Reba ibikorwa by'ikarti n'uburyo",
    fr: 'Accéder aux différentes vues de carte et analyses',
  },
  adminMapDashboard: {
    en: 'Admin Map Dashboard',
    rw: "Ikarti y'Umuyobozi",
    fr: 'Tableau de Bord Carte Admin',
  },
  adminMapDescription: {
    en: "View all users' scans on an interactive map",
    rw: "Reba amashushanya y'abantu bose ku karti",
    fr: 'Voir tous les scans des utilisateurs sur une carte interactive',
  },
  userMapView: {
    en: 'User Map View',
    rw: 'Reba Ikarti Yanjye',
    fr: 'Vue Carte Utilisateur',
  },
  userMapDescription: {
    en: 'View your own scans on a map',
    rw: 'Reba amashushanya yanjye ku karti',
    fr: 'Voir vos propres scans sur une carte',
  },
  webMapView: {
    en: 'Web Map View',
    rw: 'Reba Ikarti ya Web',
    fr: 'Vue Carte Web',
  },
  webMapDescription: {
    en: 'Interactive map optimized for web browsers',
    rw: "Ikarti y'uburyo bwiza kuri web",
    fr: 'Carte interactive optimisée pour les navigateurs web',
  },
  adminAccess: {
    en: 'Admin Access',
    rw: 'Kwinjira Umuyobozi',
    fr: 'Accès Admin',
  },
  accessDenied: {
    en: 'Access Denied',
    rw: 'Ntibwinjira',
    fr: 'Accès Refusé',
  },
  adminAccessRequired: {
    en: 'Admin access is required to view the admin map dashboard.',
    rw: 'Kwinjira kwa umuyobozi birakenewe kugira ikarti.',
    fr: "L'accès administrateur est requis pour voir le tableau de bord de carte.",
  },
  comingSoon: {
    en: 'Coming Soon',
    rw: 'Vuba',
    fr: 'Bientôt Disponible',
  },
  userMapComingSoon: {
    en: 'User map view will be available soon!',
    rw: "Reba ikarti y'umukoresha bizaba vuba!",
    fr: 'La vue carte utilisateur sera bientôt disponible !',
  },
  webOnly: {
    en: 'Web Only',
    rw: 'Web Gusa',
    fr: 'Web Seulement',
  },
  webMapOnly: {
    en: 'This feature is currently available on web only.',
    rw: 'Iki gice kiba kuri web gusa.',
    fr: 'Cette fonctionnalité est actuellement disponible uniquement sur le web.',
  },
  mapFeatures: {
    en: 'Map Features',
    rw: "Ibikorwa by'Ikarti",
    fr: 'Fonctionnalités de Carte',
  },
  interactiveMap: {
    en: 'Interactive map with real-time data',
    rw: "Ikarti y'uburyo n'amakuru ya vuba",
    fr: 'Carte interactive avec données en temps réel',
  },
  scanLocations: {
    en: 'View scan locations and disease hotspots',
    rw: "Reba aho bashushanyije n'aho ubutarumikazi bw'ingenzi",
    fr: 'Voir les emplacements de scan et les foyers de maladie',
  },
  analytics: {
    en: 'Analytics and insights for crop health',
    rw: "Uburyo n'ubumenyi bw'ubuzima bw'ibihingwa",
    fr: 'Analyses et insights pour la santé des cultures',
  },
  multiLanguage: {
    en: 'Multi-language support (EN, RW, FR)',
    rw: 'Gufasha indimi nyinshi (EN, RW, FR)',
    fr: 'Support multi-langues (EN, RW, FR)',
  },
  quickAccess: {
    en: 'Quick Access',
    rw: 'Kwinjira Vuba',
    fr: 'Accès Rapide',
  },
  openMap: {
    en: 'Open Map',
    rw: 'Fungura Ikarti',
    fr: 'Ouvrir la Carte',
  },
  myMapView: {
    en: 'My Map View',
    rw: 'Reba Ikarti Yanjye',
    fr: 'Ma Vue Carte',
  },
  myScansOnMap: {
    en: 'View your scan history on a map',
    rw: 'Reba amateka yawe yo gushushanya ku karti',
    fr: 'Voir votre historique de scans sur une carte',
  },
  mapComingSoon: {
    en: 'Map Coming Soon',
    rw: 'Ikarti Iza Vuba',
    fr: 'Carte Bientôt Disponible',
  },
  mapDescription: {
    en: 'Interactive map view will be available in the next update',
    rw: 'Reba ikarti izaba vuba mu gusubiramo gushya',
    fr: 'La vue carte interactive sera disponible dans la prochaine mise à jour',
  },
  recentScans: {
    en: 'Recent Scans',
    rw: 'Amashushanya ya Vuba',
    fr: 'Scans Récents',
  },
  noScansYet: {
    en: 'No scans yet',
    rw: 'Nta mashushanya kugeza ubu',
    fr: 'Aucun scan pour le moment',
  },
  startScanning: {
    en: 'Start scanning your crops to see them here',
    rw: 'Tangira gushushanya ibihingwa byawe kugira ubibone hano',
    fr: 'Commencez à scanner vos cultures pour les voir ici',
  },
  adminDashboard: {
    en: 'Admin Dashboard',
    rw: "Ikibaho cy'Umuyobozi",
    fr: 'Tableau de Bord Admin',
  },
  adminDashboardDesc: {
    en: 'Monitor crop health and user activity',
    rw: "Kureba ubuzima bw'ibihingwa n'ibikorwa by'abakoresha",
    fr: "Surveiller la santé des cultures et l'activité des utilisateurs",
  },
  admin: {
    en: 'Admin',
    rw: 'Umuyobozi',
    fr: 'Admin',
  },
  healthyRate: {
    en: 'Healthy Rate',
    rw: "Umucyo w'Ubuzima",
    fr: 'Taux de Santé',
  },
  diseaseRate: {
    en: 'Disease Rate',
    rw: "Umucyo w'Ubutarumikazi",
    fr: 'Taux de Maladie',
  },
  uniqueUsers: {
    en: 'Unique Users',
    rw: 'Abakoresha Batandukanye',
    fr: 'Utilisateurs Uniques',
  },
  topDisease: {
    en: 'Top Disease',
    rw: "Ubutarumikazi bw'Ingenzi",
    fr: 'Maladie Principale',
  },
  diseaseHeatmap: {
    en: 'Disease Heatmap & User Locations',
    rw: "Ikarti y'Ubutarumikazi n'Aho Abakoresha",
    fr: 'Carte de Chaleur des Maladies & Localisations',
  },
  hideMap: {
    en: 'Hide Map',
    rw: 'Hisha Ikarti',
    fr: 'Masquer la Carte',
  },
  showMap: {
    en: 'Show Map',
    rw: 'Erekana Ikarti',
    fr: 'Afficher la Carte',
  },
  mostActiveLocation: {
    en: 'Most Active Location',
    rw: 'Aho Bikorwa Bingenzi',
    fr: 'Localisation la Plus Active',
  },
  scansWillAppearHere: {
    en: 'Scans will appear here as users start using the app',
    rw: 'Amashushanya azerekana hano iyo abakoresha batangira gukoresha app',
    fr: "Les scans apparaîtront ici quand les utilisateurs commenceront à utiliser l'app",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES[0],
  );

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        const language = SUPPORTED_LANGUAGES.find(
          (lang) => lang.code === savedLanguage,
        );
        if (language) {
          setCurrentLanguage(language);
        }
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', language.code);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[currentLanguage.code] || translation['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
