"""
nitrogen: This is the total nitrogen (N) in the soil, which is a primary nutrient for plants 
phh2o: This represents the soil's pH, a crucial factor that affects how available nutrients are to crops 
cec: Cation Exchange Capacity is a key indicator of soil fertility and the soil's ability to hold onto nutrients 
soc: Soil organic carbon content is considered a fundamental measure of soil health 
clay, sand, and silt: The ratio of these particles defines the soil's texture, which in turn affects water retention and the ability of roots to grow 
Depth Interval
The recommended depth interval is the shallowest one because the topsoil is where most root activity and nutrient absorption happens 
0-5cm: This specific interval is chosen because it represents the immediate topsoil, making it the most relevant layer for the model 
Prediction Value
The best statistical value for a reliable input into an AI model is the mean
mean: The documentation specifies that the mean is the "'expected value' and provides an unbiased prediction of the soil property" 
This makes it the most direct and scientifically sound input for making predictions [cite]. The other available values are mainly used to measure uncertainty 
"""

import requests
import json

def get_soilgrids_data(coordinates: tuple):
    # Requesting for required minerals present in the top soil
    lat, lon = coordinates
    base_url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    properties = ["nitrogen", "phh2o", "cec", "soc", "clay", "sand", "silt"]
    params = {
        'lon': lon, 'lat': lat, 'property': properties,
        'depth': "0-5cm", 'value': "mean"
    }
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching SoilGrids data: {e}")
        return None

# This is the new, definitive parsing function.
def parse_soil_properties(raw_data: dict):
    # This function takes the huge api response and parses it into a readable format
    if not raw_data or 'properties' not in raw_data or 'layers' not in raw_data['properties']:
        return None
    property_map = {
        "nitrogen": {"key": "Nitrogen (g/kg)", "unit": "g/kg"},
        "phh2o":    {"key": "Soil pH", "unit": ""},
        "cec":      {"key": "Cation Exchange Capacity (cmol(c)/kg)", "unit": "cmol(c)/kg"},
        "soc":      {"key": "Soil Organic Carbon (g/kg)", "unit": "g/kg"},
        "clay":     {"key": "Clay Content (%)", "unit": "%"},
        "sand":     {"key": "Sand Content (%)", "unit": "%"},
        "silt":     {"key": "Silt Content (%)", "unit": "%"}
    }
    
    structured_output = {}
    
    # Process each layer from the repsonse from the api
    for layer in raw_data['properties']['layers']:
        name = layer.get('name')
        if name in property_map:
            # Safely extract the mean value and the conversion factor
            try:
                mean_value = layer['depths'][0]['values']['mean']
                conversion_factor = layer['unit_measure'].get('d_factor', 1.0)
                
                if mean_value is not None:
                    # Calculate the value in its conventional unit
                    converted_value = round(mean_value / conversion_factor, 2)
                    
                    # Get the descriptive key from our map
                    output_key = property_map[name]["key"]
                    structured_output[output_key] = converted_value
            except (KeyError, IndexError, TypeError):
                continue
                
    return structured_output
def get_and_parse_soil_data(coordinates: tuple):
    raw_soil_data = get_soilgrids_data(coordinates)
    if raw_soil_data:
        parsed_data = parse_soil_properties(raw_soil_data)
        return parsed_data
    return None
if __name__ == "__main__":
    working_coords = (23.0, 85.0) 

    raw_soil_data = get_soilgrids_data(working_coords)
    
    if raw_soil_data:
        llm_ready_data = parse_soil_properties(raw_soil_data)
        
        # Print the final, clean output
        print(json.dumps(llm_ready_data, indent=2))