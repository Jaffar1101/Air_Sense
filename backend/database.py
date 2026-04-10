
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "environment_monitoring"

_client = None

def get_db_client():
    global _client
    if _client is None:
        if not MONGODB_URI:
            print("Warning: MONGODB_URI not set in environment variables.")
            return None
        try:
            # Create a client with a short timeout to prevent hanging if the DB is unreachable
            # Use certifi to fix SSL certificate verification issues on Mac
            _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
            # Trigger a connection check
            _client.admin.command('ping')
            print("Successfully connected to MongoDB Atlas.")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"Failed to connect to MongoDB: {e}")
            _client = None
    return _client

def get_db():
    client = get_db_client()
    if client:
        return client[DB_NAME]
    return None

def init_mongo_collections(db):
    """
    Initialize required collections and indexes.
    This operation is idempotent.
    """
    REQUIRED_COLLECTIONS = ["environment_snapshots", "agent_actions", "agent_rewards"]
    
    try:
        print("Initializing MongoDB collections...")
        for col_name in REQUIRED_COLLECTIONS:
            # Accessing the collection creates it if it doesn't exist (lazy creation)
            collection = db[col_name]
            
            # Create index on timestamp (idempotent)
            collection.create_index("timestamp")
            print(f"Verified collection '{col_name}' and index on 'timestamp'.")
            
        print("MongoDB collections initialized successfully.")
    except Exception as e:
        print(f"Error initializing MongoDB collections: {e}")
