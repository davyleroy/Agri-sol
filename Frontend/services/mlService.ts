export interface CropType {
  id: string;
  name: string;
  scientificName: string;
  icon: string;
  description: string;
  commonDiseases: string[];
  modelEndpoint: string;
}

export const SUPPORTED_CROPS: CropType[] = [
  {
    id: 'potatoes',
    name: 'Potatoes',
    scientificName: 'Solanum tuberosum',
    icon: '🥔',
    description:
      'Potato plants including russet, red, and fingerling varieties',
    commonDiseases: ['Early Blight', 'Late Blight', 'Healthy'],
    modelEndpoint: '/api/ml/potatoes',
  },
  {
    id: 'beans',
    name: 'Beans',
    scientificName: 'Phaseolus vulgaris',
    icon: '🫘',
    description: 'Common beans including kidney, black, and pinto varieties',
    commonDiseases: ['Bean Rust', 'Angular Leaf Spot', 'Healthy'],
    modelEndpoint: '/api/ml/beans',
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    scientificName: 'Zea mays',
    icon: '🌽',
    description: 'Corn plants including sweet corn and field corn varieties',
    commonDiseases: [
      'Northern Corn Leaf Blight',
      'Gray Leaf Spot',
      'Common Rust',
      'Ear Rot',
    ],
    modelEndpoint: '/api/ml/maize',
  },
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    scientificName: 'Solanum lycopersicum',
    icon: '🍅',
    description:
      'Tomato plants including cherry, beefsteak, and roma varieties',
    commonDiseases: [
      'Early Blight',
      'Late Blight',
      'Bacterial Spot',
      'Fusarium Wilt',
    ],
    modelEndpoint: '/api/ml/tomatoes',
  },
];

export interface MLPrediction {
  disease: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  recommendations: string[];
  treatmentUrgency: 'None' | 'Low' | 'Medium' | 'High';
  estimatedRecovery: string;
}

export interface MLAnalysisResult {
  success: boolean;
  prediction?: MLPrediction;
  error?: string;
  processingTime?: number;
}

