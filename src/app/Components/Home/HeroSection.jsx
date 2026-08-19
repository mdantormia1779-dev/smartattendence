import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Next.js Image import করা হলো
import { Button } from "@/components/ui/button";

const HeroSection = () => {
    return (
        <section className="relative w-full min-h-[90vh] flex items-center justify-center bg-gray-900 overflow-hidden px-6 py-20">
            
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/70 to-black/80 z-10" />
                <Image 
                    src="/hero.avif"
                    alt="Modern Workplace" 
                    fill
                    priority
                    className="object-cover object-center"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-20 max-w-4xl mx-auto text-center space-y-8 text-white">
                
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs md:text-sm font-medium text-gray-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#00B050] animate-pulse"></span>
                    Multi-tenant SaaS · Face · GPS · Payroll
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                    Smart Attendance for every <br className="hidden sm:inline" />
                    <span className="text-white">modern workplace</span>
                </h1>

                {/* Description */}
                <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-300 font-normal leading-relaxed">
                    Face recognition, GPS geo-fencing, shift & leave management, and automatic payroll — all in one secure ERP for organizations of any size.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <Button className="w-full sm:w-auto bg-[#00B050] hover:bg-[#009644] text-white font-medium px-8 py-3 rounded-lg text-base shadow-lg transition-transform hover:scale-105">
                        Get Started Free
                    </Button>
                    
                    <Link href="#features">
                        <button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-base backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2 group">
                            Explore Features 
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </Link>
                </div>

                {/* Statistics Section */}
                <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/10 max-w-2xl mx-auto text-center">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white">18k+</h3>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">Employees</p>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white">63</h3>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">Organizations</p>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white">99.9%</h3>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">Uptime</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default HeroSection;