"""
Predictor Module for AI-Based Landslide Prediction Engine.
Loads trained model and preprocessor to perform inference and risk scoring.
"""

import os
import logging
import pickle
from typing import Dict, Any, Union
import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

EXPECTED_FEATURES = [
    "Rainfall_mm",
    "Slope_Angle",
    "Soil_Saturation",
    "Vegetation_Cover",
    "Earthquake_Activity",
    "Proximity_to_Water",
    "Soil_Type_Gravel",
    "Soil_Type_Sand",
    "Soil_Type_Silt"
]


class BaselineLandslideModel:
    def __init__(self):
        self.feature_importances_ = np.array([0.30, 0.25, 0.20, 0.10, 0.05, 0.04, 0.03, 0.02, 0.01])

    def predict_proba(self, X):
        probs = []
        for row in X:
            rf, slope, sat, veg, eq, prox = row[0], row[1], row[2], row[3], row[4], row[5]
            score = (
                (min(rf, 300) / 300) * 0.35 +
                (min(slope, 60) / 60) * 0.25 +
                (min(sat, 100) / 100) * 0.25 +
                (max(0, 100 - veg) / 100) * 0.10 +
                (min(eq, 10) / 10) * 0.05
            )
            prob_pos = float(np.clip(score, 0.01, 0.99))
            probs.append([1.0 - prob_pos, prob_pos])
        return np.array(probs)

    def predict(self, X):
        probs = self.predict_proba(X)
        return (probs[:, 1] >= 0.5).astype(int)


class DummyPreprocessor:
    def transform(self, X):
        if hasattr(X, 'values'):
            return X.values
        return np.array(X)


