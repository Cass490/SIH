import google.generativeai as genai
from src.core.config import GEMINI_API_KEY

# Configure the Gemini client
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
llm = genai.GenerativeModel('gemini-pro')

def generate_conversational_response(xgboost_output: dict, farm_details: dict) -> str:
    """
    Takes the raw XGBoost model output and farm details,
    and returns a user-friendly, conversational response from the LLM.
    """
    
    # Extract the key information from the model's prediction
    best_crop = xgboost_output['best_recommendation']['crop']
    best_confidence = xgboost_output['best_recommendation']['confidence']
    other_crops = [rec['crop'] for rec in xgboost_output['other_recommendations']]
    
    # Craft a detailed, structured prompt for the LLM
    prompt = f"""
    You are an expert agricultural advisor named 'Agri-Friend'.
    A farmer has requested a crop recommendation for their farm named '{farm_details['farm_name']}'.
    
    My machine learning model has analyzed their soil and local weather.
    The model's top recommendation is: {best_crop} with a confidence score of {best_confidence}.
    Other good options are: {', '.join(other_crops)}.
    
    Your task is to create a personalized and encouraging response for the farmer.
    Follow these instructions:
    1.  Start with a friendly greeting.
    2.  Clearly state the top recommended crop ({best_crop}).
    3.  Explain in simple, easy-to-understand terms *why* this crop is a good choice. (You can infer reasons, e.g., "This crop is likely a good match for your soil's nutrient profile and the local climate.")
    4.  Briefly mention the other good options.
    5.  Provide two actionable, simple "Quick Tips" for the recommended crop.
    6.  End with an encouraging closing statement and ask if they need more help.
    
    Generate the response now.
    """
    
    try:
        response = llm.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error communicating with Gemini API: {e}")
        return "Our AI advisor is currently unavailable, but our model recommends: " + best_crop