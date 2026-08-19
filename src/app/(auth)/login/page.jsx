"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import gsap from 'gsap';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".login-content",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );

            gsap.fromTo(
                ".brand-side",
                { x: -50, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Logging in with:", { email, password, rememberMe });
    };

    return (
        <div ref={containerRef} className="min-h-screen w-full bg-[#FBF9F5] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            
            {/* Left Side: Brand Showcase & Features (Desktop Only) */}
            <div className="brand-side hidden lg:flex lg:col-span-5 bg-gradient-to-br from-gray-900 to-gray-800 p-12 flex-col justify-between text-white relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00B050_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* Top Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="bg-[#00B050] text-white font-bold px-3.5 py-2 rounded-xl text-xl tracking-wider shadow-md">
                            VX
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-white">
                            Attendance<span className="text-[#00B050]">ERP</span>
                        </div>
                    </Link>
                </div>

                {/* Middle Content */}
                <div className="relative z-10 space-y-6 max-w-md">
                    <span className="inline-block bg-[#00B050]/20 text-[#00B050] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                        Secure Enterprise Portal
                    </span>
                    <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
                        Manage your workforce with intelligence & precision.
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Access automated payroll, face-recognition attendance, GPS tracking, and real-time analytics from a single unified dashboard.
                    </p>

                    {/* Feature Bullets */}
                    <div className="space-y-3 pt-2 text-sm text-gray-300">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#00B050] shrink-0" />
                            <span>Anti-spoofing face recognition clock-in</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-[#00B050] shrink-0" />
                            <span>Strict GPS geo-fencing branch validation</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-[#00B050] shrink-0" />
                            <span>One-click automated salary & tax calculation</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer info */}
                <div className="relative z-10 text-xs text-gray-500">
                    © 2026 AttendanceERP. All rights reserved.
                </div>
            </div>

            {/* Right Side: Login Form Container */}
            <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-24">
                
                {/* Top Back Link */}
                <div className="w-full flex justify-between items-center">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to home
                    </Link>
                    
                    {/* Mobile Logo View */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="bg-[#00B050] text-white font-bold px-2.5 py-1 rounded-lg text-sm tracking-wider">
                            VX
                        </div>
                        <span className="font-bold text-gray-900">AttendanceERP</span>
                    </div>
                </div>

                {/* Main Form Box */}
                <div className="login-content w-full max-w-lg mx-auto my-auto py-8 space-y-8">
                    
                    {/* Header */}
                    <div className="space-y-2 text-left">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                            Welcome back 👋
                        </h1>
                        <p className="text-sm text-gray-500">
                            Please enter your credentials to sign in to your account.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </span>
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com" 
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-[#00B050] focus:ring-2 focus:ring-[#00B050]/20 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                                    Password
                                </label>
                                <a href="#forgot" className="text-xs font-semibold text-[#00B050] hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" 
                                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-[#00B050] focus:ring-2 focus:ring-[#00B050]/20 transition-all shadow-sm"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input 
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-[#00B050] border-gray-300 rounded focus:ring-[#00B050]"
                                />
                                <span className="text-sm text-gray-600 font-medium">Remember for 30 days</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            className="w-full bg-[#00B050] hover:bg-[#009644] text-white font-medium py-4 rounded-2xl shadow-md transition-transform hover:scale-[1.01] cursor-pointer text-base"
                        >
                            Sign In to Dashboard
                        </Button>
                    </form>

                    {/* Bottom redirect link */}
                    <div className="text-center text-sm text-gray-500 pt-4">
                        Don't have an account yet?{" "}
                        <Link href="/signup" className="font-semibold text-[#00B050] hover:underline">
                            Start Free Trial
                        </Link>
                    </div>
                </div>

                {/* Mobile Bottom Footer */}
                <div className="lg:hidden text-center text-xs text-gray-400 pt-6">
                    © 2026 AttendanceERP. All rights reserved.
                </div>

            </div>
        </div>
    );
};

export default LoginPage;