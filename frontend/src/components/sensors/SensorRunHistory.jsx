
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SensorRunHistory = () => {
    const [history, setHistory] = useState([]);
    const [selectedRun, setSelectedRun] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('http://localhost:8000/hardware/runs');
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                }
            } catch (e) {
                console.error("History fetch error", e);
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 10000);
        return () => clearInterval(interval);
    }, []);

    const getStatus = (stability) => {
        if (!stability) return { label: 'Incomplete', color: 'bg-gray-100 text-gray-500' };
        if (stability > 80) return { label: 'Stable', color: 'bg-emerald-100 text-emerald-700' };
        if (stability > 50) return { label: 'Noisy', color: 'bg-yellow-100 text-yellow-700' };
        return { label: 'Unstable', color: 'bg-red-100 text-red-700' };
    };

    return (
        <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Session History</h3>
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Total Runs: {history.length}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="p-5">Run ID</th>
                            <th className="p-5">Date</th>
                            <th className="p-5">Duration</th>
                            <th className="p-5">Dominant</th>
                            <th className="p-5">Avg AQI</th>
                            <th className="p-5">Peak AQI</th>
                            <th className="p-5">Status</th>
                            <th className="p-5"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-12 text-center text-gray-400">
                                    No recorded sessions found.
                                </td>
                            </tr>
                        ) : (
                            history.map((run) => {
                                const status = getStatus(run.sensor_stability_score);
                                return (
                                    <tr
                                        key={run.run_id}
                                        onClick={() => setSelectedRun(run)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                                    >
                                        <td className="p-5 font-mono text-gray-600 font-medium group-hover:text-primary transition-colors">
                                            {run.run_id}
                                        </td>
                                        <td className="p-5 text-gray-500">
                                            {new Date(run.start_time).toLocaleDateString()} <span className="text-xs text-gray-300 ml-1">{new Date(run.start_time).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="p-5 text-gray-500 font-mono">
                                            {run.duration_seconds}s
                                        </td>
                                        <td className="p-5">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                                                {run.dominant_pollutant || "PM2.5"}
                                            </span>
                                        </td>
                                        <td className="p-5 font-bold text-gray-700">
                                            {run.avg_pm25}
                                        </td>
                                        <td className="p-5 font-bold text-indigo-600">
                                            {run.peak_aqi}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button className="text-gray-300 hover:text-primary transition-colors">
                                                ➔
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Enhanced Detail Modal */}
            <AnimatePresence>
                {selectedRun && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedRun(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h4 className="text-xl font-bold text-gray-800">{selectedRun.run_id}</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(selectedRun.start_time).toLocaleString()} — {new Date(selectedRun.end_time).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatus(selectedRun.sensor_stability_score).color}`}>
                                    {getStatus(selectedRun.sensor_stability_score).label}
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Col: Primary Metrics */}
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dominant Pollutant</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                                                🌫️
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800">{selectedRun.dominant_pollutant || "PM2.5"}</p>
                                                <p className="text-xs text-gray-500">Based on mass concentration</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <p className="text-xs text-blue-400 font-bold uppercase mb-1">Avg PM2.5</p>
                                            <p className="text-2xl font-bold text-blue-600">{selectedRun.avg_pm25}</p>
                                        </div>
                                        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                            <p className="text-xs text-indigo-400 font-bold uppercase mb-1">Avg PM10</p>
                                            <p className="text-2xl font-bold text-indigo-600">{selectedRun.avg_pm10}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Col: Session Stats */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Duration</span>
                                        <span className="font-mono font-bold text-gray-700">{selectedRun.duration_seconds}s</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Data Points Collected</span>
                                        <span className="font-bold text-gray-700">{selectedRun.data_points_count}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Peak AQI Recorded</span>
                                        <span className="font-bold text-purple-600">{selectedRun.peak_aqi}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Sensor Stability</span>
                                        <span className="font-bold text-gray-700">{selectedRun.sensor_stability_score}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 flex justify-end">
                                <button
                                    onClick={() => setSelectedRun(null)}
                                    className="px-6 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SensorRunHistory;
