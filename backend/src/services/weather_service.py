"""
Live weather fetching service using NASA POWER API.
Used at inference time to get real-time weather for a given location.
"""
import requests
from datetime import datetime

def get_live_weather(lat, lon):
    """
    Fetch the most recent complete year of weather data from NASA POWER,
    returning values matching the model's training feature format.
    """
    current_year = datetime.now().year
    target_year = current_year - 1

    url = "https://power.larc.nasa.gov/api/temporal/monthly/point"
    params = {
        "parameters": "T2M,RH2M,PRECTOTCORR,WS2M,ALLSKY_SFC_SW_DWN",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": target_year,
        "end": target_year,
        "format": "JSON"
    }

    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    param_data = data['properties']['parameter']

    year_key = f"{target_year}13"

    return {
        'temperature_c': param_data['T2M'].get(year_key),
        'humidity_pct': param_data['RH2M'].get(year_key),
        'rainfall_mm': param_data['PRECTOTCORR'].get(year_key, 0) * 365,
        'wind_speed_m_s': param_data['WS2M'].get(year_key),
        'solar_radiation_mj_m2_day': param_data['ALLSKY_SFC_SW_DWN'].get(year_key),
        'data_year': target_year
    }
