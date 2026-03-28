import { useState, useEffect } from 'react';
import { Radio, Activity, Zap, Cloud } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
    { time: '08:00', emissions: 12000 },
    { time: '10:00', emissions: 18500 },
    { time: '12:00', emissions: 32000 },
    { time: '14:00', emissions: 45000 },
    { time: '16:00', emissions: 65000 },
    { time: '18:00', emissions: 82000 },
    { time: '20:00', emissions: 95000 },
    { time: '22:00', emissions: 108000 },
    { time: '00:00 (Proj)', emissions: 118294 }
];

const IoTDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('eco_user');
        if (user) {
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-brand-bg)] w-full pt-28 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-start pb-20">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-[var(--color-brand-bg)] -z-10" />

            <div className="w-full max-w-6xl">
                <div className="mb-12 text-center relative">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <Radio className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">IoT Sensor Network</h1>
                    <p className="text-[var(--color-brand-text-secondary)] text-lg max-w-2xl mx-auto">
                        Real-time air quality monitoring with MQ-7 hardware and daily future emission projections.
                    </p>
                </div>

                {!isAuthenticated ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-md mx-auto backdrop-blur-sm">
                        <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
                        <p className="text-gray-400 text-sm mb-6">Please sign in to access live sensor data streams and predictive networking nodes.</p>
                        <a href="/app" className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all">
                            Go to Login
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Live Status Card */}
                        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                NodeMCU Status
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-900/50 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg"><Zap className="w-5 h-5 text-blue-400" /></div>
                                        <div>
                                            <p className="text-xs text-gray-400">Current Readings</p>
                                            <p className="text-lg font-bold text-white">1,402 ADC</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono text-emerald-400">LIVE</span>
                                </div>

                                <div className="p-4 bg-gray-900/50 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Cloud className="w-5 h-5 text-indigo-400" /></div>
                                        <div>
                                            <p className="text-xs text-gray-400">Cumulative Daily</p>
                                            <p className="text-lg font-bold text-white">43,891 ppm</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono text-gray-500 text-right">Updated<br/>2m ago</span>
                                </div>
                            </div>
                        </div>

                        {/* Predictive Model Card */}
                        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Random Forest Projections</h3>
                                    <p className="text-sm text-gray-400">Predictive End-of-Day emissions extrapolator</p>
                                </div>
                                <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm font-semibold text-blue-400 transition-colors">
                                    Run Extrapolation
                                </button>
                            </div>
                            
                            <div className="flex-1 w-full min-h-[300px] mt-4 flex flex-col relative">
                                <p className="text-2xl font-black text-white tracking-widest leading-none drop-shadow-md mb-6 ml-4">
                                    118,294 <span className="text-sm text-blue-400 font-medium tracking-normal">PROJECTED FINAL</span>
                                </p>
                                <div className="flex-1 w-full min-h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={mockData} margin={{ top: 5, right: 30, bottom: 5, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="time" stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#0b1020', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                                            />
                                            <Line type="monotone" dataKey="emissions" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#0b1020', stroke: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#60a5fa', stroke: '#0b1020', strokeWidth: 2 }} animationDuration={1500} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IoTDashboard;
