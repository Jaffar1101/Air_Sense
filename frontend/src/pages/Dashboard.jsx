import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import AgentStatusCard from '../components/AgentStatusCard';
import PollutantCard from '../components/PollutantCard';
import featherBg from '../assets/feather.png';
import { useLiveEnvironment } from '../hooks/useEnvironment';
import { fetchHistory } from '../api/environment';

const LAT = 19.0760;
const LON = 72.8777;

const Dashboard = () => {
    const { data, agentAction, loading, error, lastUpdated } = useLiveEnvironment(LAT, LON);
    const [historyData, setHistoryData] = useState([]);
    const [secondsAgo, setSecondsAgo] = useState(0);

    // Fetch 24h History
    useEffect(() => {
        const loadHistory = async () => {
            const history = await fetchHistory(24);
            // Format timestamps for display (e.g., "14:00")
            const formatted = history.map(item => ({
                ...item,
                time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setHistoryData(formatted);
        };
        loadHistory();
    }, []); // Run once on mount

    // "Seconds Ago" Ticker (1s)
    useEffect(() => {
        const timerId = setInterval(() => {
            if (lastUpdated) {
                const diff = Math.floor((new Date() - lastUpdated) / 1000);
                setSecondsAgo(diff);
            }
        }, 1000);
        return () => clearInterval(timerId);
    }, [lastUpdated]);

    // Re-fetch history and aggregate by hour
    useEffect(() => {
        const loadHistory = async () => {
            if (loading && !data) return; // Wait for initial load if needed, but history is independent usually. 
            // Actually, depend on nothing or lastUpdated.

            const history = await fetchHistory(24);
            if (history && history.length > 0) {
                // Aggregate data by hour
                const hourlyMap = new Map();

                history.forEach(item => {
                    const date = new Date(item.timestamp);
                    // Key format: "YYYY-MM-DD HH:00" to sort correctly, but for trend we just need sequential.
                    // Let's use the hour timestamp as key.
                    date.setMinutes(0, 0, 0);
                    const key = date.getTime();

                    if (!hourlyMap.has(key)) {
                        hourlyMap.set(key, { sum: 0, count: 0, time: date });
                    }
                    const entry = hourlyMap.get(key);
                    entry.sum += item.aqi;
                    entry.count += 1;
                });

                // Convert map to sorted array
                const aggregated = Array.from(hourlyMap.entries())
                    .sort((a, b) => a[0] - b[0])
                    .map(([key, val]) => ({
                        time: val.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        aqi: Math.round(val.sum / val.count),
                        timestamp: val.time.toISOString(),
                        category: "Average" // Simplified for aggregated view
                    }));

                // Ensure we usually have 24 bars if possible, or just what's available.
                // If the user wants a full 24h timeline filled with 0s for missing data, we could do that, 
                // but usually showing available history is fine.
                setHistoryData(aggregated);
            }
        };
        loadHistory();
    }, [lastUpdated]);

    const SkeletonCard = () => (
        <div className="bg-white p-6 rounded-card shadow-card min-h-[160px] animate-pulse flex flex-col justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
    );

    // AQI Color Logic
    const getAQIColor = (aqi) => {
        if (aqi <= 50) return "text-green-500"; // Good
        if (aqi <= 100) return "text-lime-500"; // Satisfactory (Light Green)
        if (aqi <= 200) return "text-yellow-500"; // Moderately Polluted
        if (aqi <= 300) return "text-orange-500"; // Poor
        if (aqi <= 400) return "text-red-500"; // Very Poor
        return "text-red-900"; // Severe (Dark Red)
    };

    // Wind Descriptor Logic
    const getWindDescriptor = (speed) => {
        if (speed < 2) return "Low dispersion";
        if (speed < 5) return "Moderate dispersion";
        return "High dispersion";
    };

    // Determine Empty State
    // If we have minimal data (less than 6 points), show baseline message
    const isCollecting = historyData.length < 6;

    // Use Mock Data for visual baseline if collecting, otherwise real data
    const chartData = isCollecting
        ? Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, aqi: 0 }))
        : historyData;

    // Calculate Min/Max for Badges
    const minAQI = isCollecting ? { val: 0, time: '--' } : historyData.reduce((prev, curr) => curr.aqi < prev.val ? { val: curr.aqi, time: curr.time } : prev, { val: 9999, time: '' });
    const maxAQI = isCollecting ? { val: 0, time: '--' } : historyData.reduce((prev, curr) => curr.aqi > prev.val ? { val: curr.aqi, time: curr.time } : prev, { val: -1, time: '' });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100 text-xs">
                    <p className="font-bold text-gray-700 mb-1">{data.time}</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getAQIColor(data.aqi).replace('text-', 'bg-').replace('-500', '-500') }}></span>
                        <span className="text-gray-600 font-medium">AQI: <span className="text-gray-900 font-bold">{data.aqi}</span></span>
                    </div>
                    <p className="mt-1 text-gray-400 capitalize">{data.category || (isCollecting ? 'Calibrating' : 'Unknown')}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="relative min-h-screen animate-fade-in-up">
            {/* Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src={featherBg} alt="" className="w-full h-full object-cover opacity-100" />
            </div>

            <div className="relative z-10 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary"> System Overview</h1>
                        <p className="text-text-secondary mt-1">
                            {loading
                                ? "Connecting to environmental sensors..."
                                : error
                                    ? `Live data unavailable. Showing last recorded snapshot.`
                                    : "Real-time environmental monitoring active."}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className={`px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-sm border border-gray-100 flex items-center gap-2 ${error ? "text-red-500" : "text-text-secondary"}`}>
                            <span className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-primary animate-pulse"}`}></span>
                            {error ? "Sensor Error" : "Live Connection"}
                        </div>
                        {lastUpdated && !loading && (
                            <span className="text-xs text-gray-500 font-medium mr-2">
                                Last updated: {secondsAgo}s ago
                            </span>
                        )}
                    </div>
                </div>

                {/* Live Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Air Quality Index"
                                value={data?.air_quality ? <><CountUp end={data.air_quality.aqi} duration={2} /></> : "--"}
                                icon="💨"
                                colorClass={data?.air_quality ? getAQIColor(data.air_quality.aqi) : "text-gray-400"}
                                label={data?.air_quality?.category}
                                dominant={data?.air_quality?.dominant_pollutant}
                                delay={0}
                            />
                            <StatCard
                                title="Temperature"
                                value={data?.weather ? <><CountUp end={data.weather.temperature} decimals={1} duration={2} />°C</> : "--"}
                                icon="🌡️"
                                colorClass="text-gray-700"
                                label={data?.weather?.condition}
                                note={data?.weather ? `Feels like ${Math.round(data.weather.feels_like)}°C` : null}
                                delay={0.1}
                            />
                            <StatCard
                                title="Humidity"
                                value={data?.weather ? <><CountUp end={data.weather.humidity} duration={2} />%</> : "--"}
                                icon="💧"
                                colorClass="text-blue-500"
                                note={data?.weather?.humidity > 55 ? "High humidity may amplify PM readings" : null}
                                delay={0.2}
                            />
                            <StatCard
                                title="Wind Speed"
                                value={data?.weather ? <><CountUp end={data.weather.wind_speed} decimals={1} duration={2} /> m/s</> : "--"}
                                icon="🍃"
                                colorClass="text-emerald-600"
                                label={data?.weather ? getWindDescriptor(data.weather.wind_speed) : null}
                                delay={0.3}
                            />
                        </>
                    )}
                </div>

                {/* Trends and Agent Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 24-Hour Trend Chart - Bar Style */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-card shadow-card min-h-[350px] flex flex-col relative overflow-hidden group">

                        {/* Header with Min/Max Badges */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 z-10 relative">
                            <div>
                                <h3 className="text-lg font-bold text-text-primary">24-Hour Trend</h3>
                                <p className="text-xs text-text-secondary mt-1">Real-time AQI monitoring</p>
                            </div>

                            {!isCollecting && (
                                <div className="flex gap-4">
                                    {/* Min Badge */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                                            {minAQI.val}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-text-primary">Min.</span>
                                            <span className="text-[10px] text-text-secondary uppercase tracking-wide">at {minAQI.time}</span>
                                        </div>
                                    </div>

                                    {/* Max Badge */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                                            {maxAQI.val}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-text-primary">Max.</span>
                                            <span className="text-[10px] text-text-secondary uppercase tracking-wide">at {maxAQI.time}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bar Chart */}
                        <div className="flex-grow w-full h-[250px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={40}>
                                    <XAxis
                                        dataKey="time"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                                        interval="preserveStartEnd"
                                        minTickGap={50}
                                    />
                                    <YAxis
                                        hide={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                                        domain={[0, 'auto']}
                                        width={30}
                                        label={{ value: 'AQI (US)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                    <Bar dataKey="aqi" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>

                            {/* Collecting Data Overlay */}
                            {isCollecting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                                    <div className="text-center p-4 bg-white/90 rounded-xl border border-gray-100 shadow-sm max-w-xs">
                                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3"></div>
                                        <p className="text-sm font-medium text-text-secondary">
                                            Collecting data...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <AgentStatusCard action={agentAction} isAutoMode={true} />
                </div>

                {/* Pollutant Breakdown Grid */}
                <div>
                    <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        Pollutant Breakdown
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Real-time μg/m³</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-24 bg-white rounded-xl shadow-sm animate-pulse border-l-4 border-gray-100"></div>
                            ))
                        ) : data?.air_quality ? (
                            <>
                                <PollutantCard
                                    name="PM2.5"
                                    value={data.air_quality.pm25}
                                    unit="μg/m³"
                                    limit={15}
                                    description="Fine Particles"
                                    delay={0.4}
                                />
                                <PollutantCard
                                    name="PM10"
                                    value={data.air_quality.pm10}
                                    unit="μg/m³"
                                    limit={45}
                                    description="Coarse Particles"
                                    delay={0.5}
                                />
                                <PollutantCard
                                    name="NO2"
                                    value={data.air_quality.no2}
                                    unit="μg/m³"
                                    limit={25}
                                    description="Nitrogen Dioxide"
                                    delay={0.6}
                                />
                                <PollutantCard
                                    name="SO2"
                                    value={data.air_quality.so2}
                                    unit="μg/m³"
                                    limit={40}
                                    description="Sulfur Dioxide"
                                    delay={0.7}
                                />
                                <PollutantCard
                                    name="CO"
                                    value={data.air_quality.co}
                                    unit="μg/m³"
                                    limit={4000}
                                    description="Carbon Monoxide"
                                    delay={0.8}
                                />
                                <PollutantCard
                                    name="O3"
                                    value={data.air_quality.o3}
                                    unit="μg/m³"
                                    limit={100}
                                    description="Ozone"
                                    delay={0.9}
                                />
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
