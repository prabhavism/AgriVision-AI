"""
Loads all models, scalers, encoders, and SHAP explainers once at API startup.
"""
import tensorflow as tf
import joblib
import shap
import numpy as np
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Models:
    def __init__(self):
        self.model_a = tf.keras.models.load_model(os.path.join(BASE_DIR, "models/saved/model_a_crop_recommendation.keras"))
        self.scaler_a = joblib.load(os.path.join(BASE_DIR, "models/saved/scaler_a.pkl"))
        self.le_a = joblib.load(os.path.join(BASE_DIR, "models/saved/label_encoder_a.pkl"))

        df_a = pd.read_csv(os.path.join(BASE_DIR, "../data/processed/dataset3_clean.csv"))
        X_a = df_a.drop(columns=['crop'])
        X_a_scaled = self.scaler_a.transform(X_a)
        background_a = X_a_scaled[np.random.choice(X_a_scaled.shape[0], 100, replace=False)]
        self.explainer_a = shap.KernelExplainer(self.model_a.predict, background_a)

        self.model_b = tf.keras.models.load_model(os.path.join(BASE_DIR, "models/saved/model_b_yield_prediction.keras"))
        self.scaler_b = joblib.load(os.path.join(BASE_DIR, "models/saved/scaler_b.pkl"))
        self.model_b_cols = joblib.load(os.path.join(BASE_DIR, "models/saved/model_b_columns.pkl"))

        df_b = pd.read_csv(os.path.join(BASE_DIR, "../data/processed/model_b_training_data.csv"))
        df_b_encoded = pd.get_dummies(df_b, columns=['state_name', 'crop', 'season'], drop_first=True)
        df_b_encoded = df_b_encoded.reindex(columns=self.model_b_cols, fill_value=0)
        X_b_scaled_full = self.scaler_b.transform(df_b_encoded.astype(float))
        background_b = X_b_scaled_full[np.random.choice(X_b_scaled_full.shape[0], 100, replace=False)]
        self.explainer_b = shap.KernelExplainer(self.model_b.predict, background_b)

        print("All models and explainers loaded")

models = Models()
