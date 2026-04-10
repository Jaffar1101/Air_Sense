import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from 'recharts';
import { fetchHistory } from '../../api/environment';

const ForecastGraph = ({ prediction, confidence }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const histData = await fetchHistory(3);

            if (!histData || histData.length === 0) {
                setHistory([]);
                setLoading(false);
                return;
            }

            const processedData = histData.map(item => ({
                time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(item.timestamp).getTime(),
                actual_aqi: item.aqi,
                predicted_aqi: null,
                range: [item.aqi, item.aqi]
            }));

            // Bridge Point & Prediction
            if (prediction !== null && prediction !== undefined && processedData.length > 0) {
                const lastPoint = processedData[processedData.length - 1];

                // Set the bridge value so the dashed line starts from here
                lastPoint.predicted_aqi = lastPoint.actual_aqi;

                const nextTime = new Date(lastPoint.timestamp + 60 * 60 * 1000);
                const errorMargin = (prediction * 0.2) * (1 - (confidence / 100));

                const predictedPoint = {
                    time: nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    timestamp: nextTime.getTime(),
                    actual_aqi: null,
                    predicted_aqi: prediction,
                    range: [Math.max(0, prediction - errorMargin), prediction + errorMargin]
                };

                processedData.push(predictedPoint);
            }

            setHistory(processedData);
            setLoading(false);
        };

        loadData();
    }, [prediction, confidence]);

    if (loading) return <div className="h-[300px] bg-white rounded-xl shadow-sm animate-pulse m-4"></div>;

    if (history.length < 2) {
        return (
            <div className="h-[300px] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="p-3 bg-gray-50 rounded-full mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-gray-900 font-medium">Insufficient Data</h3>
                <p className="text-sm text-gray-500 mt-1">Forecast confidence improves with more sensor data availability.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-card shadow-card">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Forecast Trajectory</h3>
                    <p className="text-xs text-gray-400">3-Hour Trend + 1-Hour Prediction</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-1 bg-blue-500 rounded-full"></span>
                        <span className="text-gray-600">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-1 border-b-2 border-dashed border-blue-400"></span>
                        <span className="text-gray-600">Projected</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />

                        {/* Confidence Band */}
                        <Area
                            type="monotone"
                            dataKey="range"
                            stroke="none"
                            fill="#93c5fd"
                            fillOpacity={0.2}
                        />

                        {/* Actual Line */}
                        <Area
                            type="monotone"
                            dataKey="actual_aqi"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#colorActual)"
                            name="Actual AQI"
                        />

                        {/* Predicted Line (Dashed) */}
                        <Area
                            type="monotone"
                            dataKey="predicted_aqi"
                            stroke="#60a5fa"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            fill="none"
                            name="Predicted AQI"
                            dot={{ r: 4, fill: "#fff", stroke: "#60a5fa", strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ForecastGraph;
