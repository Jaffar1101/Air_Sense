def get_aqi_category(aqi):
    if aqi <= 50: return "Good", "#22c55e" # Green
    if aqi <= 100: return "Satisfactory", "#84cc16" # Light Green (Lime)
    if aqi <= 200: return "Moderately Polluted", "#eab308" # Yellow
    if aqi <= 300: return "Poor", "#f97316" # Orange
    if aqi <= 400: return "Very Poor", "#ef4444" # Red
    return "Severe", "#7f1d1d" # Dark Red

def calculate_sub_index(concentration, breakpoints):
    """
    Calculates sub-index for a single pollutant using linear interpolation.
    breakpoints: list of tuples (low_conc, high_conc, low_index, high_index)
    """
    if concentration is None:
        return None
        
    for (C_lo, C_hi, I_lo, I_hi) in breakpoints:
        if C_lo <= concentration <= C_hi:
            return I_lo + (I_hi - I_lo) * (concentration - C_lo) / (C_hi - C_lo)
            
    # If out of range (usually higher than max defined), extrapolate or cap
    # CPCB usually caps at max index 500 for calculation purposes or extends the last slope.
    # For safety, if > max C_hi, we use the last valid slope or max index.
    last_bp = breakpoints[-1]
    if concentration > last_bp[1]:
        # Linear extrapolation from last bracket
        (C_lo, C_hi, I_lo, I_hi) = last_bp
        val = I_lo + (I_hi - I_lo) * (concentration - C_lo) / (C_hi - C_lo)
        return min(val, 500) # Cap at 500 usually
        
    return 0

def calculate_cpcb_aqi(pollutants: dict):
    """
    Pollutants dict should keys: pm2_5, pm10, no2, so2, co, o3, nh3
    Values in µg/m3 (CO in mg/m3 must be converted to µg/m3? No, CPCB CO is usually mg/m3)
    Wait, check CPCB CO unit. It is mg/m3. OpenWeatherMap returns CO in µg/m3.
    We need to handle unit conversion for CO! 1 mg/m3 = 1000 µg/m3. 
    So OpenWeatherMap/1000 = CPCB input.
    """
    
    # Breakpoints (Concentration Range -> Index Range)
    # Source: CPCB National Air Quality Index Standard
    
    # PM2.5 (µg/m3)
    bp_pm25 = [
        (0, 30, 0, 50), (31, 60, 51, 100), (61, 90, 101, 200),
        (91, 120, 201, 300), (121, 250, 301, 400), (251, 380, 401, 500) # 380+ Severe
    ]
    
    # PM10 (µg/m3)
    bp_pm10 = [
        (0, 50, 0, 50), (51, 100, 51, 100), (101, 250, 101, 200),
        (251, 350, 201, 300), (351, 430, 301, 400), (431, 500, 401, 500) # 430+
    ]
    
    # NO2 (µg/m3)
    bp_no2 = [
        (0, 40, 0, 50), (41, 80, 51, 100), (81, 180, 101, 200),
        (181, 280, 201, 300), (281, 400, 301, 400), (401, 500, 401, 500) # 400+
    ]
    
    # SO2 (µg/m3)
    bp_so2 = [
        (0, 40, 0, 50), (41, 80, 51, 100), (81, 380, 101, 200),
        (381, 800, 201, 300), (801, 1600, 301, 400), (1600, 2000, 401, 500) # 1600+
    ]
    
    # CO (mg/m3) - Note Unit!
    bp_co = [
        (0, 1.0, 0, 50), (1.1, 2.0, 51, 100), (2.1, 10, 101, 200),
        (10.1, 17, 201, 300), (17.1, 34, 301, 400), (34.1, 50, 401, 500) # 34+
    ]
    
    # O3 (µg/m3)
    bp_o3 = [
        (0, 50, 0, 50), (51, 100, 51, 100), (101, 168, 101, 200),
        (169, 208, 201, 300), (209, 748, 301, 400), (748, 1000, 401, 500) # 748+
    ]
    
    # NH3 (µg/m3)
    bp_nh3 = [
        (0, 200, 0, 50), (201, 400, 51, 100), (401, 800, 101, 200),
        (801, 1200, 201, 300), (1200, 1800, 301, 400), (1800, 2400, 401, 500) # 1800+
    ]

    # Prepare input values (handle missing)
    p = pollutants
    
    # Conversion for CO (µg/m3 -> mg/m3)
    co_val = p.get("co")
    if co_val is not None:
        co_val = co_val / 1000.0

    sub_indices = {}
    sub_indices["pm2_5"] = calculate_sub_index(p.get("pm2_5"), bp_pm25)
    sub_indices["pm10"] = calculate_sub_index(p.get("pm10"), bp_pm10)
    sub_indices["no2"] = calculate_sub_index(p.get("no2"), bp_no2)
    sub_indices["so2"] = calculate_sub_index(p.get("so2"), bp_so2)
    sub_indices["co"] = calculate_sub_index(co_val, bp_co)
    sub_indices["o3"] = calculate_sub_index(p.get("o3"), bp_o3)
    sub_indices["nh3"] = calculate_sub_index(p.get("nh3"), bp_nh3)

    # Filter out None
    valid_subs = {k: v for k, v in sub_indices.items() if v is not None}
    
    if not valid_subs:
        return None

    # Determine Max
    max_sub_index = max(valid_subs.values())
    dominant_pollutant = max(valid_subs, key=valid_subs.get)
    
    aqi_final = int(round(max_sub_index))
    cat, color = get_aqi_category(aqi_final)

    return {
        "aqi_value": aqi_final,
        "category": cat,
        "color": color,
        "dominant_pollutant": dominant_pollutant,
        "sub_indices": {k: int(round(v)) for k, v in valid_subs.items()}
    }
