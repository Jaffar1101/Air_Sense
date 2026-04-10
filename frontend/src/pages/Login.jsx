import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulation of auth
        setTimeout(() => {
            const email = e.target.email.value;
            if (email.includes('error')) {
                setError("Unable to sign in. Please check your credentials.");
                setIsLoading(false);
            } else {
                navigate('/dashboard');
            }
        }, 800);
    };

    return (
        <div className="min-h-screen flex w-full font-sans text-text-primary">
            {/* Left Side - Brand Narrative */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-white via-eco-light/50 to-primary/5 items-center justify-center border-r border-gray-100">
                {/* Subtle Abstract Visuals */}
                <div className="absolute inset-0">
                    {/* Very faint noise texture could go here if using images, using CSS patterns instead */}
                    <div className="absolute inset-0 opacity-[0.02]"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                    </div>
                </div>

                <div className="relative z-10 p-16 max-w-xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold text-primary mb-6 tracking-tight"
                    >
                        Intelligent Air Quality Monitoring
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-text-secondary leading-relaxed mb-12"
                    >
                        Air Sense helps you monitor indoor air quality, optimize filtration performance, and reduce particulate exposure using real-time analytics and predictive insights.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="border-t border-gray-200 pt-6"
                    >
                        <p className="text-sm text-gray-400 font-medium">Designed for smart buildings, workplaces, and controlled environments.</p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-12 lg:p-24 relative">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p className="mt-2 text-sm text-text-secondary">
                            {isLogin ? 'Access your Air Sense monitoring dashboard.' : 'Set up your Air Sense monitoring account.'}
                        </p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input-field"
                                    placeholder="name@company.com"
                                />
                                <p className="mt-1 text-xs text-gray-400">Use your registered work or device account.</p>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                                <p className="mt-1 text-xs text-gray-400">Minimum 8 characters.</p>
                            </div>

                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <label htmlFor="org" className="block text-sm font-medium text-text-secondary mb-1">
                                        Organization / Site Name <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        id="org"
                                        name="org"
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. HQ Building A"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">For multi-device or building deployments.</p>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary cursor-pointer select-none">
                                    {isLogin ? 'Keep me signed in on this device' : 'This is a trusted device'}
                                </label>
                            </div>

                            {isLogin && (
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-text-secondary hover:text-primary transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full btn-primary ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                            >
                                {isLoading ? 'Verifying credentials...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </button>
                            {!isLogin && (
                                <p className="text-center text-xs text-gray-400 mt-3">
                                    Your data remains private and device-bound.
                                </p>
                            )}
                        </div>

                        <div className="text-center mt-6 pt-4 border-t border-gray-50">
                            <p className="text-sm text-text-secondary">
                                {isLogin ? "New to Air Sense? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                    }}
                                    className="font-semibold text-primary hover:text-accent transition-colors"
                                >
                                    {isLogin ? 'Set up access' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
