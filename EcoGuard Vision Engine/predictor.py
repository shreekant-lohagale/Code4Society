"""
EcoGuard - Vision Engine Predictor
Handles all AI model predictions (Vision, Weight, Carbon, Lifestyle)
Optimized for 512MB RAM with Lazy Loading
Aligned with Frontend Integration Guide 🎨
"""

import os
import json
import pickle
import numpy as np
from pathlib import Path
import logging
import gc

logger = logging.getLogger(__name__)

class ModelPredictor:
    """
    Central predictor class that loads and manages all models
    """
    
    def __init__(self, models_path=None):
        """
        Initialize predictor with path
        Args:
            models_path: Path to models directory
        """
        if models_path is None:
            models_path = Path(__file__).resolve().parent / "models"
        self.models_path = Path(models_path)
        self.vision_model = None
        self.weight_estimator = None
        self.weight_config = None
        self.lifestyle_model = None
        
        # Load small config only
        self._load_weight_config()
        
        self.emission_factors = {
            'plastic': 2.5,
            'glass': 1.8,
            'metal': 8.0,
            'paper': 1.0,
            'cardboard': 0.9,
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

    def _load_weight_config(self):
        """Small config load"""
        config_path = self.models_path / 'weight_model' / 'weight_estimator_config.json'
        if config_path.exists():
            try:
                with open(config_path, 'r') as f:
                    self.weight_config = json.load(f)
                logger.info("✓ Weight Config loaded")
            except Exception as e:
                logger.error(f"Failed to load weight config: {e}")

    def _get_vision(self):
        """Lazy load YOLOv8"""
        if self.vision_model is None:
            gc.collect() # Clean up before heavy load
            from ultralytics import YOLO
            vision_path = self.models_path / 'vision_model' / 'best.pt'
            if vision_path.exists():
                logger.info("Loading Vision Model (YOLOv8)...")
                self.vision_model = YOLO(str(vision_path))
            else:
                raise Exception(f"Vision model missing at {vision_path}")
        return self.vision_model

    def _get_lifestyle(self):
        """Lazy load Lifestyle model"""
        if self.lifestyle_model is None:
            gc.collect()
            import joblib
            lifestyle_path = self.models_path / 'lifestyle_model' / 'best_ml_model.joblib'
            if lifestyle_path.exists():
                logger.info("Loading Lifestyle Model...")
                self.lifestyle_model = joblib.load(str(lifestyle_path))
            else:
                raise Exception(f"Lifestyle model missing at {lifestyle_path}")
        return self.lifestyle_model

    def _get_weight(self):
        """Lazy load weight estimator"""
        if self.weight_estimator is None:
            weight_path = self.models_path / 'weight_model' / 'weight_estimator.pkl'
            if weight_path.exists():
                logger.info("Loading Weight Estimator...")
                with open(weight_path, 'rb') as f:
                    self.weight_estimator = pickle.load(f)
            else:
                logger.warning("Weight estimator .pkl missing, will use rule-based fallback from config")
        return self.weight_estimator
    
    def detect_objects(self, image_path):
        """
        Detect objects in image using YOLOv8
        Returns: Dictionary with detections and image_shape
        """
        model = self._get_vision()
        
        try:
            results = model(image_path, conf=0.25)
            detections = []
            for result in results:
                for box in result.boxes:
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                    
                    detections.append({
                        'class_id': class_id,
                        'class_name': self.class_names.get(class_id, 'unknown'),
                        'confidence': round(confidence, 4),
                        'bbox': {
                            'x1': round(bbox[0], 2),
                            'y1': round(bbox[1], 2),
                            'x2': round(bbox[2], 2),
                            'y2': round(bbox[3], 2)
                        }
                    })
            
            return {
                'success': True,
                'detections': detections,
                'count': len(detections),
                'model': 'YOLOv8 Nano',
                'accuracy': '96.1%',
                'image_shape': [results[0].orig_shape[0], results[0].orig_shape[1], 3] if len(results) > 0 else [640, 640, 3]
            }
        
        except Exception as e:
            logger.error(f"Error in object detection: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def estimate_weight(self, bbox, class_name, image_shape):
        """
        Estimate object weight using rule-based formula from config
        """
        try:
            if self.weight_config is None:
                raise Exception("Weight config not loaded")
            
            # Extract bbox coordinates
            x1, y1, x2, y2 = bbox['x1'], bbox['y1'], bbox['x2'], bbox['y2']
            bbox_area = (x2 - x1) * (y2 - y1)
            image_area = image_shape[0] * image_shape[1]
            area_ratio = bbox_area / image_area if image_area > 0 else 0
            
            base_weights = self.weight_config['base_weights']
            reference_ratio = self.weight_config.get('reference_area_ratio', 0.15)
            min_weight = self.weight_config.get('min_weight_g', 5)
            max_weight = self.weight_config.get('max_weight_g', 5000)
            
            base_weight = base_weights.get(class_name, 30)
            weight_g = base_weight * (area_ratio / reference_ratio)
            weight_g = max(min_weight, min(weight_g, max_weight))
            weight_kg = weight_g / 1000
            
            size_category = 'Medium'
            if area_ratio < 0.1: size_category = 'Small'
            elif area_ratio > 0.4: size_category = 'Large'
            
            return {
                'success': True,
                'weight_g': round(weight_g, 2),
                'weight_kg': round(weight_kg, 4),
                'material': class_name,
                'size_category': size_category,
                'explanation': f'Base {class_name} = {base_weight}g. Area ratio: {round(area_ratio, 4)}'
            }
        except Exception as e:
            logger.error(f"Error in weight estimation: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def calculate_carbon(self, weight_kg, material):
        """
        Calculate CO2 emissions using LCA factors
        """
        try:
            factor = self.emission_factors.get(material, 2.0)
            carbon_kg = weight_kg * factor
            carbon_g = carbon_kg * 1000
            
            return {
                'success': True,
                'material': material,
                'weight_kg': round(weight_kg, 4),
                'carbon_kg': round(carbon_kg, 4),
                'carbon_g': round(carbon_g, 2)
            }
        except Exception as e:
            logger.error(f"Error in carbon calculation: {str(e)}")
            return {'success': False, 'error': str(e)}

    def analyze_image(self, image_path):
        """
        Single unified entry point for combined vision, weight, and carbon impact analysis.
        Aligned with Frontend Integration Guide Pipeline 1.
        """
        vision_result = self.detect_objects(image_path)
        if not vision_result.get('success'):
            return vision_result
            
        detections = vision_result.get('detections', [])
        img_shape = vision_result.get('image_shape', [640, 640, 3])
        
        enriched_detections = []
        for det in detections:
            class_name = det['class_name']
            
            # 1. Weight Estimation
            weight_res = self.estimate_weight(det['bbox'], class_name, img_shape)
            weight_g = weight_res.get('weight_g', 30.0)
            weight_kg = weight_res.get('weight_kg', 0.03)
            size_category = weight_res.get('size_category', 'Medium')
            
            # 2. Carbon Calculation
            carbon_res = self.calculate_carbon(weight_kg, class_name)
            carbon_g = carbon_res.get('carbon_g', 50.0)
            
            # Enhance detection with metrics
            det['weight_g'] = weight_g
            det['carbon_g'] = carbon_g
            det['size_category'] = size_category
            
            enriched_detections.append(det)
        
        return {
            'success': True,
            'detections': enriched_detections,
            'image_shape': img_shape
        }
    
    def predict_lifestyle_carbon(self, features):
        """
        Predict user's carbon footprint from lifestyle features.
        Aligned with Frontend Integration Guide Pipeline 2.
        Args:
            features: List of 20 normalized floats (0.0 to 1.0)
        """
        try:
            model = self._get_lifestyle()
            
            # De-normalize features based on known categories
            # Note: This is an approximation of the model's categorical mapping
            # Assuming most categories have 3-4 options (max index 2-3)
            # BodyType (4), Sex (2), Diet (4), Shower (4), Heating (4), Transport (3), Vehicle (6)
            # We multiply by roughly the expected scale and round to integers
            scales = [3, 1, 3, 3, 3, 2, 5, 2, 1000, 3, 1000, 3, 10, 24, 10, 24, 2, 5, 5, 1]
            denormalized = []
            for i, val in enumerate(features):
                scale = scales[i] if i < len(scales) else 1
                denormalized.append(round(val * scale))
                
            features_array = np.array(denormalized).reshape(1, -1)
            monthly_carbon = float(model.predict(features_array)[0])
            
            average_carbon = 500
            compared_percent = round((monthly_carbon - average_carbon) / average_carbon * 100, 1)
            
            return {
                'success': True,
                'monthly_carbon_kg': round(monthly_carbon, 1),
                'yearly_carbon_kg': round(monthly_carbon * 12, 1),
                'compared_to_average_percent': compared_percent,
                'recommendation': self._get_recommendation(compared_percent)
            }
        except Exception as e:
            logger.error(f"Error in lifestyle prediction: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _get_recommendation(self, compared_percent):
        if compared_percent < -10: return "Great! Your footprint is below average."
        if compared_percent > 10: return "Your footprint is significantly above average. Consider sustainable habit changes."
        return "Good! Your footprint is close to the average."

# Global predictor instance
_predictor = None

def get_predictor(models_path=None):
    global _predictor
    if _predictor is None:
        _predictor = ModelPredictor(models_path)
    return _predictor

def predict(image_path):
    """Legacy entry point for backward compatibility"""
    predictor = get_predictor()
    result = predictor.analyze_image(image_path)
    if not result.get('success'): return []
    return result.get('detections', [])