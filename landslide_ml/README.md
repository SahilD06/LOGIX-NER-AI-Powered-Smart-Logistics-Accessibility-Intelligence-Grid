# AI-Based Landslide Prediction Engine

Predict whether a landslide event is likely to occur based on localized environmental, geological, and meteorological conditions. Built as a comprehensive ML pipeline for a Smart India Hackathon project.

## Overview
This platform employs multiple ensemble and gradient boosting machine learning models to assess hazards using standard input features like rainfall, slope, soil properties, and vegetation cover. The platform automatically trains models, compares their ROC-AUC, selects the top performer with a specified priority tiebreaker, and exports comprehensive logs and visualization artifacts.

## System Architecture

```text
project/
│
├── data/
│   └── landslide_training.csv      <-- Training data
├── models/
│   ├── best_landslide_model.pkl    <-- Exported ML model
│   └── preprocessor.pkl            <-- Feature scaler
│
├── artifacts/
│   ├── model_comparison.csv        <-- Tabular evaluation metrics
│   ├── confusion_matrix.png        <-- True/False Positive map
│   ├── roc_curve.png               <-- AUC diagnostics
│   └── feature_importance.png      <-- ML decision insights
│
├── src/
│   ├── train.py                    <-- Training & selection loop
│   ├── evaluate.py                 <-- Metric computation & plotting
│   └── predict.py                  <-- Inference Engine API
│
├── app.py                          <-- Streamlit web interface
├── requirements.txt                <-- Python dependencies
└── README.md
```

## Quickstart

### 1. Installation
Install the necessary python dependencies using pip:
```bash
pip install -r requirements.txt
```

### 2. Model Training
Run the training pipeline. It will ingest data (or safely generate compliant synthetic data if the target `data/landslide_training.csv` is incorrect/missing), perform train/test splits, evaluate LightGBM, XGBoost, CatBoost, Sklearn Ensembles, then select the best.
```bash
python src/train.py
```
*Output logic:* Saves the best model based on ROC-AUC into `models/best_landslide_model.pkl` along with `artifacts/`.

### 3. Start the Web App
Run the interactive predictive dashboard tool:
```bash
streamlit run app.py
```

## Features

- **Multi-Model Pipeline:** Robust evaluation across top gradient boosted trees and random forests.
- **Risk Categorization Rules:**  
  * Low Risk: < 25% (Green box)
  * Moderate Risk: 25% - 50% (Blue box)
  * High Risk: 50% - 75% (Orange box)
  * Critical Risk: >= 75% (Red box)
- **Modular Design:** `predict.py` acts as a clean service for real-time JSON-like request/response inference.
