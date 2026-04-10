
import serial.tools.list_ports

def get_hardware_status():
    """
    Detects connected Arduino hardware via Serial ports.
    Returns real-time status object.
    """
    ports = serial.tools.list_ports.comports()
    
    status = {
        "connected": False,
        "board": "None",
        "port": "None",
        "rate": "0 Hz",
        "sensors": 0,
        "status_color": "red" # red, yellow, green
    }

    # Common Arduino VIDs (approximate list) or search by description
    arduino_ports = [
        p for p in ports 
        if 'Arduino' in p.description or 'USB Serial' in p.description or 'usbmodem' in p.device
    ]

    if arduino_ports:
        device = arduino_ports[0]
        status["connected"] = True
        status["port"] = device.device
        status["status_color"] = "green"
        
        # Attempt to guess board type from description
        desc = device.description.lower()
        if "uno" in desc:
            status["board"] = "Arduino Uno"
        elif "mega" in desc:
            status["board"] = "Arduino Mega"
        elif "esp32" in desc:
            status["board"] = "ESP32 Dev Module"
        else:
            status["board"] = "Universal Serial Board" # Fallback

        # If we found a device, we assume standard config for this project
        status["rate"] = "1 Hz"
        status["sensors"] = 5 # Standard array: PM2.5, PM10, Nox, CO, Temp/Hum
    
    return status

import serial
import json
import random
from datetime import datetime, timezone
from services import aqi_calculator

# Global serial connection
serial_connection = None

