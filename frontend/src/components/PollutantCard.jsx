import React from 'react';
import { motion } from 'framer-motion';

/**
 * Pollutant Card Component
 * Displays individual pollutant details with severity-based styling.
 */
const PollutantCard = ({ name, value, unit, limit, description, delay = 0 }) => {
    // Determine severity color
    const getSeverity = (val, limit) => {
        if (val > limit * 2) return { color: 'border-red-500 text-red-500', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' }; // Severe
        if (val > limit) return { color: 'border-orange-500 text-orange-500', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' }; // Poor
        if (val > limit * 0.5) return { color: 'border-yellow-500 text-yellow-600', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' }; // Moderate
        return { color: 'border-emerald-500 text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' }; // Good
    };

    const style = getSeverity(value, limit);
    const isExceeded = value > limit;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`bg-white rounded-xl shadow-sm border-l-4 ${style.color} p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{name}</span>
                    <span className="text-xs text-gray-300 font-medium">{description}</span>
                </div>
                {isExceeded && (
                    <div className="text-red-500 bg-red-50 p-1 rounded-full animate-pulse" title={`Exceeds WHO limit of ${limit} ${unit}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="flex items-baseline gap-1 mt-2">
                <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
                <span className="text-xs text-gray-500 font-medium">{unit}</span>
            </div>

            {/* Progress bar visual */}
            <div className="w-full h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div
                    className={`h-full ${style.color.split(' ')[0].replace('border-', 'bg-')}`}
                    style={{ width: `${Math.min((value / (limit * 2)) * 100, 100)}%` }}
                ></div>
            </div>
        </motion.div>
    );
};

export default PollutantCard;