class MLService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl =
      process.env.EXPO_PUBLIC_ML_API_URL || 'http://localhost:5000';
    this.apiKey = process.env.EXPO_PUBLIC_ML_API_KEY || 'agrisol-api-key-2024';

    // Validate environment variables
    console.log('🔧 ML Service Configuration:');
    console.log('API URL:', this.baseUrl);
    console.log('API Key configured:', !!this.apiKey);

    if (
      !process.env.EXPO_PUBLIC_ML_API_URL ||
      process.env.EXPO_PUBLIC_ML_API_URL === 'your_ml_api_url_here'
    ) {
      console.warn(
        '⚠️  EXPO_PUBLIC_ML_API_URL is not properly configured. Using default localhost.'
      );
    }

    if (
      !process.env.EXPO_PUBLIC_ML_API_KEY ||
      process.env.EXPO_PUBLIC_ML_API_KEY === 'your_ml_api_key_here'
    ) {
      console.warn(
        '⚠️  EXPO_PUBLIC_ML_API_KEY is not properly configured. Using default key.'
      );
    }
  }

  async analyzeImage(
    imageUri: string,
    cropType: CropType
  ): Promise<MLAnalysisResult> {
    try {
      // For development, always try the real API first, fallback to mock if it fails
      console.log('🚀 Attempting to analyze image with real API...');

      const startTime = Date.now();

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'crop_image.jpg',
      } as any);

      console.log(
        `📡 Making request to: ${this.baseUrl}${cropType.modelEndpoint}`
      );

      const response = await fetch(`${this.baseUrl}${cropType.modelEndpoint}`, {
        method: 'POST',
        headers: {
          // Remove Content-Type header to let the browser set it automatically for FormData
          // 'Content-Type': 'multipart/form-data', // This can cause issues with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ML API error: ${response.status}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        prediction: this.formatPrediction(result, cropType),
        processingTime,
      };
    } catch (error) {
      console.error('ML Analysis Error:', error);

      // Return mock data for development/demo purposes
      return this.getMockPrediction(cropType);
    }
  }

  private formatPrediction(apiResult: any, cropType: CropType): MLPrediction {
    console.log('🔄 Formatting API result:', apiResult);

    return {
      disease: apiResult.predicted_class || 'Unknown',
      confidence: Math.round(
        apiResult.confidence_percentage || apiResult.confidence || 85
      ),
      severity: this.determineSeverity(apiResult.confidence),
      recommendations:
        apiResult.recommendations ||
        this.generateRecommendations(apiResult.predicted_class, cropType),
      treatmentUrgency:
        apiResult.treatment_urgency ||
        this.determineTreatmentUrgency(apiResult.predicted_class),
      estimatedRecovery:
        apiResult.estimated_recovery ||
        this.estimateRecoveryTime(apiResult.predicted_class),
    };
  }

  private determineSeverity(confidence: number): 'Low' | 'Medium' | 'High' {
    if (confidence > 0.8) return 'High';
    if (confidence > 0.6) return 'Medium';
    return 'Low';
  }

  private determineTreatmentUrgency(
    disease: string
  ): 'None' | 'Low' | 'Medium' | 'High' {
    const urgentDiseases = ['late blight', 'bacterial blight', 'fusarium wilt'];
    const moderateDiseases = ['early blight', 'rust', 'leaf spot'];

    const diseaseLower = disease.toLowerCase();

    if (diseaseLower.includes('healthy')) return 'None';
    if (urgentDiseases.some((d) => diseaseLower.includes(d))) return 'High';
    if (moderateDiseases.some((d) => diseaseLower.includes(d))) return 'Medium';
    return 'Low';
  }

  private estimateRecoveryTime(disease: string): string {
    const diseaseLower = disease.toLowerCase();

    if (diseaseLower.includes('healthy')) return 'N/A';
    if (diseaseLower.includes('virus') || diseaseLower.includes('wilt'))
      return '4-6 weeks';
    if (diseaseLower.includes('blight') || diseaseLower.includes('rust'))
      return '2-3 weeks';
    return '1-2 weeks';
  }

  private generateRecommendations(
    disease: string,
    cropType: CropType
  ): string[] {
    const diseaseLower = disease.toLowerCase();
    const baseRecommendations = [
      'Monitor plant regularly for changes',
      'Ensure proper spacing for air circulation',
      'Water at soil level, avoid wetting leaves',
    ];

    if (diseaseLower.includes('healthy')) {
      return [
        'Continue current care routine',
        'Maintain regular watering schedule',
        'Monitor for early signs of disease',
        'Apply balanced fertilizer as needed',
      ];
    }

    if (diseaseLower.includes('blight')) {
      return [
        'Remove affected leaves immediately',
        'Apply copper-based fungicide',
        'Improve air circulation around plants',
        'Avoid overhead watering',
        ...baseRecommendations,
      ];
    }

    if (diseaseLower.includes('rust')) {
      return [
        'Apply sulfur-based fungicide',
        'Remove infected plant debris',
        'Increase spacing between plants',
        'Consider resistant varieties for next season',
        ...baseRecommendations,
      ];
    }

    if (diseaseLower.includes('bacterial')) {
      return [
        'Remove infected plants to prevent spread',
        'Apply copper-based bactericide',
        'Disinfect tools between plants',
        'Avoid working with wet plants',
        ...baseRecommendations,
      ];
    }

    return [
      'Consult local agricultural extension office',
      'Consider professional plant pathologist consultation',
      'Document symptoms for tracking',
      ...baseRecommendations,
    ];
  }

  // Mock prediction for development/demo
  private getMockPrediction(cropType: CropType): MLAnalysisResult {
    const mockDiseases = {
      potatoes: ['Healthy Potato Plant', 'Early Blight', 'Late Blight'],
      beans: ['Healthy Bean Plant', 'Bean Rust', 'Angular Leaf Spot'],
      maize: [
        'Healthy Corn Plant',
        'Northern Corn Leaf Blight',
        'Gray Leaf Spot',
      ],
      tomatoes: ['Healthy Tomato Plant', 'Early Blight', 'Late Blight'],
    };

    const diseases = mockDiseases[cropType.id as keyof typeof mockDiseases] || [
      'Healthy Plant',
    ];
    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
    const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence

    return {
      success: true,
      prediction: {
        disease: randomDisease,
        confidence: Math.round(confidence * 100),
        severity: this.determineSeverity(confidence),
        recommendations: this.generateRecommendations(randomDisease, cropType),
        treatmentUrgency: this.determineTreatmentUrgency(randomDisease),
        estimatedRecovery: this.estimateRecoveryTime(randomDisease),
      },
      processingTime: 1500 + Math.random() * 1000, // 1.5-2.5 seconds
    };
  }
}

export const mlService = new MLService();
