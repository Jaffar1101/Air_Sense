
import React, { useState, useEffect } from 'react';
import SensorStatusBar from '../components/sensors/SensorStatusBar';
import RawSensorCard from '../components/sensors/RawSensorCard';
import DerivedMetricsCard from '../components/sensors/DerivedMetricsCard';
import CurrentRunCard from '../components/sensors/CurrentRunCard';
import SensorRunHistory from '../components/sensors/SensorRunHistory';
import RawDataInspector from '../components/sensors/RawDataInspector';

import featherBg from '../assets/feather.png';

const Sensors = () => {
    const [streamData, setStreamData] = useState({ raw: null, derived: null, timestamp: null });
    const [runData, setRunData] = useState(null);

    // Fetch Live Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stream
                const streamRes = await fetch('http://localhost:8000/hardware/stream');
                if (streamRes.ok) {
                    const data = await streamRes.json();
                    setStreamData(data);
                }

                // Fetch Run Stats
                const runRes = await fetch('http://localhost:8000/hardware/run/current');
                if (runRes.ok) {
                    const rData = await runRes.json();
                    setRunData(rData);
                }
            } catch (e) {
                console.error("Fetch error", e);
            }
        };

        const interval = setInterval(fetchData, 1000); // 1Hz update
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen animate-fade-in-up pb-20">
            {/* Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src={featherBg} alt="" className="w-full h-full object-cover opacity-100" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* 1. Page Header (Matched to Dashboard) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Sensors</h1>
                        <p className="text-text-secondary mt-1">Live hardware telemetry and session history</p>
                    </div>
                </div>

                {/* 2. System Status Strip */}
                <div className="w-full">
                    <SensorStatusBar />
                </div>

                {/* 3. Live Sensor Stream (Two cards side-by-side) */}
                <section>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-card shadow-card overflow-hidden h-full">
                            <RawSensorCard data={streamData.raw} />
                        </div>
                        <div className="bg-white rounded-card shadow-card overflow-hidden h-full">
                            <DerivedMetricsCard data={streamData.derived} />
                        </div>
                    </div>
                </section>

                {/* 4. Current Session Summary (Only when active) */}
                {runData && runData.active && (
                    <div className="w-full">
                        <CurrentRunCard runData={runData} />
                    </div>
                )}

                {/* 5. Session History */}
                <div className="w-full">
                    <SensorRunHistory />
                </div>

                {/* 6. Raw Data Inspector (Collapsible) */}
                <div className="w-full">
                    <RawDataInspector />
                </div>
            </div>
        </div>
    );
};

export default Sensors;
