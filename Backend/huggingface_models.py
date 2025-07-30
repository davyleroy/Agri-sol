#!/usr/bin/env python3
"""
Hugging Face Model Manager for AgriSol Backend
Downloads and manages models from Hugging Face repositories
"""

import os
import requests
import tempfile
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import tensorflow as tf

logger = logging.getLogger(__name__)

class HuggingFaceModelManager:
    """Manages model downloads from Hugging Face"""
    
    def __init__(self, cache_dir: str = "models_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        # Hugging Face model repositories
        self.model_repos = {
            'tomatoes': {
                'repo': 'Davy-leroy/Tomatoes-CNN',
                'file': 'optimized_tomatoes_model.h5',
                'fallback': 'tomato_disease_best_model_fixed.h5'
            },
            'potatoes': {
                'repo': 'Davy-leroy/Potatoes-CNN',
                'file': 'optimized_potatoes_model.h5',
                'fallback': 'potato_disease_model_best.keras'
            },
            'maize': {
                'repo': 'Davy-leroy/Maize-CNN',
                'file': 'optimized_maize_model.h5',
                'fallback': 'corn_gentle_v3.h5'
            },
            'beans': {
                'repo': 'Davy-leroy/Beans-CNN',
                'file': 'optimized_beans_model.h5',
                'fallback': 'bean_disease_model_best.keras'
            }
        }
    
    def get_model_url(self, crop_type: str) -> str:
        """Get the download URL for a model"""
        if crop_type not in self.model_repos:
            raise ValueError(f"Unknown crop type: {crop_type}")
        
        repo_info = self.model_repos[crop_type]
        return f"https://huggingface.co/{repo_info['repo']}/resolve/main/{repo_info['file']}"
    
    def download_model(self, crop_type: str, force_download: bool = False) -> Optional[Path]:
        """Download a model from Hugging Face"""
        try:
            repo_info = self.model_repos[crop_type]
            model_file = repo_info['file']
            cache_path = self.cache_dir / f"{crop_type}_{model_file}"
            
            # Check if already cached
            if cache_path.exists() and not force_download:
                logger.info(f"✅ Using cached model for {crop_type}: {cache_path}")
                return cache_path
            
            # Download from Hugging Face
            url = self.get_model_url(crop_type)
            logger.info(f"📥 Downloading {crop_type} model from: {url}")
            
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            # Save to cache
            with open(cache_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"✅ Downloaded {crop_type} model: {cache_path}")
            return cache_path
            
        except Exception as e:
            logger.error(f"❌ Failed to download {crop_type} model: {e}")
            return None
    
    def get_model_path(self, crop_type: str) -> Optional[Path]:
        """Get the path to a model, downloading if necessary"""
        # Try to download from Hugging Face first
        model_path = self.download_model(crop_type)
        
        if model_path and model_path.exists():
            return model_path
        
        # Fallback to local files
        fallback_paths = [
            Path("../Notebook") / self.model_repos[crop_type]['fallback'],
            Path("models") / f"optimized_{crop_type}_model.h5",
            Path("models") / f"optimized_{crop_type}_model.tflite"
        ]
        
        for path in fallback_paths:
            if path.exists():
                logger.info(f"✅ Using fallback model for {crop_type}: {path}")
                return path
        
        logger.warning(f"⚠️ No model found for {crop_type}")
        return None
    
    def load_model_from_hf(self, crop_type: str) -> Optional[tf.keras.Model]:
        """Load a model from Hugging Face"""
        try:
            model_path = self.get_model_path(crop_type)
            
            if not model_path:
                logger.error(f"❌ No model path available for {crop_type}")
                return None
            
            logger.info(f"🤖 Loading {crop_type} model from: {model_path}")
            
            # Try loading with different methods
            try:
                model = tf.keras.models.load_model(str(model_path), compile=False)
                logger.info(f"✅ Successfully loaded {crop_type} model")
                return model
            except Exception as e:
                logger.warning(f"⚠️ Failed to load {crop_type} model with compile=False: {e}")
                
                # Try with custom objects
                try:
                    custom_objects = {
                        'InputLayer': tf.keras.layers.InputLayer,
                        'loss_fn': lambda y_true, y_pred: tf.keras.losses.categorical_crossentropy(y_true, y_pred),
                        'accuracy': tf.keras.metrics.categorical_accuracy
                    }
                    model = tf.keras.models.load_model(str(model_path), custom_objects=custom_objects, compile=False)
                    logger.info(f"✅ Successfully loaded {crop_type} model with custom objects")
                    return model
                except Exception as e2:
                    logger.error(f"❌ Failed to load {crop_type} model: {e2}")
                    return None
                    
        except Exception as e:
            logger.error(f"❌ Error loading {crop_type} model from Hugging Face: {e}")
            return None
    
    def get_available_models(self) -> Dict[str, Any]:
        """Get information about available models"""
        models_info = {}
        
        for crop_type in self.model_repos.keys():
            model_path = self.get_model_path(crop_type)
            repo_info = self.model_repos[crop_type]
            
            models_info[crop_type] = {
                'available': model_path is not None and model_path.exists(),
                'source': 'huggingface' if model_path and 'cache' in str(model_path) else 'local',
                'path': str(model_path) if model_path else None,
                'repo': repo_info['repo'],
                'file': repo_info['file'],
                'fallback': repo_info['fallback']
            }
        
        return models_info
    
    def clear_cache(self):
        """Clear the model cache"""
        try:
            for file in self.cache_dir.glob("*"):
                file.unlink()
            logger.info("✅ Model cache cleared")
        except Exception as e:
            logger.error(f"❌ Failed to clear cache: {e}")

# Global instance
hf_manager = HuggingFaceModelManager() 