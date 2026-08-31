"""
SHAP-based explanation functions for AgriVision AI.
Model A: crop recommendation (classification)
Model B: yield prediction (regression)
"""
import numpy as np

def explain_crop_recommendation(model_a, scaler_a, le_a, explainer_a, 
                                  n, p, k, temperature, humidity, ph, rainfall, top_n=3):
    input_arr = np.array([[n, p, k, temperature, humidity, ph, rainfall]])
    input_scaled = scaler_a.transform(input_arr)

    pred_probs = model_a.predict(input_scaled, verbose=0)
    pred_class_idx = np.argmax(pred_probs[0])
    pred_crop = le_a.classes_[pred_class_idx]
    confidence = pred_probs[0][pred_class_idx]

    shap_vals = explainer_a.shap_values(input_scaled, nsamples=100)
    crop_shap = shap_vals[0, :, pred_class_idx]

    feature_names = ['N','P','K','temperature','humidity','ph','rainfall']
    contributions = list(zip(feature_names, crop_shap))
    contributions.sort(key=lambda x: abs(x[1]), reverse=True)
    top_features = contributions[:top_n]

    explanation_parts = []
    for feat, val in top_features:
        direction = "increased" if val > 0 else "decreased"
        explanation_parts.append(f"{feat} {direction} confidence")

    explanation_text = f"Recommended: {pred_crop} ({confidence:.1%} confidence). Key factors: " + ", ".join(explanation_parts) + "."

    return {
        "predicted_crop": pred_crop,
        "confidence": float(confidence),
        "top_features": [{"feature": f, "shap_value": float(v)} for f, v in top_features],
        "explanation_text": explanation_text
    }


def explain_yield_prediction(model_b, scaler_b, model_b_cols, explainer_b,
                               state_name, crop, season, area_ha, temperature_c, humidity_pct,
                               rainfall_mm, wind_speed_m_s, solar_radiation_mj_m2_day, top_n=3):
    input_dict = {col: 0 for col in model_b_cols}
    input_dict['area_ha'] = area_ha
    input_dict['temperature_c'] = temperature_c
    input_dict['humidity_pct'] = humidity_pct
    input_dict['rainfall_mm'] = rainfall_mm
    input_dict['wind_speed_m_s'] = wind_speed_m_s
    input_dict['solar_radiation_mj_m2_day'] = solar_radiation_mj_m2_day

    state_col = f'state_name_{state_name}'
    crop_col = f'crop_{crop}'
    season_col = f'season_{season}'
    if state_col in input_dict: input_dict[state_col] = 1
    if crop_col in input_dict: input_dict[crop_col] = 1
    if season_col in input_dict: input_dict[season_col] = 1

    input_arr = np.array([[input_dict[col] for col in model_b_cols]])
    input_scaled = scaler_b.transform(input_arr)

    pred_yield = model_b.predict(input_scaled, verbose=0)[0][0]

    shap_vals = explainer_b.shap_values(input_scaled, nsamples=100)
    feature_shap = shap_vals[0, :, 0]

    contributions = list(zip(model_b_cols, feature_shap))
    contributions.sort(key=lambda x: abs(x[1]), reverse=True)
    top_features = contributions[:top_n]

    explanation_parts = []
    for feat, val in top_features:
        direction = "increased" if val > 0 else "decreased"
        clean_name = feat.replace('state_name_','').replace('crop_','').replace('season_','')
        is_active = input_dict[feat] == 1

        if feat.startswith('state_name_'):
            phrase = f"being in {clean_name}" if is_active else f"not being in {clean_name}"
        elif feat.startswith('crop_'):
            phrase = f"the crop being {clean_name}" if is_active else f"the crop not being {clean_name}"
        elif feat.startswith('season_'):
            phrase = f"the season being {clean_name}" if is_active else f"the season not being {clean_name}"
        else:
            phrase = clean_name

        explanation_parts.append(f"{phrase} {direction} predicted yield")

    explanation_text = f"Predicted yield: {pred_yield:.0f} kg/ha. Key factors: " + ", ".join(explanation_parts) + "."

    return {
        "predicted_yield_kg_per_ha": float(pred_yield),
        "top_features": [{"feature": f, "shap_value": float(v)} for f, v in top_features],
        "explanation_text": explanation_text
    }
