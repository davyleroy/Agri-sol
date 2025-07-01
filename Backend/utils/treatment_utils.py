from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class TreatmentRecommendationEngine:
    """Provides treatment recommendations and disease management advice"""
    
    def __init__(self):
        self.treatment_database = self._initialize_treatment_database()
        self.severity_thresholds = {
            'high': 0.8,
            'medium': 0.6,
            'low': 0.0
        }
    
    def _initialize_treatment_database(self) -> Dict:
        """Initialize comprehensive treatment database"""
        return {
            # Tomato diseases
            'Bacterial Spot': {
                'immediate_actions': [
                    'Remove infected plants to prevent spread',
                    'Disinfect all gardening tools with 10% bleach solution',
                    'Avoid working with plants when they are wet'
                ],
                'treatment_options': [
                    'Apply copper-based bactericide (follow label instructions)',
                    'Use streptomycin-based spray if available',
                    'Implement strict sanitation protocols'
                ],
                'prevention': [
                    'Choose resistant varieties for next planting',
                    'Ensure proper plant spacing for air circulation',
                    'Use drip irrigation instead of overhead watering',
                    'Remove crop debris after harvest'
                ],
                'urgency': 'High',
                'recovery_time': '3-4 weeks',
                'organic_alternatives': [
                    'Neem oil spray (weekly application)',
                    'Baking soda solution (1 tsp per quart water)',
                    'Compost tea application'
                ]
            },
            
            'Early Blight': {
                'immediate_actions': [
                    'Remove affected lower leaves immediately',
                    'Mulch around plants to prevent soil splash',
                    'Improve air circulation by pruning'
                ],
                'treatment_options': [
                    'Apply copper-based fungicide every 7-10 days',
                    'Use chlorothalonil-based products',
                    'Apply preventive fungicide spray'
                ],
                'prevention': [
                    'Rotate crops (avoid tomato family for 2-3 years)',
                    'Water at soil level, avoid wetting foliage',
                    'Maintain proper plant nutrition',
                    'Choose resistant varieties'
                ],
                'urgency': 'Medium',
                'recovery_time': '2-3 weeks',
                'organic_alternatives': [
                    'Bicarbonate spray (baking soda + oil)',
                    'Milk spray (1:10 ratio with water)',
                    'Copper soap fungicide'
                ]
            },
            
            'Late Blight': {
                'immediate_actions': [
                    'Remove entire infected plants immediately',
                    'Do not compost infected material',
                    'Apply emergency fungicide treatment'
                ],
                'treatment_options': [
                    'Apply systemic fungicide (metalaxyl-based)',
                    'Use preventive copper sprays',
                    'Consider destroying severely affected plants'
                ],
                'prevention': [
                    'Choose late blight resistant varieties',
                    'Ensure excellent drainage',
                    'Avoid overhead irrigation',
                    'Monitor weather conditions (cool, wet weather favors disease)'
                ],
                'urgency': 'High',
                'recovery_time': '4-6 weeks',
                'organic_alternatives': [
                    'Copper sulfate spray',
                    'Remove and destroy infected plants',
                    'Improve drainage and air circulation'
                ]
            },
            
            'Leaf Mold': {
                'immediate_actions': [
                    'Increase ventilation in greenhouse/tunnel',
                    'Reduce humidity levels',
                    'Remove affected leaves'
                ],
                'treatment_options': [
                    'Apply fungicide spray (propiconazole)',
                    'Use sulfur-based fungicides',
                    'Improve environmental controls'
                ],
                'prevention': [
                    'Maintain humidity below 85%',
                    'Ensure adequate ventilation',
                    'Space plants properly',
                    'Choose resistant varieties'
                ],
                'urgency': 'Medium',
                'recovery_time': '2-3 weeks',
                'organic_alternatives': [
                    'Sulfur dust application',
                    'Baking soda spray',
                    'Improve ventilation naturally'
                ]
            },
            
            'Septoria Leaf Spot': {
                'immediate_actions': [
                    'Remove infected lower leaves',
                    'Apply mulch to prevent soil splash',
                    'Improve plant spacing'
                ],
                'treatment_options': [
                    'Apply chlorothalonil fungicide',
                    'Use copper-based products',
                    'Preventive fungicide program'
                ],
                'prevention': [
                    'Crop rotation (3-4 year cycle)',
                    'Water at soil level only',
                    'Remove plant debris',
                    'Choose resistant varieties'
                ],
                'urgency': 'Medium',
                'recovery_time': '2-3 weeks',
                'organic_alternatives': [
                    'Neem oil spray',
                    'Copper soap fungicide',
                    'Compost tea application'
                ]
            },
            
            'Spider Mites': {
                'immediate_actions': [
                    'Increase humidity around plants',
                    'Spray plants with water to dislodge mites',
                    'Remove heavily infested leaves'
                ],
                'treatment_options': [
                    'Apply miticide spray',
                    'Use insecticidal soap',
                    'Release predatory mites'
                ],
                'prevention': [
                    'Maintain adequate humidity',
                    'Avoid over-fertilizing with nitrogen',
                    'Regular monitoring and early detection',
                    'Encourage beneficial insects'
                ],
                'urgency': 'Medium',
                'recovery_time': '1-2 weeks',
                'organic_alternatives': [
                    'Neem oil spray',
                    'Insecticidal soap',
                    'Predatory insect release'
                ]
            },
            
            'Target Spot': {
                'immediate_actions': [
                    'Remove affected plant parts',
                    'Improve air circulation',
                    'Apply preventive fungicide'
                ],
                'treatment_options': [
                    'Fungicide application (azoxystrobin)',
                    'Copper-based treatments',
                    'Systemic fungicide program'
                ],
                'prevention': [
                    'Crop rotation practices',
                    'Avoid leaf wetness',
                    'Proper plant spacing',
                    'Remove crop debris'
                ],
                'urgency': 'Medium',
                'recovery_time': '2-3 weeks',
                'organic_alternatives': [
                    'Copper fungicide',
                    'Sulfur spray',
                    'Cultural control methods'
                ]
            },
            
            'Mosaic Virus': {
                'immediate_actions': [
                    'Remove infected plants immediately',
                    'Disinfect tools with 10% bleach',
                    'Control aphid vectors'
                ],
                'treatment_options': [
                    'No direct treatment available',
                    'Focus on vector control',
                    'Remove infected plants'
                ],
                'prevention': [
                    'Use virus-free seeds and transplants',
                    'Control aphid populations',
                    'Choose resistant varieties',
                    'Practice good sanitation'
                ],
                'urgency': 'High',
                'recovery_time': 'Plant removal required',
                'organic_alternatives': [
                    'Reflective mulches to deter aphids',
                    'Beneficial insect habitat',
                    'Row covers during vulnerable periods'
                ]
            },
            
            'Yellow Leaf Curl Virus': {
                'immediate_actions': [
                    'Remove infected plants',
                    'Control whitefly populations',
                    'Use reflective mulch'
                ],
                'treatment_options': [
                    'No direct treatment',
                    'Focus on whitefly control',
                    'Use resistant varieties'
                ],
                'prevention': [
                    'Plant resistant varieties',
                    'Use insect-proof screens',
                    'Control whitefly vectors',
                    'Remove infected plants promptly'
                ],
                'urgency': 'High',
                'recovery_time': 'Plant removal required',
                'organic_alternatives': [
                    'Yellow sticky traps for whiteflies',
                    'Neem oil for vector control',
                    'Companion planting with repellent plants'
                ]
            },
            
            # Potato diseases
            'Healthy': {
                'immediate_actions': [
                    'Continue current care routine',
                    'Monitor regularly for any changes'
                ],
                'treatment_options': [
                    'No treatment needed',
                    'Maintain preventive care'
                ],
                'prevention': [
                    'Maintain regular watering schedule',
                    'Apply balanced fertilizer as needed',
                    'Monitor for early signs of disease',
                    'Practice good garden hygiene'
                ],
                'urgency': 'None',
                'recovery_time': 'N/A',
                'organic_alternatives': [
                    'Compost application',
                    'Natural fertilizers',
                    'Companion planting'
                ]
            },
            
            # Maize diseases
            'Common Rust': {
                'immediate_actions': [
                    'Remove infected plant debris',
                    'Increase spacing between plants',
                    'Apply preventive fungicide'
                ],
                'treatment_options': [
                    'Apply sulfur-based fungicide',
                    'Use triazole fungicides',
                    'Implement preventive spray program'
                ],
                'prevention': [
                    'Choose resistant varieties',
                    'Ensure proper plant spacing',
                    'Remove crop residue',
                    'Rotate crops appropriately'
                ],
                'urgency': 'Medium',
                'recovery_time': '2-3 weeks',
                'organic_alternatives': [
                    'Sulfur dust application',
                    'Neem oil spray',
                    'Cultural control practices'
                ]
            },
            
            'Gray Leaf Spot': {
                'immediate_actions': [
                    'Improve air circulation',
                    'Remove crop residue',
                    'Apply fungicide treatment'
                ],
                'treatment_options': [
                    'Strobilurin fungicides',
                    'Triazole fungicides',
                    'Preventive spray program'
                ],
                'prevention': [
                    'Practice crop rotation',
                    'Use resistant hybrids',
                    'Manage crop residue',
                    'Avoid late season nitrogen'
                ],
                'urgency': 'Medium',
                'recovery_time': '3-4 weeks',
                'organic_alternatives': [
                    'Copper-based fungicides',
                    'Cultural management',
                    'Resistant variety selection'
                ]
            },
            
            'Northern Corn Leaf Blight': {
                'immediate_actions': [
                    'Remove infected leaves',
                    'Apply fungicide spray',
                    'Improve air circulation'
                ],
                'treatment_options': [
                    'Apply fungicide (propiconazole)',
                    'Use preventive treatments',
                    'Consider resistant hybrids'
                ],
                'prevention': [
                    'Use resistant corn hybrids',
                    'Practice crop rotation',
                    'Remove corn debris',
                    'Avoid dense planting'
                ],
                'urgency': 'Medium',
                'recovery_time': '2-4 weeks',
                'organic_alternatives': [
                    'Copper fungicides',
                    'Cultural practices',
                    'Biological control agents'
                ]
            }
        }
    
    def get_treatment_recommendations(self, disease: str, confidence: float) -> Dict:
        """Get comprehensive treatment recommendations for a disease"""
        try:
            if disease not in self.treatment_database:
                return self._get_generic_recommendations()
            
            disease_info = self.treatment_database[disease]
            severity = self._determine_severity(confidence)
            
            recommendations = {
                'disease': disease,
                'confidence': confidence,
                'severity': severity,
                'urgency': disease_info.get('urgency', 'Medium'),
                'estimated_recovery': disease_info.get('recovery_time', '2-3 weeks'),
                'immediate_actions': disease_info.get('immediate_actions', []),
                'treatment_options': disease_info.get('treatment_options', []),
                'prevention_measures': disease_info.get('prevention', []),
                'organic_alternatives': disease_info.get('organic_alternatives', [])
            }
            
            # Add severity-specific recommendations
            if severity == 'High':
                recommendations['priority_message'] = 'Immediate attention required!'
                recommendations['additional_notes'] = [
                    'Monitor daily for changes',
                    'Consider consulting agricultural extension service',
                    'Document progress with photos'
                ]
            elif severity == 'Medium':
                recommendations['priority_message'] = 'Treatment recommended within 1-2 days'
                recommendations['additional_notes'] = [
                    'Monitor every 2-3 days',
                    'Keep detailed treatment records'
                ]
            else:
                recommendations['priority_message'] = 'Monitor and consider preventive measures'
                recommendations['additional_notes'] = [
                    'Weekly monitoring sufficient',
                    'Focus on prevention'
                ]
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting treatment recommendations: {str(e)}")
            return self._get_generic_recommendations()
    
    def _determine_severity(self, confidence: float) -> str:
        """Determine severity level based on confidence score"""
        if confidence >= self.severity_thresholds['high']:
            return 'High'
        elif confidence >= self.severity_thresholds['medium']:
            return 'Medium'
        else:
            return 'Low'
    
    def _get_generic_recommendations(self) -> Dict:
        """Get generic recommendations for unknown diseases"""
        return {
            'disease': 'Unknown',
            'confidence': 0.0,
            'severity': 'Low',
            'urgency': 'Medium',
            'estimated_recovery': 'Varies',
            'immediate_actions': [
                'Document symptoms with photos',
                'Isolate affected plants if possible',
                'Monitor for spread'
            ],
            'treatment_options': [
                'Consult local agricultural extension office',
                'Submit samples for professional diagnosis',
                'Consider broad-spectrum treatments if spread is rapid'
            ],
            'prevention_measures': [
                'Maintain good garden hygiene',
                'Ensure proper plant spacing',
                'Monitor regularly for changes'
            ],
            'organic_alternatives': [
                'Improve soil health with compost',
                'Encourage beneficial insects',
                'Use preventive organic sprays'
            ],
            'priority_message': 'Professional diagnosis recommended',
            'additional_notes': [
                'Keep detailed records of symptoms',
                'Note environmental conditions',
                'Track progression over time'
            ]
        }

# Global instance
treatment_engine = TreatmentRecommendationEngine() 