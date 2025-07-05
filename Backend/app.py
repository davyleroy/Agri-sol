#!/usr/bin/env python3
"""
AgriSol Plant Disease Detection API - Consolidated Backend
Combines all functionality from multiple app files into a single, robust system.

Features:
- Enhanced model loading with multiple fallbacks
- Comprehensive treatment recommendations
- Optional location API integration
- Built-in testing endpoints
- Robust error handling
- Production-ready configuration
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
    description=config_obj.API_DESCRIPTION,
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
    'Bean Rust': {
        'immediate_actions': [
            'Remove infected leaves immediately',
            'Increase air circulation between plants',
            'Apply fungicide spray'
        ],
        'treatment_options': [
            'Apply sulfur-based fungicide',
            'Use copper-based products',
            'Systemic fungicide for severe cases'
        ],
        'prevention': [
            'Plant resistant varieties',
            'Avoid overhead watering',
            'Ensure proper plant spacing',
            'Remove plant debris'
        ],
        'urgency': 'Medium',
        'recovery_time': '2-3 weeks',
        'organic_alternatives': [
            'Sulfur dust application',
            'Neem oil spray',
            'Baking soda solution'
        ]
    },
    'Angular Leaf Spot': {
        'immediate_actions': [
            'Remove infected plant debris',
            'Improve air circulation',
            'Apply copper-based treatment'
        ],
        'treatment_options': [
            'Apply copper-based bactericide',
            'Use streptomycin spray',
            'Implement sanitation protocols'
        ],
        'prevention': [
            'Use disease-free seeds',
            'Avoid overhead irrigation',
            'Rotate crops regularly',
            'Choose resistant varieties'
        ],
        'urgency': 'Medium',
        'recovery_time': '2-3 weeks',
        'organic_alternatives': [
            'Copper soap spray',
            'Neem oil treatment',
            'Compost tea application'
        ]
    },
    'Healthy': {
        'immediate_actions': [
            'Continue current care routine',
            'Monitor regularly for early signs',
            'Maintain optimal growing conditions'
        ],
        'treatment_options': [
            'No treatment needed',
            'Continue preventive care',
            'Maintain plant health'
        ],
        'prevention': [
            'Regular monitoring',
            'Proper watering and nutrition',
            'Good air circulation',
            'Preventive spraying if needed'
        ],
        'urgency': 'None',
        'recovery_time': 'Plant is healthy',
        'organic_alternatives': [
            'Compost tea for plant health',
            'Beneficial microorganism application',
            'Organic mulching'
        ]
    }
}

# API Models for documentation
prediction_model = api.model('Prediction', {
    'success': fields.Boolean(description='Whether the prediction was successful'),
    'predicted_class': fields.String(description='The predicted disease class'),
    'confidence': fields.Float(description='Confidence score (0-1)'),
    'confidence_percentage': fields.Float(description='Confidence percentage (0-100)'),
    'severity': fields.String(enum=['Low', 'Medium', 'High'], description='Disease severity'),
    'recommendations': fields.List(fields.String, description='Treatment recommendations'),
    'treatment_urgency': fields.String(enum=['None', 'Low', 'Medium', 'High'], description='Treatment urgency'),
    'estimated_recovery': fields.String(description='Estimated recovery time'),
    'crop_type': fields.String(description='Type of crop analyzed'),
    'all_predictions': fields.Raw(description='All class predictions with confidence scores'),
    'processing_time': fields.Float(description='Processing time in seconds'),
    'model_info': fields.Raw(description='Information about the model used')
})

health_model = api.model('Health', {
    'status': fields.String(description='API health status'),
    'message': fields.String(description='Status message'),
    'models_loaded': fields.List(fields.String, description='List of loaded models'),
    'location_api_enabled': fields.Boolean(description='Whether location API is enabled'),
    'testing_endpoints_enabled': fields.Boolean(description='Whether testing endpoints are enabled'),
    'timestamp': fields.String(description='Current timestamp'),
    'version': fields.String(description='API version')
})

def load_model_safely(model_path: Path, crop_type: str) -> Optional[tf.keras.Model]:
    """
    Safely load a model with enhanced error handling and custom object support
    """
    try:
        model_path_str = str(model_path)
        logger.info(f"Attempting to load {crop_type} model from: {model_path_str}")
        
        # For .keras files that might have custom loss functions
        if model_path_str.endswith('.keras'):
            try:
                # Try loading with compile=False to avoid custom function issues
                model = tf.keras.models.load_model(model_path_str, compile=False)
                logger.info(f"✅ Loaded {crop_type} model without compilation: {model_path_str}")
                return model
            except Exception as e:
                logger.warning(f"Failed to load {crop_type} model without compilation: {str(e)}")
                try:
                    # Try with custom objects
                    custom_objects = {
                        'loss_fn': lambda y_true, y_pred: tf.keras.losses.categorical_crossentropy(y_true, y_pred),
                        'accuracy': tf.keras.metrics.categorical_accuracy
                    }
                    model = tf.keras.models.load_model(model_path_str, custom_objects=custom_objects)
                    logger.info(f"✅ Loaded {crop_type} model with custom objects: {model_path_str}")
                    return model
                except Exception as e2:
                    logger.error(f"Failed to load {crop_type} model with custom objects: {str(e2)}")
                    return None
        else:
            # For .h5 files
            try:
                model = tf.keras.models.load_model(model_path_str)
                logger.info(f"✅ Loaded {crop_type} model: {model_path_str}")
                return model
            except Exception as e:
                logger.error(f"Failed to load {crop_type} model: {str(e)}")
                return None
                
    except Exception as e:
        logger.error(f"Critical error loading {crop_type} model from {model_path_str}: {str(e)}")
        return None

def load_models():
    """
    Load all ML models at startup with enhanced error handling and fallback strategies
    """
    global models, model_info, model_load_errors
    
    logger.info("🚀 Starting model loading process...")
    
    for crop_type in ['tomatoes', 'potatoes', 'maize', 'beans']:
        logger.info(f"📋 Loading {crop_type} model...")
        model_loaded = False
        
        # Try primary path first
        primary_path = config_obj.MODEL_PATHS.get(crop_type)
        if primary_path and primary_path.exists():
            model = load_model_safely(primary_path, crop_type)
            if model is not None:
                models[crop_type] = model
                model_info[crop_type] = {
                    'path': str(primary_path),
                    'input_shape': model.input_shape,
                    'output_shape': model.output_shape,
                    'classes': len(config_obj.DISEASE_CLASSES[crop_type]),
                    'load_time': datetime.now().isoformat(),
                    'source': 'primary'
                }
                logger.info(f"✅ Successfully loaded {crop_type} model from primary path")
                model_loaded = True
        
        # Try alternative paths if primary failed
        if not model_loaded:
            alternative_paths = config_obj.ALTERNATIVE_MODEL_PATHS.get(crop_type, [])
            for alt_path in alternative_paths:
                if alt_path.exists():
                    model = load_model_safely(alt_path, crop_type)
                    if model is not None:
                        models[crop_type] = model
                        model_info[crop_type] = {
                            'path': str(alt_path),
                            'input_shape': model.input_shape,
                            'output_shape': model.output_shape,
                            'classes': len(config_obj.DISEASE_CLASSES[crop_type]),
                            'load_time': datetime.now().isoformat(),
                            'source': 'alternative'
                        }
                        logger.info(f"✅ Successfully loaded {crop_type} model from alternative: {alt_path}")
                        model_loaded = True
                        break
        
        if not model_loaded:
            error_msg = f"No working model found for {crop_type}"
            logger.warning(f"⚠️ {error_msg}")
            model_load_errors[crop_type] = error_msg
    
    logger.info(f"🎯 Model loading complete. Loaded: {list(models.keys())}")
    return models

def preprocess_image(image_file, target_size=(256, 256)) -> Optional[np.ndarray]:
    """
    Preprocess uploaded image for model prediction with enhanced error handling
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
    Get comprehensive treatment recommendations based on disease, crop type, and confidence
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
        "Avoid overhead watering to reduce moisture on leaves"
    ]
    
    # Get specific recommendations
    immediate_actions = treatment_data.get('immediate_actions', [])
    treatment_options = treatment_data.get('treatment_options', [])
    prevention = treatment_data.get('prevention', [])
    organic_alternatives = treatment_data.get('organic_alternatives', [])
    
    # Combine recommendations based on severity
    all_recommendations = []
    
    if severity == 'High':
        all_recommendations.extend(immediate_actions)
        all_recommendations.extend(treatment_options)
    elif severity == 'Medium':
        all_recommendations.extend(immediate_actions[:2])  # First 2 immediate actions
        all_recommendations.extend(treatment_options)
    else:
        all_recommendations.extend(prevention)
    
    # Add organic alternatives if available
    if organic_alternatives:
        all_recommendations.append("Organic alternatives available:")
        all_recommendations.extend(organic_alternatives[:2])  # First 2 organic options
    
    # Add base recommendations
    all_recommendations.extend(base_recommendations)
    
    return {
        'recommendations': all_recommendations,
        'immediate_actions': immediate_actions,
        'treatment_options': treatment_options,
        'prevention': prevention,
        'organic_alternatives': organic_alternatives,
        'urgency': treatment_data.get('urgency', 'Medium'),
        'recovery_time': treatment_data.get('recovery_time', '2-3 weeks'),
        'severity': severity
    }

