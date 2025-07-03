from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from flask_restx import Api, Resource, fields, reqparse
import tensorflow as tf
import numpy as np
import cv2
import os
from PIL import Image
import io
import base64
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# API Documentation Setup
api = Api(
    app,
    version='1.0',
    title='AgriSol Plant Disease Detection API',
    description='Machine Learning API for detecting plant diseases in tomatoes, potatoes, and maize',
    doc='/docs/'  # This creates the /docs endpoint
)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Updated model paths based on our diagnostics
MODEL_PATHS = {
    'tomatoes': '../Notebook/tomato_disease_best_model_fixed.h5',
    'potatoes': '../Notebook/potato_disease_model_best.keras',  # This one works
    'maize': '../Notebook/corn_gentle_v3.h5',  # Use general model as fallback
    'beans': '../Notebook/bean_disease_model_best.h5'  # Use general model for beans
}

# Alternative model paths if primary ones don't exist
ALTERNATIVE_PATHS = {
    'tomatoes': [
        '../Notebook/tomato_disease_best_model.h5', 
        '../Notebook/tomato_transfer_best.h5'
    ],
    'potatoes': [
        '../Notebook/nuclear_potato_model.keras',
        '../Notebook/potato_model_best.h5',
        '../Notebook/best_potato_react_model.h5'
    ],
    'maize': [
        '../Notebook/tomato_disease_best_model_fixed.h5',  # Use tomato model as fallback
        '../Notebook/best_plant_disease_model.h5'
    ],
    'beans': [
        '../Notebook/tomato_disease_best_model_fixed.h5',  # Use tomato model as fallback
        '../Notebook/agrisol_potato_model.keras'
    ]
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
        'Disease Detected', 'Healthy', 'Needs Attention'  # Generic classes for fallback
    ],
    'beans': [
        'Angular Leaf Spot', 'Bean Rust', 'Healthy'
    ]
}

# Global model storage
models = {}
model_info = {}

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
    'all_predictions': fields.Raw(description='All class predictions with confidence scores')
})

health_model = api.model('Health', {
    'status': fields.String(description='API health status'),
    'message': fields.String(description='Status message'),
    'models_loaded': fields.List(fields.String, description='List of loaded models'),
    'timestamp': fields.String(description='Current timestamp')
})

def load_model_safely(model_path, crop_type):
    """Safely load a model with custom object handling"""
    try:
        # For .keras files that might have custom loss functions
        if model_path.endswith('.keras'):
            try:
                # Try loading with compile=False to avoid custom function issues
                model = tf.keras.models.load_model(model_path, compile=False)
                logger.info(f"Loaded {crop_type} model without compilation: {model_path}")
                return model
            except Exception as e:
                logger.warning(f"Failed to load {crop_type} model without compilation: {str(e)}")
                # Try with custom objects
                custom_objects = {'loss_fn': lambda y_true, y_pred: tf.keras.losses.categorical_crossentropy(y_true, y_pred)}
                model = tf.keras.models.load_model(model_path, custom_objects=custom_objects)
                logger.info(f"Loaded {crop_type} model with custom objects: {model_path}")
                return model
        else:
            # For .h5 files
            model = tf.keras.models.load_model(model_path)
            logger.info(f"Loaded {crop_type} model: {model_path}")
            return model
            
    except Exception as e:
        logger.error(f"Failed to load {crop_type} model from {model_path}: {str(e)}")
        return None

