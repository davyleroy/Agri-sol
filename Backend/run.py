#!/usr/bin/env python3
"""
Production startup script for AgriSol Plant Disease Detection API v2.0
Enhanced with better configuration management and error handling
"""

import os
import sys
import signal
import time
from pathlib import Path
from dotenv import load_dotenv

# Add the current directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app, load_models, logger, config_obj
    from config import get_config, validate_config
except ImportError as e:
    print(f"❌ Failed to import required modules: {e}")
    print("Make sure you're running this script from the Backend directory")
    sys.exit(1)

def load_environment():
    """Load environment variables from .env file if it exists"""
    env_file = Path('.env')
    if env_file.exists():
        load_dotenv(env_file)
        logger.info(f"✅ Loaded environment variables from {env_file}")
    else:
        logger.info("⚠️ No .env file found, using system environment variables")

def display_startup_banner():
    """Display startup banner with system information"""
    print("\n" + "=" * 70)
    print("🍅🥔🌽🫘 AgriSol Plant Disease Detection API v2.0")
    print("=" * 70)
    print(f"🌍 Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print(f"🐛 Debug Mode: {config_obj.DEBUG}")
    print(f"🌐 Host: {config_obj.HOST}")
    print(f"🔌 Port: {config_obj.PORT}")
    print(f"📍 Location API: {'Enabled' if config_obj.LOCATION_API_ENABLED else 'Disabled'}")
    print(f"🧪 Testing Endpoints: {'Enabled' if config_obj.TESTING_ENDPOINTS_ENABLED else 'Disabled'}")
    print("=" * 70)

def check_dependencies():
    """Check if all required dependencies are available"""
    required_packages = [
        ('flask', 'flask'), 
        ('tensorflow', 'tensorflow'), 
        ('numpy', 'numpy'), 
        ('pillow', 'PIL'), 
        ('opencv-python', 'cv2')
    ]
    
    missing_packages = []
    for package_name, import_name in required_packages:
        try:
            __import__(import_name)
        except ImportError:
            missing_packages.append(package_name)
    
    if missing_packages:
        logger.error(f"❌ Missing required packages: {', '.join(missing_packages)}")
        logger.error("Install them with: pip install -r requirements.txt")
        return False
    
    logger.info("✅ All required dependencies are available")
    return True

def validate_environment():
    """Validate the environment and configuration"""
    errors = validate_config(config_obj)
    
    if errors:
        logger.warning("⚠️ Configuration warnings:")
        for error in errors:
            logger.warning(f"  - {error}")
    
    # Check if models directory exists
    if not config_obj.NOTEBOOK_DIR.exists():
        logger.error(f"❌ Models directory not found: {config_obj.NOTEBOOK_DIR}")
        logger.error("Please ensure the Notebook directory exists with model files")
        return False
    
    # Check upload directory
    try:
        os.makedirs(config_obj.UPLOAD_FOLDER, exist_ok=True)
        logger.info(f"✅ Upload directory ready: {config_obj.UPLOAD_FOLDER}")
    except Exception as e:
        logger.error(f"❌ Cannot create upload directory: {e}")
        return False
    
    return True

def setup_signal_handlers():
    """Setup signal handlers for graceful shutdown"""
    def signal_handler(signum, frame):
        logger.info(f"\n🛑 Received signal {signum}, shutting down gracefully...")
        logger.info("👋 AgriSol API stopped")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

def display_api_info():
    """Display API endpoint information"""
    base_url = f"http://{config_obj.HOST}:{config_obj.PORT}"
    
    print("\n🔗 API Endpoints:")
    print(f"  📊 Health Check:     {base_url}/")
    print(f"  📚 Documentation:    {base_url}/docs")
    print(f"  🧪 Test Interface:   {base_url}/test")
    print(f"  🤖 Models Info:      {base_url}/api/models")
    print(f"  🍅 Tomatoes:         {base_url}/api/ml/tomatoes")
    print(f"  🥔 Potatoes:         {base_url}/api/ml/potatoes")
    print(f"  🌽 Maize:            {base_url}/api/ml/maize")
    print(f"  🫘 Beans:            {base_url}/api/ml/beans")
    
    if config_obj.TESTING_ENDPOINTS_ENABLED:
        print(f"  🧪 Test Models:      {base_url}/api/test/models")
        print(f"  ⚙️ Test Config:       {base_url}/api/test/config")
    
    if config_obj.LOCATION_API_ENABLED:
        print(f"  📍 Location API:     {base_url}/api/location/*")
    
    print("\n💡 Quick Start:")
    print(f"  curl {base_url}/")
    print(f"  curl {base_url}/api/models")
    print()

def main():
    """Main entry point for the application"""
    try:
        # Load environment variables
        load_environment()
        
        # Display startup banner
        display_startup_banner()
        
        # Check dependencies
        if not check_dependencies():
            sys.exit(1)
        
        # Validate environment
        if not validate_environment():
            sys.exit(1)
        
        # Setup signal handlers
        setup_signal_handlers()
        
        # Load models
        logger.info("🚀 Loading machine learning models...")
        start_time = time.time()
        models = load_models()
        load_time = time.time() - start_time
        
        if not models:
            logger.error("❌ No models loaded successfully!")
            logger.error("The API will start but predictions will not work")
        else:
            logger.info(f"✅ Loaded {len(models)} models in {load_time:.2f} seconds")
            logger.info(f"📋 Available models: {', '.join(models.keys())}")
        
        # Display API information
        display_api_info()
        
        # Get configuration
        config_obj = get_config()
        
        # For production deployment (like Render), use PORT from environment
        port = int(os.environ.get('PORT', config_obj.PORT))
        host = os.environ.get('HOST', config_obj.HOST)
        debug = os.environ.get('FLASK_ENV', 'development') == 'development'
        
        print(f"🚀 Starting AgriSol Backend on {host}:{port}")
        print(f"🔧 Environment: {os.environ.get('FLASK_ENV', 'development')}")
        print(f"🐛 Debug mode: {debug}")
        
        # Start the application
        logger.info("🌐 Starting Flask application...")
        logger.info("Press Ctrl+C to stop the server")
        
        app.run(
            host=host,
            port=port,
            debug=debug,
            threaded=True
        )
        
    except KeyboardInterrupt:
        logger.info("\n🛑 Interrupted by user")
        logger.info("👋 AgriSol API stopped")
    except Exception as e:
        logger.error(f"❌ Application failed to start: {e}")
        logger.error(f"Traceback: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 