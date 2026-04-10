
import React from 'react';
import { motion } from 'framer-motion';

const DerivedMetricsCard = ({ data }) => {
    if (!data) return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-3xl mb-2">🧠</span>
            <p>Waiting for derived metrics...</p>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 h-full">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                <span className="text-blue-500">⚡</span> Derived Intelligence
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {/* AQI */}
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Standard AQI</p>
                    <p className="text-3xl font-bold text-gray-800">{data.aqi}</p>
                    <p className="text-xs text-gray-500 mt-1">Computed from raw feed</p>
                </div>

                {/* Dominant */}
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Primary Driver</p>
                    <p className="text-xl font-bold text-gray-800 mt-2">{data.dominant_pollutant || 'None'}</p>
                </div>

                {/* Stability */}
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Purity Stability</p>
                    <p className="text-xl font-bold text-emerald-600 mt-2">{data.stability}%</p>
                </div>

                {/* Noise */}
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Noise Level</p>
                    <p className="text-xl font-bold text-blue-600 mt-2">{data.noise_level}</p>
                </div>
            </div>

            <div className="mt-4 text-center">
                <span className="text-[10px] text-gray-300 uppercase tracking-widest">Processed by Edge Agent</span>
            </div>
        </div>
    );
};

export default DerivedMetricsCard;
