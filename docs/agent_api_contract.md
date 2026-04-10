# Agent API Contract

This document defines the strict API response structure for the AI Agent services.

**Base URL**: `http://localhost:8000`

---

## 1. Agent Latest Action

**Endpoint**: `GET /agent/latest`

**Description**: Returns the most recent decision made by the AI Agent. The agent runs independently and logs decisions to the database; this endpoint retrieves the newest log entry.

### Response JSON Structure

```json
{
  "timestamp": "2026-01-21T10:30:05.123456+00:00", // string, required (ISO 8601 UTC)
  "mode": "Purifying",                             // string, required
  "fan_speed": 85,                                 // int, required (0-100)
  "confidence": 0.92,                              // float, required (0.0 - 1.0)
  "reasoning": "Air quality is deteriorating significantly; increasing fan speed to compensate." // string, required
}
```

### Field Details

| Field | Type | Description |
| :--- | :--- | :--- |
| `timestamp` | `string` | ISO 8601 UTC timestamp of when the decision was made. |
| `mode` | `string` | The operating mode recommended by the agent. Expected values: `"Monitoring"`, `"Purifying"`, `"Eco"`. |
| `fan_speed` | `int` | Recommended fan speed percentage (0-100). |
| `confidence` | `float` | The agent's confidence score for this decision (0.0 to 1.0). |
| `reasoning` | `string` | Human-readable explanation of why this action was chosen. |

### Confidence Levels (Frontend Interpretation)

The frontend should map the raw `confidence` float to user-friendly labels as follows:

- **< 0.40** (< 40%): **"Learning"**
- **0.40 - 0.70** (40% - 70%): **"Moderate confidence"**
- **> 0.70** (> 70%): **"High confidence"**

*Note: If no actions exist in the database (e.g., fresh install), the API returns an empty JSON object `{}` or `null`.*
