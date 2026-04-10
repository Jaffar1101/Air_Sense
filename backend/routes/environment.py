from fastapi import APIRouter
from services import environment_service, storage_service

router = APIRouter()

@router.get("/live")
def get_live_environment(lat: float, lon: float):
    # 1. Fetch Data (Critical)
    try:
        data = environment_service.get_normalized_data(lat, lon)
        if not data:
            return {"error": "Unable to fetch live data"}
    except Exception as e:
        print(f"Fetch Error: {e}")
        return {"error": "Unable to fetch live data"}

    # 2. Log Data (Non-Critical)
    try:
        # Pass a copy to avoid mutation by PyMongo (which adds _id)
        storage_service.log_data(data.copy())
    except Exception as e:
        # Log error internally but do NOT fail the request
        print(f"Logging Error (Ignored): {e}")

    # 3. Return Data
    return data

@router.get("/history")
def get_history(hours: int = 24):
    """
    Get historical AQI trend data.
    Defaults to last 24 hours.
    """
    try:
        return storage_service.get_history(hours)
    except Exception as e:
        print(f"Error fetching history: {e}")
        # Return empty list on error
        return []
