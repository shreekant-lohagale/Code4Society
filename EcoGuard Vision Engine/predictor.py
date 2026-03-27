"""
EcoGuard - Vision Engine Predictor
Handles waste detection, weight estimation, and carbon calculation.
"""

import json
import pickle
import joblib
import numpy as np
import cv2
import pandas as pd
from pathlib import Path
from ultralytics import YOLO
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelPredictor:
    """
    Central predictor class that loads and manages all models
    """
    
    def __init__(self, models_path="models"):
        """
        Initialize and load models
        Args:
            models_path: Path to models directory
        """
        self.models_path = Path(models_path)
        self.vision_model = None
        self.weight_estimator = None
        self.weight_config = None
        self.emission_factors = {
            'plastic': 2.5,
            'glass': 1.2,
            'metal': 8.5,
            'paper': 1.3,
            'cardboard': 1.1,
            'trash': 1.5
        }
        self.class_names = {
            0: 'cardboard',
            1: 'glass',
            2: 'metal',
            3: 'paper',
            4: 'plastic',
            5: 'trash'
        }
        
        # Load models once at startup
        self.load_models()
    
    def load_models(self):
        """Load pre-trained models"""
        try:
            # Load Vision Model (YOLOv8)
            vision_path = self.models_path / 'vision_model' / 'best.pt'
            if vision_path.exists():
                self.vision_model = YOLO(str(vision_path))
                logger.info("✓ Vision Model (YOLOv8) loaded")
            else:
                logger.error(f"Vision model not found at {vision_path}. Attempting legacy path.")
                legacy_vision = self.models_path / 'best.pt'
                if legacy_vision.exists():
                    self.vision_model = YOLO(str(legacy_vision))
                    logger.info("✓ Vision Model (YOLOv8) loaded from legacy path")

            # Load Weight Estimator (rule-based or pickle)
            weight_path = self.models_path / 'weight_model' / 'weight_estimator.pkl'
            if weight_path.exists():
                with open(weight_path, 'rb') as f:
                    self.weight_estimator = pickle.load(f)
                logger.info("✓ Weight Estimator loaded")
            
            # Load Weight Config
            config_path = self.models_path / 'weight_model' / 'weight_estimator_config.json'
            if config_path.exists():
                with open(config_path, 'r') as f:
                    self.weight_config = json.load(f)
                logger.info("✓ Weight Config loaded")
                
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")

    def predict_all(self, image_path):
        """
        Complete analysis: Detection -> Weight -> Carbon
        """
        if self.vision_model is None:
            return {"error": "Vision model not loaded"}
            
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                return {"error": "Invalid image path"}
            img_shape = img.shape
            
            # 1. Vision - Detect objects
            results = self.vision_model(img)[0]
            
            output = []
            for box in results.boxes:
                cls_id = int(box.cls[0])
                class_name = self.class_names.get(cls_id, results.names[cls_id] if hasattr(results, 'names') else 'unknown')
                confidence = float(box.conf[0])
                bbox_coords = box.xyxy[0].tolist() # [x1, y1, x2, y2]
                
                # 2. Weight - Estimate for this detection
                weight_g = 0
                if self.weight_estimator:
                    try:
                        # Some versions of WeightEstimator might have different signatures
                        weight_result = self.weight_estimator.estimate_weight(
                            bbox=bbox_coords,
                            image_shape=img_shape,
                            material=class_name
                        )
                        weight_g = weight_result.get('weight_g', 30)
                    except:
                        # Fallback to base calculations if estimator fails or has different signature
                        weight_g = 30 # Default average
                else:
                    weight_g = 30 # Default average
                
                # 3. Carbon - Calculate emissions
                factor = self.emission_factors.get(class_name, 1.5)
                weight_kg = weight_g / 1000
                carbon_kg = weight_kg * factor
                
                output.append({
                    "material": class_name,
                    "confidence": round(confidence, 4),
                    "weight_g": round(weight_g, 2),
                    "carbon_kg": round(carbon_kg, 4)
                })
                
            return output
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            return {"error": str(e)}

# Global predictor instance
_predictor = None

def get_predictor():
    """Get global predictor instance"""
    global _predictor
    if _predictor is None:
        _predictor = ModelPredictor()
    return _predictor

def predict(image_path):
    """
    Main entry point for API
    """
    return get_predictor().predict_all(image_path)