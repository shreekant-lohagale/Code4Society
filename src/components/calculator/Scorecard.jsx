import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { ArrowLeft, Leaf, ScanSearch } from 'lucide-react';
import CountUp from 'react-countup';

const Scorecard = ({ lifestyleCarbon, imageRes }) => {

    const imageCarbon = imageRes && imageRes.length > 0
        ? imageRes.reduce((sum, item) => sum + item.carbon_kg, 0)
        : 0;

    const totalCarbon = lifestyleCarbon + imageCarbon;

    // Dynamic color threshold mapping based on carbon metrics 
    let status = "Medium";
    let color = "#fbbf24"; // yellow
    let textGrad = "from-amber-400 to-yellow-500";

    if (totalCarbon < 1500) {
        status = "Low";
        color = "#10b981"; // green
        textGrad = "from-[var(--color-brand-accent)] to-emerald-400";
    } else if (totalCarbon > 3500) {
        status = "High";
        color = "#ef4444"; // red
        textGrad = "from-red-400 to-rose-500";
    }

    const chartData = [
        { name: 'Lifestyle', CO2: lifestyleCarbon, color: '#10b981' }, // emerald
        { name: 'Visual Waste', CO2: imageCarbon, color: '#8b5cf6' } // violet
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-[var(--color-brand-surface)] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden flex flex-col gap-10"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b1020] rounded-full border border-white/10 mb-6 text-sm">
                        <Leaf className="w-4 h-4 text-[var(--color-brand-accent)]" />
                        <span className="text-gray-300">Dual-Model Analysis Complete</span>
                    </div>
                    <h3 className="text-[var(--color-brand-text-secondary)] font-medium uppercase tracking-widest text-sm mb-2">Total Estimated Footprint</h3>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r ${textGrad}`}>
                            <CountUp end={totalCarbon} decimals={1} duration={2.5} separator="," />
                        </span>
                        <span className="text-2xl font-bold text-gray-400">kg/yr</span>
                    </div>
                </div>

                <div className="bg-[#0b1020]/50 border border-white/5 rounded-2xl p-6 min-w-[250px]">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Lifestyle Carbon</span>
                            <span className="text-white font-medium">{lifestyleCarbon} kg</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 flex items-center gap-1"><ScanSearch className="w-3 h-3" /> YOLO Waste</span>
                            <span className="text-white font-medium">{imageCarbon > 0 ? imageCarbon.toFixed(3) : '0'} kg</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                            <span className="text-emerald-400 font-bold">Total Carbon</span>
                            <span className="text-emerald-400 font-bold">{totalCarbon.toFixed(2)} kg</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Split Layout */}
            <div className="grid lg:grid-cols-2 gap-10 items-start">

                {/* Left: Table & Suggestion */}
                <div className="space-y-8">
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <ScanSearch className="w-5 h-5 text-violet-400" />
                            Computer Vision Log
                        </h4>

                        {imageRes && imageRes.length > 0 ? (
                            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0b1020]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Material Detected</th>
                                            <th className="px-4 py-3 font-medium">Confidence</th>
                                            <th className="px-4 py-3 font-medium">Weight (g)</th>
                                            <th className="px-4 py-3 font-medium text-right">CO₂ (kg)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-gray-300">
                                        {imageRes.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 capitalize">{item.material}</td>
                                                <td className="px-4 py-3 text-emerald-400">{Math.round(item.confidence * 100)}%</td>
                                                <td className="px-4 py-3">{item.weight_g}g</td>
                                                <td className="px-4 py-3 text-right font-medium text-white">{item.carbon_kg}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 bg-[#0b1020] border border-white/5 rounded-xl text-center text-gray-500 text-sm">
                                No waste images were uploaded or processed.
                            </div>
                        )}
                    </div>

                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-xl">
                        <h5 className="font-bold text-emerald-400 mb-2">Reduction Suggestion</h5>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Your carbon footprint is classified as <strong style={{ color }}>{status}</strong>.
                            Our regression model notes that reducing private transport mileage and increasing renewable electricity usage are the fastest localized ways to drop this base score. Further, substituting petroleum-based plastics found in your Waste AI scan can lower compounding future emissions.
                        </p>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 text-sm text-[var(--color-brand-text-secondary)] hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Recalculate
                    </button>
                </div>

                {/* Right: Bar Chart */}
                <div className="h-full min-h-[300px] w-full bg-[#0b1020] rounded-xl border border-white/5 p-6 relative">
                    <h4 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">Model Contribution Breakdown</h4>
                    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} kg CO₂`}
                            />
                            <Bar dataKey="CO2" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500}>
                                {
                                    chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </motion.div>
    );
};

export default Scorecard;
