
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

const RawDataInspector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState([]);

    // Poll for data only when open
    useEffect(() => {
        let interval;
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8000/hardware/run/current/data');
                if (res.ok) {
                    const points = await res.json();
                    // Add index for simple X-Axis
                    const indexed = points.map((p, i) => ({ ...p, index: i + 1 }));
                    setData(indexed);
                }
            } catch (e) {
                console.error("Inspector fetch error", e);
            }
        };

        if (isOpen) {
            fetchData();
            interval = setInterval(fetchData, 2000);
        }

        return () => clearInterval(interval);
    }, [isOpen]);

    const handleDownloadCSV = () => {
        if (!data || data.length === 0) return;

        const headers = ["Index", "PM2.5", "PM10", "AQI", "Stability"];
        const rows = data.map(row =>
            [row.index, row.pm2_5, row.pm10, row.aqi, row.stability].join(",")
        );

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sensor_run_data_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-700">Raw Data Inspector</h3>
                        <p className="text-xs text-gray-400">View real-time series graph and export datasets.</p>
                    </div>
                </div>
                <span className={`text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100"
                    >
                        <div className="p-6 space-y-8">

                            {/* Controls */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                                    {data.length} Data Points Collected
                                </span>
                                <button
                                    onClick={handleDownloadCSV}
                                    disabled={data.length === 0}
                                    className={`px-4 py-2 rounded text-sm font-bold flex items-center gap-2 
                                        ${data.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                                    `}
                                >
                                    <span>⬇</span> Export CSV
                                </button>
                            </div>

                            {data.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <p className="text-gray-400">No data points available in the current run.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Charts */}
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="index" stroke="#9ca3af" fontSize={12} />
                                                <YAxis stroke="#9ca3af" fontSize={12} />
                                                <RechartsTooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="pm2_5" stroke="#3b82f6" strokeWidth={2} dot={false} name="PM2.5" />
                                                <Line type="monotone" dataKey="aqi" stroke="#8b5cf6" strokeWidth={2} dot={false} name="AQI" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Raw Table Preview (Last 10) */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Recent Values (Last 5)</h4>
                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                                    <tr>
                                                        <th className="p-3">Index</th>
                                                        <th className="p-3">PM2.5</th>
                                                        <th className="p-3">PM10</th>
                                                        <th className="p-3">AQI</th>
                                                        <th className="p-3">Stability</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {data.slice(-5).reverse().map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="p-3 font-mono text-gray-400">#{row.index}</td>
                                                            <td className="p-3">{row.pm2_5}</td>
                                                            <td className="p-3">{row.pm10}</td>
                                                            <td className="p-3 font-bold text-blue-600">{row.aqi}</td>
                                                            <td className="p-3">{row.stability}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RawDataInspector;
