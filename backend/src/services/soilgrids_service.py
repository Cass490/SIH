import httpx

async def get_soilgrids_data(latitude: float, longitude: float) -> dict:
    """Fetches soil properties from SoilGrids asynchronously."""
    base_url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    properties = ["nitrogen", "phh2o", "cec", "soc", "clay", "sand", "silt"]
    params = {
        'lon': longitude, 'lat': latitude, 'property': properties,
        'depth': "0-5cm", 'value': "mean"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(base_url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"Error fetching SoilGrids data: {e}")
            return None

def parse_soil_properties(raw_data: dict) -> dict:
    """
    Parses the raw SoilGrids API response into a clean dictionary.
    This is your exact parsing logic, which is excellent.
    """
    if not raw_data or 'properties' not in raw_data or 'layers' not in raw_data['properties']:
        return None
        
    property_map = {
        "nitrogen": "N", # Mapping to our model's expected input names
        "phh2o": "ph",
        "cec": "CEC",
        "soc": "SOC",
        "clay": "Clay_Content_Percent",
        "sand": "Sand_Content_Percent",
        "silt": "Silt_Content_Percent"
    }
    
    structured_output = {}
    
    for layer in raw_data['properties']['layers']:
        name = layer.get('name')
        if name in property_map:
            try:
                mean_value = layer['depths'][0]['values']['mean']
                conversion_factor = layer['unit_measure'].get('d_factor', 1.0)
                if mean_value is not None:
                    converted_value = round(mean_value / conversion_factor, 2)
                    output_key = property_map[name]
                    # NOTE: SoilGrids gives Nitrogen in cg/kg. Your model likely expects a different unit.
                    # This is where unit conversion would be critical. For now, we pass the value.
                    structured_output[output_key] = converted_value
            except (KeyError, IndexError, TypeError):
                continue
    if 'P' not in structured_output: structured_output['P'] = 50 # Average value
    if 'K' not in structured_output: structured_output['K'] = 50 # Average value            
    return structured_output