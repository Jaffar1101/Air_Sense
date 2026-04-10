
import React from 'react';
import { motion } from 'framer-motion';

const RawSensorCard = ({ data }) => {
    if (!data) return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-3xl mb-2">📡</span>
            <p>Waiting for data stream...</p>
        </div>
    );

    const items = [
        { label: 'PM2.5', value: data.pm2_5, unit: 'µg/m³', color: 'text-purple-600' },
        { label: 'PM10', value: data.pm10, unit: 'µg/m³', color: 'text-purple-600' },
        { label: 'CO', value: data.co, unit: 'ppb', color: 'text-orange-600' },
        { label: 'NO2', value: data.no2, unit: 'ppb', color: 'text-orange-600' },
        { label: 'Temp', value: data.temperature, unit: '°C', color: 'text-blue-600' },
        { label: 'Humidity', value: data.humidity, unit: '%', color: 'text-blue-600' },
        { label: 'Fan RPM', value: data.fan_rpm, unit: '', color: 'text-gray-700' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 h-full">
            <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                Raw Sensor Feed
                <span className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">Live</span>
            </h3>

            <div className="space-y-3 font-mono text-sm">
                {items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0"
                    >
                        <span className="text-gray-500">{item.label}</span>
                        <span className={`font-bold ${item.color}`}>
                            {item.value} <span className="text-xs text-gray-400 font-normal">{item.unit}</span>
                        </span>
                    </motion.div>
                ))}
            </div>

        </div>
    );
};

export default RawSensorCard;
