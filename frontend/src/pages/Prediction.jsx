import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForecastSummary from '../components/prediction/ForecastSummary';
import ForecastGraph from '../components/prediction/ForecastGraph';
import PreventiveChecklist from '../components/prediction/PreventiveChecklist';
import FilterStressCard from '../components/prediction/FilterStressCard';
import CountUp from 'react-countup';
import featherBg from '../assets/feather.png';

import { fetchAgentStatus } from '../api/agent'; // New Import

const Prediction = () => {
    const [result, setResult] = useState(null);
    const [agentStatus, setAgentStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchForecast = async () => {
            // Fetch both forecast (numbers) and latest status (reasoning)
            try {
                const [forecastRes, statusData] = await Promise.all([
                    fetch('http://localhost:8000/agent/forecast').then(res => res.json()),
                    fetchAgentStatus()
                ]);

                setResult(forecastRes);
                setAgentStatus(statusData);
            } catch (err) {
                console.error("Forecast Error:", err);
                setError("Unable to connect to Agent Forecast Service.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchForecast();

        // Poll every 30 seconds
        const interval = setInterval(fetchForecast, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src={featherBg} alt="" className="w-full h-full object-cover opacity-100" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-8 pt-6">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-text-primary">Predictive Analysis</h1>
                    <p className="text-text-secondary mt-2">Real-time breakdown of future air quality trends and autonomous mitigation strategies.</p>
                </div>

                <div className="w-full min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-[400px] flex flex-col items-center justify-center bg-white rounded-card shadow-soft mx-auto max-w-2xl"
                            >
                                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                                <p className="text-text-secondary animate-pulse font-medium">Syncing with Agent Forecast Model...</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-[400px] flex flex-col items-center justify-center bg-red-50 rounded-card border border-red-100 text-center p-8 mx-auto max-w-2xl"
                            >
                                <div className="text-5xl mb-4">⚠️</div>
                                <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* SECTION A: Forecast Summary (Hero) */}
                                <ForecastSummary />

                                {/* SECTION B: Forecast Trajectory (Mini Graph) */}
                                <div className="mt-8 mb-8">
                                    <ForecastGraph
                                        prediction={result.predicted_aqi}
                                        confidence={result.confidence}
                                    />
                                </div>

                                {/* SECTION C & D: Reasoning & Readiness Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* SECTION C: Agent Reasoning */}
                                    <div className="lg:col-span-2 bg-white p-8 rounded-card shadow-card border-l-4 border-primary relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Agent Reasoning</p>
                                                </div>

                                                <p className="text-[10px] text-gray-400 mb-3 font-mono">
                                                    GENERATED AT: {agentStatus?.timestamp ? new Date(agentStatus.timestamp).toLocaleTimeString() : "--:--:--"}
                                                </p>

                                                <div className="flex items-center gap-4 mb-4">
                                                    <h2 className="text-4xl font-extrabold text-primary">{result.fan_speed} Mode</h2>
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">Active Strategy</span>
                                                </div>

                                                <p className="text-text-primary text-lg leading-relaxed font-medium">
                                                    "{agentStatus?.explanation || result.explanation || "Analyzing..."}"
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-center md:items-end min-w-[120px]">
                                                <div className="relative flex items-center justify-center w-20 h-20 mb-2">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="40" cy="40" r="36" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                                                        <circle cx="40" cy="40" r="36" stroke="#3b82f6" strokeWidth="8" fill="transparent"
                                                            strokeDasharray={2 * Math.PI * 36}
                                                            strokeDashoffset={(2 * Math.PI * 36) - ((result.confidence / 100) * (2 * Math.PI * 36))}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <span className="absolute text-xl font-bold text-gray-800">{result.confidence}%</span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Model Confidence</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION D: Preventive Readiness Checklist */}
                                    <div className="lg:col-span-1 h-full">
                                        <PreventiveChecklist actions={agentStatus?.preventive_actions} />
                                    </div>

                                    {/* SECTION E: Spike Warning or Status Card */}
                                    <div className={`lg:col-span-2 p-6 rounded-card shadow-card flex flex-col justify-center ${result.spike_warning ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full text-2xl ${result.spike_warning ? 'bg-white text-red-500 shadow-sm animate-pulse' : 'bg-white text-emerald-500 shadow-sm'}`}>
                                                {result.spike_warning ? '⚠️' : '🛡️'}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm uppercase tracking-wide ${result.spike_warning ? 'text-red-800' : 'text-emerald-800'}`}>
                                                    {result.spike_warning ? 'Anomaly Alert' : 'System Status'}
                                                </h4>
                                                <p className={`text-sm mt-1 font-medium ${result.spike_warning ? 'text-red-700' : 'text-emerald-700'}`}>
                                                    {result.spike_warning
                                                        ? "Rapid pollution spike anticipated. Preemptive mitigation active."
                                                        : "No significant pollution anomalies detected. Environment is stable."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION F: Filter Stress Projection */}
                                    <div className="lg:col-span-1 h-full">
                                        <FilterStressCard
                                            stress={agentStatus?.filter_stress}
                                            level={agentStatus?.filter_stress_level}
                                            explanation={agentStatus?.filter_stress_explanation}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Prediction;
