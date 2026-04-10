import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AgentStatusCard = ({ action, isAutoMode }) => {
    // Default safe values
    const mode = action?.mode || 'Monitoring';
    const fanSpeed = action?.fan_speed || 0;
    const confidence = action?.confidence ? Math.round(action.confidence * 100) : 0;
    const reasoning = action?.reasoning || "Analyzing environmental data stream...";

    // Simulated "Live Logs" for visual effect (adds to the 'AI' feel)
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Add a new log line occasionally to simulate processing
        const simulatedLogs = [
            "Reading sensor inputs...",
            "Validating AQI trends...",
            "Checking correlation matrix...",
            "Optimizing fan curve...",
            "Syncing with cloud model..."
        ];

        const interval = setInterval(() => {
            const randomLog = simulatedLogs[Math.floor(Math.random() * simulatedLogs.length)];
            const time = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
            setLogs(prev => [`[${time}] ${randomLog}`, ...prev].slice(0, 3));
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    const getColor = (conf) => {
        if (conf >= 80) return {
            text: 'text-emerald-500',
            bg: 'bg-emerald-500',
            bgSoft: 'bg-emerald-50/50',
            border: 'border-emerald-100',
            fill: '#10b981'
        };
        if (conf >= 50) return {
            text: 'text-amber-500',
            bg: 'bg-amber-500',
            bgSoft: 'bg-amber-50/50',
            border: 'border-amber-100',
            fill: '#f59e0b'
        };
        return {
            text: 'text-rose-500',
            bg: 'bg-rose-500',
            bgSoft: 'bg-rose-50/50',
            border: 'border-rose-100',
            fill: '#f43f5e'
        };
    };

    const style = getColor(confidence);
    const radius = 32; // Larger circle
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (fanSpeed / 100) * circumference; // Using Fan Speed for the main gauge

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-card shadow-card overflow-hidden border border-gray-100 h-full flex flex-col relative group"
        >
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${style.bg} opacity-5 blur-3xl rounded-full -mr-10 -mt-10 transition-colors duration-500`}></div>

            {/* Header */}
            <div className="p-5 border-b border-gray-50 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 shadow-sm">
                        <svg className={`w-5 h-5 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-primary leading-none">Guard AI</h3>
                        <p className="text-[10px] text-text-secondary mt-1 font-medium tracking-wide uppercase">
                            STATUS: {action?.readiness || "INITIALIZING"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`relative flex h-2 w-2`}>
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.bg} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.bg}`}></span>
                    </span>
                    <span className="text-xs font-bold text-gray-400">ACTIVE</span>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col gap-6 z-10">

                {/* Main Hero: Fan Speed & Confidence */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Fan Output</p>
                        <div className="flex items-baseline gap-1">
                            <h2 className="text-4xl font-bold text-gray-800">{fanSpeed}</h2>
                            <span className="text-sm text-gray-400 font-medium">%</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 max-w-max">
                            <span className={`text-[10px] font-bold ${style.text}`}>
                                {confidence}% Confidence
                            </span>
                        </div>
                    </div>

                    {/* Circular Gauge */}
                    <div className="relative w-20 h-20">
                        {/* Background Circle */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className={`${style.text} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        {/* Inner Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className={`w-6 h-6 text-gray-300 ${fanSpeed > 0 ? 'animate-spin-slow' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Strategy Text */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-bold text-gray-500 uppercase">Strategy</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 leading-snug truncate">
                            {mode}
                        </p>
                    </div>

                    {/* Filter Stress */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-xs font-bold text-gray-500 uppercase">Load</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min((action?.filter_stress || 0) * 100, 100)}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {Math.round((action?.filter_stress || 0) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* "Terminal" Log Window */}
                <div className="mt-auto bg-gray-900 rounded-xl p-4 border border-gray-800 shadow-inner overflow-hidden relative font-mono text-[10px] leading-relaxed">
                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none"></div>
                    <div className="flex flex-col gap-1">
                        <AnimatePresence initial={false}>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 0.7 - (i * 0.2), x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-emerald-400 whitespace-nowrap overflow-hidden text-ellipsis"
                                >
                                    <span className="text-gray-500 mr-2">{log.split(']')[0]}]</span>
                                    {log.split(']')[1]}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <motion.div
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="text-emerald-500 font-bold"
                        >
                            _{/* Cursor */}
                        </motion.div>
                    </div>
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse box-shadow-glow"></div>
                </div>
            </div>
        </motion.div>
    );
};

export default AgentStatusCard;
