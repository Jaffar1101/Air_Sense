import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = React.useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-primary/10 shadow-sm"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Air Sense
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link to="/" className="text-text-primary hover:bg-primary/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                            <Link to="/dashboard" className="text-text-primary hover:bg-primary/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                            <Link to="/about" className="text-text-primary hover:bg-primary/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
                            <button
                                onClick={() => navigate('/login')}
                                className="btn-primary text-sm shadow-md"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                    {/* Mobile Hamburger */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" onClick={() => setIsOpen(false)} className="text-text-primary hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-text-primary hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
                        <Link to="/about" onClick={() => setIsOpen(false)} className="text-text-primary hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium">About</Link>
                        <button
                            onClick={() => {
                                navigate('/login');
                                setIsOpen(false);
                            }}
                            className="w-full text-left btn-primary text-sm shadow-md mt-4 ml-3"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </motion.nav>
    );
};

export default Navbar;