def validate_image_file(file) -> Tuple[bool, str]:
    """
    Validate uploaded image file
    """
    if not file:
        return False, "No file provided"
    
    if file.filename == '':
        return False, "No file selected"
    
    # Check file extension
    filename = file.filename.lower()
    valid_extensions = config_obj.SUPPORTED_IMAGE_EXTENSIONS
    
    if not any(filename.endswith(ext) for ext in valid_extensions):
        return False, f"Invalid file type. Supported formats: {', '.join(valid_extensions)}"
    
    # Check file size
    file.seek(0, 2)  # Seek to end
    size = file.tell()
    file.seek(0)  # Reset position
    
    if size > config_obj.MAX_UPLOAD_SIZE:
        return False, f"File too large. Maximum size: {config_obj.MAX_UPLOAD_SIZE // (1024*1024)}MB"
    
    return True, "Valid file"

# API Endpoints

@api.route('/api/health')
class HealthCheck(Resource):
    @api.doc('health_check')
    @api.marshal_with(health_model)
    def get(self):
        """Health check endpoint - returns comprehensive API status"""
        return {
            'status': 'healthy',
            'message': 'AgriSol Plant Disease Detection API is running',
            'models_loaded': list(models.keys()),
            'location_api_enabled': location_api_available,
            'testing_endpoints_enabled': config_obj.TESTING_ENDPOINTS_ENABLED,
            'timestamp': datetime.now().isoformat(),
            'version': config_obj.API_VERSION
        }

