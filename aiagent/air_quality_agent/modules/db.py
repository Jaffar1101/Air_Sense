import os
import pymongo
from dotenv import load_dotenv
import certifi

# Load env immediately
load_dotenv()

def get_db_client():
    uri = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
    if not uri:
        print("Warning: MONGO_URI (or MONGODB_URI) not found in environment variables.")
        return None
    try:
        # Create a new client and connect to the server
        client = pymongo.MongoClient(uri, tlsCAFile=certifi.where())
        # Send a ping to confirm a successful connection
        client.admin.command('ping')
        return client
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

def get_recent_snapshots(limit=60):
    """
    Fetches the most recent snapshots from the 'snapshots' collection.
    Defaults to 60 records (e.g., last hour if 1/min).
    READ-ONLY: Does not modify data.
    """
    client = get_db_client()
    if not client:
        return []

    try:
        # Assuming database name 'air_quality_db' and collection 'snapshots'
        # Adjust names if specified, otherwise defaulting to standard convention
        db = client.environment_monitoring
        collection = db.environment_snapshots
        
        # specific projection to return essential fields only? Or all?
        # User asked to "Expose function", implies returning list of docs.
        # Sort descending by timestamp (assuming 'timestamp' or '_id').
        # Using _id for natural recency if timestamp missing, or explicit 'timestamp'
        
        cursor = collection.find().sort("_id", -1).limit(limit)
        
        snapshots = []
        for doc in cursor:
            # Convert ObjectId to string for JSON serialization compatibility
            doc["_id"] = str(doc["_id"])
            snapshots.append(doc)
            
        return snapshots
    except Exception as e:
        print(f"Error fetching snapshots: {e}")
        return []
    finally:
        client.close()

def get_latest_context():
    """
    Fetches the single most recent snapshot to act as the current state.
    Returns dict or None.
    """
    snapshots = get_recent_snapshots(limit=1)
    if snapshots:
        return snapshots[0]
    return None

def get_trend(limit=5):
    """
    Returns list of dicts [{'pm25': x, 'gas': y}, ...]
    """
    snapshots = get_recent_snapshots(limit=limit)
    values = []
    for s in snapshots:
        pm = float(s.get('pm25') or s.get('aqi') or 0)
        gas = float(s.get('gas_index') or s.get('voc') or 0)
        values.append({'pm25': pm, 'gas': gas})
    return values

def log_action(action_data):
    """
    Logs agent decisions to 'agent_actions' collection.
    action_data: dict containing timestamp, environment_snapshot_id, action, confidence
    """
    client = get_db_client()
    if not client:
        return
    
    try:
        db = client.environment_monitoring
        collection = db.agent_actions
        # Insert
        collection.insert_one(action_data)
        # print("Action logged to MongoDB.")
    except Exception as e:
        print(f"Error logging action: {e}")
    finally:
        client.close()

def log_reward(reward_data):
    """
    Logs calculate rewards to 'agent_rewards' collection.
    """
    client = get_db_client()
    if not client:
        return

    try:
        db = client.environment_monitoring
        collection = db.agent_rewards
        collection.insert_one(reward_data)
    except Exception as e:
        print(f"Error logging reward: {e}")
    finally:
        client.close()

def get_recent_rewards(limit=10):
    """
    Returns list of validation 'reward' values (floats) from recent history.
    """
    client = get_db_client()
    if not client:
        return []

    try:
        db = client.environment_monitoring
        collection = db.agent_rewards
        # Sort desc by timestamp
        cursor = collection.find({}, {"reward": 1}).sort("timestamp", -1).limit(limit)
        
        rewards = []
        for doc in cursor:
             r = doc.get("reward")
             if r is not None:
                 rewards.append(float(r))
        return rewards
    except Exception:
        return []
    finally:
        client.close()

def log_prediction_evaluation(eval_data):
    """
    Logs prediction accuracy checks: {timestamp, predicted_aqi, actual_aqi, error}
    """
    client = get_db_client()
    if not client:
        return

    try:
        db = client.environment_monitoring
        collection = db.prediction_evaluations
        collection.insert_one(eval_data)
    except Exception as e:
        print(f"Error logging eval: {e}")
    finally:
        client.close()
