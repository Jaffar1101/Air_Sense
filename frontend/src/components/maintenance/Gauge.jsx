
import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { motion } from 'framer-motion';

const Gauge = ({ value, label, confidence, source, colorScale }) => {
    // Determine color based on value
    const getColor = (val) => {
        if (colorScale) {
            if (val >= 70) return '#10b981'; // Green (Emerald 500)
            if (val >= 40) return '#eab308'; // Yellow (Yellow 500)
            return '#ef4444'; // Red (Red 500)
        }
        return '#3b82f6'; // Default Blue
    };

    const color = getColor(value);

    // Data for the gauge: [Fill Value, Max Value]
    const data = [{ name: 'value', value: value, fill: color }];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative"
        >
            {/* Tooltip Trigger (Info Icon) */}
            <div className="absolute top-4 right-4 group cursor-help z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {/* Tooltip Content */}
                <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    <p className="font-semibold mb-1">Metric Source:</p>
                    <p className="text-gray-300 leading-tight">{source}</p>
                    {confidence > 0 && (
                        <div className="mt-2 text-gray-400 border-t border-gray-700 pt-1">
                            Model Confidence: <span className="text-emerald-400">{Math.round(confidence * 100)}%</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-48 h-48 relative">
                {/* Recharts Radial Bar acting as Speedometer */}
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="90%"
                        barSize={15}
                        data={data}
                        startAngle={180}
                        endAngle={0}
                    >
                        {/* Background Track */}
                        <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                        />
                        <RadialBar
                            minAngle={15}
                            background={{ fill: '#f3f4f6' }} // Gray 100
                            clockWise
                            dataKey="value"
                            cornerRadius={10}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
                    <span className="text-4xl font-extrabold" style={{ color }}>{value}%</span>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">{label}</span>
                </div>

                {/* Confidence Ring (Outer) */}
                {confidence > 0 && (
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 pointer-events-none" style={{
                        transform: 'scale(1.15)',
                        opacity: 0.5
                    }}></div>
                )}
            </div>

            <div className="mt-2 text-center">
                <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${value >= 70 ? 'bg-emerald-100 text-emerald-700' :
                        value >= 40 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                    }`}>
                    {value >= 70 ? 'Excellent' : value >= 40 ? 'Fair' : 'Critical'}
                </div>
            </div>
        </motion.div>
    );
};

export default Gauge;
