import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/4.png';


const Hero = () => {
    const navigate = useNavigate();

    return (
        <div className="relative pt-32 pb-16 overflow-hidden min-h-screen flex flex-col justify-between">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src={heroBg}
                    alt="Background"
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col items-center text-center relative z-10 pt-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-xs font-bold tracking-widest uppercase">Operational Intelligence v2.0</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-text-primary leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Clean</span> Indoor Air With <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Smarter</span> Decisions.
                    </h1>

                    <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed font-normal">
                        Air Sense delivers real-time indoor air quality monitoring and predictive insights. Track particulate matter, anticipate pollution spikes, and optimize filtration systems using data-driven intelligence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20">
                        <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/login')}
                            className="px-8 py-3.5 text-base font-medium btn-primary shadow-sm hover:shadow-md transition-all"
                        >
                            Get Started
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -1, borderColor: '#d1d5db' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-3.5 text-base font-medium bg-white text-text-primary border border-gray-200 rounded-full shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
                        >
                            Explore Platform <span className="text-gray-400">→</span>
                        </motion.button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Hero;
