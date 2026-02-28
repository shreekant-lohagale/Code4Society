import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Database, Server, Laptop, Cpu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const blocks = [
    { id: 'frontend', name: 'React + Tailwind', icon: <Laptop className="w-5 h-5" />, col: 'col-span-3' },
    { id: 'backend', name: 'FastAPI / Python', icon: <Server className="w-5 h-5" />, col: 'col-span-3' },
    { id: 'ml', name: 'Gradient Boosting (XGBoost)', icon: <Cpu className="w-5 h-5" />, col: 'col-span-1' },
    { id: 'db', name: 'Time-Series DB', icon: <Database className="w-5 h-5" />, col: 'col-span-1' }
];

const Architecture = () => {
    const comp = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Setup timeline for architecture build-up
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".arch-container",
                    start: "top 75%",
                }
            });

            tl.from(".arch-block", {
                scale: 0.8,
                opacity: 0,
                stagger: 0.3,
                duration: 0.8,
                ease: "back.out(1.5)"
            });

            // SVG path drawing animation
            tl.fromTo(".connector-line path", {
                strokeDasharray: 200,
                strokeDashoffset: 200,
            }, {
                strokeDashoffset: 0,
                duration: 1.2,
                ease: "power2.inOut",
                stagger: 0.2
            }, "-=0.5");

        }, comp);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={comp} id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--color-brand-bg)] w-full relative z-10 border-t border-white/5">
            <div className="max-w-5xl mx-auto arch-container">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-[var(--color-brand-accent)] font-semibold tracking-wide uppercase text-sm mb-3">System Design</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Production-Ready Architecture</h3>
                </div>

                <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-[var(--color-brand-surface)]/50 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-between overflow-hidden">

                    {/* Abstract grid background */}
                    <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                    {/* Client Layer */}
                    <div className="arch-block relative z-10 bg-[var(--color-brand-bg)] border-2 border-[var(--color-brand-accent)]/40 hover:border-[var(--color-brand-accent)] px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.1)] w-full max-w-md flex items-center justify-center gap-3 group transition-colors cursor-default">
                        <div className="p-2 bg-[var(--color-brand-accent)]/20 rounded-lg text-[var(--color-brand-accent)] group-hover:scale-110 transition-transform">
                            <Laptop className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-[var(--color-brand-text-secondary)] uppercase tracking-wider font-semibold">Frontend Client</span>
                            <span className="text-lg font-bold text-white">React + Tailwind UI</span>
                        </div>
                    </div>

                    {/* Connector 1 */}
                    <svg className="connector-line w-12 h-16 md:h-24 z-10" viewBox="0 0 40 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 0 L20 100" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                        <circle cx="20" cy="50" r="6" fill="#10b981" />
                    </svg>

                    {/* API Layer */}
                    <div className="arch-block relative z-10 bg-[var(--color-brand-bg)] border-2 border-blue-400/40 hover:border-blue-400 px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(96,165,250,0.1)] w-full max-w-md flex items-center justify-center gap-3 group transition-colors cursor-default">
                        <div className="p-2 bg-blue-400/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                            <Server className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-[var(--color-brand-text-secondary)] uppercase tracking-wider font-semibold">API Gateway / Backend</span>
                            <span className="text-lg font-bold text-white">FastAPI Ecosystem</span>
                        </div>
                    </div>

                    {/* Branching Connectors */}
                    <div className="relative w-full max-w-md h-16 md:h-24 flex justify-between px-16 z-10">
                        <svg className="connector-line absolute inset-0 w-full h-full" viewBox="0 0 400 100" fill="none" preserveAspectRatio="none">
                            <path d="M200 0 L200 50 L80 50 L80 100" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                            <path d="M200 0 L200 50 L320 50 L320 100" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                            <circle cx="200" cy="50" r="6" fill="#60a5fa" />
                        </svg>
                    </div>

                    {/* Data & ML Layer */}
                    <div className="w-full max-w-md flex justify-between gap-4 z-10">
                        <div className="arch-block flex-1 bg-[var(--color-brand-bg)] border-2 border-amber-400/40 hover:border-amber-400 py-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 group transition-colors cursor-default text-center">
                            <div className="text-amber-400 group-hover:scale-110 transition-transform"><Database className="w-6 h-6" /></div>
                            <span className="text-sm font-bold text-white">Time-Series DB</span>
                        </div>

                        <div className="arch-block flex-1 bg-[var(--color-brand-bg)] border-2 border-purple-400/40 hover:border-purple-400 py-4 rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.15)] flex flex-col items-center justify-center gap-2 group transition-colors cursor-default text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="text-purple-400 group-hover:scale-110 transition-transform relative z-10"><Cpu className="w-6 h-6" /></div>
                            <span className="text-sm font-bold text-white relative z-10">Gradient Boosting ML</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Architecture;
