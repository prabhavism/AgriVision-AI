from pydantic import BaseModel
from typing import List

class RecommendRequest(BaseModel):
    n: float
    p: float
    k: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class FeatureContribution(BaseModel):
    feature: str
    shap_value: float

class RecommendResponse(BaseModel):
    predicted_crop: str
    confidence: float
    top_features: List[FeatureContribution]
    explanation_text: str

class YieldRequest(BaseModel):
    state_name: str
    crop: str
    season: str
    area_ha: float
    latitude: float
    longitude: float

class YieldResponse(BaseModel):
    predicted_yield_kg_per_ha: float
    top_features: List[FeatureContribution]
    explanation_text: str
    weather_used: dict
