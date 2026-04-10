import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="min-h-screen bg-background text-text-primary selection:bg-primary selection:text-white">
            <Navbar />
            <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-primary font-bold tracking-wider uppercase text-sm">Our Mission</span>
                    <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-8 text-text-primary leading-tight">
                        Making indoor environments <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">visible and intelligent.</span>
                    </h1>

                    <div className="prose prose-lg text-text-secondary">
                        <p>
                            Air Sense was founded on a simple principle: you cannot optimize what you cannot measure.
                            We spend 90% of our lives indoors, yet the air we breathe in these spaces is often an invisible variable.
                        </p>
                        <p>
                            Our platform combines industrial-grade sensing hardware with predictive software to not just
                            monitor pollution, but actively manage it. By integrating with existing HVAC infrastructure,
                            Air Sense transforms static buildings into living, breathing ecosystems that protect occupant health
                            and reduce energy waste.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 border-t border-gray-100 pt-12">
                        <div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">Data-First Approach</h3>
                            <p className="text-text-secondary text-base">
                                We rely on high-fidelity sensor arrays and transparent algorithms, providing facilities teams with actionable truth, not estimates.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">Sustainable by Design</h3>
                            <p className="text-text-secondary text-base">
                                Our goal is to extend filter life cycles and recapture particulate matter for downstream material reuse, closing the loop on waste.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
