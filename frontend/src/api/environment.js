const API_BASE_URL = "http://localhost:8000";

export const fetchLiveEnvironment = async (lat, lon) => {
    try {
        const response = await fetch(`${API_BASE_URL}/environment/live?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data;
    } catch (error) {
        console.error("API Error:", error);
        return { error: "Failed to connect to sensor network" };
    }
};

export const fetchHistory = async (hours = 24) => {
    try {
        const response = await fetch(`${API_BASE_URL}/environment/history?hours=${hours}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("History API Error:", error);
        return [];
    }
};

export const fetchLatestAgentAction = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/agent/latest`);
        if (!response.ok) {
            // It's okay if it fails or returns 503 (DB down), just return null
            return null;
        }
        const data = await response.json();
        // If empty object, return null
        if (Object.keys(data).length === 0) return null;
        return data;
    } catch (error) {
        console.warn("Agent API Error:", error);
        return null;
    }
};
