import { useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import problemBg from '../assets/3.png';
import gsap from 'gsap';
import { useScrollScrub } from '../hooks/useScrollScrub';

// Standard Section Wrapper
const Section = ({ children, className = "", id = "" }) => (
    <section
        id={id}
        className={`min-h-screen flex flex-col justify-center items-center py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-100 ${className}`}
    >
        <div className="max-w-6xl w-full relative z-10">
            {children}
        </div>
    </section>
);

// FRAME 2: INVISIBLE POLLUTION (The Problem)
const ProblemSection = () => {
    const sectionRef = useRef(null);
    const hazeRef = useRef(null);

    useScrollScrub({
        trigger: sectionRef,
        start: "top 80%", // Triggers as soon as it enters view
        end: "center center", // Completes when centered
        scrub: 1 // Responsive, less lag
    }, (tl) => {
        // Transformation: Haze is always present but thickens rapidly
        tl.fromTo(hazeRef.current,
            { opacity: 0.1, scale: 1.1, filter: "blur(30px)" },
            {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                ease: "power2.out"
            }
        );
    });

    return (
        <Section id="problem-section" className="section-problem bg-white relative overflow-hidden">
            <div ref={sectionRef} className="h-full w-full relative">
                {/* Background Image */}
                <div className="absolute inset-0 pointer-events-none">
                    <img src={problemBg} alt="Background Pattern" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px]"></div>
                </div>

                {/* Haze / Particulate Layer */}
                <div ref={hazeRef} className="absolute inset-0 pointer-events-none overflow-hidden select-none will-change-transform">
                    {/* Particulate Matter */}
                    <div
                        className="absolute inset-0 opacity-40 blur-sm scale-100"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #334155 1.5px, transparent 1.5px)',
                            backgroundSize: '32px 32px'
                        }}
                    />
                    {/* Atmospheric Thickness */}
                    <div className="absolute inset-0 bg-gray-400/20 blur-2xl scale-110" />
                </div>

                <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center h-full">
                    <div>
                        <span className="font-mono text-xs font-bold tracking-widest text-text-secondary uppercase mb-4 block">PHASE 01 // EXPOSURE</span>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight text-black">
                            INVISIBLE ACCUMULATION
                        </h2>
                        <div className="space-y-6">
                            <div className="border-l-2 border-primary pl-6">
                                <h4 className="text-3xl font-bold text-primary mb-1">90%</h4>
                                <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">INDOOR EXPOSURE</p>
                            </div>
                            <div className="border-l-2 border-gray-300 pl-6">
                                <h4 className="text-3xl font-bold text-gray-400 mb-1">PM 2.5</h4>
                                <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">FINE PARTICULATE LOAD</p>
                            </div>
                        </div>
                    </div>

                    {/* Minimal Visual */}
                    <div className="relative h-80 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                        <div
                            className="w-48 h-48 bg-gray-400/20 rounded-full blur-2xl opacity-60 transform scale-100"
                        />
                        <p className="relative z-10 font-mono text-xs text-gray-500 uppercase tracking-widest">OPTICAL DENSITY MAP</p>
                    </div>
                </div>
            </div>
        </Section>
    );
};

