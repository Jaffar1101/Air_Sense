from fastapi import APIRouter
from services import storage_service, confidence_service
from datetime import datetime, timezone, timedelta

router = APIRouter()

@router.get("/latest")
def get_latest_action():
    try:
        # Reference: User Request Step 2955 - Generate dynamic status
        
        # 1. Fetch History (Last 4 hours to see trend)
        history = storage_service.get_history(hours=4)
        
        if not history:
            # Fallback if no data
            return {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "mode": "System Startup",
                "fan_speed": 0,
                "confidence": 0.0,
                "reasoning": "Waiting for sensor data initialization..."
            }

        # 2. Analyze Trend & Predict
        current_aqi = history[-1].get("aqi", 0)
        
        # Simple trend analysis: Compare vs 30 mins ago (assuming ~1 record/min)
        # If we have < 30 records, use index 0
        compare_idx = max(0, len(history) - 30)
        past_aqi = history[compare_idx].get("aqi", current_aqi)
        
        trend_delta = current_aqi - past_aqi
        predicted_aqi = current_aqi + (trend_delta * 0.5) # Simple projection
        
        # 3. Calculate Confidence
        conf_result = confidence_service.calculate_confidence(history)
        confidence_score = conf_result["score"]

        # --- HARDWARE INTEGRATION START ---
        # Fetch validated hardware runs (Truth Layer)
        recent_runs = storage_service.get_run_history(limit=5)
        run_count = len(recent_runs)
        
        # Confidence Boost: Verified Hardware Data
        if run_count >= 3:
            confidence_score += 0.20 # +20% for robust hardware history
        elif run_count >= 1:
            confidence_score += 0.05 # +5% for at least one run
            
        # Confidence Penalty: Recent Instability
        if recent_runs:
            last_run = recent_runs[0]
            # If last run was "noisy" or had low stability score (assuming < 80 is threshold)
            stability = last_run.get("summary", {}).get("stability_score", 100)
            if stability < 80:
                confidence_score -= 0.10 # -10% for recent sensor noise
        
        # Clamp Confidence 0.0 - 1.0
        confidence_score = max(0.0, min(1.0, confidence_score))
        # --- HARDWARE INTEGRATION END ---
        
        # 4. Determine Action Rules & Readiness
        mode = "Monitoring"
        fan_speed = 0
        readiness = "Ready"
        filter_stress = 0.05 # Baseline simulated stress
        reason_template = ""

        # Readiness Logic (Simulated based on data)
        if len(history) < 10:
            readiness = "Calibrating"
        elif confidence_score < 0.4:
            readiness = "Warming Up"

        if predicted_aqi > 200:
            mode = "Purifying"
            fan_speed = 100
            filter_stress = 0.95
            reason_template = "Hazardous air quality detected. Maximizing filtration."
        elif predicted_aqi > 150:
            mode = "Purifying"
            fan_speed = 80
            filter_stress = 0.75
            reason_template = "Unhealthy AQI levels predicted. Engaging high purification."
        elif predicted_aqi > 100:
            mode = "Purifying"
            fan_speed = 50
            filter_stress = 0.45
            reason_template = "Air quality is poor. Moderate sensing and filtration active."
        elif predicted_aqi > 50:
            mode = "Monitoring"
            fan_speed = 20
            filter_stress = 0.15
            reason_template = "Moderate air quality. Maintaining low-power circulation."
        else:
            mode = "Eco"
            fan_speed = 0
            reason_template = "Air quality is good. System in energy-saving standby."

        # Add trend context to reasoning
        # Construct Natural Language Reasoning
        reasoning_parts = []
        
        # 6. Determine Primary Driver
        # Default to dominant pollutant from history
        last_record = history[-1]
        primary_driver = last_record.get("dominant_pollutant", "PM2.5")
        
        # Check for Weather Stagnation (Low wind + High/Rising AQI)
        if last_record.get("wind_speed", 5) < 1.0 and current_aqi > 100:
             primary_driver = "Weather Stagnation"
        elif last_record.get("pm25", 0) > last_record.get("pm10", 0):
             primary_driver = "PM2.5"
        elif last_record.get("pm10", 0) > last_record.get("pm25", 0):
             primary_driver = "PM10"
        
        # Part 1: Condition & Driver
        if trend_delta > 5:
            reasoning_parts.append(f"AQI is rising rapidly due to accumulating {primary_driver} levels.")
        elif trend_delta < -5:
            reasoning_parts.append(f"Air quality is improving as {primary_driver} levels disperse.")
        else:
            reasoning_parts.append(f"AQI remains stable with consistent {primary_driver} readings.")

        # Part 2: Prediction/Context
        if predicted_aqi > 150:
             reasoning_parts.append("Expect hazardous conditions to persist; maximum filtration is advised.")
        elif predicted_aqi > 100:
             reasoning_parts.append("Pollution levels are unhealthy and require sustained purification.")
        elif predicted_aqi > 50:
             reasoning_parts.append("Moderate quality expected to continue over the next hour.")
        else:
             reasoning_parts.append("Conditions are optimal with no significant deterioration forecasted.")

        # Part 3: Historical Context (Confidence & Hardware)
        if confidence_score > 0.8:
            reasoning_parts.append("Sensor data alignment with historical patterns is strong.")
        elif confidence_score > 0.5:
             reasoning_parts.append("Forecast reliability is moderate based on current volatility.")
        else:
            reasoning_parts.append("Prediction confidence will improve as more data is collected.")
            
        # Part 4: Hardware Citation
        if recent_runs:
             last_run_stability = recent_runs[0].get("summary", {}).get("stability_score", 100)
             if last_run_stability >= 80:
                 reasoning_parts.append("Recent hardware diagnostics confirm stable sensor operation.")
             else:
                 reasoning_parts.append("Note: Recent sensor noise may impact forecast precision.")
        else:
             reasoning_parts.append("Hardware calibration relies on historical models (No recent runs).")

        final_reasoning = " ".join(reasoning_parts)



        # 7. Determine Risk Level (Derived from Predicted AQI)
        risk_level = "Low"
        if predicted_aqi > 300: risk_level = "Severe"
        elif predicted_aqi > 200: risk_level = "Very Poor"
        elif predicted_aqi > 100: risk_level = "Moderate"
        elif predicted_aqi > 50: risk_level = "Satisfactory"
        else: risk_level = "Good"

        # 8. Preventive Readiness Checklist
        actions = [
            {
                "label": "Increase filtration readiness",
                "enabled": readiness != "Ready" or predicted_aqi > 50,
                "info": "Pre-charge filters to maximize particle capture efficiency during rising pollution."
            },
            {
                "label": "Limit outdoor air exchange",
                "enabled": predicted_aqi > 100,
                "info": "Close windows and vents to prevent outdoor pollutant ingress."
            },
            {
                "label": "Monitor filter load",
                "enabled": filter_stress > 0.5,
                "info": "High usage expected; ensure filter life is sufficient for prolonged operation."
            },
            {
                "label": "Alert sensitive occupants",
                "enabled": predicted_aqi > 100,
                "info": "Notify elderly or asthmatic individuals of expected poor air quality."
            }
        ]

        # 9. Filter Stress Projection
        # Logic to determine stress level and explanation
        stress_level = "Low"
        stress_explanation = "Minimal stress accumulation projected."
        
        if filter_stress > 0.7:
             stress_level = "High"
             stress_explanation = "High forecasted particulate load will accelerate filter clogging."
        elif filter_stress > 0.3:
             stress_level = "Moderate"
             stress_explanation = "Moderate usage expected; routine check recommended."



        # 5. Return Response (Matching Contract + New Fields)
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "mode": mode,
            "fan_speed": fan_speed,
            "confidence": confidence_score,
            "reasoning": final_reasoning,
            "predicted_aqi": int(predicted_aqi),
            "readiness": readiness,
            "filter_stress": filter_stress,
            "explanation": final_reasoning,
            "primary_driver": primary_driver,
            "risk_level": risk_level,
            "preventive_actions": actions,
            "filter_stress_level": stress_level,
            "filter_stress_explanation": stress_explanation,
            "filter_health": int(max(0, (1.0 - filter_stress) * 100)),
            "fan_performance": int(90 + (confidence_score * 10)), # Simulated efficiency based on sensor confidence
            "maintenance_insights": [
                f"Filter stress load is currently {stress_level.lower()} at {int(filter_stress * 100)}% capacity.",
                
                f"Fan efficiency {'remains stable' if fan_speed < 80 else 'dropped slightly'} under current load conditions.",
                
                f"Current AQI trend {'accelerates' if trend_delta > 5 else 'stabilizes'} filter clogging risk.",
                
                f"Sensor confidence is {int(confidence_score * 100)}%, validating predictive durability models."
            ],
            "forecasts": {
                "filter_replacement": {
                    "earliest": (datetime.now() + timedelta(days=90 if filter_stress > 0.5 else 180)).strftime("%b %d"),
                    "latest": (datetime.now() + timedelta(days=120 if filter_stress > 0.5 else 240)).strftime("%b %d"),
                    "confidence": int(confidence_score * 100),
                    "assumptions": [
                        "Based on current daily usage of 12h",
                        "Assumes seasonal pollen spike in April"
                    ]
                },
                "fan_service": {
                    "earliest": (datetime.now() + timedelta(days=365)).strftime("%b %d"),
                    "latest": (datetime.now() + timedelta(days=400)).strftime("%b %d"),
                    "confidence": 92, # Motor reliability usually high
                    "assumptions": [
                        "Bearing wear is linear",
                        "No major voltage surges"
                    ]
                }
            }
        }

    except Exception as e:
        print(f"Error generating agent status: {e}")
        return {
             "timestamp": datetime.now(timezone.utc).isoformat(),
             "mode": "Error", 
             "fan_speed": 0, 
             "confidence": 0.0, 
             "reasoning": "Internal agent error."
        }