def load_models():
    """Load all ML models at startup with improved error handling"""
    global models, model_info
    
    for crop_type, model_path in MODEL_PATHS.items():
        logger.info(f"Attempting to load {crop_type} model...")
        model_loaded = False
        
        # Try primary path first
        if os.path.exists(model_path):
            model = load_model_safely(model_path, crop_type)
            if model is not None:
                models[crop_type] = model
                model_info[crop_type] = {
                    'path': model_path,
                    'input_shape': model.input_shape,
                    'output_shape': model.output_shape,
                    'classes': len(DISEASE_CLASSES[crop_type])
                }
                logger.info(f"✅ Successfully loaded {crop_type} model")
                model_loaded = True
        
        # Try alternative paths if primary failed
        if not model_loaded:
            alternative_paths = ALTERNATIVE_PATHS.get(crop_type, [])
            for alt_path in alternative_paths:
                if os.path.exists(alt_path):
                    model = load_model_safely(alt_path, crop_type)
                    if model is not None:
                        models[crop_type] = model
                        model_info[crop_type] = {
                            'path': alt_path,
                            'input_shape': model.input_shape,
                            'output_shape': model.output_shape,
                            'classes': len(DISEASE_CLASSES[crop_type])
                        }
                        logger.info(f"✅ Successfully loaded {crop_type} model from alternative: {alt_path}")
                        model_loaded = True
                        break
        
        if not model_loaded:
            logger.warning(f"⚠️ No working model found for {crop_type}")

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

def get_treatment_recommendations(disease, crop_type):
    """Get treatment recommendations based on disease and crop"""
    base_recommendations = [
        f"Monitor {crop_type} plant regularly for disease progression",
        "Ensure proper air circulation around plants",
        "Avoid overhead watering to reduce moisture on leaves"
    ]
    
    disease_lower = disease.lower()
    
    if disease_lower == 'healthy':
        return [
            "Plant appears healthy - continue current care routine",
            "Monitor regularly for early signs of disease",
            "Maintain proper watering and nutrition"
        ]
    elif 'blight' in disease_lower:
        return [
            f"Remove affected {crop_type} leaves immediately",
            "Apply copper-based fungicide as directed",
            "Improve air circulation and reduce humidity",
            "Consider organic neem oil treatment"
        ] + base_recommendations
    elif 'angular leaf spot' in disease_lower:
        return [
            "Remove infected plant debris",
            "Apply copper-based fungicide",
            "Improve air circulation between plants",
            "Avoid overhead watering",
            "Plant disease-resistant varieties"
        ] + base_recommendations
    elif 'bean rust' in disease_lower or 'rust' in disease_lower:
        return [
            "Apply sulfur-based fungicide",
            "Remove infected leaves immediately",
            "Increase spacing between plants",
            "Avoid working with wet plants",
            "Consider resistant bean varieties"
        ] + base_recommendations
    elif 'bacterial spot' in disease_lower or 'bacterial' in disease_lower:
        return [
            "Remove infected plants to prevent spread",
            "Apply copper-based bactericide",
            "Disinfect tools between plants",
            "Avoid working with wet plants",
            "Improve air circulation around plants"
        ] + base_recommendations
    elif 'mosaic virus' in disease_lower or 'virus' in disease_lower:
        return [
            "Remove infected plants immediately",
            "Control insect vectors (aphids, whiteflies)",
            "Use virus-free seeds",
            "Disinfect tools regularly",
            "Plant resistant varieties"
        ] + base_recommendations
    else:
        return [
            f"Treat {disease} in {crop_type} according to local guidelines",
            "Consult with agricultural extension service",
            "Consider integrated pest management approach"
        ] + base_recommendations

@api.route('/')
class HealthCheck(Resource):
    @api.doc('health_check')
    @api.marshal_with(health_model)
    def get(self):
        """Health check endpoint - returns API status and loaded models"""
        return {
            'status': 'healthy',
            'message': 'Plant Disease Detection API is running',
            'models_loaded': list(models.keys()),
            'timestamp': datetime.now().isoformat()
        }

