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

# Model paths (relative to notebook directory)
MODEL_PATHS = {
    'tomatoes': '../Notebook/tomato_disease_best_model_fixed.h5',
    'potatoes': '../Notebook/potato_disease_model_best.keras',
    'maize': '../Notebook/corn_gentle_v3.h5',
    'beans': '../Notebook/bean_disease_model_best.keras'
}

# Alternative model paths if primary ones don't exist
ALTERNATIVE_PATHS = {
    'tomatoes': ['../Notebook/tomato_disease_best_model.h5', '../Notebook/tomato_transfer_best.h5'],
    'potatoes': ['../Notebook/potato_disease_model_best.keras', '../Notebook/nuclear_potato_model.keras'],
    'maize': ['../Notebook/corn_antibias_v2.h5', '../Notebook/corn_disease_balanced_model.h5'],
    'beans': ['../Notebook/bean_disease_model_best.keras']
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
    ],
    'beans': [
        'Healthy', 'Bacterial Spot', 'Angular Leaf Spot', 'Healthy'
    ]
}

# Global model storage
models = {}

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

def load_models():
    """Load all ML models at startup"""
    global models
    
    for crop_type, model_path in MODEL_PATHS.items():
        try:
            # Try primary path first
            if os.path.exists(model_path):
                logger.info(f"Loading {crop_type} model from {model_path}")
                models[crop_type] = tf.keras.models.load_model(model_path)
                logger.info(f"Successfully loaded {crop_type} model")
                continue
            
            # Try alternative paths
            alternative_paths = ALTERNATIVE_PATHS.get(crop_type, [])
            model_loaded = False
            for alt_path in alternative_paths:
                if os.path.exists(alt_path):
                    try:
                        logger.info(f"Loading {crop_type} model from alternative path {alt_path}")
                        models[crop_type] = tf.keras.models.load_model(alt_path)
                        logger.info(f"Successfully loaded {crop_type} model from {alt_path}")
                        model_loaded = True
                        break
                    except Exception as e:
                        logger.warning(f"Failed to load {crop_type} model from {alt_path}: {str(e)}")
                        continue
            
            if not model_loaded:
                logger.warning(f"No working model file found for {crop_type}")
                
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
            if crop_type not in ['tomatoes', 'potatoes', 'maize']:
                api.abort(400, f'Unsupported crop type: {crop_type}. Supported types: tomatoes, potatoes, maize')
            
            # Check if model is loaded
            if crop_type not in models:
                api.abort(500, f'Model not available for {crop_type}')
            
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
            
            # Get prediction results
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])
            predicted_disease = DISEASE_CLASSES[crop_type][predicted_class_idx]
            
            # Determine severity and urgency
            severity = 'High' if confidence > 0.8 else 'Medium' if confidence > 0.6 else 'Low'
            urgency = 'High' if 'blight' in predicted_disease.lower() else 'Medium'
            
            # Prepare response
            result = {
                'success': True,
                'predicted_class': predicted_disease,
                'confidence': confidence,
                'confidence_percentage': round(confidence * 100, 1),
                'severity': severity,
                'recommendations': [
                    f'Treat {predicted_disease} immediately',
                    'Monitor plant regularly',
                    'Improve air circulation'
                ],
                'treatment_urgency': urgency,
                'estimated_recovery': '2-3 weeks',
                'crop_type': crop_type,
                'all_predictions': {
                    DISEASE_CLASSES[crop_type][i]: float(predictions[0][i])
                    for i in range(len(DISEASE_CLASSES[crop_type]))
                }
            }
            
            logger.info(f"Prediction completed for {crop_type}: {predicted_disease} ({confidence:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            api.abort(500, 'Internal server error during prediction')

@api.route('/api/models')
class GetModels(Resource):
    @api.doc('get_models')
    def get(self):
        """Get information about available models"""
        model_info = {}
        
        for crop_type in ['tomatoes', 'potatoes', 'maize']:
            model_info[crop_type] = {
                'loaded': crop_type in models,
                'classes': DISEASE_CLASSES[crop_type],
                'endpoint': f'/api/ml/{crop_type}'
            }
        
        return {
            'models': model_info,
            'total_models': len(models)
        }

# Web interface for testing
TEST_INTERFACE_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>AgriSol Plant Disease Detection - Test Interface</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .result { background: #e8f5e8; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .error { background: #ffeaea; padding: 15px; border-radius: 5px; margin-top: 20px; }
        input, select, button { padding: 10px; margin: 10px 0; }
        button { background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #45a049; }
        .model-status { padding: 10px; margin: 5px 0; border-radius: 5px; }
        .loaded { background: #d4edda; color: #155724; }
        .not-loaded { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>🌱 AgriSol Plant Disease Detection - Test Interface</h1>
    
    <div class="container">
        <h2>📊 Model Status</h2>
        <div id="modelStatus">Loading...</div>
    </div>
    
    <div class="container">
        <h2>📷 Test Disease Detection</h2>
        <form id="uploadForm" enctype="multipart/form-data">
            <label for="cropType">Select Crop Type:</label><br>
            <select id="cropType" name="crop_type" required>
                <option value="tomatoes">🍅 Tomatoes</option>
                <option value="potatoes">🥔 Potatoes</option>
                <option value="maize">🌽 Maize/Corn</option>
            </select><br>
            
            <label for="imageFile">Upload Plant Image:</label><br>
            <input type="file" id="imageFile" name="image" accept="image/*" required><br>
            
            <button type="submit">🔍 Analyze Image</button>
        </form>
        
        <div id="result"></div>
    </div>

    <script>
        // Load model status
        fetch('/api/models')
            .then(response => response.json())
            .then(data => {
                let statusHtml = '';
                for (const [crop, info] of Object.entries(data.models)) {
                    const statusClass = info.loaded ? 'loaded' : 'not-loaded';
                    const statusText = info.loaded ? '✅ Loaded' : '❌ Not Loaded';
                    statusHtml += `<div class="model-status ${statusClass}"><strong>${crop.charAt(0).toUpperCase() + crop.slice(1)}:</strong> ${statusText} (${info.classes.length} classes)</div>`;
                }
                document.getElementById('modelStatus').innerHTML = statusHtml;
            })
            .catch(error => {
                document.getElementById('modelStatus').innerHTML = '<div class="error">Error loading model status</div>';
            });

        // Handle form submission
        document.getElementById('uploadForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            const imageFile = document.getElementById('imageFile').files[0];
            const cropType = document.getElementById('cropType').value;
            
            if (!imageFile) {
                document.getElementById('result').innerHTML = '<div class="error">Please select an image file</div>';
                return;
            }
            
            formData.append('image', imageFile);
            
            document.getElementById('result').innerHTML = '<div>🔄 Analyzing image...</div>';
            
            try {
                const response = await fetch(`/api/ml/${cropType}`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('result').innerHTML = `
                        <div class="result">
                            <h3>🎯 Analysis Results</h3>
                            <p><strong>Predicted Disease:</strong> ${result.predicted_class}</p>
                            <p><strong>Confidence:</strong> ${result.confidence_percentage}%</p>
                            <p><strong>Severity:</strong> ${result.severity}</p>
                            <p><strong>Treatment Urgency:</strong> ${result.treatment_urgency}</p>
                            <p><strong>Estimated Recovery:</strong> ${result.estimated_recovery}</p>
                            <p><strong>Recommendations:</strong></p>
                            <ul>${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
                        </div>
                    `;
                } else {
                    document.getElementById('result').innerHTML = `<div class="error">Error: ${result.error}</div>`;
                }
            } catch (error) {
                document.getElementById('result').innerHTML = `<div class="error">Error: ${error.message}</div>`;
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
    logger.info("Starting AgriSol Plant Disease Detection API with Documentation...")
    
    # Load all models
    load_models()
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5000, debug=True) 