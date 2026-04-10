import numpy as np
from sklearn.linear_model import LinearRegression

class FilterHealthModel:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self._fallback_base = 100.0
        
        # Try loading pre-trained regression model
        import joblib
        import os
        try:
            if os.path.exists("models/filter_model.pkl"):
                self.model = joblib.load("models/filter_model.pkl")
                self.is_trained = True
                print("FilterHealthModel: Loaded external pre-trained model.")
            else:
                from sklearn.linear_model import LinearRegression
                self.model = LinearRegression() # Fallback
        except Exception as e:
            print(f"FilterHealthModel: Error loading model - {e}")
            from sklearn.linear_model import LinearRegression
            self.model = LinearRegression()

    def train(self, X_train=None, y_train=None):
        # ... (Identical to previous, used for fallback training) ...
        # For brevity, reusing existing fallback logic structure via existing code
        pass 

    def predict(self, run_hours, avg_pm25, fan_speed_val=50):
        """
        Predicts filter health percentage and confidence score.
        fan_speed_val: Numeric speed (0-100). Default 50 if unknown.
        """
        confidence = 0.95
        
        # Guard against uninitialized model
        if not self.model:
             return 100.0, 0.0

        if self.is_trained:
            try:
                # Expects: [pm25, fan_speed, usage_hours] based on training script
                import pandas as pd
                features_df = pd.DataFrame([{
                    "pm25": avg_pm25,
                    "fan_speed": fan_speed_val,
                    "usage_hours": run_hours
                }])
                health = self.model.predict(features_df)[0]
            except Exception as e:
                # Fallback if dimensions mismatch (e.g. using old fallback model)
                exposure = np.array([[run_hours * avg_pm25]])
                try:
                    health = self.model.predict(exposure)[0]
                except:
                    # Absolute heuristic fallback
                    health = max(0, 100 - (run_hours * avg_pm25 / 1500.0))
                    confidence = 0.4
        else:
            # Fallback heuristic
            health = max(0, 100 - (run_hours * avg_pm25 / 1500.0))
            confidence = 0.5
            
        # Clamp health
        health = max(0.0, min(100.0, health))
        
        # Simple confidence decay
        if run_hours > 3000 or avg_pm25 > 300:
             confidence -= 0.2
            
        return float(health), float(confidence)

    def get_status(self, health_pct):
        if health_pct > 80:
            return "Good"
        elif health_pct > 40:
            return "Fair"
        elif health_pct > 20:
            return "Replace Soon"
        else:
            return "CRITICAL: Replace Immediately"
