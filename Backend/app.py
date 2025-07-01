from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os
from PIL import Image
import io
import base64
from werkzeug.utils import secure_filename
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Model paths (relative to notebook directory)
MODEL_PATHS = {
    'tomatoes': '../Notebook/tomato_disease_best_model_fixed.h5',
    'potatoes': '../Notebook/sweet_spot_potato_model.keras',
    'maize': '../Notebook/corn_gentle_v3.h5'
}

# Disease class mappings
DISEASE_CLASSES = {
    'tomatoes': [
        'Bacterial Spot', 'Early Blight', 'Healthy', 'Late Blight', 'Leaf Mold',
        'Septoria Leaf Spot', 'Spider Mites', 'Target Spot', 'Mosaic Virus', 
        'Yellow Leaf Curl Virus'
    ],
    'potatoes': [
        'Early Blight', 'Healthy', 'Late Blight'
    ],
    'maize': [
        'Common Rust', 'Gray Leaf Spot', 'Healthy', 'Northern Corn Leaf Blight'
    ]
}

# Treatment recommendations
TREATMENT_RECOMMENDATIONS = {
    'Bacterial Spot': [
        'Remove infected plants to prevent spread',
        'Apply copper-based bactericide',
        'Disinfect tools between plants',
        'Avoid working with wet plants',
        'Improve air circulation around plants'
    ],
    'Early Blight': [
        'Remove affected leaves immediately',
        'Apply copper-based fungicide',
        'Improve air circulation around plants',
        'Avoid overhead watering',
        'Monitor plant regularly for changes'
    ],
    'Late Blight': [
        'Remove affected leaves immediately',
        'Apply copper-based fungicide',
        'Improve air circulation around plants',
        'Avoid overhead watering',
        'Consider resistant varieties for next season'
    ],
    'Leaf Mold': [
        'Improve ventilation to reduce humidity',
        'Remove affected leaves',
        'Apply fungicide spray',
        'Avoid overhead watering'
    ],
    'Septoria Leaf Spot': [
        'Remove infected leaves',
        'Apply fungicide treatment',
        'Ensure proper plant spacing',
        'Water at soil level'
    ],
    'Spider Mites': [
        'Increase humidity around plants',
        'Use insecticidal soap spray',
        'Remove heavily infested leaves',
        'Introduce beneficial insects'
    ],
    'Target Spot': [
        'Remove affected plant parts',
        'Apply fungicide treatment',
        'Improve air circulation',
        'Avoid leaf wetness'
    ],
    'Mosaic Virus': [
        'Remove infected plants immediately',
        'Control aphid vectors',
        'Use virus-free seeds',
        'Disinfect tools regularly'
    ],
    'Yellow Leaf Curl Virus': [
        'Remove infected plants',
        'Control whitefly vectors',
        'Use reflective mulch',
        'Plant resistant varieties'
    ],
    'Common Rust': [
        'Apply sulfur-based fungicide',
        'Remove infected plant debris',
        'Increase spacing between plants',
        'Consider resistant varieties'
    ],
    'Gray Leaf Spot': [
        'Apply fungicide treatment',
        'Improve air circulation',
        'Remove crop residue',
        'Rotate crops'
    ],
    'Northern Corn Leaf Blight': [
        'Apply fungicide spray',
        'Remove infected leaves',
        'Practice crop rotation',
        'Use resistant hybrids'
    ],
    'Healthy': [
        'Continue current care routine',
        'Maintain regular watering schedule',
        'Monitor for early signs of disease',
        'Apply balanced fertilizer as needed'
    ]
}

# Global model storage
models = {}

def load_models():
    """Load all ML models at startup"""
    global models
    
    for crop_type, model_path in MODEL_PATHS.items():
        try:
            if os.path.exists(model_path):
                logger.info(f"Loading {crop_type} model from {model_path}")
                models[crop_type] = tf.keras.models.load_model(model_path)
                logger.info(f"Successfully loaded {crop_type} model")
            else:
                logger.warning(f"Model file not found: {model_path}")
        except Exception as e:
            logger.error(f"Error loading {crop_type} model: {str(e)}")

