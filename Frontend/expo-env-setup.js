// Environment setup verification for AgriSol Frontend
console.log('🔧 AgriSol Environment Configuration Check');
console.log('='.repeat(50));
console.log(
  'API URL:',
  process.env.EXPO_PUBLIC_ML_API_URL || 'http://localhost:5000'
);
console.log('API Key configured:', !!process.env.EXPO_PUBLIC_ML_API_KEY);
console.log('Environment:', process.env.EXPO_PUBLIC_ENV || 'development');
console.log('='.repeat(50));

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_ML_API_URL || 'http://localhost:5000',
  apiKey: process.env.EXPO_PUBLIC_ML_API_KEY || 'agrisol-api-key-2024',
  environment: process.env.EXPO_PUBLIC_ENV || 'development',
  debug: process.env.EXPO_PUBLIC_DEBUG === 'true',
};
