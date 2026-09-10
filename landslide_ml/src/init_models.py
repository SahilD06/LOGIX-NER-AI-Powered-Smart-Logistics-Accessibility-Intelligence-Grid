import pickle
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from predict import BaselineLandslideModel, DummyPreprocessor

if __name__ == '__main__':
    os.makedirs('models', exist_ok=True)
    with open('models/best_landslide_model.pkl', 'wb') as f:
        pickle.dump(BaselineLandslideModel(), f)
    with open('models/preprocessor.pkl', 'wb') as f:
        pickle.dump(DummyPreprocessor(), f)
    print("Baseline models exported successfully.")