@api.route('/api/ml/<string:crop_type>')
class PredictDisease(Resource):
    @api.doc('predict_disease')
    @api.expect(api.parser().add_argument('image', location='files', type=FileStorage, required=True, help='Plant image file'))
    @api.marshal_with(prediction_model)
    def post(self, crop_type):
        """Predict plant disease from uploaded image with comprehensive analysis"""
        start_time = time.time()
        
        try:
            # Validate crop type
            if crop_type not in ['tomatoes', 'potatoes', 'maize', 'beans']:
                api.abort(400, f'Unsupported crop type: {crop_type}. Supported types: tomatoes, potatoes, maize, beans')
            
            # Check if model is loaded
            if crop_type not in models:
                available_models = list(models.keys())
                error_msg = f'Model not available for {crop_type}. Available models: {available_models}'
                if crop_type in model_load_errors:
                    error_msg += f'. Load error: {model_load_errors[crop_type]}'
                api.abort(500, error_msg)
            
            # Validate request
            if 'image' not in request.files:
                api.abort(400, 'No image file provided')
            
            image_file = request.files['image']
            
            # Validate image file
            is_valid, error_msg = validate_image_file(image_file)
            if not is_valid:
                api.abort(400, error_msg)
            
            # Preprocess image
            processed_image = preprocess_image(image_file)
            
            if processed_image is None:
                api.abort(400, 'Failed to process image. Please ensure the image is valid and try again.')
            
            # Make prediction
            model = models[crop_type]
            predictions = model.predict(processed_image, verbose=0)
            
            # Handle different prediction shapes
            if len(predictions.shape) > 2:
                predictions = predictions[0]  # Take first batch
            if len(predictions.shape) > 1:
                predictions = predictions[0]  # Take first sample
            
            # Get prediction results
            predicted_class_idx = np.argmax(predictions)
            confidence = float(predictions[predicted_class_idx])
            
            # Get class name safely
            available_classes = config_obj.DISEASE_CLASSES[crop_type]
            if predicted_class_idx < len(available_classes):
                predicted_disease = available_classes[predicted_class_idx]
            else:
                predicted_disease = f"Class_{predicted_class_idx}"
            
            # Get comprehensive treatment recommendations
            treatment_info = get_treatment_recommendations(predicted_disease, crop_type, confidence)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Prepare response
            result = {
                'success': True,
                'predicted_class': predicted_disease,
                'confidence': confidence,
                'confidence_percentage': round(confidence * 100, 1),
                'severity': treatment_info['severity'],
                'recommendations': treatment_info['recommendations'],
                'treatment_urgency': treatment_info['urgency'],
                'estimated_recovery': treatment_info['recovery_time'],
                'crop_type': crop_type,
                'processing_time': round(processing_time, 3),
                'model_info': model_info.get(crop_type, {}),
                'all_predictions': {
                    available_classes[i] if i < len(available_classes) else f"Class_{i}": float(predictions[i])
                    for i in range(len(predictions))
                }
            }
            
            logger.info(f"Prediction completed for {crop_type}: {predicted_disease} ({confidence:.3f}) in {processing_time:.3f}s")
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Error in prediction for {crop_type}: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            api.abort(500, f'Internal server error during prediction: {str(e)}')

