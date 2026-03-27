import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TreePine, Trophy, Zap, ShieldCheck } from 'lucide-react';
import VirtualTree from '../ui/VirtualTree';
import AnimatedButton from '../ui/AnimatedButton';

gsap.registerPlugin(ScrollTrigger);

const Gamification = () => {
    const sectionRef = useRef(null);
    const cardsRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Header Animation
            gsap.from(".gamification-header", {
                scrollTrigger: {
                    trigger: ".gamification-header",
                    start: "top 80%",
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });

            // Cards staggered animation
            gsap.from(".gamification-card", {
                scrollTrigger: {
                    trigger: ".gamification-grid",
                    start: "top 75%",
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "back.out(1.7)"
            });

            // Forest Preview Float
            gsap.to(".forest-preview", {
                y: -20,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const features = [
        {
            icon: <TreePine className="w-6 h-6 text-[#00FFFF]" />,
            title: "Earn Virtual Trees",
            desc: "Every time you reduce your monthly footprint, you earn a digital tree in your forest."
        },
        {
            icon: <Zap className="w-6 h-6 text-amber-400" />,
            title: "Dynamic Feedback",
            desc: "Your trees' health changes based on your habits. Green for savings, amber for warnings."
        },
        {
            icon: <Trophy className="w-6 h-6 text-purple-400" />,
            title: "Global Leaderboards",
            desc: "Compete for the lowest 'Tree Requirement' score and climb the ranks of top savers."
        }
    ];

    return (
        <section 
            ref={sectionRef} 
            id="gamification" 
            className="py-32 px-4 sm:px-6 lg:px-8 bg-[#050B10] w-full relative overflow-hidden border-t border-white/5"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                
                {/* Left: Content */}
                <div className="relative z-10 space-y-8">
                    <div className="gamification-header">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold mb-6">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Gaming for Good</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                            Grow Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Virtual Forest</span>
                        </h2>
                        <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl">
                            Turn carbon savings into a tangible digital legacy. Track, compete, and visualize your environmental impact with our premium gamification engine.
                        </p>
                    </div>

                    <div className="gamification-grid grid gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="gamification-card flex gap-5 bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/[0.07] transition-all hover:translate-x-2">
                                <div className="p-3 bg-gray-900 rounded-xl h-fit border border-white/5">
                                    {f.icon}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1">{f.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4">
                        <AnimatedButton href="/app" className="shadow-lg shadow-cyan-500/20">
                            Launch My Forest
                        </AnimatedButton>
                    </div>
                </div>

                {/* Right: Visual Preview */}
                <div className="relative flex justify-center items-center">
                    <div className="forest-preview relative bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-white/10 p-8 sm:p-12 rounded-[3rem] w-full max-w-lg aspect-square flex flex-col items-center justify-center backdrop-blur-3xl overflow-hidden group">
                        
                        {/* Interactive Grid Background */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                        
                        {/* Displaying Trees of different states */}
                        <div className="relative z-10 grid grid-cols-2 gap-8 items-end">
                            <div className="flex flex-col items-center gap-2 transform -translate-y-4">
                                <VirtualTree health="healthy" size="lg" />
                                <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mt-2">Active Saving</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 transform translate-y-6">
                                <VirtualTree health="neutral" size="md" />
                                <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-2">Stability</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 transform -translate-x-8">
                                <VirtualTree health="unhealthy" size="md" />
                                <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-2">Critical Need</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 transform -translate-y-8 translate-x-4">
                                <VirtualTree health="healthy" size="sm" />
                                <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mt-2">Early Growth</span>
                            </div>
                        </div>

                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                        
                        {/* Bottom Label card */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#111111]/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/20">
                                <TreePine className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Forest Status</div>
                                <div className="text-sm font-black text-white">Thriving: 12 Trees</div>
                            </div>
                        </div>
                    </div>

                    {/* Outer floating elements */}
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -top-10 -right-4 bg-[#111111] border border-white/10 p-4 rounded-2xl shadow-2xl z-20 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-xs font-bold text-white whitespace-nowrap">+2.5kg Offsets Earned</span>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default Gamification;
