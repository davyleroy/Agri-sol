import tensorflow as tf
import numpy as np
import cv2
from PIL import Image
import io
import logging
from typing import Optional, Tuple, Dict, Any
import os

logger = logging.getLogger(__name__)

class ModelManager:
    """Manages loading and operations for plant disease detection models"""
    
    def __init__(self):
        self.models = {}
        self.model_paths = {
            'tomatoes': '../Notebook/tomato_disease_best_model_fixed.h5',
            'potatoes': '../Notebook/sweet_spot_potato_model.keras',
            'maize': '../Notebook/corn_gentle_v3.h5'
        }
        
        # Alternative model paths if primary ones don't exist
        self.alternative_paths = {
            'tomatoes': ['../Notebook/tomato_disease_best_model.h5', '../Notebook/tomato_transfer_best.h5'],
            'potatoes': ['../Notebook/agrisol_potato_model.keras', '../Notebook/nuclear_potato_model.keras'],
            'maize': ['../Notebook/corn_antibias_v2.h5', '../Notebook/corn_disease_balanced_model.h5']
        }
    
    def load_model(self, crop_type: str) -> bool:
        """Load a specific model"""
        try:
            model_path = self.model_paths.get(crop_type)
            
            # Try primary path first
            if model_path and os.path.exists(model_path):
                self.models[crop_type] = tf.keras.models.load_model(model_path)
                logger.info(f"Successfully loaded {crop_type} model from {model_path}")
                return True
            
            # Try alternative paths
            alternative_paths = self.alternative_paths.get(crop_type, [])
            for alt_path in alternative_paths:
                if os.path.exists(alt_path):
                    self.models[crop_type] = tf.keras.models.load_model(alt_path)
                    logger.info(f"Successfully loaded {crop_type} model from alternative path {alt_path}")
                    return True
            
            logger.warning(f"No model file found for {crop_type}")
            return False
            
        except Exception as e:
            logger.error(f"Error loading {crop_type} model: {str(e)}")
            return False
    
    def load_all_models(self) -> Dict[str, bool]:
        """Load all available models"""
        results = {}
        for crop_type in ['tomatoes', 'potatoes', 'maize']:
            results[crop_type] = self.load_model(crop_type)
        return results
    
    def get_model(self, crop_type: str) -> Optional[tf.keras.Model]:
        """Get a loaded model"""
        return self.models.get(crop_type)
    
    def is_model_loaded(self, crop_type: str) -> bool:
        """Check if a model is loaded"""
        return crop_type in self.models
    
    def get_loaded_models(self) -> list:
        """Get list of loaded model names"""
        return list(self.models.keys())

def preprocess_image(image_data, target_size: Tuple[int, int] = (256, 256)) -> Optional[np.ndarray]:
    """
    Preprocess uploaded image for model prediction
    
    Args:
        image_data: Image file data or PIL Image
        target_size: Target size for resizing (width, height)
    
    Returns:
        Preprocessed image array or None if processing fails
    """
    try:
        # Handle different input types
        if hasattr(image_data, 'read'):
            # File-like object
            image = Image.open(image_data).convert('RGB')
        elif isinstance(image_data, bytes):
            # Bytes data
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
        elif isinstance(image_data, Image.Image):
            # PIL Image
            image = image_data.convert('RGB')
        else:
            raise ValueError("Unsupported image data type")
        
        # Resize image
        image = image.resize(target_size)
        
        # Convert to numpy array and normalize
        image_array = np.array(image)
        image_array = image_array.astype(np.float32) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        return None

def postprocess_predictions(predictions: np.ndarray, class_names: list) -> Dict[str, Any]:
    """
    Postprocess model predictions
    
    Args:
        predictions: Raw model predictions
        class_names: List of class names
    
    Returns:
        Dictionary with processed prediction results
    """
    try:
        # Get prediction results
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        predicted_class = class_names[predicted_class_idx]
        
        # Create all predictions dictionary
        all_predictions = {
            class_names[i]: float(predictions[0][i])
            for i in range(len(class_names))
        }
        
        # Sort predictions by confidence
        sorted_predictions = dict(
            sorted(all_predictions.items(), key=lambda x: x[1], reverse=True)
        )
        
        return {
            'predicted_class': predicted_class,
            'confidence': confidence,
            'predicted_class_idx': int(predicted_class_idx),
            'all_predictions': all_predictions,
            'sorted_predictions': sorted_predictions,
            'top_3_predictions': dict(list(sorted_predictions.items())[:3])
        }
        
    except Exception as e:
        logger.error(f"Error postprocessing predictions: {str(e)}")
        return None

def validate_image_file(file) -> Tuple[bool, str]:
    """
    Validate uploaded image file
    
    Args:
        file: Uploaded file object
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not file:
        return False, "No file provided"
    
    if file.filename == '':
        return False, "No file selected"
    
    # Check file extension
    filename = file.filename.lower()
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
    
    if not any(filename.endswith(ext) for ext in valid_extensions):
        return False, f"Invalid file type. Supported formats: {', '.join(valid_extensions)}"
    
    # Check file size (Flask should handle this, but double-check)
    file.seek(0, 2)  # Seek to end
    size = file.tell()
    file.seek(0)  # Reset position
    
    max_size = 16 * 1024 * 1024  # 16MB
    if size > max_size:
        return False, f"File too large. Maximum size: {max_size // (1024*1024)}MB"
    
    return True, "Valid file"

def get_model_info() -> Dict[str, Dict]:
    """Get information about available models and their classes"""
    return {
        'tomatoes': {
            'name': 'Tomato Disease Detection',
            'classes': [
                'Bacterial Spot', 'Early Blight', 'Healthy', 'Late Blight', 'Leaf Mold',
                'Septoria Leaf Spot', 'Spider Mites', 'Target Spot', 'Mosaic Virus', 
                'Yellow Leaf Curl Virus'
            ],
            'input_size': (256, 256, 3),
            'description': 'Detects 10 common tomato diseases and healthy plants'
        },
        'potatoes': {
            'name': 'Potato Disease Detection',
            'classes': ['Early Blight', 'Healthy', 'Late Blight'],
            'input_size': (256, 256, 3),
            'description': 'Detects potato blight diseases and healthy plants'
        },
        'maize': {
            'name': 'Maize Disease Detection',
            'classes': ['Common Rust', 'Gray Leaf Spot', 'Healthy', 'Northern Corn Leaf Blight'],
            'input_size': (256, 256, 3),
            'description': 'Detects common maize/corn diseases and healthy plants'
        }
    } 