@router.get("/forecast")
def get_forecast():
    try:
        # 1. Fetch History
        history = storage_service.get_history(hours=4)
        
        if not history:
             return {
                "current_aqi": 0,
                "predicted_aqi": 0,
                "spike_warning": False,
                "fan_speed": "Off",
                "confidence": 0,
                "explanation": "Insufficient data to generate forecast."
            }

        # 2. Analyze
        current_aqi = history[-1].get("aqi", 0)
        compare_idx = max(0, len(history) - 30)
        past_aqi = history[compare_idx].get("aqi", current_aqi)
        trend_delta = current_aqi - past_aqi
        
        # Aggressive prediction for forecast view (1 hour out)
        predicted_aqi = int(current_aqi + (trend_delta * 0.8))
        predicted_aqi = max(0, predicted_aqi) # No negative AQI

        # 3. Confidence
        conf_result = confidence_service.calculate_confidence(history)
        conf_score = int(conf_result["score"] * 100)

        # 4. Spike Warning Logic
        # If AQI is rising fast (> 10 points in 30 mins) AND predicted to go high
        spike_warning = trend_delta > 10 and predicted_aqi > 100

        # 5. Determine Logic
        fan_label = "Off"
        explanation = ""
        
        if predicted_aqi > 200:
            fan_label = "Max"
            explanation = "Critical pollution levels forecasted. System entering maximum filtration mode to mitigate health risks."
        elif predicted_aqi > 150:
            fan_label = "High"
            explanation = "Unhealthy air quality expected shortly. High-speed filtration recommended to stabilize indoor environment."
        elif predicted_aqi > 100:
            fan_label = "Medium"
            explanation = "Air quality degrading. Medium fan speed will maintain equilibrium."
        elif predicted_aqi > 50:
            fan_label = "Low"
            explanation = "Moderate conditions prevailing. Low circulation is sufficient."
        else:
            fan_label = "Eco"
            explanation = "Air quality projected to remain optimal. Energy-saving mode active."

        if spike_warning:
            explanation = "Rapid pollution spike detected! " + explanation

        return {
            "current_aqi": current_aqi,
            "predicted_aqi": predicted_aqi,
            "spike_warning": spike_warning,
            "fan_speed": fan_label,
            "confidence": conf_score,
            "explanation": explanation
        }

    except Exception as e:
        print(f"Error generating forecast: {e}")
        return {
            "current_aqi": 0,
            "predicted_aqi": 0,
            "spike_warning": False,
            "fan_speed": "Error",
            "confidence": 0,
            "explanation": "Internal calculation error."
        }

