import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
import joblib
import sys
import os

# Ensure we can run from anywhere
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(BASE_DIR)

# Constants
DATA_PATH = os.path.join(BASE_DIR, 'data/training_data.csv')
POLLUTION_MODEL_PATH = os.path.join(BASE_DIR, 'models/pollution_model.pkl')
FILTER_MODEL_PATH = os.path.join(BASE_DIR, 'models/filter_model.pkl')

def load_data():
    if not os.path.exists(DATA_PATH):
        print(f"Error: Data file not found at {DATA_PATH}")
        sys.exit(1)
    return pd.read_csv(DATA_PATH)

def load_model(path):
    if not os.path.exists(path):
        print(f"Error: Model not found at {path}")
        sys.exit(1)
    return joblib.load(path)

def evaluate_pollution_model(df):
    print("\n" + "="*50)
    print("EVALUATING POLLUTION PREDICTION MODEL")
    print("="*50)
    
    # Matching training configuration
    features = ['pm25', 'gas_index', 'hour', 'fan_speed']
    target = 'pm25_next'
    
    # Validating columns exist
    for col in features + [target]:
        if col not in df.columns:
            print(f"Error: Missing column '{col}' in dataset.")
            return

    X = df[features]
    y = df[target]

    # Split (Same seed as training for valid test set)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = load_model(POLLUTION_MODEL_PATH)
    
    # Predict
    y_pred = model.predict(X_test)
    y_pred = np.maximum(0, y_pred) # Apply the same clamping logic as Agent
    
    # Metrics
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Test Set Size: {len(X_test)} samples")
    print("-" * 30)
    print(f"{'Metric':<10} | {'Value':<10}")
    print("-" * 30)
    print(f"{'R² Score':<10} | {r2:.4f}")
    print(f"{'MAE':<10} | {mae:.4f}")
    print(f"{'MSE':<10} | {mse:.4f}")
    print("-" * 30)
    
    # Sample Comparison
    print("\nSample Predictions (Test Set):")
    comparison = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred})
    print(comparison.head(5).to_string())

def evaluate_filter_model(df):
    print("\n" + "="*50)
    print("EVALUATING FILTER HEALTH MODEL")
    print("="*50)
    
    # Matching training configuration
    features = ['pm25', 'fan_speed', 'usage_hours']
    target = 'filter_health'
    
    for col in features + [target]:
        if col not in df.columns:
            print(f"Error: Missing column '{col}' in dataset.")
            return

    X = df[features]
    y = df[target]

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = load_model(FILTER_MODEL_PATH)
    
    # Predict
    y_pred = model.predict(X_test)
    # The agent logic clamps 0-100, let's mirror that for fair eval
    y_pred = np.clip(y_pred, 0, 100)
    
    metrics = {
        'R² Score': r2_score(y_test, y_pred),
        'MAE': mean_absolute_error(y_test, y_pred),
        'MSE': mean_squared_error(y_test, y_pred)
    }
    
    print(f"Test Set Size: {len(X_test)} samples")
    print("-" * 30)
    print(f"{'Metric':<10} | {'Value':<10}")
    print("-" * 30)
    for k, v in metrics.items():
        print(f"{k:<10} | {v:.4f}")
    print("-" * 30)
    
    print("\nSample Predictions (Test Set):")
    comparison = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred})
    print(comparison.head(5).to_string())
    
if __name__ == "__main__":
    print("Loading data...")
    df = load_data()
    
    evaluate_pollution_model(df)
    evaluate_filter_model(df)
    print("\nEvaluation Complete.")
