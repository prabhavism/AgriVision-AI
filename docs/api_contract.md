# AgriVision AI - API Contract

Base URL (local development): `http://127.0.0.1:8000`

## 1. Health Check

**GET** `/`

Response:
```json
{"status": "AgriVision AI API is running"}
```

## 2. Crop Recommendation

**POST** `/recommend`

Request body:
```json
{
  "n": 90,
  "p": 42,
  "k": 43,
  "temperature": 20.9,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```

| Field | Type | Notes |
|---|---|---|
| n, p, k | float | Soil nutrient levels (nitrogen, phosphorus, potassium), non-negative |
| temperature | float | Degrees Celsius |
| humidity | float | Percentage, 0-100 |
| ph | float | Soil pH, 0-14 |
| rainfall | float | mm |

Success response (200):
```json
{
  "predicted_crop": "rice",
  "confidence": 0.7222487926483154,
  "top_features": [
    {"feature": "rainfall", "shap_value": 0.31},
    {"feature": "humidity", "shap_value": 0.10}
  ],
  "explanation_text": "Recommended: rice (72.2% confidence). Key factors: rainfall increased confidence, humidity increased confidence."
}
```

Can recommend any of 22 crops: apple, banana, blackgram, chickpea, coconut, coffee, cotton, grapes, jute, kidneybeans, lentil, maize, mango, mothbeans, mungbean, muskmelon, orange, papaya, pigeonpeas, pomegranate, rice, watermelon.

Error response (400): invalid pH/humidity/negative values.

## 3. Yield Prediction

**POST** `/predict-yield`

Request body:
```json
{
  "state_name": "Chhattisgarh",
  "crop": "rice",
  "season": "Kharif",
  "area_ha": 10000,
  "latitude": 21.1982964,
  "longitude": 81.4007922
}
```

| Field | Type | Notes |
|---|---|---|
| state_name | string | Indian state name |
| crop | string | **Must be one of: rice, maize, chickpea, cotton** |
| season | string | **Must be Kharif or Rabi** |
| area_ha | float | Farm area in hectares, must be > 0 |
| latitude, longitude | float | Used to fetch live weather via NASA POWER |

Weather is fetched automatically server-side (most recent complete year) — the frontend does not need to supply weather data.

Success response (200):
```json
{
  "predicted_yield_kg_per_ha": 1467.6,
  "top_features": [
    {"feature": "state_name_Chhattisgarh", "shap_value": -649.65},
    {"feature": "crop_rice", "shap_value": 410.14}
  ],
  "explanation_text": "Predicted yield: 1468 kg/ha. Key factors: being in Chhattisgarh decreased predicted yield, the crop being rice increased predicted yield.",
  "weather_used": {
    "temperature_c": 25.36,
    "humidity_pct": 64.46,
    "rainfall_mm": 1609.65,
    "wind_speed_m_s": 1.94,
    "solar_radiation_mj_m2_day": 17.32,
    "data_year": 2025
  }
}
```

Error responses:
- 400: invalid crop (not one of the 4 supported), invalid season, area ≤ 0, invalid lat/long
- 502: NASA POWER weather fetch failed
- 500: internal prediction error

## Frontend Notes

- `top_features` is sorted by impact (most influential first) — recommend showing this as a horizontal bar chart, with positive SHAP values in one color and negative in another.
- `explanation_text` is ready-to-display plain English — no need to construct sentences from `top_features` yourself, though you can use both (chart from `top_features`, caption from `explanation_text`).
- Yield prediction only supports 4 crops currently (rice, maize, chickpea, cotton) — the recommendation endpoint supports all 22. Consider disabling/filtering the yield form to these 4 crops, or gracefully handling the 400 error if a user picks something else.
- CORS is open (`*`) in development. This will be tightened before deployment — confirm your dev server's origin/port with the backend team if you hit CORS issues later.
