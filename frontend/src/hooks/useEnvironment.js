import { useState, useEffect } from 'react';
import { fetchLiveEnvironment } from '../services/environment';
import { fetchAgentStatus } from '../api/agent';

/**
 * Hook to fetch live environment data and agent status.
 * Polling interval: 60 seconds.
 * 
 * @param {number} lat 
 * @param {number} lon 
 */
export const useLiveEnvironment = (lat, lon) => {
    const [data, setData] = useState(null);
    const [agentAction, setAgentAction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = async () => {
        try {
            // We set loading true only on initial load to avoid UI flicker during polling
            if (!data) setLoading(true);

            // Parallel fetch
            const [envData, agentData] = await Promise.all([
                fetchLiveEnvironment(lat, lon).catch(err => {
                    console.error("Env fetch failed:", err);
                    return null;
                }),
                fetchAgentStatus().catch(err => {
                    console.error("Agent fetch failed:", err);
                    return null;
                })
            ]);

            if (envData) {
                setData(envData);
                setError(null);
            } else {
                setError("Failed to fetch live data");
            }

            if (agentData) {
                setAgentAction(agentData);
            }

            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 60000); // Poll every 60s
        return () => clearInterval(intervalId);
    }, [lat, lon]);

    return { data, agentAction, loading, error, lastUpdated };
};
