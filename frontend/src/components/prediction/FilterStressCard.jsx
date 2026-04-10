
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FilterStressCard = ({ stress, level, explanation }) => {
    // Determine color based on level
    const getColor = (lvl) => {
        switch (lvl?.toLowerCase()) {
            case 'high': return 'text-red-400 border-red-500/30 bg-red-500/10';
            case 'moderate': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
            default: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        }
    };

    const getBarColor = (val) => {
        if (val > 0.7) return 'bg-red-500';
        if (val > 0.3) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const colorClass = getColor(level);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between h-full"
        >
            <div>
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
                    Projected Filter Stress (Next 24h)
                </h3>

                <div className="flex items-end gap-3 mb-2">
                    <span className={`text-2xl font-bold ${level === 'High' ? 'text-red-400' : level === 'Moderate' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {level || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500 mb-1.5">Usage Trend</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden mb-4 border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stress || 0) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${getBarColor(stress)}`}
                    />
                </div>

                <p className="text-sm text-gray-300 leading-relaxed mb-6 border-l-2 border-white/20 pl-3">
                    {explanation || "Analyzing filter usage patterns..."}
                </p>
            </div>

            <Link
                to="/maintenance"
                className="mt-auto group flex items-center justify-between w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            >
                <span className="text-sm text-gray-300 group-hover:text-white font-medium">
                    View Maintenance Schedule
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Link>
        </motion.div>
    );
};

export default FilterStressCard;
