"""
AgriVision AI - FastAPI backend
Exposes crop recommendation and yield prediction with SHAP explainability.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import RecommendRequest, RecommendResponse, YieldRequest, YieldResponse
from api.model_loader import models
from explainability.shap_utils import explain_crop_recommendation, explain_yield_prediction
from services.weather_service import get_live_weather

app = FastAPI(title="AgriVision AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_CROPS_YIELD = ['rice', 'maize', 'chickpea', 'cotton']
VALID_SEASONS = ['Kharif', 'Rabi']

@app.get("/")
def root():
    return {"status": "AgriVision AI API is running"}

@app.post("/recommend", response_model=RecommendResponse)
def recommend_crop(req: RecommendRequest):
    if not (0 <= req.ph <= 14):
        raise HTTPException(status_code=400, detail="pH must be between 0 and 14")
    if req.humidity < 0 or req.humidity > 100:
        raise HTTPException(status_code=400, detail="Humidity must be between 0 and 100")
    if req.n < 0 or req.p < 0 or req.k < 0 or req.rainfall < 0:
        raise HTTPException(status_code=400, detail="N, P, K, and rainfall must be non-negative")

    try:
        result = explain_crop_recommendation(
            models.model_a, models.scaler_a, models.le_a, models.explainer_a,
            n=req.n, p=req.p, k=req.k, temperature=req.temperature,
            humidity=req.humidity, ph=req.ph, rainfall=req.rainfall
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict-yield", response_model=YieldResponse)
def predict_yield(req: YieldRequest):
    if req.crop.lower() not in VALID_CROPS_YIELD:
        raise HTTPException(
            status_code=400,
            detail=f"Yield prediction is only available for: {', '.join(VALID_CROPS_YIELD)}"
        )
    if req.season not in VALID_SEASONS:
        raise HTTPException(
            status_code=400,
            detail=f"Season must be one of: {', '.join(VALID_SEASONS)}"
        )
    if req.area_ha <= 0:
        raise HTTPException(status_code=400, detail="Area must be greater than 0")
    if not (-90 <= req.latitude <= 90) or not (-180 <= req.longitude <= 180):
        raise HTTPException(status_code=400, detail="Invalid latitude/longitude")

    try:
        weather = get_live_weather(req.latitude, req.longitude)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch live weather data: {str(e)}")

    try:
        result = explain_yield_prediction(
            models.model_b, models.scaler_b, models.model_b_cols, models.explainer_b,
            state_name=req.state_name, crop=req.crop, season=req.season, area_ha=req.area_ha,
            temperature_c=weather['temperature_c'], humidity_pct=weather['humidity_pct'],
            rainfall_mm=weather['rainfall_mm'], wind_speed_m_s=weather['wind_speed_m_s'],
            solar_radiation_mj_m2_day=weather['solar_radiation_mj_m2_day']
        )
        result['weather_used'] = weather
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
