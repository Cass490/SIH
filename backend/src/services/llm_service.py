import google.generativeai as genai
from src.core.config import GEMINI_API_KEY

# Configure the Gemini client
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
llm = genai.GenerativeModel('gemini-2.5-pro')

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
    
    # ... (existing imports and generate_conversational_response function)

def generate_chat_response(farm_details: dict, user_message: str, chat_history: list = None) -> str:
    """
    Handles a conversational follow-up question from the user.
    """
    
    # For a more advanced system, you would pass the whole chat history.
    # For our prototype, we'll keep the prompt focused on the new question.
    
    prompt = f"""
    You are an expert agricultural advisor named 'Agri-Friend'.
    You are in a conversation with a farmer about their farm named '{farm_details['farm_name']}'.
    
    Here is some context about their farm based on our last analysis:
    - Soil N: {farm_details['soil_properties']['N']}
    - Soil P: {farm_details['soil_properties']['P']}
    - Soil K: {farm_details['soil_properties']['K']}
    - Soil pH: {farm_details['soil_properties']['ph']}
    - Location: {farm_details['location']['coordinates']}
    
    The farmer's new question is: "{user_message}"
    
    Your task is to provide a helpful, concise, and simple answer to this specific question.
    If the question is about a crop, provide actionable advice.
    If the question is unrelated to farming, politely state that you can only help with agricultural topics.
    
    Generate the response now.
    """
    
    try:
        response = llm.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error communicating with Gemini API during chat: {e}")
        return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment."