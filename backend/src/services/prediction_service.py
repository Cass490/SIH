import pickle
import pandas as pd
import xgboost
import os

# --- Load Models and Encoders ONCE when the server starts ---
# This is efficient because you don't reload them on every request.
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'crop_recommendation_model_final.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'label_encoder_final.pkl')

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ XGBoost Model loaded successfully.")

    with open(ENCODER_PATH, 'rb') as f:
        encoder = pickle.load(f)
    print("✅ Label Encoder loaded successfully.")

except FileNotFoundError:
    print("⚠️ Error: Model or encoder files not found. Make sure they are in the backend/models/ directory.")
    model = None
    encoder = None

# --- The Prediction Function ---
def get_crop_recommendation(N: int, P: int, K: int, temperature: float, humidity: float, ph: float, rainfall: float) -> dict:
    """
    Takes soil and weather data, returns top 3 crop recommendations.
    """
    if model is None or encoder is None:
        return {"error": "Model not loaded. Check server logs."}

    # Create a DataFrame in the exact format the model was trained on
    input_data = pd.DataFrame({
        'N': [N], 'P': [P], 'K': [K],
        'temperature': [temperature], 'humidity': [humidity],
        'ph': [ph], 'rainfall': [rainfall]
    })

    # Get prediction probabilities for all classes
    pred_proba = model.predict_proba(input_data)[0]
    
    # Get top 3 recommendations
    top_3_indices = pred_proba.argsort()[-3:][::-1]
    top_3_crops = encoder.inverse_transform(top_3_indices)
    top_3_confidence = [pred_proba[i] * 100 for i in top_3_indices]

    # Format the result
    recommendations = []
    for crop, confidence in zip(top_3_crops, top_3_confidence):
        recommendations.append({
            "crop": crop,
            "confidence": f"{confidence:.2f}%"
        })

    return {
        "best_recommendation": recommendations[0],
        "other_recommendations": recommendations[1:]
    }