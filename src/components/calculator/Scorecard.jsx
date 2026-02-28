import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, Leaf } from 'lucide-react';
import CountUp from 'react-countup';

const Scorecard = ({ score }) => {

    // Dynamic color threshold mapping based on carbon metrics 
    let status = "Medium";
    let color = "#fbbf24"; // yellow
    let textGrad = "from-amber-400 to-yellow-500";

    if (score < 1500) {
        status = "Low";
        color = "#10b981"; // green
        textGrad = "from-[var(--color-brand-accent)] to-emerald-400";
    } else if (score > 3500) {
        status = "High";
        color = "#ef4444"; // red
        textGrad = "from-red-400 to-rose-500";
    }

    // Mock breakdown data since ML API isn't fully returning arrays yet
    const breakdown = [
        { name: 'Transport', value: score * 0.4 },
        { name: 'Diet & Home', value: score * 0.35 },
        { name: 'Consumption', value: score * 0.25 }
    ];

    const COLORS = [color, '#374151', '#1f2937'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-[var(--color-brand-surface)] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden"
        >
            <div className="flex flex-col md:flex-row gap-12 items-center">

                {/* Left: Total Score */}
                <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b1020] rounded-full border border-white/10 mb-6 text-sm">
                        <Leaf className="w-4 h-4" style={{ color }} />
                        <span className="text-gray-300">Analysis Complete</span>
                    </div>

                    <h3 className="text-[var(--color-brand-text-secondary)] font-medium uppercase tracking-widest text-sm mb-2">Estimated Footprint</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r ${textGrad}`}>
                            <CountUp end={score} duration={2} separator="," />
                        </span>
                        <span className="text-2xl font-bold text-gray-400">kg/yr</span>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-6">
                        Impact Level: <span style={{ color }}>{status}</span>
                    </h4>

                    <p className="text-[var(--color-brand-text-secondary)] leading-relaxed max-w-md">
                        Based on your inputs, your carbon footprint is classified as <strong>{status}</strong>. Reducing private transport mileage and increasing renewable electricity usage are the fastest localized ways to drop this score.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 flex items-center gap-2 text-sm text-[var(--color-brand-text-secondary)] hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Recalculate
                    </button>
                </div>

                {/* Right: Chart */}
                <div className="flex-1 w-full h-64 md:h-80 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={breakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {breakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => `${Math.round(value)} kg CO₂`}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className="text-gray-400 text-sm font-medium">Breakdown</span>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default Scorecard;
