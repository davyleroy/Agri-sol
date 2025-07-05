#!/usr/bin/env python3
"""
Model diagnostic and fixing script for AgriSol Backend
This script helps identify and resolve model loading issues
"""

import os
import sys
import tensorflow as tf
import numpy as np
from pathlib import Path

def check_model_files():
    """Check which model files exist and their formats"""
    print("🔍 Checking model files in ../Notebook/")
    print("=" * 60)
    
    notebook_dir = Path("../Notebook")
    if not notebook_dir.exists():
        print("❌ Notebook directory not found!")
        return False
    
    # Primary model paths
    primary_models = {
        'tomatoes': 'tomato_disease_best_model_fixed.h5',
        'potatoes': 'sweet_spot_potato_model.keras', 
        'maize': 'corn_gentle_v3.h5'
    }
    
    # Alternative model paths
    alternative_models = {
        'tomatoes': ['tomato_disease_best_model.h5', 'tomato_transfer_best.h5'],
        'potatoes': ['agrisol_potato_model.keras', 'nuclear_potato_model.keras'],
        'maize': ['corn_antibias_v2.h5', 'corn_disease_balanced_model.h5']
    }
    
    working_models = {}
    
    for crop_type, primary_file in primary_models.items():
        print(f"\n📋 {crop_type.title()} Models:")
        
        # Check primary model
        primary_path = notebook_dir / primary_file
        if primary_path.exists():
            try:
                print(f"  ✅ Primary: {primary_file} (exists)")
                # Try to load to verify format
                model = tf.keras.models.load_model(str(primary_path))
                print(f"     📊 Input shape: {model.input_shape}")
                print(f"     📊 Output shape: {model.output_shape}")
                working_models[crop_type] = str(primary_path)
                print(f"     ✅ Loads successfully!")
                del model  # Free memory
                continue
            except Exception as e:
                print(f"     ❌ Load error: {str(e)}")
        else:
            print(f"  ❌ Primary: {primary_file} (not found)")
        
        # Check alternative models
        found_working = False
        for alt_file in alternative_models.get(crop_type, []):
            alt_path = notebook_dir / alt_file
            if alt_path.exists():
                try:
                    print(f"  🔄 Testing: {alt_file}")
                    model = tf.keras.models.load_model(str(alt_path))
                    print(f"     📊 Input shape: {model.input_shape}")
                    print(f"     📊 Output shape: {model.output_shape}")
                    working_models[crop_type] = str(alt_path)
                    print(f"     ✅ Alternative model works!")
                    del model  # Free memory
                    found_working = True
                    break
                except Exception as e:
                    print(f"     ❌ Load error: {str(e)}")
            else:
                print(f"  ❌ Alternative: {alt_file} (not found)")
        
        if not found_working:
            print(f"  ⚠️  No working model found for {crop_type}")
    
    print("\n" + "=" * 60)
    print("📊 Summary:")
    for crop_type, model_path in working_models.items():
        print(f"  ✅ {crop_type}: {Path(model_path).name}")
    
    missing = set(['tomatoes', 'potatoes', 'maize']) - set(working_models.keys())
    for crop_type in missing:
        print(f"  ❌ {crop_type}: No working model")
    
    return working_models

def list_all_model_files():
    """List all potential model files in the notebook directory"""
    print("\n🗂️  All Model Files in ../Notebook/:")
    print("=" * 60)
    
    notebook_dir = Path("../Notebook")
    if not notebook_dir.exists():
        print("❌ Notebook directory not found!")
        return
    
    model_extensions = ['.h5', '.keras', '.pb']
    model_files = []
    
    for ext in model_extensions:
        files = list(notebook_dir.glob(f"*{ext}"))
        model_files.extend(files)
    
    if not model_files:
        print("❌ No model files found!")
        return
    
    for file_path in sorted(model_files):
        file_size = file_path.stat().st_size / (1024 * 1024)  # MB
        print(f"  📄 {file_path.name} ({file_size:.1f} MB)")
        
        # Try to determine crop type from filename
        filename_lower = file_path.name.lower()
        if 'tomato' in filename_lower:
            crop_type = "🍅 Tomato"
        elif 'potato' in filename_lower:
            crop_type = "🥔 Potato"
        elif 'corn' in filename_lower or 'maize' in filename_lower:
            crop_type = "🌽 Corn/Maize"
        else:
            crop_type = "❓ Unknown"
        
        print(f"     Type: {crop_type}")

def test_model_prediction(model_path, crop_type):
    """Test a model with dummy data"""
    try:
        print(f"\n🧪 Testing {crop_type} model prediction...")
        
        # Load model
        model = tf.keras.models.load_model(model_path)
        
        # Create dummy image data (256x256x3)
        dummy_image = np.random.random((1, 256, 256, 3)).astype(np.float32)
        
        # Make prediction
        predictions = model.predict(dummy_image, verbose=0)
        
        print(f"  ✅ Prediction shape: {predictions.shape}")
        print(f"  ✅ Prediction values: {predictions[0][:5]}...")  # First 5 values
        print(f"  ✅ Max confidence: {np.max(predictions[0]):.4f}")
        print(f"  ✅ Predicted class index: {np.argmax(predictions[0])}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Prediction test failed: {str(e)}")
        return False

def main():
    """Main diagnostic function"""
    print("🚀 AgriSol Model Diagnostic Tool")
    print("=" * 60)
    
    # Check TensorFlow
    print(f"📊 TensorFlow version: {tf.__version__}")
    print(f"📊 GPU available: {tf.config.list_physical_devices('GPU')}")
    
    # Check model files
    working_models = check_model_files()
    
    # List all model files
    list_all_model_files()
    
    # Test predictions for working models
    print("\n🧪 Testing Model Predictions:")
    print("=" * 60)
    
    disease_classes = {
        'tomatoes': 10,  # Expected number of classes
        'potatoes': 3,
        'maize': 4
    }
    
    for crop_type, model_path in working_models.items():
        test_model_prediction(model_path, crop_type)
        
        # Verify output shape matches expected classes
        try:
            model = tf.keras.models.load_model(model_path)
            output_shape = model.output_shape
            expected_classes = disease_classes.get(crop_type, 0)
            
            if output_shape[-1] == expected_classes:
                print(f"  ✅ Output classes match expected ({expected_classes})")
            else:
                print(f"  ⚠️  Output classes ({output_shape[-1]}) != expected ({expected_classes})")
            
            del model
            
        except Exception as e:
            print(f"  ❌ Could not verify model structure: {str(e)}")
    
    # Recommendations
    print("\n💡 Recommendations:")
    print("=" * 60)
    
    if len(working_models) == 3:
        print("  ✅ All models working! Your API should run without issues.")
    else:
        print("  ⚠️  Some models missing or broken. API will work with available models.")
        print("  📋 Actions to take:")
        
        missing = set(['tomatoes', 'potatoes', 'maize']) - set(working_models.keys())
        for crop_type in missing:
            print(f"    - Find or retrain {crop_type} model")
            print(f"    - Check if model file exists but has different name")
    
    print("\n🔧 API Configuration:")
    print("  - Update MODEL_PATHS in app.py to use working models")
    print("  - The API will automatically use alternative models if primary ones fail")
    print("  - Missing models will be reported in API health check")

if __name__ == "__main__":
    main() 