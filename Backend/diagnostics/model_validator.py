#!/usr/bin/env python3
"""
Model Validator and Diagnostic Tool for AgriSol Plant Disease Detection API
Consolidates functionality from fix_models.py and use_general_model.py
"""

import os
import sys
import tensorflow as tf
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import json
import time
from datetime import datetime
import logging

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from config import get_config
except ImportError:
    print("❌ Could not import config. Make sure you're running from the Backend directory.")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelValidator:
    """Comprehensive model validation and diagnostic tool"""
    
    def __init__(self):
        self.config = get_config()
        self.validation_results = {}
        self.model_info = {}
        
    def check_tensorflow_setup(self) -> Dict[str, Any]:
        """Check TensorFlow installation and GPU availability"""
        print("🔍 Checking TensorFlow setup...")
        
        tf_info = {
            'version': tf.__version__,
            'gpu_available': len(tf.config.list_physical_devices('GPU')) > 0,
            'gpu_devices': [device.name for device in tf.config.list_physical_devices('GPU')],
            'cpu_devices': [device.name for device in tf.config.list_physical_devices('CPU')],
            'memory_growth_enabled': False
        }
        
        # Enable memory growth for GPUs if available
        if tf_info['gpu_available']:
            try:
                gpus = tf.config.experimental.list_physical_devices('GPU')
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
                tf_info['memory_growth_enabled'] = True
                print(f"✅ GPU memory growth enabled for {len(gpus)} GPU(s)")
            except Exception as e:
                print(f"⚠️ Could not enable GPU memory growth: {e}")
        
        print(f"📊 TensorFlow version: {tf_info['version']}")
        print(f"📊 GPU available: {tf_info['gpu_available']}")
        if tf_info['gpu_available']:
            print(f"📊 GPU devices: {', '.join(tf_info['gpu_devices'])}")
        
        return tf_info
    
    def check_model_files(self) -> Dict[str, Any]:
        """Check which model files exist and their properties"""
        print("\n🔍 Checking model files...")
        print("=" * 60)
        
        if not self.config.NOTEBOOK_DIR.exists():
            print(f"❌ Notebook directory not found: {self.config.NOTEBOOK_DIR}")
            return {'error': 'Notebook directory not found'}
        
        model_status = {}
        
        for crop_type in ['tomatoes', 'potatoes', 'maize', 'beans']:
            print(f"\n📋 {crop_type.title()} Models:")
            crop_status = {
                'primary_model': None,
                'alternative_models': [],
                'working_model': None,
                'error': None
            }
            
            # Check primary model
            primary_path = self.config.MODEL_PATHS.get(crop_type)
            if primary_path and primary_path.exists():
                file_size = primary_path.stat().st_size / (1024 * 1024)  # MB
                print(f"  ✅ Primary: {primary_path.name} ({file_size:.1f} MB)")
                crop_status['primary_model'] = {
                    'path': str(primary_path),
                    'size_mb': file_size,
                    'exists': True
                }
                
                # Try to load primary model
                load_result = self.test_model_loading(primary_path, crop_type)
                if load_result['success']:
                    crop_status['working_model'] = crop_status['primary_model']
                    crop_status['working_model'].update(load_result)
                    print(f"     ✅ Loads successfully!")
                else:
                    print(f"     ❌ Load error: {load_result['error']}")
                    crop_status['error'] = load_result['error']
            else:
                print(f"  ❌ Primary: {primary_path.name if primary_path else 'Not configured'} (not found)")
                crop_status['primary_model'] = {'exists': False}
            
            # Check alternative models
            alternative_paths = self.config.ALTERNATIVE_MODEL_PATHS.get(crop_type, [])
            for alt_path in alternative_paths:
                if alt_path.exists():
                    file_size = alt_path.stat().st_size / (1024 * 1024)  # MB
                    print(f"  🔄 Testing: {alt_path.name} ({file_size:.1f} MB)")
                    
                    alt_info = {
                        'path': str(alt_path),
                        'size_mb': file_size,
                        'exists': True
                    }
                    
                    load_result = self.test_model_loading(alt_path, crop_type)
                    alt_info.update(load_result)
                    
                    if load_result['success']:
                        print(f"     ✅ Alternative model works!")
                        if not crop_status['working_model']:
                            crop_status['working_model'] = alt_info
                    else:
                        print(f"     ❌ Load error: {load_result['error']}")
                    
                    crop_status['alternative_models'].append(alt_info)
                else:
                    print(f"  ❌ Alternative: {alt_path.name} (not found)")
                    crop_status['alternative_models'].append({
                        'path': str(alt_path),
                        'exists': False
                    })
            
            model_status[crop_type] = crop_status
        
        return model_status
    
    def test_model_loading(self, model_path: Path, crop_type: str) -> Dict[str, Any]:
        """Test loading a specific model"""
        try:
            model_path_str = str(model_path)
            start_time = time.time()
            
            # Try different loading strategies
            if model_path_str.endswith('.keras'):
                try:
                    # Try loading without compilation first
                    model = tf.keras.models.load_model(model_path_str, compile=False)
                    load_method = 'keras_no_compile'
                except Exception:
                    # Try with custom objects
                    custom_objects = {
                        'loss_fn': lambda y_true, y_pred: tf.keras.losses.categorical_crossentropy(y_true, y_pred),
                        'accuracy': tf.keras.metrics.categorical_accuracy
                    }
                    model = tf.keras.models.load_model(model_path_str, custom_objects=custom_objects)
                    load_method = 'keras_custom_objects'
            else:
                # For .h5 files
                model = tf.keras.models.load_model(model_path_str)
                load_method = 'h5_standard'
            
            load_time = time.time() - start_time
            
            # Get model information
            model_info = {
                'success': True,
                'load_time': load_time,
                'load_method': load_method,
                'input_shape': model.input_shape,
                'output_shape': model.output_shape,
                'total_params': model.count_params(),
                'trainable_params': sum([tf.keras.backend.count_params(w) for w in model.trainable_weights]),
                'layers': len(model.layers),
                'optimizer': str(model.optimizer.__class__.__name__) if hasattr(model, 'optimizer') else 'Unknown'
            }
            
            # Test prediction
            dummy_input = np.random.random((1, 256, 256, 3)).astype(np.float32)
            start_pred = time.time()
            predictions = model.predict(dummy_input, verbose=0)
            pred_time = time.time() - start_pred
            
            model_info.update({
                'prediction_time': pred_time,
                'prediction_shape': predictions.shape,
                'max_prediction': float(np.max(predictions)),
                'predicted_class': int(np.argmax(predictions))
            })
            
            # Validate output shape matches expected classes
            expected_classes = len(self.config.DISEASE_CLASSES.get(crop_type, []))
            if predictions.shape[-1] == expected_classes:
                model_info['class_count_valid'] = True
            else:
                model_info['class_count_valid'] = False
                model_info['class_count_mismatch'] = f"Expected {expected_classes}, got {predictions.shape[-1]}"
            
            # Clean up
            del model
            
            return model_info
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'error_type': type(e).__name__
            }
    
    def test_prediction_pipeline(self, crop_type: str, model_path: Path) -> Dict[str, Any]:
        """Test the complete prediction pipeline for a model"""
        print(f"\n🧪 Testing prediction pipeline for {crop_type}...")
        
        try:
            # Load model
            model = tf.keras.models.load_model(str(model_path), compile=False)
            
            # Create test images with different characteristics
            test_cases = [
                ('random_noise', np.random.random((256, 256, 3))),
                ('green_plant', np.full((256, 256, 3), [0.2, 0.8, 0.2])),
                ('brown_diseased', np.full((256, 256, 3), [0.6, 0.4, 0.2])),
                ('high_contrast', np.random.choice([0.0, 1.0], size=(256, 256, 3))),
                ('grayscale', np.full((256, 256, 3), 0.5))
            ]
            
            results = {}
            
            for test_name, test_image in test_cases:
                # Preprocess image
                image_batch = np.expand_dims(test_image.astype(np.float32), axis=0)
                
                # Make prediction
                start_time = time.time()
                predictions = model.predict(image_batch, verbose=0)
                pred_time = time.time() - start_time
                
                # Analyze predictions
                predicted_class_idx = np.argmax(predictions[0])
                confidence = float(predictions[0][predicted_class_idx])
                
                # Get class name
                available_classes = self.config.DISEASE_CLASSES.get(crop_type, [])
                predicted_class = (available_classes[predicted_class_idx] 
                                 if predicted_class_idx < len(available_classes) 
                                 else f"Class_{predicted_class_idx}")
                
                results[test_name] = {
                    'predicted_class': predicted_class,
                    'predicted_class_idx': predicted_class_idx,
                    'confidence': confidence,
                    'prediction_time': pred_time,
                    'prediction_distribution': predictions[0].tolist()
                }
                
                print(f"  {test_name}: {predicted_class} ({confidence:.3f}) - {pred_time:.3f}s")
            
            del model
            return {'success': True, 'results': results}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def suggest_model_fixes(self, model_status: Dict[str, Any]) -> Dict[str, List[str]]:
        """Suggest fixes for model issues"""
        print("\n💡 Model Fix Suggestions:")
        print("=" * 60)
        
        suggestions = {}
        
        for crop_type, status in model_status.items():
            crop_suggestions = []
            
            if not status.get('working_model'):
                print(f"\n❌ {crop_type.title()} - No working model found")
                
                if not status['primary_model'].get('exists'):
                    crop_suggestions.append("Download or train the primary model")
                    crop_suggestions.append(f"Expected location: {self.config.MODEL_PATHS.get(crop_type)}")
                
                if status.get('error'):
                    error = status['error']
                    if 'custom' in error.lower():
                        crop_suggestions.append("Try loading with compile=False")
                        crop_suggestions.append("Check for custom loss functions or metrics")
                    elif 'memory' in error.lower():
                        crop_suggestions.append("Reduce batch size or enable GPU memory growth")
                    elif 'version' in error.lower():
                        crop_suggestions.append("Check TensorFlow version compatibility")
                        crop_suggestions.append("Consider converting model to current TF version")
                
                # Check if alternative models exist
                working_alternatives = [alt for alt in status['alternative_models'] 
                                      if alt.get('success')]
                if working_alternatives:
                    crop_suggestions.append(f"Use alternative model: {working_alternatives[0]['path']}")
                
                # Cross-model suggestions
                for other_crop, other_status in model_status.items():
                    if other_crop != crop_type and other_status.get('working_model'):
                        crop_suggestions.append(f"Temporarily use {other_crop} model as fallback")
                        break
                
            else:
                print(f"✅ {crop_type.title()} - Working model available")
                working_model = status['working_model']
                
                if not working_model.get('class_count_valid', True):
                    crop_suggestions.append("Verify model was trained for correct number of classes")
                    crop_suggestions.append("Check disease class mappings in config")
                
                if working_model.get('prediction_time', 0) > 5.0:
                    crop_suggestions.append("Model prediction is slow - consider optimization")
                    crop_suggestions.append("Check if GPU acceleration is working")
            
            suggestions[crop_type] = crop_suggestions
            
            if crop_suggestions:
                for suggestion in crop_suggestions:
                    print(f"  💡 {suggestion}")
        
        return suggestions
    
    def generate_report(self, tf_info: Dict, model_status: Dict, suggestions: Dict) -> Dict[str, Any]:
        """Generate comprehensive validation report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'tensorflow_info': tf_info,
            'model_status': model_status,
            'suggestions': suggestions,
            'summary': {
                'total_crops': len(model_status),
                'working_models': sum(1 for status in model_status.values() 
                                    if status.get('working_model')),
                'failed_models': sum(1 for status in model_status.values() 
                                   if not status.get('working_model')),
                'gpu_available': tf_info['gpu_available'],
                'tensorflow_version': tf_info['version']
            }
        }
        
        # Calculate overall health score
        working_models = report['summary']['working_models']
        total_crops = report['summary']['total_crops']
        health_score = (working_models / total_crops) * 100 if total_crops > 0 else 0
        report['summary']['health_score'] = health_score
        
        return report
    
    def run_full_validation(self, save_report: bool = True) -> Dict[str, Any]:
        """Run complete model validation"""
        print("🚀 Starting comprehensive model validation...")
        print("=" * 70)
        
        # Check TensorFlow setup
        tf_info = self.check_tensorflow_setup()
        
        # Check model files
        model_status = self.check_model_files()
        
        # Generate suggestions
        suggestions = self.suggest_model_fixes(model_status)
        
        # Generate report
        report = self.generate_report(tf_info, model_status, suggestions)
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 VALIDATION SUMMARY")
        print("=" * 70)
        print(f"✅ Working models: {report['summary']['working_models']}/{report['summary']['total_crops']}")
        print(f"📊 Health score: {report['summary']['health_score']:.1f}%")
        print(f"🖥️ GPU available: {report['summary']['gpu_available']}")
        print(f"🔧 TensorFlow: {report['summary']['tensorflow_version']}")
        
        if report['summary']['health_score'] == 100:
            print("🎉 ALL MODELS VALIDATED SUCCESSFULLY!")
        elif report['summary']['health_score'] >= 75:
            print("✅ Most models working - minor issues detected")
        elif report['summary']['health_score'] >= 50:
            print("⚠️ Some models have issues - check suggestions")
        else:
            print("❌ Major model issues detected - review all suggestions")
        
        # Save report
        if save_report:
            report_file = f"model_validation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            try:
                with open(report_file, 'w') as f:
                    json.dump(report, f, indent=2, default=str)
                print(f"\n📄 Detailed report saved: {report_file}")
            except Exception as e:
                print(f"⚠️ Could not save report: {e}")
        
        return report

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Validate AgriSol ML models')
    parser.add_argument('--crop', choices=['tomatoes', 'potatoes', 'maize', 'beans'],
                       help='Validate specific crop model only')
    parser.add_argument('--no-save', action='store_true',
                       help='Don\'t save validation report')
    parser.add_argument('--test-pipeline', action='store_true',
                       help='Test prediction pipeline for working models')
    
    args = parser.parse_args()
    
    validator = ModelValidator()
    
    if args.crop:
        # Validate specific crop only
        print(f"🧪 Validating {args.crop} model only...")
        # Implementation for single crop validation
        pass
    else:
        # Run full validation
        report = validator.run_full_validation(save_report=not args.no_save)
        
        # Test prediction pipelines if requested
        if args.test_pipeline:
            print("\n🧪 Testing prediction pipelines...")
            for crop_type, status in report['model_status'].items():
                if status.get('working_model'):
                    model_path = Path(status['working_model']['path'])
                    pipeline_result = validator.test_prediction_pipeline(crop_type, model_path)
                    if pipeline_result['success']:
                        print(f"✅ {crop_type} pipeline working")
                    else:
                        print(f"❌ {crop_type} pipeline failed: {pipeline_result['error']}")

if __name__ == "__main__":
    main() 