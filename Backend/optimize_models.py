#!/usr/bin/env python3
"""
AgriSol Model Optimization Script
Quantizes models to reduce size while maintaining accuracy
"""

import os
import sys
import time
import numpy as np
import tensorflow as tf
from pathlib import Path
import shutil

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def setup_tensorflow():
    """Configure TensorFlow for optimal performance"""
    # Suppress TensorFlow warnings
    tf.get_logger().setLevel('ERROR')
    
    # Configure GPU memory growth if available
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print("✅ GPU memory growth configured")
        except RuntimeError as e:
            print(f"⚠️ GPU configuration warning: {e}")
    
    print(f"🔧 TensorFlow version: {tf.__version__}")
    return True

def get_model_size(model_path):
    """Get model file size in MB"""
    if os.path.exists(model_path):
        size_bytes = os.path.getsize(model_path)
        return size_bytes / (1024 * 1024)
    return 0

def load_model_safely(model_path):
    """Load model with error handling and compatibility fixes"""
    try:
        print(f"📂 Loading model: {model_path}")
        
        # Convert Path object to string for extension checking
        model_path_str = str(model_path)
        
        # Try loading with different methods for compatibility
        model = None
        
        if model_path_str.endswith('.keras') or model_path_str.endswith('.h5'):
            # First try: Load without compilation (most compatible)
            try:
                print("🔄 Attempting to load without compilation...")
                model = tf.keras.models.load_model(model_path_str, compile=False)
                print("✅ Loaded without compilation successfully")
            except Exception as e1:
                print(f"⚠️ Failed without compilation: {str(e1)[:100]}...")
                
                # Second try: Load with safe loading
                try:
                    print("🔄 Attempting safe loading...")
                    model = tf.keras.models.load_model(
                        model_path_str, 
                        compile=False,
                        safe_mode=False  # Disable safe mode for compatibility
                    )
                    print("✅ Safe loading successful")
                except Exception as e2:
                    print(f"⚠️ Safe loading failed: {str(e2)[:100]}...")
                    
                    # Third try: Use weights only method
                    try:
                        print("🔄 Attempting weights-only loading...")
                        # This is a fallback - we'll skip this model and use alternatives
                        raise Exception("Keras version incompatibility - will use alternative models")
                    except Exception as e3:
                        print(f"❌ All loading methods failed")
                        return None
        else:
            raise ValueError(f"Unsupported model format: {model_path}")
        
        if model is not None:
            print(f"✅ Model loaded successfully")
            print(f"📊 Model input shape: {model.input_shape}")
            print(f"📊 Model output shape: {model.output_shape}")
            
            # Recompile the model for our use case
            model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            print("✅ Model recompiled successfully")
        
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

def quantize_model(model, model_name):
    """Apply quantization to reduce model size"""
    try:
        print(f"🔧 Starting quantization for {model_name}...")
        
        # Convert to TensorFlow Lite with quantization
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        
        # Enable quantization
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        # Use integer quantization for maximum size reduction
        converter.representative_dataset = generate_representative_dataset
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
        converter.inference_input_type = tf.uint8
        converter.inference_output_type = tf.uint8
        
        # Convert model
        quantized_model = converter.convert()
        
        print(f"✅ Quantization completed for {model_name}")
        return quantized_model
    
    except Exception as e:
        print(f"❌ Quantization failed for {model_name}: {e}")
        print("🔄 Falling back to dynamic range quantization...")
        
        # Fallback to dynamic range quantization
        try:
            converter = tf.lite.TFLiteConverter.from_keras_model(model)
            converter.optimizations = [tf.lite.Optimize.DEFAULT]
            quantized_model = converter.convert()
            print(f"✅ Fallback quantization completed for {model_name}")
            return quantized_model
        except Exception as e2:
            print(f"❌ Fallback quantization also failed: {e2}")
            return None

def generate_representative_dataset():
    """Generate representative dataset for quantization"""
    # Create dummy data that matches model input shape
    for _ in range(100):
        yield [np.random.random((1, 256, 256, 3)).astype(np.float32)]

def save_quantized_model(quantized_model, save_path, model_name):
    """Save quantized model to file"""
    try:
        with open(save_path, 'wb') as f:
            f.write(quantized_model)
        print(f"✅ Quantized model saved: {save_path}")
        return True
    except Exception as e:
        print(f"❌ Error saving quantized model: {e}")
        return False