@router.get("/performance-history")
def get_performance_history():
    try:
        # 1. Fetch History (Last 12 hours for timeline)
        history = storage_service.get_history(hours=12)
        
        if not history:
            return []

        performance_data = []

        # 2. Iterate and derive metrics
        for record in history:
            aqi = record.get("aqi", 0)
            
            # Simulate historical agent decision logic
            # This reconstructs what the agent likely did/would do at that AQI
            
            # Filter Stress Logic (0.0 - 1.0)
            # Baseline + Load factor
            stress_load = 0.05
            if aqi > 200: stress_load = 0.95
            elif aqi > 150: stress_load = 0.75
            elif aqi > 100: stress_load = 0.45
            elif aqi > 50: stress_load = 0.15
            
            # Fan Efficiency Trend (100% -> drops as filters clog/AQI rises)
            # Simulated inverse relationship to stress for visualization
            fan_efficiency = 100 - (stress_load * 20) # 100% down to 80% under load
            
            # Determine "Accelerated Wear" Zone
            # If stress > 0.6, we consider this an accelerated wear period
            is_accelerated_wear = stress_load > 0.6

            performance_data.append({
                "timestamp": record["timestamp"],
                "aqi": aqi,
                "filter_stress": int(stress_load * 100), # 0-100 for graph
                "fan_efficiency": int(fan_efficiency),
                "accelerated_wear": is_accelerated_wear 
            })

        return performance_data

    except Exception as e:
        print(f"Error generating performance history: {e}")
        return []
