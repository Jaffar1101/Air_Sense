import json
import os
from datetime import datetime

STATE_FILE = "state/pending_predictions.json"

def save_prediction(predicted_value, timestamp=None):
    """
    Saves a prediction made NOW so we can check it later.
    """
    if not timestamp:
        timestamp = datetime.utcnow().isoformat()
        
    entry = {
        "timestamp": timestamp,
        "predicted_aqi": predicted_value
    }
    
    # We only keep the last one for 1-hour lookback simplicity in this task
    # Or append if we want to track multiple. 
    # Let's just overwrite for specific "1 hour ahead" check.
    try:
        with open(STATE_FILE, 'w') as f:
            json.dump(entry, f)
    except Exception:
        pass

def check_and_log_accuracy(current_aqi):
    """
    Checks if there's a pending prediction from ~1 hour ago.
    If yes, logs the error.
    """
    if not os.path.exists(STATE_FILE):
        return

    try:
        with open(STATE_FILE, 'r') as f:
            past_pred = json.load(f)
            
        pred_ts = datetime.fromisoformat(past_pred["timestamp"])
        pred_val = past_pred["predicted_aqi"]
        
        # Check if approx 1 hour has passed (e.g. > 50 mins)
        now = datetime.utcnow()
        delta_mins = (now - pred_ts).total_seconds() / 60.0
        
        if delta_mins >= 50: # Flexible window
            # Log it!
            error = abs(pred_val - current_aqi)
            
            from air_quality_agent.modules.db import log_prediction_evaluation
            
            log_entry = {
                "evaluation_timestamp": now,
                "prediction_timestamp": past_pred["timestamp"],
                "predicted_aqi": float(pred_val),
                "actual_aqi": float(current_aqi),
                "error": float(error)
            }
            
            log_prediction_evaluation(log_entry)
            
            # Remove file so we don't log same one again
            os.remove(STATE_FILE)
            
    except Exception as e:
        # print(f"Eval Error: {e}")
        pass