// FRAME 3: INVISIBLE -> VISIBLE (GSAP Scroll-Scrub)
const RevealSection = () => {
    const containerRef = useRef(null);
    const particlesRef = useRef(null);
    const textRef = useRef(null);

    useScrollScrub({
        trigger: containerRef,
        start: "top top",
        end: "+=1200", // Much shorter pin for snappier feel
        scrub: 0.5 // Responsive scrub
    }, (tl) => {
        const particles = particlesRef.current.children;
        const colCount = 15; // 15 columns
        const gap = 14;      // Spacing

        // Particles Animation: Random Scatter -> Organized Rectangle Grid
        tl.fromTo(particles,
            {
                x: () => (Math.random() - 0.5) * window.innerWidth * 1.2,
                y: () => (Math.random() - 0.5) * window.innerHeight * 1.2,
                opacity: 0,
                scale: 0.5,
            },
            {
                // Reform into a dense, perfect rectangle behind text
                x: (i) => ((i % colCount) - colCount / 2) * gap,
                y: (i) => (Math.floor(i / colCount) - 5) * gap,
                opacity: (i) => Math.random() * 0.4 + 0.6,
                scale: 1,
                duration: 1,
                stagger: { amount: 0.5, from: "random" }, // Very fast organization
                ease: "power2.out"
            }
        );

        // Text Reveal - Sycnhronized
        tl.fromTo(textRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
            "<+0.2" // Almost immediate overlap
        );
    });

    return (
        <div id="reveal-section" ref={containerRef} className="section-reveal relative h-screen bg-black flex items-center justify-center overflow-hidden">
            {/* Particles Container */}
            <div ref={particlesRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 will-change-transform">
                {[...Array(150)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 bg-emerald-500 rounded-sm" />
                ))}
            </div>

            {/* Text Container */}
            <div ref={textRef} className="relative z-20 text-center opacity-0">
                <h3 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                    VISIBLE MASS.
                </h3>
            </div>
        </div>
    );
};

// FRAME 4: CAPTURE (The System)
const CaptureSection = () => {
    const sectionRef = useRef(null);
    return (
        <Section id="capture-section" className="section-capture bg-[#0a0a0a] text-white">
            <div ref={sectionRef} className="w-full flex flex-col items-center gap-12">

                {/* Abstract Filtration Engine */}
                <div className="relative w-full h-[50vh] border-y border-white/10 flex items-center justify-center overflow-hidden bg-white/[0.02]">

                    {/* 1. Clean Airflow (Background - Continuous Pass-through) */}
                    <div className="absolute inset-0">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={`flow-${i}`}
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: i * 0.25
                                }}
                                className="absolute h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                style={{ top: `${10 + i * 7}%` }}
                            />
                        ))}
                    </div>

                    {/* 2. retention Barrier (Center) */}
                    <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/30 z-20">
                        <div className="absolute top-0 bottom-0 -left-px w-1 bg-emerald-500/10 blur-[1px]" />
                    </div>

                    {/* 3. Particulate Capture (Impact & Hold) */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={`p-${i}`}
                            initial={{ x: -800, opacity: 0, scale: 1 }}
                            animate={{
                                x: 0, // Impact at center
                                opacity: [0, 1, 1, 0], // Fade in -> Hold -> Disappear
                                scale: [1, 1, 0] // Shrink on absorption
                            }}
                            transition={{
                                duration: 4,
                                times: [0, 0.3, 0.8, 1], // 30% travel, 50% retention, 20% fade
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "circOut" // Rapid deceleration into barrier
                            }}
                            className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-white rounded-full z-30 shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                            style={{ marginTop: (Math.random() - 0.5) * 400 }}
                        />
                    ))}

                </div>

                {/* Functional Labels */}
                <div className="grid grid-cols-3 w-full max-w-4xl border-t border-white/10 pt-8 font-mono text-xs uppercase tracking-[0.2em] text-gray-500">
                    <div className="text-left group cursor-default">
                        <span className="block text-white mb-2 group-hover:text-emerald-400 transition-colors">01 // INFLOW</span>
                        RAW STREAM
                    </div>
                    <div className="text-center group cursor-default">
                        <span className="block text-emerald-500 mb-2">02 // RETENTION</span>
                        ABSORPTION
                    </div>
                    <div className="text-right group cursor-default">
                        <span className="block text-white mb-2 group-hover:text-emerald-400 transition-colors">03 // OUTPUT</span>
                        PURIFIED
                    </div>
                </div>
            </div>
        </Section>
    );
};



