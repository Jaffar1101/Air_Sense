/**
 * @typedef {Object} AgentStatusResponse
 * @property {string} timestamp - ISO 8601 UTC timestamp
 * @property {string} mode - Operating mode (Monitoring, Purifying, Eco, etc.)
 * @property {number} fan_speed - Fan speed percentage (0-100)
 * @property {number} confidence - Confidence score (0-100)
 * @property {string} explanation - Human-readable reasoning for the action
 * @property {number} predicted_aqi - Forecasted AQI for the next hour
 * @property {string} readiness - System readiness state (Ready, Calibrating, etc.)
 * @property {number} filter_stress - Simulated stress on the filter (0.0 - 1.0)
 * @property {string} primary_driver - Main factor influencing AQI (e.g., PM2.5, Weather Stagnation)
 * @property {string} risk_level - Human-readable risk assessment (e.g., Moderate, Severe)
 * @property {Array<{label: string, enabled: boolean, info: string}>} preventive_actions - Checklist of recommended actions
 * @property {string} filter_stress_level - Projected stress level (Low, Moderate, High)
 * @property {string} filter_stress_explanation - Explanation for the stress projection
 * @property {number} filter_health - Effective Filter Health percentage (0-100)
 * @property {number} fan_performance - Fan Performance Efficiency percentage (0-100)
 * @property {string[]} maintenance_insights - List of factual maintenance insights
 */

const API_BASE_URL = "http://localhost:8000";

/**
 * Fetches the latest agent status with rich metadata.
 * @returns {Promise<AgentStatusResponse | null>} The agent status or null if unavailable.
 */
export const fetchAgentStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/agent/latest`);
        if (!response.ok) {
            console.warn(`Agent API Error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Basic validation to ensure it's not an empty object
        if (!data || Object.keys(data).length === 0) {
            return null;
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch agent status:", error);
        return null;
    }
};
