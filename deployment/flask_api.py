# Flask API for Render/Railway Deployment
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["*"])  # Allow all origins for development

# Class names for each crop
CLASS_NAMES = {
    'tomato': [
        'Tomato Bacterial Spot', 'Tomato Early Blight', 'Tomato Healthy', 
        'Tomato Late Blight', 'Tomato Leaf Mold', 'Tomato Septoria Leaf Spot',
        'Tomato Spider Mites', 'Tomato Target Spot', 'Tomato Mosaic Virus', 
        'Tomato Yellow Leaf Curl Virus'
    ],
    'potato': [
        'Potato Early Blight', 'Potato Healthy', 'Potato Late Blight'
    ],
    'beans': [
        'Bean Angular Leaf Spot', 'Bean Rust', 'Bean Healthy'
    ]
}

# Global variable to store models
models = {}

def load_models():
    """Load all available models"""
    global models
    models = {}
    
    # Model file mappings
    model_files = {
        'tomato': ['tomato_disease_model.h5', 'tomato_disease_model_best.keras'],
        'potato': ['potato_disease_model_best.keras', 'agrisol_potato_model.h5'],
        'beans': ['bean_disease_model_best.keras', 'enhanced_bean_disease.h5']
    }
    
    base_paths = ['./models', './Notebook', '.']
    
    for crop, possible_files in model_files.items():
        for base_path in base_paths:
            for filename in possible_files:
                filepath = os.path.join(base_path, filename)
                if os.path.exists(filepath):
                    try:
                        models[crop] = tf.keras.models.load_model(filepath)
                        logger.info(f"✅ Loaded {crop} model from {filepath}")
                        break
                    except Exception as e:
                        logger.warning(f"Failed to load {filepath}: {e}")
                        continue
            if crop in models:
                break
        
        if crop not in models:
            logger.warning(f"⚠️ No working model found for {crop}")

def preprocess_image(image_data, crop_type):
    """Preprocess image for model prediction"""
    try:
        # Handle base64 encoded images
        if isinstance(image_data, str) and image_data.startswith('data:image'):
            # Remove data:image/jpeg;base64, prefix
            image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
        elif isinstance(image_data, str):
            # Direct base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
        else:
            # Assume it's a file object
            image = Image.open(image_data)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize((256, 256))
        
        # Convert to numpy array and normalize
        img_array = np.array(image) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = {}
    for crop in ['tomato', 'potato', 'beans']:
        model_status[crop] = crop in models
    
    return jsonify({
        'status': 'healthy',
        'message': 'Agri-Sol Disease Detection API',
        'models_loaded': model_status,
        'total_models': len(models)
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        # Check if request has JSON data
        if request.is_json:
            data = request.get_json()
            image_data = data.get('image')
            crop_type = data.get('crop_type', '').lower()
        else:
            # Handle form data
            crop_type = request.form.get('crop_type', '').lower()
            if 'image' in request.files:
                image_data = request.files['image']
            else:
                image_data = request.form.get('image')
        
        # Validate inputs
        if not image_data:
            return jsonify({'error': 'No image provided', 'success': False}), 400
        
        if not crop_type or crop_type not in ['tomato', 'potato', 'beans']:
            return jsonify({'error': 'Invalid crop type. Must be tomato, potato, or beans', 'success': False}), 400
        
        if crop_type not in models:
            return jsonify({'error': f'Model for {crop_type} not available', 'success': False}), 404
        
        # Preprocess image
        img_array = preprocess_image(image_data, crop_type)
        
        # Get prediction
        model = models[crop_type]
        predictions = model.predict(img_array)
        predicted_class_idx = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))
        
        # Get class name
        class_names = CLASS_NAMES[crop_type]
        if predicted_class_idx < len(class_names):
            disease_name = class_names[predicted_class_idx]
        else:
            disease_name = f"Unknown Class {predicted_class_idx}"
        
        # Determine if plant is healthy
        is_healthy = 'healthy' in disease_name.lower()
        
        response = {
            'success': True,
            'prediction': {
                'disease': disease_name,
                'confidence': confidence,
                'class_index': predicted_class_idx,
                'crop_type': crop_type,
                'is_healthy': is_healthy
            }
        }
        
        logger.info(f"Prediction made for {crop_type}: {disease_name} ({confidence:.2%})")
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/models', methods=['GET'])
def get_models():
    """Get information about available models"""
    model_info = {}
    for crop in ['tomato', 'potato', 'beans']:
        if crop in models:
            model = models[crop]
            model_info[crop] = {
                'available': True,
                'input_shape': model.input_shape,
                'output_shape': model.output_shape,
                'classes': CLASS_NAMES[crop]
            }
        else:
            model_info[crop] = {
                'available': False,
                'classes': CLASS_NAMES[crop]
            }
    
    return jsonify(model_info)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found', 'success': False}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'success': False}), 500

# Load models on startup
with app.app_context():
    logger.info("Loading models...")
    load_models()
    logger.info(f"Models loaded: {list(models.keys())}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
