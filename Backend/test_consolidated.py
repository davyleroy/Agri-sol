#!/usr/bin/env python3
"""
Simple test script for the consolidated backend
Tests basic functionality without external dependencies
"""

import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing imports...")
    
    try:
        from config import get_config, validate_config
        print("✅ Config module imported successfully")
        
        config_obj = get_config()
        print(f"✅ Configuration loaded: {config_obj.__class__.__name__}")
        
        errors = validate_config(config_obj)
        if errors:
            print(f"⚠️ Configuration warnings: {len(errors)}")
            for error in errors:
                print(f"   - {error}")
        else:
            print("✅ Configuration validation passed")
        
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_app_creation():
    """Test if the Flask app can be created"""
    print("\n🔍 Testing Flask app creation...")
    
    try:
        from app import app, models, model_info
        print("✅ Flask app imported successfully")
        
        print(f"✅ App name: {app.name}")
        print(f"✅ Models loaded: {len(models)}")
        print(f"✅ Model info: {len(model_info)}")
        
        if models:
            print("📋 Available models:")
            for crop_type in models.keys():
                print(f"   - {crop_type}")
        else:
            print("⚠️ No models loaded (expected if model files don't exist)")
        
        return True
    except Exception as e:
        print(f"❌ App creation error: {e}")
        return False

def test_model_paths():
    """Test if model paths are configured correctly"""
    print("\n🔍 Testing model paths...")
    
    try:
        from config import get_config
        config_obj = get_config()
        
        print(f"📁 Notebook directory: {config_obj.NOTEBOOK_DIR}")
        print(f"   Exists: {config_obj.NOTEBOOK_DIR.exists()}")
        
        if config_obj.NOTEBOOK_DIR.exists():
            model_files = list(config_obj.NOTEBOOK_DIR.glob("*.h5")) + list(config_obj.NOTEBOOK_DIR.glob("*.keras"))
            print(f"📄 Model files found: {len(model_files)}")
            for model_file in model_files[:5]:  # Show first 5
                print(f"   - {model_file.name}")
            if len(model_files) > 5:
                print(f"   ... and {len(model_files) - 5} more")
        
        print("\n📋 Configured model paths:")
        for crop_type, path in config_obj.MODEL_PATHS.items():
            exists = path.exists() if path else False
            print(f"   {crop_type}: {path.name if path else 'None'} ({'✅' if exists else '❌'})")
        
        return True
    except Exception as e:
        print(f"❌ Model path error: {e}")
        return False

def test_utilities():
    """Test utility functions"""
    print("\n🔍 Testing utility functions...")
    
    try:
        from utils.testing_utils import AgriSolAPITester
        print("✅ Testing utilities imported successfully")
        
        tester = AgriSolAPITester("http://localhost:5000")
        print("✅ API tester created successfully")
        
        # Test image creation
        test_image = tester.create_test_image()
        if test_image:
            print("✅ Test image creation works")
        else:
            print("❌ Test image creation failed")
        
        return True
    except Exception as e:
        print(f"❌ Utilities error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Consolidated AgriSol Backend")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_imports),
        ("App Creation Test", test_app_creation),
        ("Model Paths Test", test_model_paths),
        ("Utilities Test", test_utilities)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} FAILED with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Backend consolidation successful!")
        print("\n💡 Next steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Start the server: python run.py")
        print("3. Test the API: http://localhost:5000/")
        print("4. View documentation: http://localhost:5000/docs")
        print("5. Use test interface: http://localhost:5000/test")
    else:
        print("⚠️ Some tests failed. Check the errors above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 