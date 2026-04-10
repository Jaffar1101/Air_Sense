
import React from 'react';
import { motion } from 'framer-motion';

const ForecastCard = ({ title, window, confidence, assumptions = [] }) => {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-card shadow-card flex flex-col justify-between h-full border border-gray-50"
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{title}</h3>
                    <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-blue-700">{confidence}% Conf.</span>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-xs text-gray-400 mb-1">Estimated Window</p>
                    <div className="text-2xl font-bold text-gray-800">
                        {window?.earliest} <span className="text-gray-300 mx-1">–</span> {window?.latest}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Model Assumptions</p>
                <ul className="space-y-1.5">
                    {assumptions.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-blue-400 mt-0.5">•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
};

export default ForecastCard;