// FRAME 6: QUANTIFIED IMPACT (GSAP Scroll-Scrub)
const OutcomeSection = () => {
    const sectionRef = useRef(null);
    const massRef = useRef(null);
    const textRef = useRef(null);
    const countObj = useRef({ value: 0 });

    useScrollScrub({
        trigger: sectionRef,
        start: "top top",
        end: "+=2500", // Extended scroll distance for "heavy" feel
        pin: true,
        scrub: 1.5, // High friction/weight
    }, (tl) => {
        // 1. Mass Compaction: Starts large/diffuse, becomes dense/small
        tl.fromTo(massRef.current,
            { scale: 3, opacity: 0, filter: "blur(40px)" }, // Initial: Dispersed
            { scale: 1, opacity: 1, filter: "blur(0px)", ease: "none" }, // Final: Solid
            0
        );

        // 2. Count-Up: Deliberate linear progression
        tl.to(countObj.current, {
            value: 1240,
            ease: "none", // Linear accumulation, no easing
            onUpdate: () => {
                if (textRef.current) {
                    textRef.current.textContent = Math.floor(countObj.current.value);
                }
            }
        }, 0);
    });

    return (
        <div className="bg-stone-950 text-white">
            <section ref={sectionRef} id="outcome-section" className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">

                {/* Background Image (User Request: Fully visible, less blur) */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img src={problemBg} alt="Impact Background" className="w-full h-full object-cover opacity-100" />
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"></div>
                </div>

                {/* The Condensed Mass */}
                <div ref={massRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 will-change-transform">
                    <div className="w-[18rem] md:w-[30rem] h-[18rem] md:h-[30rem] rounded-full relative">
                        {/* Core */}
                        <div className="absolute inset-0 bg-stone-800 rounded-full"></div>
                        {/* Inner Shadow/Gradient for Volume */}
                        <div className="absolute inset-0 bg-gradient-to-tl from-black via-transparent to-stone-700 opacity-80 rounded-full"></div>
                        {/* Abstract Surface Detail (CSS) */}
                        <div className="absolute inset-0 opacity-20 rounded-full"
                            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 40%, #000 100%)' }}></div>
                    </div>
                </div>

                {/* Data Overlay */}
                <div className="relative z-20 text-center mix-blend-exclusion">
                    <div className="flex items-baseline justify-center">
                        <span ref={textRef} className="text-6xl sm:text-8xl md:text-[10rem] font-bold tracking-tighter leading-none">0</span>
                        <span className="text-4xl md:text-5xl font-mono text-stone-400 ml-4 font-normal">kg</span>
                    </div>
                    <p className="text-stone-500 font-mono text-xs md:text-sm uppercase tracking-[0.4em] mt-6 border-t border-stone-800 pt-6 inline-block">
                        Annual Particulate Mass Retained
                    </p>
                </div>
            </section>
        </div>
    );
};

// FRAME 7: CREDIBILITY (Specs - STATIC)
const CredibilitySection = () => {
    // No animations. Static information anchor.
    return (
        <Section id="credibility-section" className="section-credibility bg-gray-50 text-black py-24 md:py-32">
            <div className="w-full max-w-5xl mx-auto px-6 md:px-0">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b-2 border-black pb-6">
                    <div>
                        <span className="font-mono text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 block">TECHNICAL DATA</span>
                        <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-black">SYSTEM SPECIFICATIONS</h3>
                    </div>
                    <span className="hidden md:block font-mono text-xs font-bold tracking-widest uppercase text-gray-500">REV 2.4.0 // DEPLOYMENT READY</span>
                </div>

                {/* Data Grid - Static, High Contrast, Factual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 font-mono text-sm leading-relaxed">

                    {/* Column 1 */}
                    <div className="space-y-8">
                        <div className="group">
                            <div className="flex justify-between items-baseline border-b border-gray-300 pb-2 mb-1">
                                <span className="text-gray-500 uppercase tracking-widest text-[10px]">Sensor Array</span>
                                <span className="font-bold text-gray-900">Laser Scattering (0.3µm)</span>
                            </div>
                            <p className="text-[10px] text-gray-400 max-w-xs">Dual-channel calibrated detection for PM2.5 and PM10 differentiation.</p>
                        </div>
                        <div className="group">
                            <div className="flex justify-between items-baseline border-b border-gray-300 pb-2 mb-1">
                                <span className="text-gray-500 uppercase tracking-widest text-[10px]">Response Latency</span>
                                <span className="font-bold text-gray-900">&lt; 200ms</span>
                            </div>
                        </div>
                        <div className="group">
                            <div className="flex justify-between items-baseline border-b border-gray-300 pb-2 mb-1">
                                <span className="text-gray-500 uppercase tracking-widest text-[10px]">Filtration Standard</span>
                                <span className="font-bold text-gray-900">HEPA H13 / MERV 16</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-8">
                        <div className="group">
                            <div className="flex justify-between items-baseline border-b border-gray-300 pb-2 mb-1">
                                <span className="text-gray-500 uppercase tracking-widest text-[10px]">Power Input</span>
                                <span className="font-bold text-gray-900">110V - 240V AC</span>
                            </div>
                        </div>
                        <div className="group">
                            <div className="flex justify-between items-baseline border-b border-gray-300 pb-2 mb-1">
                                <span className="text-gray-500 uppercase tracking-widest text-[10px]">Noise Floor</span>
                                <span className="font-bold text-gray-900">22dB (Silent Mode)</span>
                            </div>
                            <p className="text-[10px] text-gray-400 max-w-xs">Measured at 1m distance in anechoic chamber conditions.</p>
                        </div>
                        <div className="group">
                            <div className="flex justify-between items-baseline border-b border-gray-300 pb-2 mb-1">
                                <span className="text-gray-500 uppercase tracking-widest text-[10px]">Communication</span>
                                <span className="font-bold text-gray-900">WiFi 6 / LoRaWAN</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Section>
    );
};

// FRAME 8: ENTRY (Subtle Guide)
const EntrySection = ({ navigate }) => {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);

    useScrollScrub({
        trigger: sectionRef,
        start: "top 75%", // Triggers as it enters comfortable view
        end: "bottom bottom",
        scrub: 1 // Gentle scrub
    }, (tl) => {
        // Minimal forward guide: Opacity bloom and very slight lift
        tl.fromTo(contentRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, ease: "none" }
        );
    });

    return (
        <Section id="entry-section" className="section-entry bg-black text-white min-h-[60vh] relative overflow-hidden flex items-center justify-center">
            {/* Grid Background (Static) */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]" />

            <div ref={contentRef} className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center">
                <div className="w-px h-16 bg-gradient-to-b from-transparent to-emerald-900/50 mb-8" /> {/* Static subtle guide line */}

                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-10 text-stone-300">
                    System Ready.
                </h2>

                <button
                    onClick={() => navigate('/login')}
                    className="group flex items-center gap-4 px-8 py-4 border border-white/10 hover:border-emerald-500/30 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-sm"
                >
                    <span className="font-mono text-xs text-emerald-600 uppercase tracking-widest">Route</span>
                    <span className="text-lg font-bold tracking-tight text-white">ENTER DASHBOARD</span>
                </button>

                <p className="mt-12 text-stone-700 font-mono text-[10px] uppercase tracking-[0.3em]">
                    Security Protocols Active
                </p>
            </div>
        </Section>
    );
};

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background text-text-primary selection:bg-primary selection:text-white font-sans">
            <Navbar />

            {/* FRAME 1: VISION */}
            <Hero />

            {/* FRAME 2: INVISIBLE POLLUTION (The Problem) */}
            <ProblemSection />

            {/* FRAME 3: INVISIBLE -> VISIBLE (Reveal) */}
            <RevealSection />

            {/* FRAME 4: CAPTURE (The System) */}
            <CaptureSection />



            {/* FRAME 6: OUTCOME */}
            <OutcomeSection />

            {/* FRAME 7: CREDIBILITY */}
            <CredibilitySection />

            {/* FRAME 8: ENTRY */}
            <EntrySection navigate={navigate} />
        </div>
    );
};

export default Home;
