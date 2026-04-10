
import React, { useEffect, useState } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { motion } from 'framer-motion';

const PerformanceTimeline = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8000/agent/performance-history');
                const result = await response.json();

                // Process data for formatting
                const formattedData = result.map(item => ({
                    ...item,
                    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    // Add numeric stress for area shading
                    stressArea: item.filter_stress
                }));
                setData(formattedData);
            } catch (error) {
                console.error("Failed to load performance history:", error);
            }
        };
        fetchData();
    }, []);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 text-sm">
                    <p className="font-bold text-gray-700 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-gray-500 capitalize">{entry.name.replace('_', ' ')}:</span>
                            <span className="font-bold">{entry.value}</span>
                        </div>
                    ))}
                    {payload[0].payload.accelerated_wear && (
                        <div className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                            ⚠️ Accelerated Wear Detected
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-card shadow-card p-6 md:p-8"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">Degradation & Performance Timeline</h2>
                    <p className="text-gray-500 text-sm mt-1">12-hour analysis of component stress vs. efficiency</p>
                </div>
                <div className="hidden md:flex gap-4 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-100 border border-red-500 rounded-sm"></span>
                        Accelerated Wear Zone
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" />

                        {/* Ambient AQI (Reference Line) - Gray, dashed */}
                        <Line
                            type="monotone"
                            dataKey="aqi"
                            name="Ambient AQI"
                            stroke="#9ca3af"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />

                        {/* Filter Stress (Area) - Red */}
                        <Area
                            type="monotone"
                            dataKey="filter_stress"
                            name="Stress Index"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fill="url(#colorStress)"
                        />

                        {/* Fan Efficiency (Line) - Green */}
                        <Line
                            type="monotone"
                            dataKey="fan_efficiency"
                            name="Fan Efficiency"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                        />

                        {/* Reference Areas for Accelerated Wear 
                            Dynamically generating ReferenceAreas is tricky if intervals are fragmented. 
                            Using the gradient fill on the Stress Area above acts as a visual proxy for 'wear zones'.
                        */}

                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default PerformanceTimeline;
