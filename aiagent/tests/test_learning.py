import unittest
import os
import json
import numpy as np
import shutil
from air_quality_agent.agent import AirQualityAgent

class TestOnlineLearning(unittest.TestCase):
    def setUp(self):
        # Backup models and data before messing with them
        if os.path.exists("models/pollution_model.pkl"):
            shutil.copy("models/pollution_model.pkl", "models/pollution_model.bak")
        if os.path.exists("data/training_data.csv"):
            shutil.copy("data/training_data.csv", "data/training_data.bak")
            
        # Clean history
        if os.path.exists("last_observation.json"):
            os.remove("last_observation.json")

    def tearDown(self):
        # Restore backups
        if os.path.exists("models/pollution_model.bak"):
            shutil.move("models/pollution_model.bak", "models/pollution_model.pkl")
        if os.path.exists("data/training_data.bak"):
            shutil.move("data/training_data.bak", "data/training_data.csv")
        if os.path.exists("last_observation.json"):
            os.remove("last_observation.json")

    def test_model_adapts(self):
        print("\n--- Testing Online Learning ---")
        agent = AirQualityAgent()
        
        # 1. Initial State
        input_A = {"pm25": 50, "hour": 10, "usage_hours": 0, "gas_index": 0, "current_fan_speed": "OFF"}
        # Get baseline prediction
        response_1 = agent.process(input_A)
        pred_1 = response_1["status"]["predicted_next_hour_index"]
        print(f"Baseline Prediction (50 -> ?): {pred_1}")
        
        # 2. Simulate Reality Check
        # Agent saves Input A. Now run Input B which is the 'future' reality.
        # Let's say in reality, PM2.5 jumped to 100 (Unusually high).
        # Data B represents T+1
        input_B = {"pm25": 100, "hour": 11, "usage_hours": 1, "gas_index": 0, "current_fan_speed": "OFF"}
        
        # Processing B should trigger learning: "Input A (50) -> Actual (100)"
        print("Simulating T+1 (Reality: 100)... Learning should trigger.")
        agent.process(input_B)
        
        # 3. Check Adaptation (Amplify the signal)
        # One update might be subtle (e.g. 0.001 change). We loop to force visible drift.
        print("Amplifying learning (repeating update 50 times)...")
        for _ in range(50):
            # Simulate alternating sequence: A -> B -> A -> B
            # This teaches A->100 repeatedly
            agent.process(input_A) # Saves A
            agent.process(input_B) # Learns A -> 100
        
        response_2 = agent.process(input_A)
        pred_2 = response_2["status"]["predicted_next_hour_index"]
        print(f"Adapted Prediction (50 -> ?): {pred_2}")
        
        # Assert meaningful change
        diff = pred_2 - pred_1
        print(f"Shift due to learning: {diff:+.4f}")
        
        self.assertGreater(pred_2, pred_1 + 0.01, f"Model failed to adapt! Shift was negligible: {diff}")

if __name__ == "__main__":
    unittest.main()
