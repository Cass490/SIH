import httpx
from src.core.config import WEATHERAPI_COM_KEY # We will add this to the config

async def get_weather_forecast(latitude: float, longitude: float, days: int = 1) -> dict:
    """
    Fetches weather forecast data from WeatherAPI.com asynchronously.
    """
    if not WEATHERAPI_COM_KEY:
        print("⚠️ WARNING: WEATHERAPI_COM_KEY not set. Returning dummy data.")
        return {"error": "API key not configured."}

    url = "http://api.weatherapi.com/v1/forecast.json"
    # WeatherAPI.com can use lat,lon directly, which is better than city name.
    location_query = f"{latitude},{longitude}"
    
    params = {
        "key": WEATHERAPI_COM_KEY,
        "q": location_query,
        "days": days
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status() 
            return response.json()
        except httpx.RequestError as e:
            print(f"Error fetching forecast from WeatherAPI.com: {e}")
            return None

def parse_current_weather(forecast_data: dict) -> dict:
    """
    Parses the full forecast data to get just the essential CURRENT weather conditions
    needed for our XGBoost model.
    """
    if not forecast_data or 'current' not in forecast_data:
        return {"error": "Invalid weather data format."}
    
    current = forecast_data['current']
    
    return {
        "temperature": current.get('temp_c'),
        "humidity": current.get('humidity'),
        # Your model needs 'rainfall'. We'll use precipitation in mm.
        "rainfall": current.get('precip_mm')
    }