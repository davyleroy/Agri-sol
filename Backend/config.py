import os
from datetime import timedelta
from pathlib import Path

class Config:
    """Base configuration class with sensible defaults"""
    # Core Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'agrisol-secret-key-2024'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Model configuration
    MODEL_INPUT_SIZE = (256, 256, 3)
    SUPPORTED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    
    # Model paths configuration
    NOTEBOOK_DIR = Path("../Notebook")
    MODEL_PATHS = {
        'tomatoes': NOTEBOOK_DIR / 'tomato_disease_best_model_fixed.h5',
        'potatoes': NOTEBOOK_DIR / 'potato_disease_model_best.keras',
        'maize': NOTEBOOK_DIR / 'tomato_disease_best_model_fixed.h5',  # Use working model temporarily
        'beans': NOTEBOOK_DIR / 'bean_disease_model_best.keras'
    }
    
    # Alternative model paths for fallback
    ALTERNATIVE_MODEL_PATHS = {
        'tomatoes': [
            NOTEBOOK_DIR / 'tomato_disease_best_model.h5',
            NOTEBOOK_DIR / 'tomato_transfer_best.h5'
        ],
        'potatoes': [
            NOTEBOOK_DIR / 'nuclear_potato_model.keras',
            NOTEBOOK_DIR / 'agrisol_potato_model.keras',
            NOTEBOOK_DIR / 'sweet_spot_potato_model.keras'
        ],
        'maize': [
            NOTEBOOK_DIR / 'corn_gentle_v3.h5',  # Original corn model
            NOTEBOOK_DIR / 'corn_antibias_v2.h5',  # Alternative corn model
            NOTEBOOK_DIR / 'tomato_disease_best_model.h5',  # Working fallback
            NOTEBOOK_DIR / 'corn_disease_balanced_model.h5',
            NOTEBOOK_DIR / 'best_plant_disease_model.h5'  # General model fallback
        ],
        'beans': [
            NOTEBOOK_DIR / 'bean_disease_model_best.h5',
            NOTEBOOK_DIR / 'tomato_disease_best_model_fixed.h5'  # Cross-crop fallback
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
            'Common Rust', 'Healthy', 'Northern Corn Leaf Blight'  # Temporary: using fallback model
        ],
        'beans': [
            'Angular Leaf Spot', 'Bean Rust', 'Healthy'
        ]
    }
    
    # API configuration
    API_VERSION = 'v2.0'
    API_TITLE = 'AgriSol Plant Disease Detection API'
    API_DESCRIPTION = 'Machine Learning API for detecting plant diseases in tomatoes, potatoes, maize, and beans'
    
    # CORS configuration
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8081']
    
    # Logging configuration
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Optional Supabase configuration (graceful fallback)
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
    LOCATION_API_ENABLED = bool(SUPABASE_URL and SUPABASE_SERVICE_KEY)
    
    # Upload configuration
    UPLOAD_FOLDER = 'uploads'
    MAX_UPLOAD_SIZE = 16 * 1024 * 1024  # 16MB
    
    # Model loading configuration
    MODEL_LOAD_TIMEOUT = 30  # seconds
    MODEL_LOAD_RETRIES = 3
    
    # Testing configuration
    TESTING_ENABLED = True
    TESTING_ENDPOINTS_ENABLED = True

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    HOST = '0.0.0.0'
    PORT = 5000
    
    # Enhanced CORS for development
    CORS_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8081',
        'http://127.0.0.1:8081',
        'http://10.0.2.2:5000',  # Android emulator
        'http://192.168.1.1:5000'  # Common local network
    ]
    
    # Development-specific settings
    LOG_LEVEL = 'DEBUG'
    MODEL_LOAD_TIMEOUT = 60  # Longer timeout for development

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    HOST = '0.0.0.0'
    PORT = int(os.environ.get('PORT', 5000))
    
    # Production CORS (more restrictive)
    CORS_ORIGINS = [
        'https://yourdomain.com',
        'https://api.yourdomain.com',
        'https://agrisol.app'
    ]
    
    # Production-specific settings
    LOG_LEVEL = 'WARNING'
    TESTING_ENDPOINTS_ENABLED = False  # Disable testing endpoints in production
    
    # Security enhancements
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(32).hex()

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    WTF_CSRF_ENABLED = False
    
    # Testing-specific settings
    LOCATION_API_ENABLED = False  # Disable location API for testing
    MODEL_LOAD_TIMEOUT = 10  # Shorter timeout for tests

class StagingConfig(Config):
    """Staging configuration"""
    DEBUG = False
    TESTING = False
    HOST = '0.0.0.0'
    PORT = int(os.environ.get('PORT', 5000))
    
    # Staging-specific settings
    LOG_LEVEL = 'INFO'
    TESTING_ENDPOINTS_ENABLED = True  # Keep testing endpoints in staging

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'staging': StagingConfig,
    'default': DevelopmentConfig
}

def get_config(env_name=None):
    """Get configuration based on environment"""
    if env_name is None:
        env_name = os.environ.get('FLASK_ENV', 'development')
    
    return config.get(env_name, config['default'])

def validate_config(config_obj):
    """Validate configuration settings"""
    errors = []
    
    # Check required directories
    if not config_obj.NOTEBOOK_DIR.exists():
        errors.append(f"Notebook directory not found: {config_obj.NOTEBOOK_DIR}")
    
    # Check upload directory
    upload_path = Path(config_obj.UPLOAD_FOLDER)
    if not upload_path.exists():
        try:
            upload_path.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            errors.append(f"Cannot create upload directory: {e}")
    
    # Validate Supabase configuration if enabled
    if config_obj.LOCATION_API_ENABLED:
        if not config_obj.SUPABASE_URL or not config_obj.SUPABASE_SERVICE_KEY:
            errors.append("Supabase configuration incomplete")
    
    return errors 