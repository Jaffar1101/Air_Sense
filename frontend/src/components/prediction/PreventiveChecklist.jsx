import React from 'react';

const PreventiveChecklist = ({ actions }) => {
    if (!actions || actions.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-card shadow-card h-full">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">🛡️</span>
                Preventive Readiness
            </h3>

            <div className="space-y-3">
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className={`group p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 relative cursor-default
                        ${action.enabled
                                ? 'bg-blue-50/50 border-blue-100'
                                : 'bg-gray-50 border-transparent opacity-60'}`}
                    >
                        {/* Status Icon */}
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border
                            ${action.enabled
                                ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                : 'bg-gray-200 border-gray-300 text-gray-400'}`}>
                            {action.enabled ? (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <span className="text-[10px] font-bold">−</span>
                            )}
                        </div>

                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${action.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                {action.label}
                            </p>

                            {/* Disabled state info line or just tooltip? User asked for Tooltip.
                                Let's add a subtle text below for context if enabled, or use pure tooltip.
                                "Short rationale tooltip" requested.
                            */}
                        </div>

                        {/* Tooltip on Hover */}
                        <div className="absolute left-1/2 -top-12 -translate-x-1/2 w-48 bg-gray-900 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                            {action.info}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-wide">
                    Automated Preparedness Protocols
                </p>
            </div>
        </div>
    );
};

export default PreventiveChecklist;
