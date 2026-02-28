import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Problem', href: '/#problem' },
        { name: 'Solution', href: '/#solution' },
        { name: 'Features', href: '/#features' },
        { name: 'Architecture', href: '/#architecture' },
    ];

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            isScrolled ? "bg-[var(--color-brand-bg)]/80 backdrop-blur-md shadow-lg py-4" : "bg-transparent py-6"
        )}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-accent)] to-emerald-400 flex items-center justify-center shadow-lg shadow-[var(--color-brand-accent)]/20 group-hover:scale-105 transition-transform duration-300">
                            <Leaf className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">Eco<span className="text-[var(--color-brand-accent)]">Guard</span></span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-[var(--color-brand-text-secondary)] hover:text-white transition-colors duration-200"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* CTA */}
                    <div className="flex items-center">
                        <Link
                            to="/app"
                            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-brand-accent)] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--color-brand-accent)]/20 hover:scale-105 hover:bg-emerald-400 transition-all duration-300 active:scale-95"
                        >
                            Try Now
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
