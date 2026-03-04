import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Leaf, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const checkAuth = () => {
        const session = localStorage.getItem('eco_user');
        if (session) {
            setUser(JSON.parse(session));
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Setup Auth Listeners
        checkAuth();
        window.addEventListener('auth_change', checkAuth);
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('auth_change', checkAuth);
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem('eco_user');
        setUser(null);
        window.dispatchEvent(new Event('auth_change'));
        if (window.location.pathname === '/app') {
            window.location.reload(); // Force app dashboard to kick back to login block
        }
    };

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

                    {/* CTA / Auth State */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                                <div className="hidden sm:flex items-center gap-2">
                                    {user.picture ? (
                                        <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full border border-emerald-500/30" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-300">{user.name}</span>
                                </div>
                                <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/app"
                                className="inline-flex items-center justify-center rounded-lg bg-[var(--color-brand-accent)] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--color-brand-accent)]/20 hover:scale-105 hover:bg-emerald-400 transition-all duration-300 active:scale-95"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center ml-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none p-2 rounded-lg bg-white/5 border border-white/10"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[#111827]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-4 px-4 flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-base font-medium text-gray-300 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}

                    {/* Mobile Auth Summary */}
                    {user && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                {user.picture ? (
                                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-[var(--color-brand-accent)]/30" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-brand-accent)]/20 text-emerald-400 flex items-center justify-center font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-white">{user.name}</span>
                                    <span className="text-xs text-gray-400">Signed In</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
