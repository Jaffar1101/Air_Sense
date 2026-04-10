# Environment API Contract

This document defines the strict API response structure for the environment services. Both the Frontend Dashboard and the AI Agent rely on these contracts.

**Base URL**: `http://localhost:8000`

---

## 1. Live Environment Data

**Endpoint**: `GET /environment/live`
**Query Parameters**:
- `lat` (float, required): Latitude
- `lon` (float, required): Longitude

**Description**: returns the current normalized snapshot of weather and air quality data. This data is also logged to the database for history tracking.

### Response JSON Structure

```json
{
  "location": {
    "lat": 19.076,              // float, required
    "lon": 72.8777,             // float, required
    "city": "Mumbai"            // string, nullable (default: "Unknown Location")
  },
  "weather": {
    "temperature": 28.5,        // float, required (Celsius)
    "feels_like": 31.2,         // float, required (Celsius)
    "humidity": 65,             // int, required (%)
    "wind_speed": 3.4,          // float, required (m/s)
    "pressure": 1012,           // int, optional (hPa)
    "condition": "Haze"         // string, required (Description)
  },
  "air_quality": {
    "aqi": 145,                 // int, required (CPCB Scale)
    "category": "Moderate",     // string, required (Good, Satisfactory, Moderate, Poor, Very Poor, Severe)
    "dominant_pollutant": "pm10", // string, required (e.g. "pm2_5", "pm10")
    "pm25": 45.3,               // float, required (µg/m³)
    "pm10": 112.5,              // float, required (µg/m³)
    "no2": 15.2,                // float, required (µg/m³)
    "so2": 10.1,                // float, required (µg/m³)
    "co": 450.5,                // float, required (µg/m³)
    "o3": 25.4                  // float, required (µg/m³)
  },
  "timestamp": "2026-01-21T10:30:00.000000+00:00" // string, required (ISO 8601 UTC)
}
```

---

## 2. Historical Trends

**Endpoint**: `GET /environment/history`
**Query Parameters**:
- `hours` (int, optional): Number of past hours to fetch (default: 24).

**Description**: Returns a time-series list of simplified environment snapshots for graphing purposes. Results are sorted by timestamp ascending (oldest first).

### Response JSON Structure (Array)

```json
[
  {
    "timestamp": "2026-01-21T09:30:00.000000+00:00", // string, required (ISO 8601 UTC)
    "aqi": 134,                                      // int, required
    "category": "Moderate",                          // string, required
    "dominant_pollutant": "pm2_5"                    // string, required
  },
  {
    "timestamp": "2026-01-21T10:30:00.000000+00:00",
    "aqi": 145,
    "category": "Moderate",
    "dominant_pollutant": "pm10"
  }
]
```

---

## 3. Agent Latest Action

**Endpoint**: `GET /agent/latest`

**Description**: Returns the most recent decision made by the AI Agent. If no action has ever been taken, returns an empty object or null.

### Response JSON Structure

```json
{
  "timestamp": "2026-01-21T10:30:05.123456+00:00", // string, required (ISO 8601 UTC)
  "mode": "Purifying",                             // string, required ("Monitoring", "Purifying", "Eco")
  "fan_speed": 85,                                 // int, required (0-100)
  "confidence": 0.92,                              // float, required (0.0 - 1.0)
  "reasoning": "Air quality is deteriorating significantly; increasing fan speed to compensate." // string, required
}
```

*Note: If no actions exist, response may be `{}` or `null` depending on implementation handling, frontend should handle both.*
