import React, { useState, useEffect } from 'react';
import { fetchAgentStatus } from '../../api/agent';

const ForecastSummary = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStatus = async () => {
            const data = await fetchAgentStatus();
            if (data) setStatus(data);
            setLoading(false);
        };
        loadStatus();
        const interval = setInterval(loadStatus, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    const getSeverityColor = (aqi) => {
        if (aqi <= 50) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100' };
        if (aqi <= 100) return { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200', badge: 'bg-lime-100' };
        if (aqi <= 200) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-100' };
        if (aqi <= 300) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100' };
        if (aqi <= 400) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100' };
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-100' };
    };

    if (loading) return <div className="p-6 text-center text-gray-500 text-sm">Loading Forecast Summary...</div>;
    if (!status) return null;

    const colors = getSeverityColor(status.predicted_aqi);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Predicted AQI Card */}
            <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
                <p className={`text-xs font-bold uppercase ${colors.text} opacity-80 mb-1`}>Predicted AQI (1h)</p>
                <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${colors.text}`}>{status.predicted_aqi}</span>
                    <span className={`text-xs font-medium ${colors.text} opacity-75`}>US AQI</span>
                </div>
            </div>

            {/* Confidence Card */}
            <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">Confidence</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-800">{Math.round(status.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${status.confidence * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Risk Level Card */}
            <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">Risk Level</p>
                <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge} ${colors.text}`}>
                        {status.risk_level || "Assessing..."}
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Based on predictive model</p>
            </div>

            {/* Primary Driver */}
            <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">Primary Driver</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-gray-700">{status.primary_driver || "Analyzing..."}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                    Dominant factor influencing current forecast.
                </p>
            </div>
        </div>
    );
};

export default ForecastSummary;
