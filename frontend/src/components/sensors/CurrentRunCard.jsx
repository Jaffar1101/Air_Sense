
import React from 'react';

const CurrentRunCard = ({ runData }) => {
    // If we reach here, we likely have active runData, but checking just in case
    if (!runData || !runData.active) return null;

    return (
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-card shadow-card border border-emerald-100/50 p-6 md:p-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></span>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Active Session Recording</h2>
                    </div>
                    <p className="text-sm text-gray-500 font-mono">{runData.run_id}</p>
                </div>

                <div className="px-4 py-2 bg-white rounded-lg border border-emerald-100 shadow-sm flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</span>
                    <span className="text-xl font-bold text-emerald-600 font-mono tabular-nums">
                        {runData.duration}s
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data Points</p>
                    <p className="text-2xl font-bold text-gray-700">{runData.data_points.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Avg PM2.5</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-blue-600">{runData.avg_pm25}</p>
                        <span className="text-xs text-gray-400">µg/m³</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Peak AQI</p>
                    <p className="text-2xl font-bold text-purple-600">{runData.peak_aqi}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stability</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${runData.sensor_stability_score || 0}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-600">{runData.sensor_stability_score}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentRunCard;
