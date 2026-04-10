
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const StatusCard = ({ label, value, subValue, icon, active, color = 'emerald' }) => {
    return (
        <div className="bg-white p-4 rounded-card shadow-card flex items-center gap-4 relative overflow-hidden group">
            {active && (
                <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500`}></div>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${color}-50 text-${color}-600 text-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-text-secondary uppercase font-bold tracking-wider">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-text-primary">{value}</p>
                    {subValue && <span className="text-xs text-gray-400 font-mono">{subValue}</span>}
                </div>
            </div>
        </div>
    );
};

const SensorStatusBar = () => {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('http://localhost:8000/hardware/status');
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
            } catch (e) {
                console.error("Hardware status fetch failed", e);
                setStatus({ connected: false });
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fallback or "Connected" determines logic
    const isConnected = status?.connected;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
            <StatusCard
                label="Hardware Status"
                value={isConnected ? "Connected" : "Disconnected"}
                icon={isConnected ? "🔌" : "❌"}
                active={isConnected}
                color={isConnected ? "emerald" : "red"}
            />
            {isConnected ? (
                <>
                    <StatusCard
                        label="Board Info"
                        value={status.board || "Unknown"}
                        icon="🎛️"
                        color="blue"
                    />
                    <StatusCard
                        label="Port"
                        value={status.port || "Auto"}
                        icon="🔗"
                        color="indigo"
                    />
                    <StatusCard
                        label="Sampling Rate"
                        value={status.rate || "--"}
                        subValue="Hz"
                        icon="⚡"
                        color="amber"
                    />
                </>
            ) : (
                <>
                    <StatusCard label="Board Info" value="--" icon="🎛️" color="gray" />
                    <StatusCard label="Port" value="--" icon="🔗" color="gray" />
                    <StatusCard label="Sampling Rate" value="--" icon="⚡" color="gray" />
                </>
            )}
        </motion.div>
    );
};

export default SensorStatusBar;
