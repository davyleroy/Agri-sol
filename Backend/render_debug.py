#!/usr/bin/env python3
"""
Render Deployment Debug Script for AgriSol Backend
This script helps identify and fix 500 errors on Render deployment
"""

import os
import sys
import traceback
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_environment():
    """Check environment variables and system info"""
    print("🔍 Environment Check")
    print("=" * 50)
    
    # Check environment variables
    env_vars = ['PORT', 'FLASK_ENV', 'PYTHONPATH', 'PWD']
    for var in env_vars:
        value = os.environ.get(var, 'Not set')
        print(f"{var}: {value}")
    
    # Check current directory
    print(f"Current directory: {os.getcwd()}")
    print(f"Python version: {sys.version}")
    print()

def check_dependencies():
    """Check if all required packages are installed"""
    print("📦 Dependencies Check")
    print("=" * 50)
    
    required_packages = [
        'flask', 'tensorflow', 'numpy', 'PIL', 'cv2', 
        'flask_cors', 'flask_restx', 'werkzeug'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError as e:
            print(f"❌ {package}: {e}")
            missing.append(package)
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt")
    else:
        print("\n✅ All required packages are installed")
    print()

def check_model_files():
    """Check if model files exist"""
    print("🤖 Model Files Check")
    print("=" * 50)
    
    # Check directories
    notebook_dir = Path("../Notebook")
    models_dir = Path("models")
    
    print(f"Notebook directory exists: {notebook_dir.exists()}")
    print(f"Models directory exists: {models_dir.exists()}")
    
    if notebook_dir.exists():
        print(f"Notebook directory contents:")
        for file in notebook_dir.glob("*"):
            print(f"  - {file.name}")
    
    if models_dir.exists():
        print(f"Models directory contents:")
        for file in models_dir.glob("*"):
            print(f"  - {file.name}")
    
    # Check specific model files
    model_paths = {
        'tomatoes': notebook_dir / 'tomato_disease_best_model_fixed.h5',
        'potatoes': models_dir / 'optimized_potatoes_model.h5',
        'maize': notebook_dir / 'tomato_disease_best_model_fixed.h5',
        'beans': models_dir / 'optimized_beans_model.h5'
    }
    
    print("\nModel file check:")
    for crop, path in model_paths.items():
        exists = path.exists()
        size = path.stat().st_size if exists else 0
        print(f"  {crop}: {'✅' if exists else '❌'} {path} ({size} bytes)")
    
    print()

def check_config():
    """Check configuration loading"""
    print("⚙️ Configuration Check")
    print("=" * 50)
    
    try:
        from config import get_config, validate_config
        config = get_config()
        errors = validate_config(config)
        
        print(f"✅ Configuration loaded successfully")
        print(f"Debug mode: {config.DEBUG}")
        print(f"Host: {config.HOST}")
        print(f"Port: {config.PORT}")
        print(f"Location API enabled: {config.LOCATION_API_ENABLED}")
        
        if errors:
            print(f"\n⚠️ Configuration warnings:")
            for error in errors:
                print(f"  - {error}")
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        print(f"Traceback: {traceback.format_exc()}")
    
    print()

def test_model_loading():
    """Test model loading without starting the full app"""
    print("🧪 Model Loading Test")
    print("=" * 50)
    
    try:
        from app import load_models, models, model_info, model_load_errors
        
        print("Attempting to load models...")
        loaded_models = load_models()
        
        print(f"✅ Successfully loaded {len(loaded_models)} models:")
        for crop, model in loaded_models.items():
            print(f"  - {crop}: {model_info.get(crop, {}).get('path', 'Unknown path')}")
        
        if model_load_errors:
            print(f"\n❌ Model loading errors:")
            for crop, error in model_load_errors.items():
                print(f"  - {crop}: {error}")
        
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        print(f"Traceback: {traceback.format_exc()}")
    
    print()

def test_app_creation():
    """Test Flask app creation"""
    print("🌐 App Creation Test")
    print("=" * 50)
    
    try:
        from app import app, config_obj
        
        print(f"✅ Flask app created successfully")
        print(f"App name: {app.name}")
        print(f"Config class: {config_obj.__class__.__name__}")
        
        # Test basic route
        with app.test_client() as client:
            response = client.get('/')
            print(f"Root endpoint status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.get_json()
                print(f"Response: {data}")
            else:
                print(f"Response: {response.data}")
        
    except Exception as e:
        print(f"❌ App creation failed: {e}")
        print(f"Traceback: {traceback.format_exc()}")
    
    print()

def check_render_specific():
    """Check Render-specific issues"""
    print("🚀 Render Deployment Check")
    print("=" * 50)
    
    # Check if we're on Render
    is_render = os.environ.get('RENDER', False)
    print(f"Running on Render: {is_render}")
    
    # Check PORT environment variable
    port = os.environ.get('PORT')
    print(f"PORT environment variable: {port}")
    
    # Check file permissions
    current_dir = Path('.')
    print(f"Current directory writable: {os.access(current_dir, os.W_OK)}")
    
    # Check if we can create files
    try:
        test_file = current_dir / 'test_write.txt'
        test_file.write_text('test')
        test_file.unlink()
        print("✅ File system is writable")
    except Exception as e:
        print(f"❌ File system not writable: {e}")
    
    print()

def main():
    """Run all diagnostic checks"""
    print("🔧 AgriSol Render Deployment Diagnostics")
    print("=" * 60)
    print()
    
    check_environment()
    check_dependencies()
    check_model_files()
    check_config()
    test_model_loading()
    test_app_creation()
    check_render_specific()
    
    print("🎯 Diagnostic Summary")
    print("=" * 50)
    print("If you see any ❌ errors above, those are likely the cause of your 500 error.")
    print("Common issues on Render:")
    print("1. Missing model files - Upload them to Render")
    print("2. Missing dependencies - Check requirements.txt")
    print("3. File permissions - Ensure app can write to disk")
    print("4. Memory limits - Models might be too large")
    print("5. Timeout issues - Model loading takes too long")
    print()
    print("💡 Next steps:")
    print("1. Check Render logs for specific error messages")
    print("2. Ensure all model files are in the correct directories")
    print("3. Verify requirements.txt includes all dependencies")
    print("4. Consider using smaller/optimized models for deployment")

if __name__ == "__main__":
    main() 