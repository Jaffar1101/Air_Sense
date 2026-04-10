from fastapi import FastAPI, Response, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from air_quality_agent.agent import AirQualityAgent
import uvicorn
import json

# Initialize the API app
app = FastAPI(title="Air Quality Agent API", version="1.0.0")

# Initialize the agent once (Global state)
print("Starting API: Initializing Agent...")
agent = AirQualityAgent()

# --- Pydantic Models for Validation ---

class AgentInput(BaseModel):
    pm25: float = Field(default=0.0, description="Current PM2.5 pollution level")
    hour: int = Field(default=12, description="Current hour of the day (0-23)")
    usage_hours: float = Field(default=0.0, description="Total hours the filter has been used")
    gas_index: float = Field(default=0.0, description="Gas/VOC index reading")
    current_fan_speed: str = Field(default="OFF", description="Current fan speed state")
    history_pm25: list[float] = Field(default_factory=list, description="Recent PM2.5 readings history")
    override: Dict[str, Any] = Field(default_factory=dict, description="Manual override configuration")

    @field_validator('pm25', 'usage_hours', 'gas_index')
    @classmethod
    def clamp_non_negative(cls, v: float) -> float:
        """Ensure physical values are non-negative."""
        return max(0.0, float(v))

    @field_validator('hour')
    @classmethod
    def validate_hour(cls, v: int) -> int:
        """Ensure hour is within 0-23 range (cyclic)."""
        return int(v) % 24

    @field_validator('current_fan_speed')
    @classmethod
    def normalize_fan_speed(cls, v: str) -> str:
        """Normalize fan speed string."""
        return str(v).upper()

# --- API Endpoints ---

@app.get("/")
def home():
    return {"message": "Air Quality Agent API is running. POST to /run-agent to use."}

@app.post("/run-agent")
async def run_agent(data: AgentInput):
    """
    Executes the Air Quality Agent with validated inputs.
    
    The input is sanitized (clamped non-negative, hour modulo 24) before being passed to the agent.
    Returns the full JSON decision response.
    """
    try:
        # Convert Pydantic model to dict
        # parse_obj or similar is deprecated in v2, model_dump is standard now, 
        # but safely supporting v1/v2 agnostic if needed. Using model_dump (v2) or dict (v1).
        # We'll use .dict() for broad compatibility or .model_dump() if v2.
        # Given standard environments, .dict() works on both usually (deprecated in v2 but exists).
        # Let's use clean approach.
        clean_data = data.model_dump() if hasattr(data, "model_dump") else data.dict()
        
        # Run Agent
        # agent.get_json returns a serialized string.
        result_json_str = agent.get_json(clean_data)
        
        return Response(content=result_json_str, media_type="application/json")
        
    except Exception as e:
        # Fallback error handling to prevent crash
        print(f"API Error: {e}")
        error_response = {
            "error": "Internal Processing Error",
            "details": str(e),
            "status": "failed"
        }
        return Response(content=json.dumps(error_response), status_code=500, media_type="application/json")

@app.get("/snapshots")
def get_snapshots(limit: int = 60):
    """
    Exposes recent historical data from MongoDB.
    Limit defaults to 60.
    """
    from air_quality_agent.modules.db import get_recent_snapshots
    return get_recent_snapshots(limit)

@app.post("/predict-live")
async def predict_live():
    """
    Triggers a prediction cycle using the absolute latest data from MongoDB.
    Ignores manual input. Returns Prediction + Confidence.
    """
    result = agent.predict_from_live_data()
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
