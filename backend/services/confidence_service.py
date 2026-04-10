import statistics

def calculate_confidence(history_data):
    """
    Calculates a confidence score (0.0 - 1.0) for the agent's decision
    based on the quality and consistency of historical data.
    """
    if not history_data or len(history_data) < 3:
        return {
            "score": 0.2,
            "level": "Learning",
            "reason": "Insufficient historical data points."
        }
    
    # 1. Data Density Score (max 0.4)
    # Ideally we have at least 6 points per hour.
    count = len(history_data)
    density_score = min(count / 10, 1.0) * 0.4
    
    # 2. Volatility Score (max 0.4)
    # Lower standard deviation = Higher confidence
    aqi_values = [d.get("aqi", 0) for d in history_data]
    if len(aqi_values) > 1:
        stdev = statistics.stdev(aqi_values)
        avg = statistics.mean(aqi_values) if statistics.mean(aqi_values) > 0 else 1
        cv = stdev / avg # Coefficient of variation
        
        # If CV is low (<0.1), score is high. If high (>0.5), score is low.
        volatility_score = max(0, 0.4 * (1 - (cv * 2)))
    else:
        volatility_score = 0.0
        
    # 3. Base Reliability (max 0.2)
    base_score = 0.2
    
    total_score = round(density_score + volatility_score + base_score, 2)
    
    # Cap at 0.95 (AI is never 100% sure in this system)
    total_score = min(total_score, 0.95)
    
    level = "High confidence"
    if total_score < 0.7:
        level = "Moderate confidence"
    if total_score < 0.4:
        level = "Learning"
        
    return {
        "score": total_score,
        "level": level,
        "reason": f"Based on {count} data points with {volatility_score:.2f} volatility score."
    }
