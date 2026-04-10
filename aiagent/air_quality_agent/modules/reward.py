def calculate_reward(aqi_before, aqi_after, fan_speed_str, filter_health_pct):
    """
    Calculates the reward based on:
    1. ΔAQI = (AQI_before - AQI_after) * 0.6
       - Positive if air improved.
       - Negative if air got worse.
       
    2. Energy Cost = Cost(fan_speed) * 0.25
       - Penalize high energy usage.
       
    3. Filter Penalty = (1 - Health) * 0.15
       - Slight penalty if running on a bad filter? 
       - OR penalty for degrading it further? 
       - User Interpretation: Likely "usage cost" or "state penalty".
       - Given prompt: (filter_penalty * 0.15). 
       - Let's define energy_cost and filter_penalty normalized 0-1.
    """
    
    # 1. Delta AQI (Normalized roughly 0-1 for common ranges, but can go higher)
    # Let's normalize Aqi delta. If we drop 50 points, that's huge. 
    # If we drop 0, that's 0.
    # Raw delta might be too large vs the 0-1 penalties.
    # User formula: (ΔAQI * 0.6). If ΔAQI is 10, result is 6. 
    # But we clamp to -1, 1. So a drop of >= 2 points dominates everything?
    # Let's assume ΔAQI is normalized or we use raw and just clamp hard.
    # Let's use raw first per instructions, but scale if needed.
    # Actually, standard RL rewards are usually small. 
    # Let's calculate raw components first.
    
    delta_aqi = aqi_before - aqi_after
    
    # 2. Energy Cost (Normalized 0-1)
    speed_map = {"OFF": 0.0, "LOW": 0.2, "MEDIUM": 0.5, "HIGH": 1.0}
    energy_cost = speed_map.get(fan_speed_str, 0.0)
    
    # 3. Filter Penalty
    # "filter_penalty" is ambiguous. likely "cost of WEAR" or "state of BAD filter".
    # If filter is 100%, penalty is 0? If 0%, penalty is 1?
    # Let's assume penalty increases as health decreases (risk).
    # filter_penalty = 1.0 - (health / 100.0)
    filter_penalty = 1.0 - (max(0, min(100, filter_health_pct)) / 100.0)

    # Formula
    # reward = (ΔAQI * 0.6) - (energy_cost * 0.25) - (filter_penalty * 0.15)
    
    # Normalize ΔAQI?
    # If I clean air from 100 to 50, Delta is 50. 
    # 50 * 0.6 = 30.
    # Energy max = 0.25.
    # This means cleaning the air is WAY more important than energy. Correct for an "Air Quality" agent.
    # But it will instantly hit the +1 clamp.
    # Let's assume we allow easy saturation (it IS a reward for doing job).
    
    raw_reward = (delta_aqi * 0.6) - (energy_cost * 0.25) - (filter_penalty * 0.15)
    
    # Clamp -1 to 1
    return max(-1.0, min(1.0, raw_reward))
