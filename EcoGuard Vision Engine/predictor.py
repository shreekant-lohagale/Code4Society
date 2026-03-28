"""
EcoGuard - Model Predictor
Handles all AI model predictions (Vision, Weight, Carbon, Lifestyle)
"""

import json
import pickle
import numpy as np
from pathlib import Path
import logging

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
        
        # Load config only (small)
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
            except:
                logger.error("Failed to load weight config")

    def _get_vision(self):
        """Lazy load YOLO"""
        if self.vision_model is None:
            import gc
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
            import gc
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
                # Optional, can fallback to config-only
                pass
        return self.weight_estimator
    
    def detect_objects(self, image_path):
        """
        Detect objects in image using YOLOv8
        Args:
            image_path: Path to image file
        Returns:
            Dictionary with detections
        """
        # Lazy load vision model
        model = self._get_vision()
        
        try:
            # Run inference
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
                'accuracy': '96.1%'
            }
        
        except Exception as e:
            logger.error(f"Error in object detection: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def estimate_weight(self, bbox, class_name, image_shape):
        """
        Estimate object weight using rule-based formula
        Args:
            bbox: Bounding box [x1, y1, x2, y2]
            class_name: Material class name
            image_shape: Image shape [height, width, channels]
        Returns:
            Dictionary with weight estimation
        """
        try:
            if self.weight_config is None:
                raise Exception("Weight config not loaded")
            
            # Extract bbox coordinates
            x1, y1, x2, y2 = bbox['x1'], bbox['y1'], bbox['x2'], bbox['y2']
            
            # Calculate bbox area
            bbox_width = x2 - x1
            bbox_height = y2 - y1
            bbox_area = bbox_width * bbox_height
            
            # Calculate image area
            image_height, image_width = image_shape[0], image_shape[1]
            image_area = image_height * image_width
            
            # Calculate area ratio
            area_ratio = bbox_area / image_area if image_area > 0 else 0
            
            # Get base weight and reference ratio from config
            base_weights = self.weight_config['base_weights']
            reference_ratio = self.weight_config['reference_area_ratio']
            min_weight = self.weight_config['min_weight_g']
            max_weight = self.weight_config['max_weight_g']
            
            # Get base weight for material
            base_weight = base_weights.get(class_name, 30)  # Default to 30g
            
            # Calculate weight using formula
            weight_g = base_weight * (area_ratio / reference_ratio)
            
            # Apply limits
            weight_g = max(min_weight, min(weight_g, max_weight))
            weight_kg = weight_g / 1000
            
            # Determine size category
            if area_ratio < 0.1:
                size_category = 'small (<10% of image)'
            elif area_ratio < 0.25:
                size_category = 'small-medium (10-25% of image)'
            elif area_ratio < 0.5:
                size_category = 'medium (25-50% of image)'
            else:
                size_category = 'large (>50% of image)'
            
            return {
                'success': True,
                'weight_g': round(weight_g, 2),
                'weight_kg': round(weight_kg, 4),
                'material': class_name,
                'size_category': size_category,
                'confidence': 'high',
                'explanation': f'Base {class_name} = {base_weight}g. Size is {size_category.lower()}. Adjusted weight: {round(weight_g, 2)}g'
            }
        
        except Exception as e:
            logger.error(f"Error in weight estimation: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def calculate_carbon(self, weight_kg, material):
        """
        Calculate CO2 emissions using LCA factors
        Args:
            weight_kg: Weight in kilograms
            material: Material type
        Returns:
            Dictionary with carbon impact
        """
        try:
            # Get emission factor for material
            emission_factor = self.emission_factors.get(material, 2.0)
            
            # Calculate CO2
            carbon_kg = weight_kg * emission_factor
            carbon_g = carbon_kg * 1000
            
            # Calculate recycling impact (70% reduction when recycled)
            recycling_reduction_percent = 70.0
            if_recycled_co2_kg = carbon_kg * (1 - recycling_reduction_percent / 100)
            co2_saved_kg = carbon_kg - if_recycled_co2_kg
            
            return {
                'success': True,
                'material': material,
                'weight_kg': round(weight_kg, 4),
                'carbon_kg': round(carbon_kg, 4),
                'carbon_g': round(carbon_g, 2),
                'emission_factor': emission_factor,
                'recycling_reduction_percent': recycling_reduction_percent,
                'if_recycled_co2_kg': round(if_recycled_co2_kg, 4),
                'co2_saved_kg': round(co2_saved_kg, 4)
            }
        
        except Exception as e:
            logger.error(f"Error in carbon calculation: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def predict_lifestyle_carbon(self, features):
        """
        Predict user's carbon footprint from lifestyle features
        Args:
            features: List of 20 lifestyle features
        Returns:
            Dictionary with carbon prediction
        """
        try:
            # Lazy load lifestyle model
            model = self._get_lifestyle()
            
            if len(features) != 20:
                raise ValueError(f"Expected 20 features, got {len(features)}")
            
            # Convert to numpy array
            features_array = np.array(features).reshape(1, -1)
            
            # Predict
            monthly_carbon = float(model.predict(features_array)[0])
            yearly_carbon = monthly_carbon * 12
            daily_average = monthly_carbon / 30
            
            # Compare to average (assuming average is ~500 kg/month)
            average_carbon = 500
            compared_percent = round((monthly_carbon - average_carbon) / average_carbon * 100, 1)
            
            return {
                'success': True,
                'monthly_carbon_kg': round(monthly_carbon, 1),
                'yearly_carbon_kg': round(yearly_carbon, 1),
                'daily_average_kg': round(daily_average, 2),
                'compared_to_average_percent': compared_percent,
                'country_average_kg': average_carbon,
                'recommendation': self._get_recommendation(compared_percent)
            }
        
        except Exception as e:
            logger.error(f"Error in lifestyle prediction: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _get_recommendation(self, compared_percent):
        """Generate recommendation based on comparison"""
        if compared_percent < -20:
            return "Excellent! Your carbon footprint is 20%+ below average. You're an environmental leader!"
        elif compared_percent < -10:
            return "Great! Your carbon footprint is 10%+ below average. Keep up the good work!"
        elif compared_percent <= 10:
            return "Good! Your carbon footprint is close to average. Small improvements can help."
        elif compared_percent <= 20:
            return "Your carbon footprint is slightly above average. Consider reducing energy use."
        else:
            return "Your carbon footprint is significantly above average. Major changes recommended."


# Global predictor instance
_predictor = None

def get_predictor(models_path=None):
    """Get or create global predictor instance"""
    global _predictor
    if _predictor is None:
        _predictor = ModelPredictor(models_path)
    return _predictor

def reload_predictor():
    """Reload all models"""
    global _predictor
    _predictor = None
    return get_predictor()

def predict(image_path):
    """
    Legacy entry point for compatibility.
    """
    predictor = get_predictor()
    vision_result = predictor.detect_objects(image_path)
    if not vision_result.get('success'):
        return []
    
    detections = vision_result.get('detections', [])
    output = []
    for det in detections:
        output.append({
            "material": det['class_name'],
            "confidence": det['confidence'],
            "weight_g": 30.0, # Simple fallback
            "carbon_kg": 0.05
        })
    return output