def get_live_readings():
    """
    Reads a line from the connected serial port, parses it, and returns raw + derived data.
    Expected Format: JSON string from Arduino -> {"pm25": 10, "pm10": 20, "co": 150, "no2": 10, "temp": 25.5, "hum": 50, "fan": 1200}
    """
    global serial_connection
    status = get_hardware_status()
    
    data = {
        "raw": None,
        "derived": None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    if not status["connected"]:
        return data

    try:
        # Initialize if needed
        if serial_connection is None or not serial_connection.is_open:
            serial_connection = serial.Serial(status["port"], 9600, timeout=1)
        
        # Read Data
        if serial_connection.in_waiting > 0:
            line = serial_connection.readline().decode('utf-8').strip()
            # Attempt Parse
            # Attempt Parse
            raw_values = {}
            try:
                # Try parsing JSON first
                raw_values = json.loads(line)
            except json.JSONDecodeError:
                # Fallback: Key=Value format (e.g. PM25=10,TEMP=25.5)
                try:
                    parts = line.split(',')
                    for part in parts:
                        if '=' in part:
                            k, v = part.strip().split('=')
                            k = k.strip().upper()
                            # Map external keys to internal expected keys
                            val = float(v.strip())
                            if k == 'PM25': raw_values['pm25'] = val
                            elif k == 'PM10': raw_values['pm10'] = val
                            elif k == 'CO': raw_values['co'] = val
                            elif k == 'NO2': raw_values['no2'] = val
                            elif k == 'TEMP': raw_values['temp'] = val
                            elif k == 'HUM': raw_values['hum'] = val
                            elif k == 'FAN_RPM' or k == 'FAN': raw_values['fan'] = val
                except ValueError:
                    pass

            # If parsing failed completely or yielded empty data, skip
            if not raw_values:
                return data

            # Normalize Keys
            raw = {
                "pm2_5": raw_values.get("pm25", 0),
                "pm10": raw_values.get("pm10", 0),
                "co": raw_values.get("co", 0),
                "no2": raw_values.get("no2", 0),
                "temperature": raw_values.get("temp", 0),
                "humidity": raw_values.get("hum", 0),
                "fan_rpm": raw_values.get("fan", 0)
            }
            
            data["raw"] = raw

            # Calculate Derived
            pollutants = {
                "pm2_5": raw["pm2_5"],
                "pm10": raw["pm10"],
                "co": raw["co"],
                "no2": raw["no2"],
                "so2": 0, "o3": 0, "nh3": 0 # Default/Missing
            }
            
            aqi_res = aqi_calculator.calculate_cpcb_aqi(pollutants)
            
            # Simple stability: delta variance is not stored here so we categorize based on current noise
            # or simply random wobble for "demo" if it were a demo, but here we can check standard deviation if we had history.
            # We'll use a heuristic: steady fan + moderate AQI = Stable.
            stability_score = 100
            if raw["fan_rpm"] > 0 and abs(raw["fan_rpm"] - 1200) > 200:
                stability_score -= 20
            if aqi_res["aqi_value"] > 100:
                stability_score -= 30
            
            data["derived"] = {
                "aqi": aqi_res["aqi_value"],
                "dominant_pollutant": aqi_res["dominant_pollutant"],
                "stability": max(0, stability_score),
                "noise_level": "Low" if raw["fan_rpm"] < 800 else "Moderate" if raw["fan_rpm"] < 1500 else "High"
            }

    except Exception as e:
        print(f"Serial Read Error: {e}")
        # Close connection on error to reset
        if serial_connection:
            serial_connection.close()
            serial_connection = None
            
    # Process Run Lifecycle
    process_run_lifecycle(data)

    return data

# Run State
current_run = {
    "active": False,
    "start_time": None,
    "run_id": None,
    "data_points": [],
}

from services import storage_service

def process_run_lifecycle(data):
    """
    Manages the lifecycle of a 'Run' (Session).
    - Starts when connected + data received.
    - Accumulates data.
    - Ends when disconnected.
    """
    global current_run
    
    is_connected = data.get("raw") is not None
    
    # CASE 1: Start Run
    if is_connected and not current_run["active"]:
        timestamp = datetime.now(timezone.utc)
        run_id = f"Run_{timestamp.strftime('%Y-%m-%d_%H-%M-%S')}"
        current_run = {
            "active": True,
            "start_time": timestamp,
            "run_id": run_id,
            "data_points": []
        }
        print(f"--- STARTED NEW RUN: {run_id} ---")

    # CASE 2: Update Run
    if is_connected and current_run["active"]:
        data_point = {
            "pm2_5": data["raw"]["pm2_5"],
            "pm10": data["raw"]["pm10"],
            "aqi": data["derived"]["aqi"],
            "stability": data["derived"]["stability"]
        }
        current_run["data_points"].append(data_point)
        
        # Log to Raw Data collection (Engineering Layer)
        raw_log = {
            "run_id": current_run["run_id"],
            "timestamp": data["timestamp"],
            "pm25": data["raw"]["pm2_5"],
            "pm10": data["raw"]["pm10"],
            "co": data["raw"]["co"],
            "no2": data["raw"]["no2"],
            "temperature": data["raw"]["temperature"],
            "humidity": data["raw"]["humidity"],
            "fan_rpm": data["raw"]["fan_rpm"]
        }
        storage_service.log_raw_sensor_data(raw_log)

    # CASE 3: End Run (Disconnected but was active)
    if not is_connected and current_run["active"]:
        # Calculate Summary
        end_time = datetime.now(timezone.utc)
        duration = (end_time - current_run["start_time"]).total_seconds()
        
        points = current_run["data_points"]
        count = len(points)
        
        if count > 0:
            avg_pm25 = sum(p["pm2_5"] for p in points) / count
            avg_pm10 = sum(p["pm10"] for p in points) / count
            peak_aqi = max(p["aqi"] for p in points)
            avg_stability = sum(p["stability"] for p in points) / count
        else:
            avg_pm25 = 0
            avg_pm10 = 0
            peak_aqi = 0
            avg_stability = 0
            
        # Determine Dominant Pollutant (Simplified Heuristic)
        # In reality, this would be based on AQI sub-indices.
        # Here we assume if PM2.5 is high relative to PM10 (e.g. > 50% of PM10), it's the primary concern.
        # Or simply, usually PM2.5 is the main health concern.
        # Let's use a simple check: if PM2.5 is significant > 0, we label it, otherwise PM10.
        dominant = "PM2.5" if avg_pm25 > 0 else "PM10"
        
        summary = {
            "run_id": current_run["run_id"],
            "start_time": current_run["start_time"].isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": int(duration),
            "data_points_count": count,
            "avg_pm25": round(avg_pm25, 2),
            "avg_pm10": round(avg_pm10, 2),
            "peak_aqi": peak_aqi,
            "sensor_stability_score": int(avg_stability),
            "dominant_pollutant": dominant
        }
        
        # Persist
        storage_service.log_run_summary(summary)
        print(f"--- ENDED RUN: {current_run['run_id']} ---")
        
        # Reset
        current_run = {
            "active": False,
            "start_time": None,
            "run_id": None,
            "data_points": []
        }

def get_current_run_stats():
    """
    Returns live stats for the currently active run.
    """
    if not current_run["active"]:
        return None
        
    now = datetime.now(timezone.utc)
    duration = (now - current_run["start_time"]).total_seconds()
    points = current_run["data_points"]
    count = len(points)
    
    if count > 0:
        avg_pm25 = sum(p["pm2_5"] for p in points) / count
        peak_aqi = max(p["aqi"] for p in points)
    else:
        avg_pm25 = 0
        peak_aqi = 0
        
    return {
        "run_id": current_run["run_id"],
        "start_time": current_run["start_time"].isoformat(),
        "duration": _format_duration(duration),
        "data_points": count,
        "avg_pm25": round(avg_pm25, 1),
        "peak_aqi": peak_aqi
    }

def _format_duration(seconds):
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d}"

def get_current_run_raw_data():
    """
    Returns the full list of data points for the current run.
    """
    if not current_run["active"]:
        return []
    return current_run["data_points"]
