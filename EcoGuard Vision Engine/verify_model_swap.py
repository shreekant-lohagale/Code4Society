import sys
from pathlib import Path

# Add current directory to path so we can import predictor
sys.path.append(str(Path(__file__).resolve().parent))

from predictor import get_predictor
import numpy as np

def test_lifestyle_prediction():
    print("--- Testing Lifestyle Model Loading ---")
    try:
        predictor = get_predictor()
        model = predictor._get_lifestyle()
        print(f"Model loaded: {type(model)}")
        
        # Mock features (20 normalized values)
        mock_features = [0.5] * 20
        result = predictor.predict_lifestyle_carbon(mock_features)
        
        print("\nPrediction Result:")
        print(f"Success: {result.get('success')}")
        print(f"Monthly Carbon (kg): {result.get('monthly_carbon_kg')}")
        print(f"Yearly Carbon (kg): {result.get('yearly_carbon_kg')}")
        print(f"Recommendation: {result.get('recommendation')}")
        
        if result.get('success'):
            print("\n✅ Verification Successful!")
        else:
            print("\n❌ Verification Failed: Result was not successful.")
            
    except Exception as e:
        print(f"\n❌ Error during verification: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_lifestyle_prediction()
