import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import featherBg from '../assets/feather.png';

const ImpactCard = ({ title, value, unit, icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white p-6 rounded-card shadow-card hover:shadow-soft transition-all"
    >
        <div className="flex items-center gap-4">
            <div className="p-3 bg-eco-light rounded-full text-2xl">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-text-secondary uppercase">{title}</p>
                <p className="text-2xl font-bold text-text-primary">
                    {value} <span className="text-sm font-normal text-text-secondary">{unit}</span>
                </p>
            </div>
        </div>
    </motion.div>
);

const Carbon = () => {
    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src={featherBg} alt="" className="w-full h-full object-cover opacity-100" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-12">

                {/* Hero Section - The Impact */}
                <div className="relative bg-gradient-to-br from-gray-900 to-emerald-900 rounded-3xl overflow-hidden text-white p-8 md:p-16">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary rounded-full blur-[80px] opacity-20"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-4">
                                    <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">Total Capture</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                    Making the invisible, <br />
                                    <span className="text-emerald-400">tangible.</span>
                                </h1>
                                <p className="text-emerald-100/80 text-lg leading-relaxed max-w-lg">
                                    Quantitative measurement of captured particulate matter (PM2.5/PM10) using gravimetric analysis and optical sensor arrays.
                                </p>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="md:w-1/2 flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
                        >
                            <div className="text-center">
                                <p className="text-sm font-medium text-emerald-300 mb-2">TOTAL CARBON MASS RETAINED</p>
                                <div className="text-6xl md:text-8xl font-extrabold text-white tracking-tight">
                                    <CountUp end={1240} separator="," duration={2.5} />
                                    <span className="text-2xl md:text-4xl text-emerald-400 ml-2">mg</span>
                                </div>
                                <p className="mt-4 text-emerald-100/60 text-sm">Since activation on Oct 12, 2025</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Daily Stats Grid */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ImpactCard
                            title="Collected Today"
                            value={<CountUp end={12} duration={1.5} />}
                            unit="mg"
                            icon="⛅"
                            delay={0.1}
                        />
                        <ImpactCard
                            title="Weekly Average"
                            value={<CountUp end={85} duration={1.5} />}
                            unit="mg/week"
                            icon="📅"
                            delay={0.2}
                        />
                        <ImpactCard
                            title="Air Volume Cleaned"
                            value={<CountUp end={4500} separator="," duration={2} />}
                            unit="m³"
                            icon="🌬️"
                            delay={0.3}
                        />
                    </div>
                    <p className="text-xs text-text-secondary text-right opacity-70 italic">
                        * Values estimated based on airflow velocity and ambient particulate concentration models.
                    </p>
                </div>

                {/* Impact Breakdown Divider */}
                <div className="flex items-center gap-4 py-4">
                    <div className="h-px bg-gray-200 flex-grow"></div>
                    <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Impact Breakdown</span>
                    <div className="h-px bg-gray-200 flex-grow"></div>
                </div>

                {/* Storytelling / Conceptual Reuse */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-text-primary">From Pollution to Product</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Our system currently isolates and retains particulate matter, preventing re-release.
                            While primarily for purification, the high carbon content of captured soot presents future opportunities for material recovery in external industrial processes.
                        </p>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary text-xl">✒️</div>
                                <div>
                                    <h4 className="font-bold text-text-primary">Eco-Ink (Conceptual)</h4>
                                    <p className="text-sm text-text-secondary">Potential to refine soot into high-quality black pigments for specialized printing applications.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-secondary/10 rounded-lg text-secondary text-xl">🧱</div>
                                <div>
                                    <h4 className="font-bold text-text-primary">Building Materials (Conceptual)</h4>
                                    <p className="text-sm text-text-secondary">Future ability to integrate recovered carbon as additives in concrete and asphalt production.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-card shadow-soft border border-gray-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>

                        <h3 className="text-xl font-bold text-text-primary mb-6">Estimated Contribution</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-text-secondary">Clean Air Volume (Est.)</span>
                                <span className="font-bold text-primary">~180 Days</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-primary rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-text-secondary">Carbon Offset Equivalence</span>
                                <span className="font-bold text-secondary">~4 Seedlings</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="w-1/4 h-full bg-secondary rounded-full"></div>
                            </div>

                            <div className="p-4 bg-eco-light rounded-xl mt-4 text-center">
                                <p className="text-accent font-medium text-sm">
                                    "System has successfully retained 1.2g of PM2.5 this month."
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Carbon;
