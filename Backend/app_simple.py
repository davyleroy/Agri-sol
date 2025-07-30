#!/usr/bin/env python3
"""
Simplified AgriSol Backend for Render Deployment Testing
This version works without ML models to test basic functionality
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restx import Api, Resource, fields
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app, origins=['*'])

# API Documentation Setup
api = Api(
    app,
    version='v2.0',
    title='AgriSol Plant Disease Detection API (Simple)',
    description='Simplified API for testing deployment',
    doc='/docs/'
)

# Response models
health_model = api.model('Health', {
    'status': fields.String(description='API status'),
    'message': fields.String(description='Status message'),
    'timestamp': fields.String(description='Current timestamp'),
    'version': fields.String(description='API version')
})

prediction_model = api.model('Prediction', {
    'success': fields.Boolean(description='Prediction success'),
    'disease': fields.String(description='Detected disease'),
    'confidence': fields.Float(description='Confidence score'),
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
            'message': 'AgriSol API is running (simplified version)',
            'timestamp': datetime.now().isoformat(),
            'version': 'v2.0-simple'
        }

@api.route('/api/ml/<string:crop_type>')
class PredictDisease(Resource):
    @api.doc('predict_disease')
    @api.expect(api.parser().add_argument('image', location='files', type='FileStorage', required=True, help='Plant image file'))
    @api.marshal_with(prediction_model)
    def post(self, crop_type):
        """Disease prediction endpoint (simplified)"""
        try:
            # Check if image was provided
            if 'image' not in request.files:
                return {
                    'success': False,
                    'disease': 'Error',
                    'confidence': 0.0,
                    'message': 'No image file provided'
                }, 400
            
            # Get the file
            file = request.files['image']
            
            if file.filename == '':
                return {
                    'success': False,
                    'disease': 'Error',
                    'confidence': 0.0,
                    'message': 'No file selected'
                }, 400
            
            # For testing, return a mock prediction
            mock_diseases = {
                'tomatoes': 'Healthy',
                'potatoes': 'Healthy', 
                'maize': 'Healthy',
                'beans': 'Healthy'
            }
            
            disease = mock_diseases.get(crop_type, 'Unknown')
            
            return {
                'success': True,
                'disease': disease,
                'confidence': 0.85,
                'message': f'Mock prediction for {crop_type} (simplified API)'
            }
            
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            return {
                'success': False,
                'disease': 'Error',
                'confidence': 0.0,
                'message': f'Prediction failed: {str(e)}'
            }, 500

@api.route('/api/models')
class GetModels(Resource):
    @api.doc('get_models')
    def get(self):
        """Get available models info"""
        return {
            'models': {
                'tomatoes': {
                    'status': 'available',
                    'classes': ['Healthy', 'Mock Disease'],
                    'note': 'Simplified version - no ML models loaded'
                },
                'potatoes': {
                    'status': 'available', 
                    'classes': ['Healthy', 'Mock Disease'],
                    'note': 'Simplified version - no ML models loaded'
                },
                'maize': {
                    'status': 'available',
                    'classes': ['Healthy', 'Mock Disease'], 
                    'note': 'Simplified version - no ML models loaded'
                },
                'beans': {
                    'status': 'available',
                    'classes': ['Healthy', 'Mock Disease'],
                    'note': 'Simplified version - no ML models loaded'
                }
            },
            'message': 'Simplified API - using mock predictions',
            'timestamp': datetime.now().isoformat()
        }

@app.route('/')
def root_status():
    """Root endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AgriSol Plant Disease Detection API (Simplified)',
        'models_loaded': ['tomatoes', 'potatoes', 'maize', 'beans'],
        'note': 'This is a simplified version for testing deployment',
        'timestamp': datetime.now().isoformat(),
        'version': 'v2.0-simple'
    })

@app.route('/test')
def test_interface():
    """Simple test interface"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AgriSol API Test (Simplified)</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .success { background-color: #d4edda; color: #155724; }
            .error { background-color: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🍅🥔🌽🫘 AgriSol API Test (Simplified)</h1>
            <p>This is a simplified version for testing deployment on Render.</p>
            
            <h2>API Status</h2>
            <div id="status" class="status">Loading...</div>
            
            <h2>Test Prediction</h2>
            <p>Upload an image to test the API (will return mock results):</p>
            <input type="file" id="imageFile" accept="image/*">
            <button onclick="testPrediction()">Test Prediction</button>
            <div id="result"></div>
        </div>
        
        <script>
            // Check API status
            fetch('/')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('status').innerHTML = 
                        '<div class="success">✅ API is running: ' + data.message + '</div>';
                })
                .catch(error => {
                    document.getElementById('status').innerHTML = 
                        '<div class="error">❌ API error: ' + error.message + '</div>';
                });
            
            function testPrediction() {
                const fileInput = document.getElementById('imageFile');
                const file = fileInput.files[0];
                
                if (!file) {
                    alert('Please select an image file');
                    return;
                }
                
                const formData = new FormData();
                formData.append('image', file);
                
                fetch('/api/ml/tomatoes', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    document.getElementById('result').innerHTML = 
                        '<div class="success">✅ Prediction: ' + data.disease + ' (Confidence: ' + data.confidence + ')</div>';
                })
                .catch(error => {
                    document.getElementById('result').innerHTML = 
                        '<div class="error">❌ Error: ' + error.message + '</div>';
                });
            }
        </script>
    </body>
    </html>
    """

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist',
        'available_endpoints': ['/', '/api/health', '/api/models', '/api/ml/<crop_type>', '/docs', '/test']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'timestamp': datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting AgriSol Simplified API")
    
    # Get port from environment (for Render)
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    logger.info(f"🌐 Starting on {host}:{port}")
    logger.info("📚 Documentation: /docs")
    logger.info("🧪 Test interface: /test")
    
    app.run(host=host, port=port, debug=False) 