def preprocess_image(image_file, target_size=(256, 256)):
    """Preprocess uploaded image for model prediction"""
    try:
        # Read image
        image = Image.open(image_file).convert('RGB')
        
        # Resize image
        image = image.resize(target_size)
        
        # Convert to numpy array and normalize
        image_array = np.array(image)
        image_array = image_array.astype(np.float32) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        return None

def determine_severity(confidence):
    """Determine disease severity based on confidence"""
    if confidence > 0.8:
        return 'High'
    elif confidence > 0.6:
        return 'Medium'
    else:
        return 'Low'

def determine_treatment_urgency(disease):
    """Determine treatment urgency based on disease type"""
    urgent_diseases = ['late blight', 'bacterial', 'virus', 'wilt']
    moderate_diseases = ['early blight', 'rust', 'leaf spot', 'mold']
    
    disease_lower = disease.lower()
    
    if 'healthy' in disease_lower:
        return 'None'
    
    if any(urgent in disease_lower for urgent in urgent_diseases):
        return 'High'
    elif any(moderate in disease_lower for moderate in moderate_diseases):
        return 'Medium'
    else:
        return 'Low'

def estimate_recovery_time(disease):
    """Estimate recovery time based on disease type"""
    disease_lower = disease.lower()
    
    if 'healthy' in disease_lower:
        return 'N/A'
    elif any(word in disease_lower for word in ['virus', 'wilt']):
        return '4-6 weeks'
    elif any(word in disease_lower for word in ['blight', 'rust']):
        return '2-3 weeks'
    else:
        return '1-2 weeks'

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Plant Disease Detection API is running',
        'models_loaded': list(models.keys()),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/ml/<crop_type>', methods=['POST'])
def predict_disease(crop_type):
    """Main prediction endpoint for plant disease detection"""
    try:
        # Validate crop type
        if crop_type not in ['tomatoes', 'potatoes', 'maize']:
            return jsonify({
                'success': False,
                'error': f'Unsupported crop type: {crop_type}. Supported types: tomatoes, potatoes, maize'
            }), 400
        
        # Check if model is loaded
        if crop_type not in models:
            return jsonify({
                'success': False,
                'error': f'Model not available for {crop_type}'
            }), 500
        
        # Validate request
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No image file selected'
            }), 400
        
        # Preprocess image
        processed_image = preprocess_image(image_file)
        
        if processed_image is None:
            return jsonify({
                'success': False,
                'error': 'Failed to process image'
            }), 400
        
        # Make prediction
        model = models[crop_type]
        predictions = model.predict(processed_image)
        
        # Get prediction results
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        predicted_disease = DISEASE_CLASSES[crop_type][predicted_class_idx]
        
        # Get treatment recommendations
        recommendations = TREATMENT_RECOMMENDATIONS.get(
            predicted_disease, 
            ['Consult local agricultural extension office']
        )
        
        # Prepare response
        result = {
            'success': True,
            'predicted_class': predicted_disease,
            'confidence': confidence,
            'confidence_percentage': round(confidence * 100, 1),
            'severity': determine_severity(confidence),
            'recommendations': recommendations,
            'treatment_urgency': determine_treatment_urgency(predicted_disease),
            'estimated_recovery': estimate_recovery_time(predicted_disease),
            'crop_type': crop_type,
            'all_predictions': {
                DISEASE_CLASSES[crop_type][i]: float(predictions[0][i])
                for i in range(len(DISEASE_CLASSES[crop_type]))
            }
        }
        
        logger.info(f"Prediction completed for {crop_type}: {predicted_disease} ({confidence:.3f})")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during prediction'
        }), 500

@app.route('/api/models', methods=['GET'])
def get_available_models():
    """Get information about available models"""
    model_info = {}
    
    for crop_type in ['tomatoes', 'potatoes', 'maize']:
        model_info[crop_type] = {
            'loaded': crop_type in models,
            'classes': DISEASE_CLASSES[crop_type],
            'endpoint': f'/api/ml/{crop_type}'
        }
    
    return jsonify({
        'models': model_info,
        'total_models': len(models)
    })

if __name__ == '__main__':
    logger.info("Starting Plant Disease Detection API...")
    
    # Load all models
    load_models()
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5000, debug=True) 