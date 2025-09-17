import requests
import json
from config import settings

WEATHERAPI_BASE_URL = "http://api.weatherapi.com/v1"

def get_weather_forecast(city_name: str, days: int):
    url = f"{WEATHERAPI_BASE_URL}/forecast.json"
    
    params = {
        "key": settings.WEATHERAPI_COM_KEY,
        "q": city_name,
        "days": days
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status() 
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching forecast for {city_name} from WeatherAPI.com: {e}")
        return None

def parse_weather_forecast(forecast_data: dict):
    if not forecast_data or 'forecast' not in forecast_data:
        return []

    cleaned_forecasts = []
    for day_data in forecast_data['forecast']['forecastday']:
        # hourly data processing 
        hourly_list = []
        for hour_data in day_data.get('hour', []):
            hour_info = {
                "time": hour_data.get('time'),
                "temp_c": hour_data.get('temp_c'),
                "precipitation_mm": hour_data.get('precip_mm'),
                "humidity": hour_data.get('humidity'),
                "chance_of_rain": hour_data.get('chance_of_rain'),
                "condition": hour_data.get('condition', {}).get('text')
            }
            hourly_list.append(hour_info)

        day_info = {
            "date": day_data.get('date'),
            # Daily forecast
            "temp_max_c": day_data['day'].get('maxtemp_c'),
            "temp_min_c": day_data['day'].get('mintemp_c'),
            "temp_avg_c": day_data['day'].get('avgtemp_c'),
            "precipitation_mm_total": day_data['day'].get('totalprecip_mm'),
            "avg_humidity": day_data['day'].get('avghumidity'),
            "chance_of_rain_daily": day_data['day'].get('daily_chance_of_rain'),
            "condition_daily": day_data['day']['condition'].get('text'),
            "wind_max_kph": day_data['day'].get('maxwind_kph'),
            # Hourly weather
            "hourly_forecast": hourly_list
        }
        cleaned_forecasts.append(day_info)
        
    return cleaned_forecasts

if __name__ == "__main__":
    city = "Ranchi"
    days_to_forecast = 1 
    
    raw_forecast = get_weather_forecast(city, days=days_to_forecast)
    
    if raw_forecast:
        useful_forecast = parse_weather_forecast(raw_forecast)
        
        print(f"\nForecast for {city} including hourly data")
        print(json.dumps(useful_forecast, indent=2))