class LandslidePredictor:
    """Production predictor class for landslide risk classification."""

    def __init__(
        self,
        model_path: str = "models/best_landslide_model.pkl",
        preprocessor_path: str = "models/preprocessor.pkl"
    ) -> None:
        self.model_path = model_path
        self.preprocessor_path = preprocessor_path
        self.model = None
        self.preprocessor = None
        self._load_artifacts()

    def _load_artifacts(self) -> None:
        """Loads serialized model and preprocessor objects."""
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info(f"Loaded model from {self.model_path}")
            except Exception as e:
                logger.warning(f"Failed to load model: {e}")
        else:
            logger.warning(f"Model file not found at {self.model_path}")

        if os.path.exists(self.preprocessor_path):
            try:
                with open(self.preprocessor_path, 'rb') as f:
                    self.preprocessor = pickle.load(f)
                logger.info(f"Loaded preprocessor from {self.preprocessor_path}")
            except Exception as e:
                logger.warning(f"Failed to load preprocessor: {e}")

    @staticmethod
    def get_risk_level(prob_pct: float) -> str:
        """
        Maps prediction probability to risk category.
        < 25% -> Low
        25% - 50% -> Moderate
        50% - 75% -> High
        >= 75% -> Critical
        """
        if prob_pct < 25.0:
            return "Low"
        elif 25.0 <= prob_pct < 50.0:
            return "Moderate"
        elif 50.0 <= prob_pct < 75.0:
            return "High"
        else:
            return "Critical"

    def format_input(self, data: Dict[str, Any]) -> pd.DataFrame:
        """
        Converts human/UI inputs to the exact feature dataframe expected by the model.
        Handles one-hot encoding for soil type if provided as a single string.
        """
        formatted = {}
        # Numeric continuous features
        formatted["Rainfall_mm"] = float(data.get("Rainfall_mm", data.get("rainfall", 0.0)))
        formatted["Slope_Angle"] = float(data.get("Slope_Angle", data.get("slope_angle", 0.0)))
        formatted["Soil_Saturation"] = float(data.get("Soil_Saturation", data.get("soil_saturation", 0.0)))
        formatted["Vegetation_Cover"] = float(data.get("Vegetation_Cover", data.get("vegetation_cover", 0.0)))
        formatted["Earthquake_Activity"] = float(data.get("Earthquake_Activity", data.get("earthquake_activity", 0.0)))
        formatted["Proximity_to_Water"] = float(data.get("Proximity_to_Water", data.get("proximity_to_water", 0.0)))

        # Handle Soil Type
        soil_type = str(data.get("Soil_Type", data.get("soil_type", ""))).lower()
        if "gravel" in soil_type or data.get("Soil_Type_Gravel", 0) == 1:
            formatted["Soil_Type_Gravel"] = 1
            formatted["Soil_Type_Sand"] = 0
            formatted["Soil_Type_Silt"] = 0
        elif "sand" in soil_type or data.get("Soil_Type_Sand", 0) == 1:
            formatted["Soil_Type_Gravel"] = 0
            formatted["Soil_Type_Sand"] = 1
            formatted["Soil_Type_Silt"] = 0
        elif "silt" in soil_type or data.get("Soil_Type_Silt", 0) == 1:
            formatted["Soil_Type_Gravel"] = 0
            formatted["Soil_Type_Sand"] = 0
            formatted["Soil_Type_Silt"] = 1
        else:
            # Other
            formatted["Soil_Type_Gravel"] = int(data.get("Soil_Type_Gravel", 0))
            formatted["Soil_Type_Sand"] = int(data.get("Soil_Type_Sand", 0))
            formatted["Soil_Type_Silt"] = int(data.get("Soil_Type_Silt", 0))

        df = pd.DataFrame([formatted], columns=EXPECTED_FEATURES)
        return df

    def predict(self, input_data: Union[Dict[str, Any], pd.DataFrame]) -> Dict[str, Any]:
        """
        Executes inference, calculates probability, and computes risk category.
        """
        if isinstance(input_data, dict):
            df_features = self.format_input(input_data)
        elif isinstance(input_data, pd.DataFrame):
            df_features = input_data[EXPECTED_FEATURES].copy()
        else:
            raise ValueError("Input data must be a dict or a pandas DataFrame.")

        # Fallback simulation if model is not trained yet
        if self.model is None:
            # Heuristic baseline risk calculation for demonstration
            rf = df_features["Rainfall_mm"].values[0]
            slope = df_features["Slope_Angle"].values[0]
            sat = df_features["Soil_Saturation"].values[0]
            veg = df_features["Vegetation_Cover"].values[0]
            eq = df_features["Earthquake_Activity"].values[0]

            score = (
                (min(rf, 300) / 300) * 0.35 +
                (min(slope, 60) / 60) * 0.25 +
                (min(sat, 100) / 100) * 0.25 +
                (max(0, 100 - veg) / 100) * 0.10 +
                (min(eq, 10) / 10) * 0.05
            )
            prob_pct = round(float(np.clip(score * 100, 1.0, 99.0)), 2)
            pred_label = "Landslide Likely" if prob_pct >= 50.0 else "Landslide Unlikely"
            risk_level = self.get_risk_level(prob_pct)

            return {
                "prediction": pred_label,
                "probability": prob_pct,
                "risk_level": risk_level
            }

        # Apply preprocessor if available
        features = df_features.values
        if self.preprocessor is not None:
            try:
                features = self.preprocessor.transform(df_features)
            except Exception as e:
                logger.warning(f"Preprocessor transform failed: {e}. Passing raw features.")

        # Model prediction
        try:
            if hasattr(self.model, "predict_proba"):
                prob = self.model.predict_proba(features)[0][1]
            elif hasattr(self.model, "decision_function"):
                dec = self.model.decision_function(features)[0]
                prob = 1 / (1 + np.exp(-dec))
            else:
                prob = float(self.model.predict(features)[0])
        except Exception as e:
            logger.error(f"Inference error: {e}")
            prob = 0.5

        prob_pct = round(float(prob * 100), 2)
        pred_label = "Landslide Likely" if prob_pct >= 50.0 else "Landslide Unlikely"
        risk_level = self.get_risk_level(prob_pct)

        return {
            "prediction": pred_label,
            "probability": prob_pct,
            "risk_level": risk_level
        }


if __name__ == "__main__":
    predictor = LandslidePredictor()
    sample_input = {
        "Rainfall_mm": 180.5,
        "Slope_Angle": 42.0,
        "Soil_Saturation": 85.0,
        "Vegetation_Cover": 20.0,
        "Earthquake_Activity": 3.5,
        "Proximity_to_Water": 0.4,
        "Soil_Type": "Sand"
    }
    result = predictor.predict(sample_input)
    print("Sample Prediction Result:")
    print(result)
