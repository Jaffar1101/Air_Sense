# Air Quality Agent

An autonomous AI system for indoor air quality management.

## Features
*   **Adaptive Learning**: Updates prediction models in real-time based on new sensor data.
*   **Spike Detection**: Anticipates pollution surges.
*   **Filter Health Tracking**: estimates biodegradation.
*   **API**: FastAPI-based REST interface.

## Quick Start

### 1. Install Dependencies & Setup DB
```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 2. Run the API
```bash
uvicorn api:app --reload --port 8001
```
The API will be available at `http://localhost:8001`.

### 3. Usage
Send a POST request to `/run-agent`:
```bash
curl -X POST "http://localhost:8001/run-agent" \
     -H "Content-Type: application/json" \
     -d '{
           "pm25": 45,
           "hour": 14,
           "usage_hours": 200,
           "gas_index": 12 
         }'
```

Get recent data:
```bash
curl "http://localhost:8001/snapshots?limit=10"
```

### 4. Evaluation
Check model accuracy:
```bash
python scripts/evaluate_system.py
```

## Testing
Run the full test suite:
```bash
python -m unittest discover tests
```
