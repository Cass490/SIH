from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable

# Initialize the geolocator. The user_agent is important to identify your app.
geolocator = Nominatim(user_agent="sih_green_waves_app_v1")

def get_coords_from_address(village: str, district: str, pincode: str) -> dict:
    """Converts a text address to approximate latitude and longitude."""
    # Construct a query string. Adding "India" makes it more specific.
    query = f"{village}, {district}, {pincode}, India"
    print(f"Geocoding query: {query}")

    try:
        # Geocode the location with a timeout of 10 seconds
        location = geolocator.geocode(query, timeout=10)
        
        if location:
            return {
                "latitude": location.latitude,
                "longitude": location.longitude
            }
        else:
            # Try a less specific query if the first one fails
            query_less_specific = f"{district}, {pincode}, India"
            print(f"Trying less specific query: {query_less_specific}")
            location = geolocator.geocode(query_less_specific, timeout=10)
            if location:
                 return {
                    "latitude": location.latitude,
                    "longitude": location.longitude
                }
            return {"error": f"Location not found for query: {query}"}

    except (GeocoderTimedOut, GeocoderUnavailable) as e:
        print(f"Geocoding service error: {e}")
        return {"error": "Geocoding service is unavailable. Please try again."}