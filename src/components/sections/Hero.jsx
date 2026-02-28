import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import CountUp from 'react-countup';
import { ArrowRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const comp = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Fade in background overlay slightly
            tl.to(".hero-gradient", { opacity: 1, duration: 1.5, ease: "power2.out" }, 0);

            // Slide up text elements
            tl.from(".hero-text", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power3.out",
            }, 0.2);

            // Buttons scale in (removed opacity to prevent hot-reload invisibility bug)
            tl.from(".hero-btn", {
                scale: 0.9,
                duration: 0.5,
                stagger: 0.15,
                ease: "back.out(1.7)",
            }, "+=0.1");

            // Counter container fade & float
            tl.from(".hero-counter", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
            }, "-=0.4");

        }, comp);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={comp}
            className="relative min-h-[100vh] flex items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 w-full overflow-hidden"
            id="hero"
        >
            {/* Background Gradient Animation */}
            <div className="hero-gradient absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-accent))_0%,_transparent_50%] -z-10 pointer-events-none" />

            <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="flex flex-col items-start text-left z-10 w-full">
                    <div className="hero-text inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-surface)] border border-[var(--color-brand-accent)]/30 text-[var(--color-brand-accent)] text-sm font-medium tracking-wide mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Leaf className="w-4 h-4" />
                        <span>AI-Driven Sustainability</span>
                    </div>

                    <h1 className="hero-text text-5xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                        AI-Powered <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-accent)] to-emerald-400">
                            Carbon Intelligence
                        </span>
                        <br /> for Sustainable Living
                    </h1>

                    <p className="hero-text text-lg sm:text-xl text-[var(--color-brand-text-secondary)] mb-8 max-w-lg leading-relaxed">
                        Predict your exact Carbon Emission with our <strong className="text-white">Dual-Model Architecture.</strong> A regression pipeline analyzes 18 critical lifestyle factors, while our <strong className="text-violet-400">YOLO Computer Vision</strong> model instantly detects waste material weight to aggregate your total environmental impact.
                    </p>

                    <div className="flex flex-wrap gap-4 w-full sm:w-auto relative z-50 pointer-events-auto">
                        <Link to="/app" className="hero-btn w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[var(--color-brand-accent)] to-emerald-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all duration-300 pointer-events-auto cursor-pointer">
                            Calculate Footprint
                            <ArrowRight className="w-6 h-6" />
                        </Link>
                        <a href="#problem" className="hero-btn w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-brand-surface)] text-white px-8 py-4 rounded-xl font-semibold border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 pointer-events-auto cursor-pointer">
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Right Content - Counter & Visuals */}
                <div className="hero-counter relative mt-12 lg:mt-0 flex justify-center z-10 w-full h-full min-h-[400px]">
                    {/* Decorative glowing orb */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--color-brand-accent)]/20 rounded-full blur-[80px] pointer-events-none" />

                    {/* Counter Card */}
                    <div className="relative w-full max-w-md bg-[var(--color-brand-surface)]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center my-auto aspect-square overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-accent)]/5 to-transparent z-0 pointer-events-none" />

                        <div className="z-10 flex flex-col items-center">
                            <span className="text-[var(--color-brand-text-secondary)] font-medium mb-4 tracking-wider uppercase text-sm">Real-time Carbon Avoided</span>

                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                                    <CountUp
                                        start={0}
                                        end={1950}
                                        duration={3.5}
                                        separator=","
                                        useEasing={true}
                                        delay={0.5}
                                    />
                                </span>
                                <span className="text-2xl font-bold text-[var(--color-brand-accent)]">kg</span>
                            </div>
                            <span className="mt-2 text-3xl font-bold text-white/40">CO₂</span>

                            {/* Fake animated progress rings */}
                            <div className="mt-12 w-full max-w-[200px] h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[var(--color-brand-accent)] to-emerald-400 w-full origin-left animate-[scale-x_2s_ease-out_forwards]" style={{ transform: 'scaleX(0)' }}></div>
                            </div>
                            <p className="mt-3 text-sm text-[var(--color-brand-text-secondary)]">Goal: 2,000 kg</p>
                        </div>

                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[var(--color-brand-accent)]/30 rounded-tl-3xl m-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[var(--color-brand-accent)]/30 rounded-br-3xl m-4 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
                    </div>
                </div>
            </div>

            {/* Inject small custom animation for progress bar to avoid heavy styling files */}
            <style>{`
        @keyframes scale-x {
          to { transform: scaleX(0.975); }
        }
      `}</style>
        </section>
    );
};

export default Hero;