@api.route('/api/models')
class GetModels(Resource):
    @api.doc('get_models')
    def get(self):
        """Get comprehensive information about available models"""
        model_status = {}
        
        for crop_type in ['tomatoes', 'potatoes', 'maize', 'beans']:
            model_status[crop_type] = {
                'loaded': crop_type in models,
                'classes': config_obj.DISEASE_CLASSES[crop_type],
                'endpoint': f'/api/ml/{crop_type}',
                'model_info': model_info.get(crop_type, {}),
                'load_error': model_load_errors.get(crop_type)
            }
        
        return {
            'models': model_status,
            'total_models': len(models),
            'api_version': config_obj.API_VERSION,
            'location_api_enabled': location_api_available,
            'testing_endpoints_enabled': config_obj.TESTING_ENDPOINTS_ENABLED
        }

# Testing Endpoints (if enabled)
if config_obj.TESTING_ENDPOINTS_ENABLED:
    @api.route('/api/test/models')
    class TestModels(Resource):
        @api.doc('test_models')
        def get(self):
            """Test all loaded models with dummy data"""
            results = {}
            
            for crop_type, model in models.items():
                try:
                    # Create dummy image data
                    dummy_image = np.random.random((1, 256, 256, 3)).astype(np.float32)
                    
                    # Make prediction
                    start_time = time.time()
                    predictions = model.predict(dummy_image, verbose=0)
                    processing_time = time.time() - start_time
                    
                    results[crop_type] = {
                        'status': 'success',
                        'prediction_shape': predictions.shape,
                        'processing_time': round(processing_time, 3),
                        'max_confidence': float(np.max(predictions)),
                        'predicted_class_idx': int(np.argmax(predictions))
                    }
                    
                except Exception as e:
                    results[crop_type] = {
                        'status': 'error',
                        'error': str(e)
                    }
            
            return {
                'test_results': results,
                'timestamp': datetime.now().isoformat()
            }
    
    @api.route('/api/test/config')
    class TestConfig(Resource):
        @api.doc('test_config')
        def get(self):
            """Get current configuration for testing"""
            return {
                'environment': os.environ.get('FLASK_ENV', 'development'),
                'debug': config_obj.DEBUG,
                'location_api_enabled': location_api_available,
                'models_loaded': list(models.keys()),
                'upload_folder': config_obj.UPLOAD_FOLDER,
                'max_upload_size': config_obj.MAX_UPLOAD_SIZE,
                'supported_extensions': list(config_obj.SUPPORTED_IMAGE_EXTENSIONS),
                'cors_origins': config_obj.CORS_ORIGINS
            }

