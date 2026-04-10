import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import featherBg from '../assets/feather.png';
import Gauge from '../components/maintenance/Gauge';
import PerformanceTimeline from '../components/maintenance/PerformanceTimeline';
import AgentInsights from '../components/maintenance/AgentInsights';
import ForecastCard from '../components/maintenance/ForecastCard';
import { fetchAgentStatus } from '../api/agent';

const Maintenance = () => {
    const [agentStatus, setAgentStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchAgentStatus();
            if (data) setAgentStatus(data);
            setIsLoading(false);
        };
        loadData();
    }, []);

    // Helper to determine status properties based on health percentage (Legacy card reuse)
    const getStatus = (value) => {
        if (value > 80) return { label: 'Excellent', color: 'text-primary', barColor: 'from-primary to-emerald-400', bg: 'bg-emerald-50' };
        if (value > 50) return { label: 'Good', color: 'text-secondary', barColor: 'from-secondary to-lime-400', bg: 'bg-lime-50' };
        if (value > 20) return { label: 'Fair', color: 'text-yellow-600', barColor: 'from-yellow-400 to-orange-400', bg: 'bg-yellow-50' };
        return { label: 'Replace Soon', color: 'text-red-600', barColor: 'from-red-500 to-orange-500', bg: 'bg-red-50' };
    };

    const health = agentStatus?.filter_health || 0;
    const status = getStatus(health);

    return (
        <div className="relative min-h-screen">
            {/* Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src={featherBg} alt="" className="w-full h-full object-cover opacity-100" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-8 pt-6 pb-20">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-text-primary">System Maintenance</h1>
                    <p className="text-text-secondary mt-2">Real-time diagnostics and health monitoring of core components.</p>
                </div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-64 flex items-center justify-center"
                        >
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* SECTION: System Health Gauges */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-primary rounded-full"></span>
                                    System Health Overview
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Gauge
                                        value={agentStatus?.filter_health}
                                        label="Effective Filter Health"
                                        colorScale={true}
                                        confidence={agentStatus?.confidence}
                                        source="Derived from exposure history + flow resistance analysis"
                                    />
                                    <Gauge
                                        value={agentStatus?.fan_performance}
                                        label="Fan Performance"
                                        colorScale={true}
                                        confidence={agentStatus?.confidence} // Utilizing general confidence for fan as well
                                        source="Calculated from motor efficiency and airflow throughput"
                                    />
                                </div>
                            </section>

                            {/* SECTION: Degradation Timeline & Insights */}
                            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <PerformanceTimeline />
                                </div>
                                <div className="lg:col-span-1 h-full">
                                    <AgentInsights insights={agentStatus?.maintenance_insights} />
                                </div>
                            </section>

                            <hr className="border-gray-200" />

                            {/* Detailed Filter Status Card (Existing Logic Refined) */}
                            <div className="bg-white rounded-card shadow-card overflow-hidden">
                                {/* Header Section */}
                                <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-text-primary">Primary HEPA Filter Details</h2>
                                        <p className="text-text-secondary text-sm">Model: XG-2000 Pro • Sensor Confidence: {Math.round(agentStatus?.confidence * 100)}%</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full border ${status.bg} ${status.color.replace('text-', 'border-').replace('600', '200')} font-semibold text-sm`}>
                                        Status: {status.label}
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="p-4 md:p-8 space-y-8">
                                    {/* Progress Bar Detail */}
                                    <div className="relative pt-1">
                                        <p className="text-sm font-bold text-gray-500 mb-2">Cumulative Degradation Tracker</p>
                                        <div className="flex mb-2 items-center justify-between">
                                            <div className="text-xs font-semibold text-text-secondary uppercase">Critcal</div>
                                            <div className="text-xs font-semibold text-text-secondary uppercase">Optimal</div>
                                        </div>
                                        <div className="overflow-hidden h-6 mb-4 text-xs flex rounded-full bg-gray-100 shadow-inner ring-1 ring-gray-200">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${health}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${status.barColor}`}
                                            >
                                                {health > 15 && <span className="font-bold text-[10px] drop-shadow-md">{health}% Health</span>}
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Recommendation Box */}
                                    <div className={`p-6 rounded-xl ${status.bg} border border-opacity-20 ${status.color.replace('text-', 'border-').replace('600', '200')}`}>
                                        <h3 className={`font-bold mb-2 flex items-center gap-2 ${status.color}`}>
                                            <span className="text-xl">💡</span> AI Recommendation
                                        </h3>
                                        <p className="text-text-primary opacity-90 leading-relaxed">
                                            {agentStatus?.filter_stress_explanation || "Analyzing system..."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Forecast Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ForecastCard
                                    title="Filter Replacement Forecast"
                                    window={agentStatus?.forecasts?.filter_replacement}
                                    confidence={agentStatus?.forecasts?.filter_replacement?.confidence}
                                    assumptions={agentStatus?.forecasts?.filter_replacement?.assumptions}
                                />
                                <ForecastCard
                                    title="Fan Service Forecast"
                                    window={agentStatus?.forecasts?.fan_service}
                                    confidence={agentStatus?.forecasts?.fan_service?.confidence}
                                    assumptions={agentStatus?.forecasts?.fan_service?.assumptions}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default Maintenance;
