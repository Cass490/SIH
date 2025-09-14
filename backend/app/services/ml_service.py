"""
Machine Learning service for crop recommendations and predictions
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, mean_squared_error
from loguru import logger

from app.core.config import settings


class MLService:
    """Machine Learning service for agricultural predictions"""
    
    def __init__(self):
        self.crop_model = None
        self.yield_model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.crops_database = self._initialize_crops_database()
        
        # Try to load pre-trained models
        try:
            self.load_models()
        except Exception as e:
            logger.warning(f"Could not load pre-trained models: {e}")
            self._create_default_models()
    
    def _initialize_crops_database(self) -> Dict:
        """Initialize crops database with characteristics"""
        return {
            "rice": {
                "water_requirement": "high",
                "growth_duration_days": 120,
                "optimal_ph": [5.5, 7.0],
                "optimal_temperature": [20, 35],
                "soil_types": ["clay", "loamy"],
                "season": "monsoon",
                "yield_range": [3.0, 8.0],  # tons per hectare
                "market_price_range": [20, 30]  # per kg
            },
            "wheat": {
                "water_requirement": "medium",
                "growth_duration_days": 150,
                "optimal_ph": [6.0, 7.5],
                "optimal_temperature": [12, 25],
                "soil_types": ["loamy", "sandy_loam"],
                "season": "winter",
                "yield_range": [2.5, 6.0],
                "market_price_range": [18, 25]
            },
            "corn": {
                "water_requirement": "medium",
                "growth_duration_days": 100,
                "optimal_ph": [6.0, 6.8],
                "optimal_temperature": [16, 35],
                "soil_types": ["loamy", "sandy_loam"],
                "season": "summer",
                "yield_range": [4.0, 10.0],
                "market_price_range": [15, 22]
            },
            "soybeans": {
                "water_requirement": "medium",
                "growth_duration_days": 120,
                "optimal_ph": [6.0, 7.0],
                "optimal_temperature": [20, 30],
                "soil_types": ["loamy", "clay_loam"],
                "season": "monsoon",
                "yield_range": [1.5, 4.0],
                "market_price_range": [35, 45]
            },
            "cotton": {
                "water_requirement": "high",
                "growth_duration_days": 180,
                "optimal_ph": [5.8, 8.0],
                "optimal_temperature": [21, 30],
                "soil_types": ["black_soil", "loamy"],
                "season": "monsoon",
                "yield_range": [1.0, 3.0],
                "market_price_range": [30, 40]
            },
            "sugarcane": {
                "water_requirement": "high",
                "growth_duration_days": 365,
                "optimal_ph": [6.5, 7.5],
                "optimal_temperature": [20, 30],
                "soil_types": ["loamy", "clay_loam"],
                "season": "year_round",
                "yield_range": [70, 120],  # tons per hectare
                "market_price_range": [2.5, 4.0]  # per ton
            },
            "tomatoes": {
                "water_requirement": "medium",
                "growth_duration_days": 90,
                "optimal_ph": [6.0, 6.8],
                "optimal_temperature": [18, 27],
                "soil_types": ["loamy", "sandy_loam"],
                "season": "winter",
                "yield_range": [25, 50],
                "market_price_range": [25, 35]
            },
            "onions": {
                "water_requirement": "medium",
                "growth_duration_days": 120,
                "optimal_ph": [6.0, 7.0],
                "optimal_temperature": [13, 24],
                "soil_types": ["loamy", "sandy_loam"],
                "season": "winter",
                "yield_range": [15, 30],
                "market_price_range": [15, 25]
            }
        }
    
    def _create_default_models(self):
        """Create and train basic models with synthetic data"""
        logger.info("Creating default ML models with synthetic data")
        
        # Generate synthetic training data
        n_samples = 1000
        features = []
        crop_labels = []
        yields = []
        
        crops = list(self.crops_database.keys())
        
        for _ in range(n_samples):
            # Random soil and weather parameters
            ph = np.random.normal(6.5, 1.0)
            nitrogen = np.random.normal(15, 5)
            phosphorus = np.random.normal(20, 8)
            potassium = np.random.normal(200, 50)
            temperature = np.random.normal(25, 8)
            rainfall = np.random.normal(800, 300)
            humidity = np.random.normal(65, 15)
            
            # Select random crop and generate corresponding yield
            crop = np.random.choice(crops)
            crop_info = self.crops_database[crop]
            
            # Calculate yield based on conditions
            yield_base = np.random.uniform(*crop_info["yield_range"])
            
            # Adjust yield based on conditions
            ph_optimal = sum(crop_info["optimal_ph"]) / 2
            temp_optimal = sum(crop_info["optimal_temperature"]) / 2
            
            ph_factor = 1 - abs(ph - ph_optimal) / 3
            temp_factor = 1 - abs(temperature - temp_optimal) / 15
            
            final_yield = yield_base * max(0.3, ph_factor * temp_factor)
            
            features.append([ph, nitrogen, phosphorus, potassium, temperature, rainfall, humidity])
            crop_labels.append(crop)
            yields.append(final_yield)
        
        X = np.array(features)
        y_crop = np.array(crop_labels)
        y_yield = np.array(yields)
        
        # Train crop recommendation model
        self.crop_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.crop_model.fit(X, y_crop)
        
        # Train yield prediction model
        self.yield_model = RandomForestRegressor(n_estimators=100, random_state=42)
        
        # Create features for yield prediction (including crop type)
        self.label_encoder.fit(crops)
        crop_encoded = self.label_encoder.transform(y_crop)
        X_yield = np.column_stack([X, crop_encoded])
        
        self.yield_model.fit(X_yield, y_yield)
        
        # Fit scaler
        self.scaler.fit(X)
        
        logger.info("Default models created successfully")
    
    def load_models(self):
        """Load pre-trained models from disk"""
        try:
            self.crop_model = joblib.load(settings.CROP_MODEL_PATH)
            self.yield_model = joblib.load(settings.YIELD_MODEL_PATH)
            logger.info("Models loaded successfully")
        except Exception as e:
            raise Exception(f"Could not load models: {e}")
    
    def save_models(self):
        """Save trained models to disk"""
        try:
            import os
            os.makedirs(os.path.dirname(settings.CROP_MODEL_PATH), exist_ok=True)
            
            joblib.dump(self.crop_model, settings.CROP_MODEL_PATH)
            joblib.dump(self.yield_model, settings.YIELD_MODEL_PATH)
            logger.info("Models saved successfully")
        except Exception as e:
            logger.error(f"Could not save models: {e}")
    
    async def get_crop_recommendations(self, location, soil_data, weather_data, 
                                     market_data, budget=None, previous_crops=None, 
                                     experience="beginner") -> List[Dict]:
        """Generate crop recommendations based on input parameters"""
        try:
            # Prepare features for prediction
            features = self._prepare_features(soil_data, weather_data)
            features_scaled = self.scaler.transform([features])
            
            # Get crop probabilities
            crop_probabilities = self.crop_model.predict_proba(features_scaled)[0]
            crop_classes = self.crop_model.classes_
            
            # Create recommendations
            recommendations = []
            
            # Sort crops by probability
            crop_prob_pairs = list(zip(crop_classes, crop_probabilities))
            crop_prob_pairs.sort(key=lambda x: x[1], reverse=True)
            
            # Generate top 5 recommendations
            for i, (crop, probability) in enumerate(crop_prob_pairs[:5]):
                if crop in self.crops_database:
                    crop_info = self.crops_database[crop]
                    
                    # Predict yield
                    yield_pred = await self._predict_crop_yield(crop, features)
                    
                    # Calculate profit estimation
                    profit = self._calculate_profit(crop, yield_pred, market_data, location.area_hectares)
                    
                    # Calculate sustainability score
                    sustainability = self._calculate_sustainability_score(
                        crop, soil_data, previous_crops or []
                    )
                    
                    # Determine risk level
                    risk_level = self._assess_risk_level(crop, weather_data, market_data, experience)
                    
                    recommendation = {
                        "crop_name": crop.title(),
                        "confidence_score": float(probability),
                        "expected_yield_tons_per_hectare": round(yield_pred, 2),
                        "estimated_profit_per_hectare": round(profit, 2),
                        "sustainability_score": round(sustainability, 2),
                        "water_requirement": crop_info["water_requirement"],
                        "growth_duration_days": crop_info["growth_duration_days"],
                        "market_demand": market_data.get("prices", {}).get(crop, {}).get("demand", "medium"),
                        "risk_level": risk_level
                    }
                    
                    recommendations.append(recommendation)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating crop recommendations: {e}")
            # Return default recommendations
            return [
                {
                    "crop_name": "Rice",
                    "confidence_score": 0.75,
                    "expected_yield_tons_per_hectare": 5.0,
                    "estimated_profit_per_hectare": 50000.0,
                    "sustainability_score": 0.8,
                    "water_requirement": "high",
                    "growth_duration_days": 120,
                    "market_demand": "high",
                    "risk_level": "low"
                }
            ]
    
    async def _predict_crop_yield(self, crop: str, features: List[float]) -> float:
        """Predict yield for a specific crop"""
        try:
            crop_encoded = self.label_encoder.transform([crop])[0]
            yield_features = features + [crop_encoded]
            yield_pred = self.yield_model.predict([yield_features])[0]
            
            # Ensure yield is within reasonable range
            crop_info = self.crops_database.get(crop, {})
            yield_range = crop_info.get("yield_range", [1.0, 10.0])
            yield_pred = max(yield_range[0], min(yield_range[1], yield_pred))
            
            return yield_pred
        except Exception as e:
            logger.error(f"Error predicting yield for {crop}: {e}")
            return 3.0  # Default yield
    
    def _prepare_features(self, soil_data, weather_data) -> List[float]:
        """Prepare feature vector from soil and weather data"""
        # Extract soil features
        ph = soil_data.get("ph", 6.5)
        nitrogen = soil_data.get("nitrogen", 10.0)
        phosphorus = soil_data.get("phosphorus", 20.0)  # Default value
        potassium = soil_data.get("potassium", 200.0)  # Default value
        
        # Extract weather features
        temperature = weather_data.get("summary", {}).get("avg_temperature", 25.0)
        rainfall = weather_data.get("summary", {}).get("total_rainfall", 800.0)
        humidity = weather_data.get("summary", {}).get("avg_humidity", 65.0)
        
        return [ph, nitrogen, phosphorus, potassium, temperature, rainfall, humidity]
    
    def _calculate_profit(self, crop: str, yield_tons: float, market_data: Dict, area_hectares: float) -> float:
        """Calculate estimated profit for a crop"""
        try:
            crop_market_info = market_data.get("prices", {}).get(crop, {})
            
            if crop == "sugarcane":
                price_per_unit = crop_market_info.get("price_per_ton", 3000.0)
                revenue = yield_tons * price_per_unit * area_hectares
            else:
                price_per_kg = crop_market_info.get("price_per_kg", 20.0)
                revenue = yield_tons * 1000 * price_per_kg * area_hectares  # Convert tons to kg
            
            # Estimate costs (simplified)
            crop_info = self.crops_database.get(crop, {})
            base_cost_per_hectare = {
                "high": 30000,  # High water requirement crops
                "medium": 20000,
                "low": 15000
            }.get(crop_info.get("water_requirement", "medium"), 20000)
            
            total_cost = base_cost_per_hectare * area_hectares
            profit = revenue - total_cost
            
            return max(0, profit)  # Ensure non-negative profit
            
        except Exception as e:
            logger.error(f"Error calculating profit for {crop}: {e}")
            return 10000.0  # Default profit
    
    def _calculate_sustainability_score(self, crop: str, soil_data: Dict, previous_crops: List[str]) -> float:
        """Calculate sustainability score based on crop rotation and soil health"""
        try:
            base_score = 0.7
            
            # Crop rotation benefit
            if crop not in previous_crops[-2:]:  # Not grown in last 2 seasons
                base_score += 0.2
            
            # Legume bonus (nitrogen fixation)
            if crop in ["soybeans"]:
                base_score += 0.1
            
            # Soil pH compatibility
            crop_info = self.crops_database.get(crop, {})
            optimal_ph_range = crop_info.get("optimal_ph", [6.0, 7.0])
            current_ph = soil_data.get("ph", 6.5)
            
            if optimal_ph_range[0] <= current_ph <= optimal_ph_range[1]:
                base_score += 0.1
            
            return min(1.0, base_score)
            
        except Exception as e:
            logger.error(f"Error calculating sustainability score: {e}")
            return 0.7  # Default score
    
    def _assess_risk_level(self, crop: str, weather_data: Dict, market_data: Dict, experience: str) -> str:
        """Assess risk level for crop cultivation"""
        try:
            risk_factors = 0
            
            # Weather risk
            avg_temp = weather_data.get("summary", {}).get("avg_temperature", 25)
            crop_info = self.crops_database.get(crop, {})
            temp_range = crop_info.get("optimal_temperature", [20, 30])
            
            if not (temp_range[0] <= avg_temp <= temp_range[1]):
                risk_factors += 1
            
            # Market volatility risk
            crop_market = market_data.get("prices", {}).get(crop, {})
            if crop_market.get("trend") == "volatile":
                risk_factors += 1
            
            # Experience factor
            if experience == "beginner":
                risk_factors += 1
            
            # Determine risk level
            if risk_factors >= 3:
                return "high"
            elif risk_factors >= 2:
                return "medium"
            else:
                return "low"
                
        except Exception as e:
            logger.error(f"Error assessing risk level: {e}")
            return "medium"
    
    async def get_available_crops(self) -> List[str]:
        """Get list of available crops"""
        return list(self.crops_database.keys())
    
    async def predict_yield(self, crop_name: str, location, soil_data, weather_data) -> Dict:
        """Predict yield for a specific crop"""
        try:
            features = self._prepare_features(soil_data, weather_data)
            yield_pred = await self._predict_crop_yield(crop_name.lower(), features)
            
            crop_info = self.crops_database.get(crop_name.lower(), {})
            
            return {
                "crop": crop_name.title(),
                "predicted_yield_tons_per_hectare": round(yield_pred, 2),
                "confidence": 0.85,  # Placeholder confidence
                "factors": {
                    "soil_suitability": "good",
                    "weather_conditions": "favorable",
                    "growth_duration_days": crop_info.get("growth_duration_days", 120)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in yield prediction: {e}")
            return {
                "crop": crop_name.title(),
                "predicted_yield_tons_per_hectare": 3.0,
                "confidence": 0.5,
                "error": str(e)
            }