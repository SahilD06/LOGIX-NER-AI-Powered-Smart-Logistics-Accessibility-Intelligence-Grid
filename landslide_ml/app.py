"""
Streamlit Application: AI-Based Landslide Prediction Engine.
Provides an interactive web dashboard for real-time risk assessment,
probability estimation, and model performance metrics.
"""

import os
import sys
import pandas as pd
import numpy as np
import streamlit as st
from PIL import Image

# Add src to system path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))
from predict import LandslidePredictor

# Set page layout and config
st.set_page_config(
    page_title="AI-Based Landslide Prediction Engine",
    page_icon="⛰️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for polished UI
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E3A8A;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #4B5563;
        margin-bottom: 1.5rem;
    }
    .risk-card {
        padding: 1.25rem;
        border-radius: 0.5rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
        color: #ffffff;
    }
    .low-risk {
        background-color: #059669;
    }
    .mod-risk {
        background-color: #2563EB;
    }
    .high-risk {
        background-color: #D97706;
    }
    .crit-risk {
        background-color: #DC2626;
    }
    .metric-container {
        background-color: #F3F4F6;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #E5E7EB;
    }
</style>
""", unsafe_allow_html=True)


def main():
    st.markdown('<div class="main-title">⛰️ AI-Based Landslide Prediction Engine</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Predictive hazard analytics system powered by advanced machine learning.</div>', unsafe_allow_html=True)

    # Initialize predictor
    model_path = os.path.join(os.path.dirname(__file__), "models", "best_landslide_model.pkl")
    preprocessor_path = os.path.join(os.path.dirname(__file__), "models", "preprocessor.pkl")
    predictor = LandslidePredictor(model_path=model_path, preprocessor_path=preprocessor_path)

    # Sidebar inputs
    st.sidebar.header("⚙️ Environmental Parameters")
    st.sidebar.markdown("Configure real-time terrain and meteorological sensor inputs:")

    rainfall = st.sidebar.number_input(
        "Rainfall (mm)",
        min_value=0.0,
        max_value=1000.0,
        value=120.0,
        step=5.0,
        help="Cumulative rainfall in millimeters."
    )

    slope_angle = st.sidebar.slider(
        "Slope Angle (degrees)",
        min_value=0.0,
        max_value=90.0,
        value=35.0,
        step=0.5,
        help="Inclination angle of the terrain in degrees."
    )

    soil_saturation = st.sidebar.slider(
        "Soil Saturation (%)",
        min_value=0.0,
        max_value=100.0,
        value=65.0,
        step=1.0,
        help="Volumetric moisture content of the soil."
    )

    vegetation_cover = st.sidebar.slider(
        "Vegetation Cover (%)",
        min_value=0.0,
        max_value=100.0,
        value=40.0,
        step=1.0,
        help="Percentage of area covered by root-binding vegetation."
    )

    earthquake_activity = st.sidebar.number_input(
        "Earthquake Activity Index",
        min_value=0.0,
        max_value=10.0,
        value=1.5,
        step=0.1,
        help="Recent seismic intensity indicator."
    )

    proximity_to_water = st.sidebar.number_input(
        "Proximity to Water (km)",
        min_value=0.0,
        max_value=50.0,
        value=1.2,
        step=0.1,
        help="Distance to nearest active stream or body of water."
    )

    soil_type = st.sidebar.selectbox(
        "Soil Type",
        options=["Gravel", "Sand", "Silt", "Other"],
        index=1,
        help="Dominant geological soil composition."
    )

    # Main Tabs
    tab1, tab2, tab3 = st.tabs(["🎯 Real-Time Risk Prediction", "📊 Model Performance & Insights", "ℹ️ System Info"])

    with tab1:
        st.subheader("Landslide Risk Assessment")
        st.write("Click the button below to evaluate environmental hazard parameters against the trained machine learning model.")

        col_btn, _ = st.columns([1, 3])
        predict_clicked = col_btn.button("Predict Landslide Risk", type="primary", use_container_width=True)

        if predict_clicked:
            # Package input parameters
            input_data = {
                "Rainfall_mm": rainfall,
                "Slope_Angle": slope_angle,
                "Soil_Saturation": soil_saturation,
                "Vegetation_Cover": vegetation_cover,
                "Earthquake_Activity": earthquake_activity,
                "Proximity_to_Water": proximity_to_water,
                "Soil_Type": soil_type
            }

            with st.spinner("Analyzing geological and meteorological patterns..."):
                result = predictor.predict(input_data)

            prob = result["probability"]
            risk_level = result["risk_level"]
            prediction_label = result["prediction"]

            st.markdown("---")
            st.subheader("Prediction Overview")

            # Metrics row
            m_col1, m_col2, m_col3 = st.columns(3)
            with m_col1:
                st.metric("Landslide Likelihood", prediction_label)
            with m_col2:
                st.metric("Estimated Probability", f"{prob:.1f}%")
            with m_col3:
                st.metric("Risk Category", risk_level)

            # Progress Bar / Gauge
            st.markdown("#### Risk Probability Level")
            st.progress(min(max(prob / 100.0, 0.0), 1.0))

            # Risk Display Rules & Custom Alerts
            if risk_level == "Low":
                st.success(f"**LOW RISK ({prob:.1f}%)**: Environmental conditions are stable. Landslide occurrence is unlikely.")
            elif risk_level == "Moderate":
                st.info(f"**MODERATE RISK ({prob:.1f}%)**: Elevated soil saturation or slope detected. Routine monitoring recommended.")
            elif risk_level == "High":
                st.warning(f"**HIGH RISK ({prob:.1f}%)**: Hazardous conditions! Significant potential for ground destabilization.")
            else: # Critical
                st.error(f"**CRITICAL RISK ({prob:.1f}%)**: DANGER! Extreme landslide hazard detected. Immediate mitigation and alert protocols recommended.")

            # Feature Summary Table
            st.markdown("#### Input Feature Summary")
            df_summary = pd.DataFrame({
                "Parameter": [
                    "Rainfall (mm)", "Slope Angle (deg)", "Soil Saturation (%)",
                    "Vegetation Cover (%)", "Earthquake Index", "Proximity to Water (km)", "Soil Type"
                ],
                "Observed Value": [
                    rainfall, slope_angle, soil_saturation,
                    vegetation_cover, earthquake_activity, proximity_to_water, soil_type
                ]
            })
            st.dataframe(df_summary, use_container_width=True, hide_index=True)

    with tab2:
        st.subheader("Model Benchmark & Evaluation Artifacts")
        st.write("Summary of all models trained during the automated MLOps pipeline.")

        comp_path = os.path.join(os.path.dirname(__file__), "artifacts", "model_comparison.csv")
        if os.path.exists(comp_path):
            df_comp = pd.read_csv(comp_path)
            st.dataframe(df_comp, use_container_width=True, hide_index=True)
        else:
            st.info("Model comparison results will appear here once train.py is executed.")

        st.markdown("---")
        st.subheader("Evaluation Visualizations")
        v_col1, v_col2 = st.columns(2)

        with v_col1:
            st.markdown("**Confusion Matrix**")
            cm_path = os.path.join(os.path.dirname(__file__), "artifacts", "confusion_matrix.png")
            if os.path.exists(cm_path):
                st.image(cm_path, use_container_width=True)
            else:
                st.caption("No confusion matrix artifact available.")

        with v_col2:
            st.markdown("**ROC Curves Comparison**")
            roc_path = os.path.join(os.path.dirname(__file__), "artifacts", "roc_curve.png")
            if os.path.exists(roc_path):
                st.image(roc_path, use_container_width=True)
            else:
                st.caption("No ROC curve artifact available.")

        st.markdown("---")
        st.markdown("**Feature Importance**")
        fi_path = os.path.join(os.path.dirname(__file__), "artifacts", "feature_importance.png")
        if os.path.exists(fi_path):
            st.image(fi_path, use_container_width=True)
        else:
            st.caption("No feature importance artifact available.")

    with tab3:
        st.subheader("About the Predictive Analytics Engine")
        st.markdown("""
        **Project Overview**:
        This predictive engine was developed for the Smart India Hackathon to provide reliable, automated early warnings for landslide hazards.

        **Classification & Scoring Schema**:
        * **Low Risk**: Probability < 25% (Green)
        * **Moderate Risk**: Probability between 25% and 50% (Blue)
        * **High Risk**: Probability between 50% and 75% (Orange)
        * **Critical Risk**: Probability >= 75% (Red)

        **Supported Algorithms**:
        * Logistic Regression
        * Random Forest
        * Extra Trees
        * Gradient Boosting
        * XGBoost / LightGBM / CatBoost
        """)


if __name__ == "__main__":
    main()
