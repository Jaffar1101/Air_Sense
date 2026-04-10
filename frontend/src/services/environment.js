/**
 * @typedef {Object} LocationData
 * @property {number} lat
 * @property {number} lon
 * @property {string|null} city
 */

/**
 * @typedef {Object} WeatherData
 * @property {number} temperature
 * @property {number} feels_like
 * @property {number} humidity
 * @property {number} wind_speed
 * @property {number} [pressure]
 * @property {string} condition
 */

/**
 * @typedef {Object} AirQualityData
 * @property {number} aqi
 * @property {string} category
 * @property {string} dominant_pollutant
 * @property {number} pm25
 * @property {number} pm10
 * @property {number} no2
 * @property {number} so2
 * @property {number} co
 * @property {number} o3
 */

/**
 * @typedef {Object} LiveEnvironmentResponse
 * @property {LocationData} location
 * @property {WeatherData} weather
 * @property {AirQualityData} air_quality
 * @property {string} timestamp
 */

const API_BASE_URL = "http://localhost:8000";

/**
 * Fetches live environment data.
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<LiveEnvironmentResponse>}
 */
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
        throw error;
    }
};

/**
 * Fetches historical environment data.
 * @param {number} hours 
 * @returns {Promise<any[]>}
 */
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