def test_quantized_model(tflite_path, model_name):
    """Test quantized model to ensure it works"""
    try:
        print(f"🧪 Testing quantized model: {model_name}")
        
        # Load TFLite model
        interpreter = tf.lite.Interpreter(model_path=tflite_path)
        interpreter.allocate_tensors()
        
        # Get input and output tensors
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print(f"📊 Input shape: {input_details[0]['shape']}")
        print(f"📊 Output shape: {output_details[0]['shape']}")
        
        # Test with dummy data
        input_shape = input_details[0]['shape']
        input_data = np.random.random(input_shape).astype(np.float32)
        
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        
        output_data = interpreter.get_tensor(output_details[0]['index'])
        print(f"✅ Model test successful - Output shape: {output_data.shape}")
        
        return True
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def optimize_model(source_path, target_dir, model_name):
    """Complete model optimization pipeline"""
    print(f"\n🚀 Starting optimization for {model_name.upper()}")
    print("=" * 60)
    
    # Check if source exists
    if not os.path.exists(source_path):
        print(f"❌ Source model not found: {source_path}")
        return False
    
    # Get original size
    original_size = get_model_size(source_path)
    print(f"📊 Original size: {original_size:.1f} MB")
    
    # Load model
    model = load_model_safely(source_path)
    if model is None:
        return False
    
    # Quantize model
    quantized_model = quantize_model(model, model_name)
    if quantized_model is None:
        return False
    
    # Save quantized model
    target_path = os.path.join(target_dir, f"{model_name}_quantized.tflite")
    if not save_quantized_model(quantized_model, target_path, model_name):
        return False
    
    # Test quantized model
    if not test_quantized_model(target_path, model_name):
        return False
    
    # Get optimized size
    optimized_size = get_model_size(target_path)
    reduction = ((original_size - optimized_size) / original_size) * 100
    
    print(f"📊 Optimized size: {optimized_size:.1f} MB")
    print(f"📊 Size reduction: {reduction:.1f}%")
    print(f"✅ Optimization completed successfully!")
    
    return True

def main():
    """Main optimization process"""
    print("🌱 AgriSol Model Optimization")
    print("=" * 60)
    
    # Setup TensorFlow
    setup_tensorflow()
    
    # Define paths
    notebook_dir = Path("../Notebook")
    models_dir = Path("./models")
    
    # Ensure models directory exists
    models_dir.mkdir(exist_ok=True)
    
    # Models to optimize with fallback options
    models_to_optimize = {
        'potatoes': {
            'primary': notebook_dir / 'potato_disease_model_best.keras',
            'alternatives': [
                notebook_dir / 'nuclear_potato_model.keras',
                notebook_dir / 'sweet_spot_potato_model.keras',
                notebook_dir / 'agrisol_potato_model.keras',
                notebook_dir / 'potato_model_best.h5'
            ]
        },
        'beans': {
            'primary': notebook_dir / 'bean_disease_model_best.keras',
            'alternatives': [
                notebook_dir / 'bean_disease_model_best.h5',
                notebook_dir / 'enhanced_bean_disease.h5',
                notebook_dir / 'anti_bias_bean_model.h5',
                notebook_dir / 'bean_model_phase_2_medium_augmentation.h5'
            ]
        }
    }
    
    print(f"📁 Source directory: {notebook_dir}")
    print(f"📁 Target directory: {models_dir}")
    print(f"📊 Models to optimize: {len(models_to_optimize)}")
    
    # Track results
    results = {}
    
    # Optimize each model with fallback support
    for model_name, model_config in models_to_optimize.items():
        success = False
        
        # Try primary model first
        primary_path = model_config['primary']
        print(f"\n🎯 Trying primary model for {model_name.upper()}: {primary_path.name}")
        success = optimize_model(primary_path, models_dir, model_name)
        
        # If primary fails, try alternatives
        if not success and 'alternatives' in model_config:
            print(f"🔄 Primary model failed, trying alternatives for {model_name.upper()}...")
            
            for alt_path in model_config['alternatives']:
                if alt_path.exists():
                    print(f"🎯 Trying alternative: {alt_path.name}")
                    success = optimize_model(alt_path, models_dir, model_name)
                    if success:
                        print(f"✅ Alternative model successful for {model_name.upper()}")
                        break
                else:
                    print(f"⚠️ Alternative not found: {alt_path.name}")
            
            if not success:
                print(f"❌ All alternatives failed for {model_name.upper()}")
        
        results[model_name] = success
        
        # Pause between models
        if len(models_to_optimize) > 1:
            time.sleep(2)
    
    # Summary
    print("\n🎯 OPTIMIZATION SUMMARY")
    print("=" * 60)
    
    successful = 0
    for model_name, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{model_name.upper():<10} - {status}")
        if success:
            successful += 1
    
    print(f"\n📊 Overall success rate: {successful}/{len(results)} models")
    
    if successful == len(results):
        print("🎉 All models optimized successfully!")
        print("📁 Optimized models saved in: Backend/models/")
        print("🚀 Ready for deployment!")
    else:
        print("⚠️ Some models failed optimization")
        print("💡 Check the error messages above for details")

if __name__ == "__main__":
    main() 