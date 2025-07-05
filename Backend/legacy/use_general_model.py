#!/usr/bin/env python3
"""
Test the large general model for maize disease detection
"""

import tensorflow as tf
import numpy as np
from pathlib import Path

def test_general_model():
    """Test if the best_plant_disease_model.h5 can be used for maize"""
    
    model_path = Path("../Notebook/best_plant_disease_model.h5")
    
    if not model_path.exists():
        print("❌ General model not found!")
        return False
    
    try:
        print("🔄 Testing best_plant_disease_model.h5...")
        print(f"📊 File size: {model_path.stat().st_size / (1024*1024):.1f} MB")
        
        # Load model
        model = tf.keras.models.load_model(str(model_path))
        
        print(f"✅ Model loaded successfully!")
        print(f"📊 Input shape: {model.input_shape}")
        print(f"📊 Output shape: {model.output_shape}")
        
        # Test prediction
        dummy_image = np.random.random((1, 256, 256, 3)).astype(np.float32)
        predictions = model.predict(dummy_image, verbose=0)
        
        print(f"✅ Prediction shape: {predictions.shape}")
        print(f"✅ Number of classes: {predictions.shape[-1]}")
        print(f"✅ Max confidence: {np.max(predictions[0]):.4f}")
        print(f"✅ Predicted class: {np.argmax(predictions[0])}")
        
        # Check if it could work for multiple crops
        num_classes = predictions.shape[-1]
        if num_classes >= 10:
            print(f"💡 This model has {num_classes} classes - could be a multi-crop model!")
            print("💡 It might include tomato, potato, and maize classes combined")
            return True
        else:
            print(f"⚠️  Only {num_classes} classes - might be crop-specific")
            return False
            
    except Exception as e:
        print(f"❌ Error testing general model: {str(e)}")
        return False

def suggest_maize_alternatives():
    """Suggest alternatives for maize model"""
    print("\n🌽 Maize Model Alternatives:")
    print("=" * 50)
    
    alternatives = [
        "../Notebook/corn_gentle_v3.h5",
        "../Notebook/potato_model_best.h5",  # Might work as it's large
        "../Notebook/tomato_disease_best_model.h5"
    ]
    
    for alt_path in alternatives:
        path = Path(alt_path)
        if path.exists():
            size_mb = path.stat().st_size / (1024*1024)
            print(f"📄 {path.name} ({size_mb:.1f} MB)")
            
            try:
                model = tf.keras.models.load_model(str(path))
                print(f"   ✅ Loads successfully")
                print(f"   📊 Classes: {model.output_shape[-1]}")
                del model
            except Exception as e:
                print(f"   ❌ Load error: {str(e)}")
        else:
            print(f"❌ {path.name} - Not found")

if __name__ == "__main__":
    print("🌽 Testing Alternative Models for Maize")
    print("=" * 50)
    
    # Test the general model
    general_works = test_general_model()
    
    # Suggest other alternatives
    suggest_maize_alternatives()
    
    print("\n💡 Recommendations:")
    print("=" * 50)
    
    if general_works:
        print("✅ Use best_plant_disease_model.h5 as maize model")
        print("   - It has enough classes to handle multiple crops")
        print("   - Update MODEL_PATHS in app.py to use this model")
    else:
        print("⚠️  Consider:")
        print("   - Retraining maize model with correct format")
        print("   - Using tomato model as temporary fallback")
        print("   - Running API with just tomato and potato models") 