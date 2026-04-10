import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENWEATHER_API_KEY")
print(f"Loaded API Key: {api_key[:4]}...{api_key[-4:] if api_key else ''} (Masked)")

if not api_key or "your_api_key_here" in api_key:
    print("❌ API Key is missing or is the default placeholder!")
    exit(1)

url = "https://api.openweathermap.org/data/2.5/weather"
params = {"lat": 40.7128, "lon": -74.0060, "appid": api_key}

print(f"\nTesting URL: {url}...")
try:
    response = requests.get(url, params=params)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ SUCCESS! The API Key is working.")
        print("Response sample:", response.json().get("weather"))
    elif response.status_code == 401:
        print("❌ FAILED: 401 Unauthorized.")
        print("Reasons:")
        print("1. The key is incorrect.")
        print("2. The key was JUST created (it takes 10-20 mins to activate).")
        print("3. You subscribed to the wrong plan (Free plan works for 'Current Weather', but verify 2.5 vs 3.0 endpoints).")
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"❌ Request Error: {e}")
