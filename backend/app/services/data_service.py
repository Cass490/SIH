"""
Data service for integrating external APIs and data sources
"""

import httpx
import asyncio
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from loguru import logger

from app.core.config import settings


class DataService:
    """Service for fetching data from external sources"""
    
    def __init__(self):
        self.soil_grids_url = settings.SOIL_GRIDS_API_URL
        self.weather_api_key = settings.OPENWEATHER_API_KEY
        self.bhuvan_api_key = settings.BHUVAN_API_KEY
    
    async def get_soil_data(self, latitude: float, longitude: float) -> Dict:
        """
        Fetch soil data from SoilGrids API
        """
        try:
            url = f"{self.soil_grids_url}/properties/query"
            params = {
                "lon": longitude,
                "lat": latitude,
                "property": ["phh2o", "nitrogen", "soc", "sand", "clay"],  # pH, nitrogen, organic carbon, sand, clay
                "depth": "0-30cm",
                "value": "mean"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                # Process soil data
                soil_properties = {}
                for prop in data.get("properties", []):
                    name = prop.get("name")
                    depths = prop.get("depths", [])
                    if depths:
                        soil_properties[name] = depths[0].get("values", {}).get("mean", 0)
                
                # Convert to standard format
                processed_data = {
                    "ph": soil_properties.get("phh2o", 7.0) / 10.0,  # Convert from pH*10
                    "nitrogen": soil_properties.get("nitrogen", 1000) / 100.0,  # Convert from cg/kg to g/kg
                    "organic_carbon": soil_properties.get("soc", 100) / 10.0,  # Convert from dg/kg to g/kg
                    "sand_percentage": soil_properties.get("sand", 300) / 10.0,  # Convert from g/kg to %
                    "clay_percentage": soil_properties.get("clay", 200) / 10.0,  # Convert from g/kg to %
                    "source": "SoilGrids",
                    "fetch_time": datetime.utcnow().isoformat()
                }
                
                logger.info(f"Fetched soil data for coordinates ({latitude}, {longitude})")
                return processed_data
                
        except Exception as e:
            logger.error(f"Error fetching soil data: {str(e)}")
            # Return default soil data if API fails
            return {
                "ph": 6.5,
                "nitrogen": 10.0,
                "organic_carbon": 15.0,
                "sand_percentage": 40.0,
                "clay_percentage": 30.0,
                "source": "default",
                "fetch_time": datetime.utcnow().isoformat(),
                "error": str(e)
            }
    
    async def get_weather_forecast(self, latitude: float, longitude: float, days: int = 7) -> Dict:
        """
        Fetch weather forecast from OpenWeatherMap API
        """
        try:
            if not self.weather_api_key:
                raise ValueError("Weather API key not configured")
            
            # Current weather
            current_url = "https://api.openweathermap.org/data/2.5/weather"
            current_params = {
                "lat": latitude,
                "lon": longitude,
                "appid": self.weather_api_key,
                "units": "metric"
            }
            
            # Forecast
            forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
            forecast_params = {
                "lat": latitude,
                "lon": longitude,
                "appid": self.weather_api_key,
                "units": "metric",
                "cnt": 40  # 5-day forecast with 3-hour intervals
            }
            
            async with httpx.AsyncClient() as client:
                current_response = await client.get(current_url, params=current_params)
                forecast_response = await client.get(forecast_url, params=forecast_params)
                
                current_response.raise_for_status()
                forecast_response.raise_for_status()
                
                current_data = current_response.json()
                forecast_data = forecast_response.json()
                
                # Process weather data
                processed_data = {
                    "current": {
                        "temperature": current_data["main"]["temp"],
                        "humidity": current_data["main"]["humidity"],
                        "pressure": current_data["main"]["pressure"],
                        "description": current_data["weather"][0]["description"],
                        "wind_speed": current_data["wind"]["speed"],
                        "rainfall": current_data.get("rain", {}).get("1h", 0)
                    },
                    "forecast": [],
                    "summary": {
                        "avg_temperature": 0,
                        "total_rainfall": 0,
                        "avg_humidity": 0,
                        "max_wind_speed": 0
                    },
                    "source": "OpenWeatherMap",
                    "fetch_time": datetime.utcnow().isoformat()
                }
                
                # Process forecast
                temps, humidity, rainfall, wind_speeds = [], [], [], []
                
                for item in forecast_data["list"]:
                    forecast_item = {
                        "datetime": item["dt_txt"],
                        "temperature": item["main"]["temp"],
                        "humidity": item["main"]["humidity"],
                        "description": item["weather"][0]["description"],
                        "rainfall": item.get("rain", {}).get("3h", 0),
                        "wind_speed": item["wind"]["speed"]
                    }
                    processed_data["forecast"].append(forecast_item)
                    
                    temps.append(item["main"]["temp"])
                    humidity.append(item["main"]["humidity"])
                    rainfall.append(item.get("rain", {}).get("3h", 0))
                    wind_speeds.append(item["wind"]["speed"])
                
                # Calculate summary
                processed_data["summary"] = {
                    "avg_temperature": sum(temps) / len(temps) if temps else 0,
                    "total_rainfall": sum(rainfall),
                    "avg_humidity": sum(humidity) / len(humidity) if humidity else 0,
                    "max_wind_speed": max(wind_speeds) if wind_speeds else 0
                }
                
                logger.info(f"Fetched weather data for coordinates ({latitude}, {longitude})")
                return processed_data
                
        except Exception as e:
            logger.error(f"Error fetching weather data: {str(e)}")
            # Return default weather data if API fails
            return {
                "current": {
                    "temperature": 25.0,
                    "humidity": 65,
                    "pressure": 1013,
                    "description": "partly cloudy",
                    "wind_speed": 5.0,
                    "rainfall": 0
                },
                "forecast": [],
                "summary": {
                    "avg_temperature": 25.0,
                    "total_rainfall": 10.0,
                    "avg_humidity": 65.0,
                    "max_wind_speed": 8.0
                },
                "source": "default",
                "fetch_time": datetime.utcnow().isoformat(),
                "error": str(e)
            }
    
    async def get_market_data(self, latitude: float, longitude: float) -> Dict:
        """
        Fetch market prices and demand data
        """
        try:
            # This would integrate with agricultural market APIs
            # For now, returning mock data structure
            
            # In a real implementation, this might call:
            # - Government agricultural market APIs
            # - Commodity exchange APIs
            # - Local market data providers
            
            market_data = {
                "prices": {
                    "rice": {"price_per_kg": 25.0, "trend": "stable", "demand": "high"},
                    "wheat": {"price_per_kg": 22.0, "trend": "increasing", "demand": "medium"},
                    "corn": {"price_per_kg": 18.0, "trend": "decreasing", "demand": "low"},
                    "soybeans": {"price_per_kg": 40.0, "trend": "stable", "demand": "high"},
                    "cotton": {"price_per_kg": 35.0, "trend": "increasing", "demand": "medium"},
                    "sugarcane": {"price_per_ton": 3000.0, "trend": "stable", "demand": "high"},
                    "tomatoes": {"price_per_kg": 30.0, "trend": "volatile", "demand": "high"},
                    "onions": {"price_per_kg": 20.0, "trend": "stable", "demand": "medium"}
                },
                "market_trends": {
                    "seasonal_demand": "high",
                    "export_opportunities": ["rice", "soybeans"],
                    "price_volatility": "medium",
                    "supply_shortage": ["tomatoes"]
                },
                "regional_factors": {
                    "transportation_cost": "medium",
                    "storage_facilities": "available",
                    "processing_units": "nearby"
                },
                "source": "market_simulation",
                "fetch_time": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Generated market data for coordinates ({latitude}, {longitude})")
            return market_data
            
        except Exception as e:
            logger.error(f"Error fetching market data: {str(e)}")
            return {
                "error": str(e),
                "source": "error",
                "fetch_time": datetime.utcnow().isoformat()
            }
    
    async def get_satellite_imagery(self, latitude: float, longitude: float, 
                                  start_date: str, end_date: str) -> Dict:
        """
        Fetch satellite imagery data (placeholder for Bhuvan API integration)
        """
        try:
            # This would integrate with Bhuvan or other satellite APIs
            # For now, returning mock structure
            
            satellite_data = {
                "ndvi": 0.7,  # Normalized Difference Vegetation Index
                "moisture_index": 0.6,
                "land_surface_temperature": 28.5,
                "cloud_cover": 15.0,
                "imagery_date": datetime.utcnow().isoformat(),
                "resolution": "10m",
                "source": "bhuvan_simulation",
                "fetch_time": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Generated satellite data for coordinates ({latitude}, {longitude})")
            return satellite_data
            
        except Exception as e:
            logger.error(f"Error fetching satellite data: {str(e)}")
            return {
                "error": str(e),
                "source": "error",
                "fetch_time": datetime.utcnow().isoformat()
            }