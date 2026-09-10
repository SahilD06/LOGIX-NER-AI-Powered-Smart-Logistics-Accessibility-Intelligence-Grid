"""
Model Evaluation Module for Landslide Prediction Engine.
Computes classification metrics, generates comparison tables, and plots evaluation charts.
"""

import os
import logging
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> Dict[str, float]:
    """
    Computes accuracy, precision, recall, f1, and roc_auc.
    Fallback to custom pure-numpy implementation if sklearn is not installed.
    """
    try:
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
        accuracy = float(accuracy_score(y_true, y_pred))
        precision = float(precision_score(y_true, y_pred, zero_division=0))
        recall = float(recall_score(y_true, y_pred, zero_division=0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))
        try:
            roc_auc = float(roc_auc_score(y_true, y_prob))
        except Exception:
            roc_auc = 0.5
    except ImportError:
        # Fallback pure python/numpy metrics
        tp = np.sum((y_true == 1) & (y_pred == 1))
        tn = np.sum((y_true == 0) & (y_pred == 0))
        fp = np.sum((y_true == 0) & (y_pred == 1))
        fn = np.sum((y_true == 1) & (y_pred == 0))

        accuracy = (tp + tn) / max(1, len(y_true))
        precision = tp / max(1, tp + fp)
        recall = tp / max(1, tp + fn)
        f1 = (2 * precision * recall) / max(1e-9, precision + recall)
        roc_auc = 0.5

    return {
        "Accuracy": round(accuracy, 4),
        "Precision": round(precision, 4),
        "Recall": round(recall, 4),
        "F1 Score": round(f1, 4),
        "ROC-AUC": round(roc_auc, 4)
    }


def plot_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray, save_path: str = "artifacts/confusion_matrix.png", model_name: str = "Best Model") -> None:
    """Generates and saves the confusion matrix heatmap."""
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    try:
        from sklearn.metrics import confusion_matrix
        cm = confusion_matrix(y_true, y_pred)
    except ImportError:
        tp = int(np.sum((y_true == 1) & (y_pred == 1)))
        tn = int(np.sum((y_true == 0) & (y_pred == 0)))
        fp = int(np.sum((y_true == 0) & (y_pred == 1)))
        fn = int(np.sum((y_true == 1) & (y_pred == 0)))
        cm = np.array([[tn, fp], [fn, tp]])

    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False,
                xticklabels=["No Landslide", "Landslide"],
                yticklabels=["No Landslide", "Landslide"])
    plt.title(f"Confusion Matrix - {model_name}", fontsize=14, pad=12)
    plt.xlabel("Predicted Label", fontsize=11)
    plt.ylabel("Actual Label", fontsize=11)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    logger.info(f"Confusion matrix saved to {save_path}")


def plot_roc_curves(models_probs: Dict[str, np.ndarray], y_true: np.ndarray, save_path: str = "artifacts/roc_curve.png") -> None:
    """Plots ROC curves for all models evaluated."""
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.figure(figsize=(8, 6))

    try:
        from sklearn.metrics import roc_curve, auc
        for name, probs in models_probs.items():
            fpr, tpr, _ = roc_curve(y_true, probs)
            roc_score = auc(fpr, tpr)
            plt.plot(fpr, tpr, label=f"{name} (AUC = {roc_score:.3f})", lw=2)
    except ImportError:
        plt.plot([0, 1], [0, 1], linestyle="--", lw=2, color="r", label="Chance")

    plt.plot([0, 1], [0, 1], color="navy", lw=1.5, linestyle="--")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate", fontsize=11)
    plt.ylabel("True Positive Rate", fontsize=11)
    plt.title("ROC Curves Comparison", fontsize=14, pad=12)
    plt.legend(loc="lower right", fontsize=10)
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    logger.info(f"ROC Curves saved to {save_path}")


def plot_feature_importance(feature_names: List[str], importances: np.ndarray, save_path: str = "artifacts/feature_importance.png", model_name: str = "Best Model") -> None:
    """Plots and saves the top feature importances."""
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    df_feat = pd.DataFrame({
        "Feature": feature_names,
        "Importance": importances
    }).sort_values(by="Importance", ascending=True)

    plt.figure(figsize=(8, 6))
    plt.barh(df_feat["Feature"], df_feat["Importance"], color="#1f77b4")
    plt.xlabel("Relative Importance", fontsize=11)
    plt.title(f"Feature Importance ({model_name})", fontsize=14, pad=12)
    plt.grid(axis="x", alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    logger.info(f"Feature importance saved to {save_path}")
