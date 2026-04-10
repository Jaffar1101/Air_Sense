import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, label, dominant, note, icon, colorClass, delay = 0 }) => {
    // Extract base color (e.g., 'text-red-500' -> 'red-500')
    const baseColor = colorClass?.replace('text-', '') || 'gray-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-card shadow-card hover:shadow-soft transition-all duration-300 relative overflow-hidden group flex flex-col justify-between min-h-[180px]"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 opacity-70">{title}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-4xl font-extrabold ${colorClass}`}>
                            {value}
                        </span>
                        {dominant && (
                            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase self-start mt-2">
                                {dominant}
                            </span>
                        )}
                    </div>
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl bg-opacity-10 backdrop-blur-sm ${colorClass.replace('text-', 'bg-')}`}>
                        <span className="text-2xl">{icon}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 border-t border-gray-50 pt-3">
                {label && (
                    <div className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${colorClass.replace('text-', 'bg-').replace('500', '100')} ${colorClass.replace('text-', 'text-').replace('500', '700')}`}>
                        {label}
                    </div>
                )}
                {note && (
                    <p className="text-xs text-text-secondary font-medium leading-relaxed opacity-80">
                        {note}
                    </p>
                )}
            </div>

            {/* Decorative background accent */}
            <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform duration-500 bg-current ${colorClass}`} />
        </motion.div>
    );
};

export default StatCard;