# Location API integration (if available)
if location_api_available:
    try:
        location_api = LocationAPI(api)
        logger.info("✅ Location API endpoints registered")
    except Exception as e:
        logger.error(f"❌ Failed to register location API endpoints: {e}")

# Web interface for testing
TEST_INTERFACE_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>AgriSol Plant Disease Detection - Test Interface</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
        .container { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #2c3e50; margin-bottom: 30px; }
        .result { background: #d4edda; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #28a745; }
        .error { background: #f8d7da; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #dc3545; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #ffc107; }
        input, select, button { padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; width: 100%; box-sizing: border-box; }
        button { background: #28a745; color: white; border: none; cursor: pointer; font-weight: bold; }
        button:hover { background: #218838; }
        button:disabled { background: #6c757d; cursor: not-allowed; }
        .model-status { padding: 10px; margin: 5px 0; border-radius: 5px; }
        .loaded { background: #d4edda; color: #155724; }
        .not-loaded { background: #f8d7da; color: #721c24; }
        .confidence-bar { background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .confidence-fill { background: #28a745; height: 100%; transition: width 0.3s ease; }
        .recommendations { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 15px; }
        .recommendations ul { margin: 10px 0; padding-left: 20px; }
        .preview { max-width: 300px; max-height: 300px; margin: 10px 0; border-radius: 5px; border: 1px solid #ddd; }
        .stats { display: flex; justify-content: space-between; margin: 10px 0; }
        .stat { text-align: center; }
        .api-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌱 AgriSol Plant Disease Detection API v2.0</h1>
        <p>Enhanced AI-powered plant disease detection with comprehensive treatment recommendations</p>
    </div>
    
    <div class="container">
        <h2>📊 System Status</h2>
        <div id="systemStatus">Loading system status...</div>
        
        <div class="api-info">
            <h3>🔗 API Information</h3>
            <p><strong>Health Check:</strong> <a href="/" target="_blank">GET /</a></p>
            <p><strong>Models Info:</strong> <a href="/api/models" target="_blank">GET /api/models</a></p>
            <p><strong>API Documentation:</strong> <a href="/docs" target="_blank">Swagger UI</a></p>
            <p><strong>Test Models:</strong> <a href="/api/test/models" target="_blank">GET /api/test/models</a></p>
        </div>
    </div>
    
    <div class="container">
        <h2>📷 Disease Detection Test</h2>
        <form id="uploadForm" enctype="multipart/form-data">
            <label for="cropType"><strong>Select Crop Type:</strong></label>
            <select id="cropType" name="crop_type" required>
                <option value="tomatoes">🍅 Tomatoes (10 diseases)</option>
                <option value="potatoes">🥔 Potatoes (3 diseases)</option>
                <option value="maize">🌽 Maize/Corn (4 diseases)</option>
                <option value="beans">🫘 Beans (3 diseases)</option>
            </select>
            
            <label for="imageFile"><strong>Upload Plant Image:</strong></label>
            <input type="file" id="imageFile" name="image" accept="image/*" required>
            
            <img id="imagePreview" class="preview" style="display: none;">
            
            <button type="submit" id="submitBtn">🔍 Analyze Plant Disease</button>
        </form>
        
        <div id="results"></div>
    </div>

    <script>
        // Load system status
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                document.getElementById('systemStatus').innerHTML = `
                    <div class="result">
                        <h3>✅ System Healthy</h3>
                        <div class="stats">
                            <div class="stat">
                                <strong>${data.models_loaded.length}</strong><br>
                                Models Loaded
                            </div>
                            <div class="stat">
                                <strong>${data.location_api_enabled ? 'Yes' : 'No'}</strong><br>
                                Location API
                            </div>
                            <div class="stat">
                                <strong>${data.testing_endpoints_enabled ? 'Yes' : 'No'}</strong><br>
                                Testing Endpoints
                            </div>
                            <div class="stat">
                                <strong>${data.version}</strong><br>
                                API Version
                            </div>
                        </div>
                        <p><strong>Loaded Models:</strong> ${data.models_loaded.join(', ')}</p>
                    </div>
                `;
            })
            .catch(error => {
                document.getElementById('systemStatus').innerHTML = `
                    <div class="error">
                        <h3>❌ System Error</h3>
                        <p>Unable to connect to API: ${error.message}</p>
                    </div>
                `;
            });

        // Image preview
        document.getElementById('imageFile').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('imagePreview');
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        // Form submission
        document.getElementById('uploadForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            const imageFile = document.getElementById('imageFile').files[0];
            const cropType = document.getElementById('cropType').value;
            
            if (!imageFile) {
                alert('Please select an image file');
                return;
            }
            
            formData.append('image', imageFile);
            
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = '🔄 Analyzing...';
            
            const startTime = Date.now();
            
            fetch(`/api/ml/${cropType}`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const endTime = Date.now();
                const totalTime = (endTime - startTime) / 1000;
                
                if (data.success) {
                    const confidenceColor = data.confidence > 0.8 ? '#28a745' : data.confidence > 0.6 ? '#ffc107' : '#dc3545';
                    
                    document.getElementById('results').innerHTML = `
                        <div class="result">
                            <h3>🎯 Analysis Results</h3>
                            <div class="stats">
                                <div class="stat">
                                    <strong>${data.predicted_class}</strong><br>
                                    Predicted Disease
                                </div>
                                <div class="stat">
                                    <strong>${data.confidence_percentage}%</strong><br>
                                    Confidence
                                </div>
                                <div class="stat">
                                    <strong>${data.severity}</strong><br>
                                    Severity
                                </div>
                                <div class="stat">
                                    <strong>${data.treatment_urgency}</strong><br>
                                    Urgency
                                </div>
                            </div>
                            
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${data.confidence_percentage}%; background: ${confidenceColor};"></div>
                            </div>
                            
                            <p><strong>Processing Time:</strong> ${totalTime.toFixed(2)}s (API: ${data.processing_time}s)</p>
                            <p><strong>Estimated Recovery:</strong> ${data.estimated_recovery}</p>
                            
                            <div class="recommendations">
                                <h4>💡 Treatment Recommendations</h4>
                                <ul>
                                    ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `;
                } else {
                    document.getElementById('results').innerHTML = `
                        <div class="error">
                            <h3>❌ Analysis Failed</h3>
                            <p>${data.error || 'Unknown error occurred'}</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                document.getElementById('results').innerHTML = `
                    <div class="error">
                        <h3>❌ Request Failed</h3>
                        <p>Error: ${error.message}</p>
                    </div>
                `;
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = '🔍 Analyze Plant Disease';
            });
        });
    </script>
</body>
</html>
"""

@app.route('/test')
def test_interface():
    """Web interface for testing the API"""
    return render_template_string(TEST_INTERFACE_HTML)

@app.route('/')
def root_status():
    """Root endpoint - returns system status for the test interface"""
    return jsonify({
        'status': 'healthy',
        'message': 'AgriSol Plant Disease Detection API is running',
        'models_loaded': list(models.keys()),
        'location_api_enabled': location_api_available,
        'testing_endpoints_enabled': config_obj.TESTING_ENDPOINTS_ENABLED,
        'timestamp': datetime.now().isoformat(),
        'version': config_obj.API_VERSION
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist',
        'available_endpoints': [
            '/',
            '/api/health',
            '/api/models',
            '/api/ml/<crop_type>',
            '/docs',
            '/test'
        ]
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
    logger.info("🚀 Starting AgriSol Plant Disease Detection API v2.0")
    logger.info("=" * 60)
    
    # Load models
    load_models()
    
    # Start the application
    app.run(
        host=config_obj.HOST,
        port=config_obj.PORT,
        debug=config_obj.DEBUG
    )