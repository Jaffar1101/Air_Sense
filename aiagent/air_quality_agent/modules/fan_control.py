class SmartFanController:
    def __init__(self):
        self.levels = {
            "OFF": 0,
            "LOW": 1,
            "MEDIUM": 2,
            "HIGH": 3
        }

    def decide(self, current_pm25, predicted_next_pm25, filter_health_pct, history=None, current_speed="OFF", override=None):
        """
        Decides the fan speed based on inputs, history, and overrides.
        """
        decision = {
            "speed": "OFF",
            "reason": "",
            "alert": None
        }

        # 1. Manual Override Priority
        if override and override.get("active"):
            decision["speed"] = override.get("speed", "OFF")
            decision["reason"] = "Manual override active."
            return decision

        # 2. Critical Filter Check
        if filter_health_pct < 5:
            decision["speed"] = "LOW"
            decision["reason"] = "Filter critically low. Running minimum speed to prevent damage."
            decision["alert"] = "REPLACE FILTER IMMEDIATELY"
            return decision

        # 3. Trend Analysis
        # Calculate recent trend if history is available
        trend = "stable"
        if history and len(history) >= 2:
            # Simple slope: last vs first in window
            delta = history[-1] - history[0]
            if delta > 10:
                trend = "rising_fast"
            elif delta < -10:
                trend = "falling_fast"

        # 4. Hysteresis & Pollution Logic
        # We use different thresholds for upgrading vs downgrading to prevent oscillation
        
        # Upgrade Thresholds (Strict)
        UP_HIGH = 75
        UP_MEDIUM = 35
        
        # Downgrade Thresholds (Relaxed - Keep speed longer)
        DOWN_HIGH = 65  # Must drop below 65 to leave HIGH
        DOWN_MEDIUM = 25 # Must drop below 25 to leave MEDIUM
        
        target_speed = "OFF"
        reason = "Air is clean."

        # Determine Baseline Target
        if current_pm25 > 150:
            target_speed = "HIGH"
            reason = "Hazardous air quality detected."
        elif current_pm25 > UP_HIGH:
            target_speed = "HIGH"
            reason = "Poor air quality detected."
        elif current_pm25 > UP_MEDIUM:
             target_speed = "MEDIUM"
             reason = "Moderate pollution levels."
        elif current_pm25 > 10:
             target_speed = "LOW"
             reason = "Acceptable air quality."
        
        # Predictive Adjustment
        is_spike_likely = (predicted_next_pm25 - current_pm25) > 15
        
        if is_spike_likely and target_speed != "HIGH":
            # Upgrade one level if spike coming
            if target_speed == "OFF": target_speed = "LOW"
            elif target_speed == "LOW": target_speed = "MEDIUM"
            elif target_speed == "MEDIUM": target_speed = "HIGH"
            reason += " Spike predicted, increasing speed."

        # Hysteresis Check (Prevent rapid downgrades)
        # If we are currently at a higher speed, check if we should hold it
        if current_speed == "HIGH" and target_speed != "HIGH":
            if current_pm25 > DOWN_HIGH:
                target_speed = "HIGH"
                reason = "Holding HIGH speed until air clears significantly (Hysteresis)."
            elif trend == "rising_fast":
                target_speed = "HIGH"
                reason = "Pollution rising fast. Holding HIGH speed."
                
        elif current_speed == "MEDIUM" and target_speed != "MEDIUM" and target_speed != "HIGH":
            if current_pm25 > DOWN_MEDIUM:
                target_speed = "MEDIUM"
                reason = "Holding MEDIUM speed until air clears significantly (Hysteresis)."
                
        decision["speed"] = target_speed
        decision["reason"] = reason

        return decision
