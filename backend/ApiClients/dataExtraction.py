import json
from geopy.geocoders import Nominatim

from weatherAPI import get_weather_forecast, parse_weather_forecast
from soilgridsAPI import get_and_parse_soil_data
from translationAPI import translate_text

def get_coordinates_from_city(city_name: str):
    geolocator = Nominatim(user_agent="green_waves_app_v1")
    try:
        location = geolocator.geocode(city_name + ", Jharkhand, India")
        if location:
            int_latitude = int(location.latitude)
            int_longitude = int(location.longitude)
            return (int_latitude, int_longitude)
        else:
            print(f"Geocoding failed for {city_name}. Location not found.")
            return (None, None)
    except Exception as e:
        print(f"An error occurred during geocoding: {e}")
        return (None, None)

def main():
    # Translation api
    english_text = input("Please enter the English text you want to translate:\n> ")

    while True:
        choice = input("\nChoose a language to translate to:\n1. Hindi\n2. Santali\n:")
        if choice == '1':
            target_code = "hi-IN"
            break
        elif choice == '2':
            target_code = "sd-IN"
            break
        else:
            print("Invalid choice")

    translated_output = translate_text(english_text, target_code)
    print(f"Translated Text: {translated_output}\n")
    # backup
    city_name = "Ranchi"
    fallback_coords = (23.0, 85.0) 
    forecast_days = 1
    latitude, longitude = get_coordinates_from_city(city_name)
    
    # using backup coordinates if geopy didnt work
    if latitude is None or longitude is None:
        coordinates = fallback_coords
        latitude, longitude = fallback_coords
    else:
        coordinates = (latitude, longitude)
        
    consolidated_data = {
        "location": {"city": city_name, "latitude": latitude, "longitude": longitude},
        "soil_properties": None, "weather_forecast": None
    }
    # getting soil data
    print("Soil Information: ")
    soil_data = get_and_parse_soil_data(coordinates)

    # trying backup coords
    if not soil_data:
        soil_data = get_and_parse_soil_data(fallback_coords)

    consolidated_data["soil_properties"] = soil_data
    
    # if consolidated_data["soil_properties"]:
    #     print("Soil data receieved")
    # else:
    #     print("Backup coords failed")

    # Getting weather forecast
    raw_weather_data = get_weather_forecast(city_name, days=forecast_days)
    if raw_weather_data:
        consolidated_data["weather_forecast"] = parse_weather_forecast(raw_weather_data)
    # else:
        # print("Failed to process weather forecast.")

    print(json.dumps(consolidated_data, indent=2))

if __name__ == "__main__":
    main()



        