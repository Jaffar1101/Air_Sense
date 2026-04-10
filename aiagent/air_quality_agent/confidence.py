from typing import List, Dict
from statistics import stdev
from datetime import datetime
import math


def clamp(value: float, min_value: float = 0.0, max_value: float = 100.0) -> float:
    return max(min_value, min(value, max_value))


def calculate_data_sufficiency(snapshots: List[Dict]) -> float:
    """
    Measures whether we have enough data points and time coverage.
    """
    if len(snapshots) < 2:
        return 0.0

    timestamps = [
        datetime.fromisoformat(s["timestamp"].replace("Z", "+00:00"))
        for s in snapshots
        if "timestamp" in s
    ]

    if len(timestamps) < 2:
        return 0.0

    timestamps.sort()
    time_span_hours = (timestamps[-1] - timestamps[0]).total_seconds() / 3600
    data_points = len(timestamps)

    data_points_score = min(data_points / 120, 1.0) * 100
    time_window_score = min(time_span_hours / 24, 1.0) * 100

    return (data_points_score * 0.6) + (time_window_score * 0.4)


def calculate_trend_stability(snapshots: List[Dict]) -> float:
    """
    Penalizes volatile AQI movement.
    """
    aqi_values = [
        s["air_quality"]["aqi"]
        for s in snapshots
        if s.get("air_quality", {}).get("aqi") is not None
    ]

    if len(aqi_values) < 3:
        return 30.0  # Bare minimum stability

    deltas = [aqi_values[i] - aqi_values[i - 1] for i in range(1, len(aqi_values))]

    if len(deltas) < 2:
        return 40.0

    volatility = stdev(deltas)

    # Higher volatility = lower confidence
    stability = 100 - (volatility * 4)

    return clamp(stability)


def calculate_signal_agreement(latest_snapshot: Dict) -> float:
    """
    Checks if environmental signals logically support the AQI state.
    """
    aq = latest_snapshot.get("air_quality", {})
    weather = latest_snapshot.get("weather", {})

    agreement = 100.0

    wind = weather.get("wind_speed")
    humidity = weather.get("humidity")
    pm25 = aq.get("pm25")
    dominant = aq.get("dominant_pollutant")
    aqi = aq.get("aqi")

    if wind is not None and wind > 4 and aqi and aqi > 150:
        agreement -= 30

    if humidity is not None and humidity < 30 and pm25 and pm25 > 75:
        agreement -= 20

    if dominant and dominant not in ["pm2_5", "pm10"]:
        agreement -= 10

    return clamp(agreement)


def calculate_horizon_penalty(horizon_minutes: int) -> float:
    """
    Longer forecast horizon = less confidence.
    """
    penalty = 100 - (horizon_minutes / 120 * 100)
    return clamp(penalty)


def compute_confidence(
    snapshots: List[Dict],
    horizon_minutes: int = 60
) -> Dict:
    """
    Main confidence computation entrypoint.
    """

    if not snapshots:
        return {
            "score": 0,
            "level": "Low",
            "reason": "Insufficient data"
        }

    data_sufficiency = calculate_data_sufficiency(snapshots)
    trend_stability = calculate_trend_stability(snapshots)
    signal_agreement = calculate_signal_agreement(snapshots[-1])
    horizon_penalty = calculate_horizon_penalty(horizon_minutes)

    raw_score = (
        data_sufficiency * 0.4 +
        trend_stability * 0.3 +
        signal_agreement * 0.2 +
        horizon_penalty * 0.1
    )

    final_score = min(round(raw_score), 80)

    if final_score < 40:
        level = "Low"
    elif final_score < 70:
        level = "Moderate"
    else:
        level = "High"

    return {
        "score": final_score,
        "level": level,
        "components": {
            "data_sufficiency": round(data_sufficiency, 1),
            "trend_stability": round(trend_stability, 1),
            "signal_agreement": round(signal_agreement, 1),
            "horizon_penalty": round(horizon_penalty, 1)
        },
        "data_points_used": len(snapshots),
        "forecast_horizon_minutes": horizon_minutes
    }
