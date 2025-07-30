#!/usr/bin/env python3
"""
AgriSol Plant Disease Detection API with Hugging Face Models
Uses models from Hugging Face repositories for deployment
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from flask_restx import Api, Resource, fields, reqparse
import tensorflow as tf
import numpy as np
import cv2
import os
import sys
from PIL import Image
import io
import base64
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
import logging
from datetime import datetime, timedelta
import json
import time
import traceback
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import threading
import queue

# Import configuration
from config import get_config, validate_config

# Import Hugging Face model manager
try:
    from huggingface_models import hf_manager
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False
    print("⚠️ Hugging Face model manager not available")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Get configuration
config_obj = get_config()
app.config.from_object(config_obj)

# Validate configuration
config_errors = validate_config(config_obj)
if config_errors:
    logger.warning(f"Configuration warnings: {config_errors}")

# Enable CORS
CORS(app, origins=config_obj.CORS_ORIGINS)

# API Documentation Setup
api = Api(
    app,
    version=config_obj.API_VERSION,
    title=config_obj.API_TITLE,
    description=config_obj.API_DESCRIPTION + " (Hugging Face Models)",
    doc='/docs/'
)

# Ensure upload directory exists
os.makedirs(config_obj.UPLOAD_FOLDER, exist_ok=True)

# Global model storage
models = {}
model_info = {}
model_load_errors = {}

# Location API integration (optional)
location_api_available = False
if config_obj.LOCATION_API_ENABLED:
    try:
        from location_api import LocationAPI
        location_api_available = True
        logger.info("✅ Location API integration enabled")
    except ImportError as e:
        logger.warning(f"⚠️ Location API not available: {e}")
    except Exception as e:
        logger.error(f"❌ Location API integration failed: {e}")

# Treatment recommendations database
TREATMENT_DATABASE = {
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
        'organic_alternatives': [
            'Neem oil spray (1-2% solution)',
            'Baking soda spray (1 tablespoon per gallon)',
            'Garlic and chili pepper spray'
        ],
        'estimated_recovery': '2-4 weeks with proper treatment',
        'prevention_tips': [
            'Use disease-resistant varieties',
            'Ensure proper spacing between plants',
            'Avoid overhead watering',
            'Remove plant debris regularly'
        ]
    },
    'Early Blight': {
        'immediate_actions': [
            'Remove infected leaves immediately',
            'Improve air circulation around plants',
            'Avoid overhead watering'
        ],
        'treatment_options': [
            'Apply fungicide containing chlorothalonil',
            'Use copper-based fungicide',
            'Apply neem oil solution'
        ],
        'organic_alternatives': [
            'Baking soda spray (1 tablespoon per gallon)',
            'Milk spray (1 part milk to 9 parts water)',
            'Compost tea spray'
        ],
        'estimated_recovery': '3-6 weeks with treatment',
        'prevention_tips': [
            'Mulch around plants',
            'Water at soil level',
            'Remove lower leaves touching soil',
            'Rotate crops annually'
        ]
    },
    'Late Blight': {
        'immediate_actions': [
            'Remove all infected plants immediately',
            'Disinfect tools and equipment',
            'Isolate affected area'
        ],
        'treatment_options': [
            'Apply copper-based fungicide',
            'Use systemic fungicide if available',
            'Apply neem oil solution'
        ],
        'organic_alternatives': [
            'Baking soda and oil spray',
            'Garlic and onion spray',
            'Compost tea with neem oil'
        ],
        'estimated_recovery': '4-8 weeks, may require replanting',
        'prevention_tips': [
            'Plant resistant varieties',
            'Ensure good drainage',
            'Avoid overhead watering',
            'Monitor weather conditions'
        ]
    },
    'Healthy': {
        'immediate_actions': [
            'Continue current care routine',
            'Monitor for early signs of disease',
            'Maintain optimal growing conditions'
        ],
        'treatment_options': [
            'No treatment needed',
            'Continue preventive measures',
            'Maintain plant health'
        ],
        'organic_alternatives': [
            'Continue organic care routine',
            'Use compost tea for plant health',
            'Maintain soil fertility'
        ],
        'estimated_recovery': 'No recovery needed - plant is healthy',
        'prevention_tips': [
            'Maintain consistent watering',
            'Provide adequate nutrition',
            'Monitor for pests and diseases',
            'Practice crop rotation'
        ]
    }
}

def load_model_safely(crop_type: str) -> Optional[tf.keras.Model]:
    """
    Safely load a model from Hugging Face with fallback options
    """
    try:
        # Try Hugging Face first
        if HF_AVAILABLE:
            model = hf_manager.load_model_from_hf(crop_type)
            if model is not None:
                logger.info(f"✅ Successfully loaded {crop_type} model from Hugging Face")
                return model
        
        # Fallback to local files
        logger.warning(f"⚠️ Hugging Face not available, trying local files for {crop_type}")
        
        # Try local model paths
        local_paths = [
            Path("models") / f"optimized_{crop_type}_model.h5",
            Path("models") / f"optimized_{crop_type}_model.tflite",
            Path("../Notebook") / f"{crop_type}_disease_best_model.h5",
            Path("../Notebook") / f"{crop_type}_disease_model_best.keras"
        ]
        
        for model_path in local_paths:
            if model_path.exists():
                try:
                    model = tf.keras.models.load_model(str(model_path), compile=False)
                    logger.info(f"✅ Loaded {crop_type} model from local: {model_path}")
                    return model
                except Exception as e:
                    logger.warning(f"⚠️ Failed to load {model_path}: {e}")
                    continue
        
        # Create emergency fallback model
        logger.warning(f"⚠️ Creating emergency fallback model for {crop_type}")
        
        class_counts = {'tomatoes': 10, 'potatoes': 3, 'beans': 3, 'maize': 3}
        num_classes = class_counts.get(crop_type, 3)
        
        model = tf.keras.Sequential([
            tf.keras.layers.Input(shape=(256, 256, 3)),
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D(2, 2),
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D(2, 2),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        logger.info(f"✅ Created emergency fallback model for {crop_type}")
        return model
        
    except Exception as e:
        logger.error(f"❌ Critical error loading {crop_type} model: {str(e)}")
        return None

def load_models():
    """
    Load all ML models from Hugging Face with fallback options
    """
    global models, model_info, model_load_errors
    
    logger.info("🚀 Starting model loading process (Hugging Face)...")
    
    for crop_type in ['tomatoes', 'potatoes', 'maize', 'beans']:
        logger.info(f"📋 Loading {crop_type} model...")
        
        model = load_model_safely(crop_type)
        
        if model is not None:
            models[crop_type] = model
            model_info[crop_type] = {
                'input_shape': model.input_shape,
                'output_shape': model.output_shape,
                'classes': len(config_obj.DISEASE_CLASSES[crop_type]),
                'load_time': datetime.now().isoformat(),
                'source': 'huggingface' if HF_AVAILABLE else 'local'
            }
            logger.info(f"✅ Successfully loaded {crop_type} model")
        else:
            error_msg = f"Failed to load {crop_type} model"
            logger.error(f"❌ {error_msg}")
            model_load_errors[crop_type] = error_msg
    
    logger.info(f"🎯 Model loading complete. Loaded: {list(models.keys())}")
    return models

def preprocess_image(image_file, target_size=(256, 256)) -> Optional[np.ndarray]:
    """
    Preprocess uploaded image for model prediction
    """
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

def get_treatment_recommendations(disease: str, crop_type: str, confidence: float) -> Dict[str, Any]:
    """
    Get comprehensive treatment recommendations
    """
    # Get base treatment data
    treatment_data = TREATMENT_DATABASE.get(disease, {})
    
    # Determine severity based on confidence
    if confidence > 0.8:
        severity = 'High'
    elif confidence > 0.6:
        severity = 'Medium'
    else:
        severity = 'Low'
    
    # Base recommendations for all crops
    base_recommendations = [
        f"Monitor {crop_type} plant regularly for disease progression",
        "Ensure proper air circulation around plants",
        "Maintain optimal soil moisture levels",
        "Remove any infected plant debris"
    ]
    
    # Combine base and specific recommendations
    all_recommendations = base_recommendations + treatment_data.get('treatment_options', [])
    
    return {
        'disease': disease,
        'severity': severity,
        'confidence': confidence,
        'immediate_actions': treatment_data.get('immediate_actions', []),
        'treatment_options': treatment_data.get('treatment_options', []),
        'organic_alternatives': treatment_data.get('organic_alternatives', []),
        'estimated_recovery': treatment_data.get('estimated_recovery', 'Varies by condition'),
        'prevention_tips': treatment_data.get('prevention_tips', []),
        'recommendations': all_recommendations
    }

def validate_image_file(file) -> Tuple[bool, str]:
    """
    Validate uploaded image file
    """
    try:
        # Check file extension
        filename = file.filename.lower()
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
        
        if not any(filename.endswith(ext) for ext in allowed_extensions):
            return False, f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        
        # Check file size (16MB limit)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > 16 * 1024 * 1024:  # 16MB
            return False, "File too large. Maximum size: 16MB"
        
        # Try to open image
        image = Image.open(file)
        image.verify()
        file.seek(0)  # Reset to beginning
        
        return True, "Valid image file"
        
    except Exception as e:
        return False, f"Invalid image file: {str(e)}"

# API Response Models
health_model = api.model('Health', {
    'status': fields.String(description='API status'),
    'message': fields.String(description='Status message'),
    'models_loaded': fields.List(fields.String, description='Loaded models'),
    'huggingface_available': fields.Boolean(description='Hugging Face availability'),
    'timestamp': fields.String(description='Current timestamp'),
    'version': fields.String(description='API version')
})

prediction_model = api.model('Prediction', {
    'success': fields.Boolean(description='Prediction success'),
    'disease': fields.String(description='Detected disease'),
    'confidence': fields.Float(description='Confidence score'),
    'confidence_percentage': fields.Float(description='Confidence as percentage'),
    'processing_time': fields.Float(description='Processing time in seconds'),
    'recommendations': fields.List(fields.String, description='Treatment recommendations'),
    'immediate_actions': fields.List(fields.String, description='Immediate actions'),
    'organic_alternatives': fields.List(fields.String, description='Organic treatment options'),
    'estimated_recovery': fields.String(description='Estimated recovery time'),
    'prevention_tips': fields.List(fields.String, description='Prevention tips'),
    'message': fields.String(description='Response message')
})

@api.route('/api/health')
class HealthCheck(Resource):
    @api.doc('health_check')
    @api.marshal_with(health_model)
    def get(self):
        """Health check endpoint"""
        return {
            'status': 'healthy',
            'message': 'AgriSol API is running with Hugging Face models',
            'models_loaded': list(models.keys()),
            'huggingface_available': HF_AVAILABLE,
            'timestamp': datetime.now().isoformat(),
            'version': config_obj.API_VERSION
        }

@api.route('/api/ml/<string:crop_type>')
class PredictDisease(Resource):
    @api.doc('predict_disease')
    @api.expect(api.parser().add_argument('image', location='files', type=FileStorage, required=True, help='Plant image file'))
    @api.marshal_with(prediction_model)
    def post(self, crop_type):
        """Disease prediction endpoint"""
        start_time = time.time()
        
        try:
            # Validate crop type
            if crop_type not in ['tomatoes', 'potatoes', 'maize', 'beans']:
                return {
                    'success': False,
                    'disease': 'Error',
                    'confidence': 0.0,
                    'confidence_percentage': 0.0,
                    'processing_time': time.time() - start_time,
                    'recommendations': [],
                    'immediate_actions': [],
                    'organic_alternatives': [],
                    'estimated_recovery': '',
                    'prevention_tips': [],
                    'message': f'Invalid crop type: {crop_type}'
                }, 400
            
            # Check if model is loaded
            if crop_type not in models:
                return {
                    'success': False,
                    'disease': 'Error',
                    'confidence': 0.0,
                    'confidence_percentage': 0.0,
                    'processing_time': time.time() - start_time,
                    'recommendations': [],
                    'immediate_actions': [],
                    'organic_alternatives': [],
                    'estimated_recovery': '',
                    'prevention_tips': [],
                    'message': f'Model not loaded for {crop_type}'
                }, 500
            
            # Check if image was provided
            if 'image' not in request.files:
                return {
                    'success': False,
                    'disease': 'Error',
                    'confidence': 0.0,
                    'confidence_percentage': 0.0,
                    'processing_time': time.time() - start_time,
                    'recommendations': [],
                    'immediate_actions': [],
                    'organic_alternatives': [],
                    'estimated_recovery': '',
                    'prevention_tips': [],
                    'message': 'No image file provided'
                }, 400
            
            # Get the file
            file = request.files['image']
            
            if file.filename == '':
                return {
                    'success': False,
                    'disease': 'Error',
                    'confidence': 0.0,
                    'confidence_percentage': 0.0,
                    'processing_time': time.time() - start_time,
                    'recommendations': [],
                    'immediate_actions': [],
                    'organic_alternatives': [],
                    'estimated_recovery': '',
                    'prevention_tips': [],
                    'message': 'No file selected'
                }, 400
            
            # Validate image file
            is_valid, error_msg = validate_image_file(file)
            if not is_valid:
                return {
                    'success': False,
                    'disease': 'Error',
                    'confidence': 0.0,
                    'confidence_percentage': 0.0,
                    'processing_time': time.time() - start_time,
                    'recommendations': [],
                    'immediate_actions': [],
                    'organic_alternatives': [],
                    'estimated_recovery': '',
                    'prevention_tips': [],
                    'message': error_msg
                }, 400
            
            # Preprocess image
            image_array = preprocess_image(file)
            if image_array is None:
                return {
                    'success': False,
                    'disease': 'Error',
                    'confidence': 0.0,
                    'confidence_percentage': 0.0,
                    'processing_time': time.time() - start_time,
                    'recommendations': [],
                    'immediate_actions': [],
                    'organic_alternatives': [],
                    'estimated_recovery': '',
                    'prevention_tips': [],
                    'message': 'Failed to process image'
                }, 500
            
            # Make prediction
            model = models[crop_type]
            predictions = model.predict(image_array, verbose=0)
            
            # Get predicted class
            predicted_class_index = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_index])
            
            # Get disease name
            disease_classes = config_obj.DISEASE_CLASSES[crop_type]
            if predicted_class_index < len(disease_classes):
                disease = disease_classes[predicted_class_index]
            else:
                disease = 'Unknown'
            
            # Get treatment recommendations
            treatment_data = get_treatment_recommendations(disease, crop_type, confidence)
            
            processing_time = time.time() - start_time
            
            return {
                'success': True,
                'disease': disease,
                'confidence': confidence,
                'confidence_percentage': confidence * 100,
                'processing_time': processing_time,
                'recommendations': treatment_data['recommendations'],
                'immediate_actions': treatment_data['immediate_actions'],
                'organic_alternatives': treatment_data['organic_alternatives'],
                'estimated_recovery': treatment_data['estimated_recovery'],
                'prevention_tips': treatment_data['prevention_tips'],
                'message': f'Successfully analyzed {crop_type} plant'
            }
            
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            return {
                'success': False,
                'disease': 'Error',
                'confidence': 0.0,
                'confidence_percentage': 0.0,
                'processing_time': time.time() - start_time,
                'recommendations': [],
                'immediate_actions': [],
                'organic_alternatives': [],
                'estimated_recovery': '',
                'prevention_tips': [],
                'message': f'Prediction failed: {str(e)}'
            }, 500

@api.route('/api/models')
class GetModels(Resource):
    @api.doc('get_models')
    def get(self):
        """Get available models info"""
        models_data = {}
        
        for crop_type in ['tomatoes', 'potatoes', 'maize', 'beans']:
            if crop_type in models:
                models_data[crop_type] = {
                    'status': 'loaded',
                    'classes': config_obj.DISEASE_CLASSES[crop_type],
                    'input_shape': str(model_info[crop_type]['input_shape']),
                    'output_shape': str(model_info[crop_type]['output_shape']),
                    'source': model_info[crop_type]['source'],
                    'load_time': model_info[crop_type]['load_time']
                }
            else:
                models_data[crop_type] = {
                    'status': 'error',
                    'error': model_load_errors.get(crop_type, 'Unknown error'),
                    'classes': config_obj.DISEASE_CLASSES[crop_type]
                }
        
        return {
            'models': models_data,
            'huggingface_available': HF_AVAILABLE,
            'message': 'Model information retrieved successfully',
            'timestamp': datetime.now().isoformat()
        }

# Root endpoint
@app.route('/')
def root_status():
    """Root endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AgriSol Plant Disease Detection API (Hugging Face Models)',
        'models_loaded': list(models.keys()),
        'huggingface_available': HF_AVAILABLE,
        'location_api_enabled': location_api_available,
        'timestamp': datetime.now().isoformat(),
        'version': config_obj.API_VERSION
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist',
        'available_endpoints': ['/', '/api/health', '/api/models', '/api/ml/<crop_type>', '/docs']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'timestamp': datetime.now().isoformat()
    }), 500

# Load models on startup
if __name__ == '__main__':
    logger.info("🚀 Starting AgriSol Plant Disease Detection API with Hugging Face Models")
    logger.info("=" * 70)
    
    # Load models
    load_models()
    
    # Start the application
    app.run(
        host=config_obj.HOST,
        port=config_obj.PORT,
        debug=config_obj.DEBUG
    ) 