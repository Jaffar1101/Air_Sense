from datetime import datetime, timedelta
from database import get_db

def log_data(data):
    """
    Logs data to MongoDB 'environment_snapshots' collection.
    """
    db = get_db()
    if db is None:
        print("MongoDB not connected. Skipping log.")
        return

    collection = db["environment_snapshots"]
    
    try:
        if "timestamp" not in data:
            data["timestamp"] = datetime.utcnow().isoformat()

        # Duplicate Prevention: 1 snapshot per minute
        # Parse timestamp string safely
        ts_str = data["timestamp"]
        # Handle "Z" or timezone offsets if present, though utcnow().isoformat() is clean
        current_ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        
        start_of_minute = current_ts.replace(second=0, microsecond=0)
        end_of_minute = current_ts.replace(second=59, microsecond=999999)
        
        # Check if a record already exists in this minute window
        duplicate = collection.find_one({
            "timestamp": {
                "$gte": start_of_minute.isoformat(),
                "$lte": end_of_minute.isoformat()
            }
        })
        
        if duplicate:
            print(f"Skipping duplicate log for minute: {start_of_minute.isoformat()}")
            return

        # Insert record
        collection.insert_one(data)
        print(f"Logged value to MongoDB at {data['timestamp']}")

    except Exception as e:
        print(f"Error logging to MongoDB: {e}")

def get_history(hours=24):
    """
    Retrieves historical AQI data from MongoDB.
    Returns a list of simplified objects for the trend graph.
    """
    db = get_db()
    if db is None:
        return []
    
    collection = db["environment_snapshots"]
    
    # Calculate cutoff time
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    cutoff_str = cutoff.isoformat()
    
    try:
        # Query: Get documents newer than cutoff
        cursor = collection.find(
            {"timestamp": {"$gte": cutoff_str}},
            {
                "_id": 0, 
                "timestamp": 1, 
                "air_quality": 1, 
                "weather.wind_speed": 1
            }
        ).sort("timestamp", 1) # Sort ascending (oldest to newest)
        
        history = []
        for doc in cursor:
            aq = doc.get("air_quality", {})
            weather = doc.get("weather", {})
            history.append({
                "timestamp": doc.get("timestamp"),
                "aqi": aq.get("aqi"),
                "category": aq.get("category"),
                "dominant_pollutant": aq.get("dominant_pollutant"),
                "pm25": aq.get("pm25", 0),
                "pm10": aq.get("pm10", 0),
                "wind_speed": weather.get("wind_speed", 0)
            })
            
        return history
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

def log_run_summary(run_data):
    """
    Persists a summary of a sensor run to 'run_summaries' collection.
    """
    db = get_db()
    if db is None:
        return
    
    collection = db["run_summaries"]
    try:
        # Use run_id as unique index ideally, but insert as new doc
        collection.insert_one(run_data)
        print(f"Logged run summary: {run_data['run_id']}")
    except Exception as e:
        print(f"Error logging run summary: {e}")

def get_run_history(limit=20):
    """
    Retrieves the most recent run summaries.
    """
    db = get_db()
    if db is None:
        return []

    collection = db["run_summaries"]
    try:
        cursor = collection.find(
            {}, 
            {"_id": 0}
        ).sort("start_time", -1).limit(limit)
        
        return list(cursor)
    except Exception as e:
        print(f"Error fetching run history: {e}")
        return []

def log_raw_sensor_data(raw_data):
    """
    Logs raw sensor time-series to 'sensor_raw_data' collection.
    """
    db = get_db()
    if db is None:
        return
        
    collection = db["sensor_raw_data"]
    try:
        collection.insert_one(raw_data)
    except Exception as e:
        print(f"Error logging raw sensor data: {e}")