@api.route('/api/ml/<string:crop_type>')
class PredictDisease(Resource):
    @api.doc('predict_disease')
    @api.expect(api.parser().add_argument('image', location='files', type=FileStorage, required=True, help='Plant image file'))
    @api.marshal_with(prediction_model)
    def post(self, crop_type):
        """Predict plant disease from uploaded image"""
        try:
            # Validate crop type
            if crop_type not in ['tomatoes', 'potatoes', 'maize', 'beans']:
                api.abort(400, f'Unsupported crop type: {crop_type}. Supported types: tomatoes, potatoes, maize, beans')
            
            # Check if model is loaded
            if crop_type not in models:
                api.abort(500, f'Model not available for {crop_type}. Available models: {list(models.keys())}')
            
            # Validate request
            if 'image' not in request.files:
                api.abort(400, 'No image file provided')
            
            image_file = request.files['image']
            
            if image_file.filename == '':
                api.abort(400, 'No image file selected')
            
            # Preprocess image
            processed_image = preprocess_image(image_file)
            
            if processed_image is None:
                api.abort(400, 'Failed to process image')
            
            # Make prediction
            model = models[crop_type]
            predictions = model.predict(processed_image)
            
            # Handle different prediction shapes
            if len(predictions.shape) > 2:
                predictions = predictions[0]  # Take first batch
            if len(predictions.shape) > 1:
                predictions = predictions[0]  # Take first sample
            
            # Get prediction results
            predicted_class_idx = np.argmax(predictions)
            confidence = float(predictions[predicted_class_idx])
            
            # Get class name safely
            available_classes = DISEASE_CLASSES[crop_type]
            if predicted_class_idx < len(available_classes):
                predicted_disease = available_classes[predicted_class_idx]
            else:
                predicted_disease = f"Class_{predicted_class_idx}"
            
            # Determine severity and urgency
            severity = 'High' if confidence > 0.8 else 'Medium' if confidence > 0.6 else 'Low'
            urgency = 'High' if 'blight' in predicted_disease.lower() else 'Medium' if predicted_disease.lower() != 'healthy' else 'None'
            
            # Get treatment recommendations
            recommendations = get_treatment_recommendations(predicted_disease, crop_type)
            
            # Prepare response
            result = {
                'success': True,
                'predicted_class': predicted_disease,
                'confidence': confidence,
                'confidence_percentage': round(confidence * 100, 1),
                'severity': severity,
                'recommendations': recommendations,
                'treatment_urgency': urgency,
                'estimated_recovery': '2-3 weeks' if urgency != 'None' else 'Plant is healthy',
                'crop_type': crop_type,
                'all_predictions': {
                    available_classes[i] if i < len(available_classes) else f"Class_{i}": float(predictions[i])
                    for i in range(len(predictions))
                }
            }
            
            logger.info(f"Prediction completed for {crop_type}: {predicted_disease} ({confidence:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            api.abort(500, f'Internal server error during prediction: {str(e)}')

@api.route('/api/models')
class GetModels(Resource):
    @api.doc('get_models')
    def get(self):
        """Get information about available models"""
        model_status = {}
        
        for crop_type in ['tomatoes', 'potatoes', 'maize', 'beans']:
            model_status[crop_type] = {
                'loaded': crop_type in models,
                'classes': DISEASE_CLASSES[crop_type],
                'endpoint': f'/api/ml/{crop_type}',
                'model_info': model_info.get(crop_type, {})
            }
        
        return {
            'models': model_status,
            'total_models': len(models),
            'api_version': '1.1.0'
        }

# Web interface for testing
TEST_INTERFACE_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>AgriSol Plant Disease Detection - Test Interface</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
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
        .preview { max-width: 200px; max-height: 200px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌱 AgriSol Plant Disease Detection</h1>
        <p>Upload plant images to detect diseases using AI</p>
    </div>
    
    <div class="container">
        <h2>📊 Model Status</h2>
        <div id="modelStatus">Loading...</div>
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
            
            <button type="submit" id="analyzeBtn">🔍 Analyze Image</button>
        </form>
        
        <div id="result"></div>
    </div>

    <script>
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

        // Load model status
        fetch('/api/models')
            .then(response => response.json())
            .then(data => {
                let statusHtml = '';
                for (const [crop, info] of Object.entries(data.models)) {
                    const statusClass = info.loaded ? 'loaded' : 'not-loaded';
                    const statusText = info.loaded ? '✅ Ready' : '❌ Not Available';
                    const cropEmoji = {'tomatoes': '🍅', 'potatoes': '🥔', 'maize': '🌽', 'beans': '🫘'}[crop] || '🌿';
                    statusHtml += `<div class="model-status ${statusClass}">
                        <strong>${cropEmoji} ${crop.charAt(0).toUpperCase() + crop.slice(1)}:</strong> ${statusText} 
                        (${info.classes.length} classes)
                    </div>`;
                }
                statusHtml += `<p><small>Total models loaded: ${data.total_models}/4 | API Version: ${data.api_version}</small></p>`;
                document.getElementById('modelStatus').innerHTML = statusHtml;
            })
            .catch(error => {
                document.getElementById('modelStatus').innerHTML = '<div class="error">❌ Error loading model status</div>';
            });

        // Handle form submission
        document.getElementById('uploadForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            const imageFile = document.getElementById('imageFile').files[0];
            const cropType = document.getElementById('cropType').value;
            const analyzeBtn = document.getElementById('analyzeBtn');
            
            if (!imageFile) {
                document.getElementById('result').innerHTML = '<div class="error">❌ Please select an image file</div>';
                return;
            }
            
            formData.append('image', imageFile);
            
            // Show loading state
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = '🔄 Analyzing...';
            document.getElementById('result').innerHTML = '<div class="warning">🔄 Processing image... Please wait.</div>';
            
            try {
                const response = await fetch(`/api/ml/${cropType}`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const confidencePercent = result.confidence_percentage;
                    const confidenceColor = confidencePercent > 80 ? '#28a745' : confidencePercent > 60 ? '#ffc107' : '#dc3545';
                    
                    document.getElementById('result').innerHTML = `
                        <div class="result">
                            <h3>🎯 Analysis Complete!</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0;">
                                <div>
                                    <p><strong>🔍 Detected:</strong> ${result.predicted_class}</p>
                                    <p><strong>📊 Confidence:</strong> ${confidencePercent}%</p>
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width: ${confidencePercent}%; background: ${confidenceColor};"></div>
                                    </div>
                                </div>
                                <div>
                                    <p><strong>⚠️ Severity:</strong> ${result.severity}</p>
                                    <p><strong>🚨 Urgency:</strong> ${result.treatment_urgency}</p>
                                    <p><strong>⏱️ Recovery:</strong> ${result.estimated_recovery}</p>
                                </div>
                            </div>
                            
                            <div class="recommendations">
                                <h4>💡 Treatment Recommendations:</h4>
                                <ul>
                                    ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <details style="margin-top: 15px;">
                                <summary><strong>📈 Detailed Results</strong></summary>
                                <div style="margin-top: 10px; font-size: 0.9em;">
                                    ${Object.entries(result.all_predictions)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([disease, conf]) => 
                                            `<div>${disease}: ${(conf * 100).toFixed(1)}%</div>`
                                        ).join('')}
                                </div>
                            </details>
                        </div>
                    `;
                } else {
                    document.getElementById('result').innerHTML = `<div class="error">❌ Error: ${result.error || 'Unknown error occurred'}</div>`;
                }
            } catch (error) {
                document.getElementById('result').innerHTML = `<div class="error">❌ Connection Error: ${error.message}</div>`;
            } finally {
                // Reset button
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = '🔍 Analyze Image';
            }
        });
    </script>
</body>
</html>
"""

@app.route('/test')
def test_interface():
    """Web interface for testing the API"""
    return render_template_string(TEST_INTERFACE_HTML)

if __name__ == '__main__':
    logger.info("🚀 Starting AgriSol Plant Disease Detection API...")
    logger.info("📚 Documentation: http://localhost:5000/docs")
    logger.info("🧪 Test Interface: http://localhost:5000/test")
    
    # Load all models
    load_models()
    
    logger.info(f"✅ Models loaded: {list(models.keys())}")
    logger.info("🌐 API Ready!")
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5000, debug=True) 