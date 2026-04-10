import os
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
from services import aqi_calculator, storage_service

load_dotenv()
# ... (rest of imports/setup)

# ... (imports)

def get_weather_by_city(city: str, country: str):
    if not API_KEY:
        raise ValueError("API Key not configured")
    
    url = f"{BASE_URL}/weather"
    # q={city name},{country code}
    query = f"{city},{country}" if country else city
    params = {
        "q": query,
        "appid": API_KEY,
        "units": "metric"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather for {query}: {e}")
        return None

def get_environment_snapshot(city: str, country: str = None):
    # 1. Fetch Weather (Source of Lat/Lon)
    weather_data = get_weather_by_city(city, country)
    if not weather_data:
        return None

    # Extract Location & Coords
    lat = weather_data.get("coord", {}).get("lat")
    lon = weather_data.get("coord", {}).get("lon")
    
    # 2. Fetch Pollution (using Coords)
    pollution_data = get_air_quality(lat, lon)
    
    # 3. Construct the Snapshot
    
    # Parse Weather
    main = weather_data.get("main", {})
    wind = weather_data.get("wind", {})
    clouds = weather_data.get("clouds", {})
    weather_desc = weather_data.get("weather", [{}])[0]
    
    weather_obj = {
        "temperature": main.get("temp"),
        "feels_like": main.get("feels_like"),
        "humidity": main.get("humidity"),
        "pressure": main.get("pressure"),
        "wind_speed": wind.get("speed"),
        "clouds": clouds.get("all"),
        "condition": weather_desc.get("main"),
        "description": weather_desc.get("description")
    }
    
    # Parse Pollution & Calculate AQI
    pollutants_obj = {}
    aqi_result = None
    
    if pollution_data and "list" in pollution_data and len(pollution_data["list"]) > 0:
        components = pollution_data["list"][0].get("components", {})
        pollutants_obj = {
            "pm2_5": components.get("pm2_5"),
            "pm10": components.get("pm10"),
            "no2": components.get("no2"),
            "so2": components.get("so2"),
            "co": components.get("co"),
            "o3": components.get("o3"),
            "nh3": components.get("nh3")
        }
        
        # Calculate CPCB AQI
        aqi_result = aqi_calculator.calculate_cpcb_aqi(pollutants_obj)
    
    snapshot = {
        "location": {
            "city": weather_data.get("name"),
            "country": weather_data.get("sys", {}).get("country"),
            "lat": lat,
            "lon": lon
        },
        "weather": weather_obj,
        "pollutants": pollutants_obj,
        "aqi_result": aqi_result,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Log data (Adapt to standardized format)
    try:
        log_payload = {
            "location": snapshot["location"],
            "weather": snapshot["weather"],
            "air_quality": {
                "pm25": pollutants_obj.get("pm2_5"),
                "pm10": pollutants_obj.get("pm10"),
                "no2": pollutants_obj.get("no2"),
                "co": pollutants_obj.get("co"),
                "so2": pollutants_obj.get("so2"),
                "o3": pollutants_obj.get("o3"),
                "aqi": aqi_result.get("aqi_value") if aqi_result else 0,
                "category": aqi_result.get("category") if aqi_result else "Unknown",
                "dominant_pollutant": aqi_result.get("dominant_pollutant") if aqi_result else "Unknown"
            },
            "timestamp": snapshot["timestamp"]
        }
        storage_service.log_data(log_payload)
    except Exception as e:
        print(f"Failed to log snapshot: {e}")

    return snapshot

API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5"

def get_weather(lat: float, lon: float):
    if not API_KEY:
        raise ValueError("API Key not configured")

    url = f"{BASE_URL}/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY,
        "units": "metric"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather: {e}")
        return None

def get_air_quality(lat: float, lon: float):
    if not API_KEY:
        raise ValueError("API Key not configured")

    url = f"{BASE_URL}/air_pollution"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching air quality: {e}")
        return None

def get_normalized_data(lat: float, lon: float):
    weather_data = get_weather(lat, lon)
    aqi_data = get_air_quality(lat, lon)

    if not weather_data or not aqi_data:
        return None

    # Parse Weather
    main_weather = weather_data.get("main", {}) # Rename to avoid conflict if any, though 'weather' var name below is fine
    
    weather = {
        "temperature": main_weather.get("temp", 0),
        "feels_like": main_weather.get("feels_like", 0),
        "humidity": main_weather.get("humidity", 0),
        "wind_speed": weather_data.get("wind", {}).get("speed", 0),
        "pressure": main_weather.get("pressure", 0),
        "condition": weather_data.get("weather", [{}])[0].get("main", "Unknown")
    }

    # Parse AQI (OpenWeatherMap Structure)
    aqi_list = aqi_data.get("list", [{}])[0]
    components = aqi_list.get("components", {})

    pollutants_obj = {
        "pm2_5": components.get("pm2_5"),
        "pm10": components.get("pm10"),
        "no2": components.get("no2"),
        "so2": components.get("so2"),
        "co": components.get("co"),
        "o3": components.get("o3"),
        "nh3": components.get("nh3")
    }

    # Calculate CPCB AQI
    aqi_result = aqi_calculator.calculate_cpcb_aqi(pollutants_obj)
    
    calculated_aqi = 0
    calculated_category = "Unknown"
    calculated_dominant = "Unknown"
    
    if aqi_result:
        calculated_aqi = aqi_result.get("aqi_value", 0)
        calculated_category = aqi_result.get("category", "Unknown")
        calculated_dominant = aqi_result.get("dominant_pollutant", "Unknown")

    air_quality = {
        "aqi": calculated_aqi,
        "pm25": components.get("pm2_5", 0),
        "pm10": components.get("pm10", 0),
        "co": components.get("co", 0),
        "no2": components.get("no2", 0),
        "o3": components.get("o3", 0),
        "so2": components.get("so2", 0),
        "category": calculated_category,
        "dominant_pollutant": calculated_dominant
    }

    result = {
        "location": {
            "lat": lat,
            "lon": lon
        },
        "weather": weather,
        "air_quality": air_quality,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # Log data
    try:
        storage_service.log_data(result)
    except Exception as e:
        print(f"Failed to log live data: {e}")

    return result


