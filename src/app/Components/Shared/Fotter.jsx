"use client"
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP ScrollTrigger রেজিস্টার করা হলো
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const Footer = () => {
    const footerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // ফুটারের ভেতরের কন্টেন্টগুলো স্মুথলি ফেড-ইন হবে
            gsap.fromTo(
                ".footer-content",
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: "top 90%",
                    }
                }
            );
        }, footerRef);

        return () => ctx.revert();
    }, []);

    return (
        <footer ref={footerRef} className="w-full bg-[#FBF9F5] border-t border-gray-200 py-12 px-6 md:px-16 text-gray-600">
            <div className="footer-content max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                    
                    {/* Column 1: Logo & Description (Span 2 columns on medium screens) */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#00B050] text-white font-bold px-3 py-1.5 rounded-lg text-lg tracking-wider flex items-center justify-center shadow-sm">
                                VX
                            </div>
                            <div className="text-xl font-bold tracking-tight text-gray-900">
                                Attendance<span className="text-[#00B050]">ERP</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Smart attendance, payroll and HR for modern workplaces.
                        </p>
                    </div>

                    {/* Column 2: Product */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 text-sm">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-[#00B050] transition-colors">Features</a></li>
                            <li><a href="#pricing" className="hover:text-[#00B050] transition-colors">Pricing</a></li>
                            <li><a href="#integrations" className="hover:text-[#00B050] transition-colors">Integrations</a></li>
                            <li><a href="#changelog" className="hover:text-[#00B050] transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 text-sm">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#about" className="hover:text-[#00B050] transition-colors">About</a></li>
                            <li><a href="#careers" className="hover:text-[#00B050] transition-colors">Careers</a></li>
                            <li><a href="#blog" className="hover:text-[#00B050] transition-colors">Blog</a></li>
                            <li><a href="#contact" className="hover:text-[#00B050] transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Resources */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 text-sm">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#help" className="hover:text-[#00B050] transition-colors">Help Center</a></li>
                            <li><a href="#api" className="hover:text-[#00B050] transition-colors">API Docs</a></li>
                            <li><a href="#status" className="hover:text-[#00B050] transition-colors">Status</a></li>
                            <li><a href="#security" className="hover:text-[#00B050] transition-colors">Security</a></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Section: Legal & Copyright */}
                <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
                    <p>© 2026 AttendanceERP. All rights reserved.</p>
                    
                    {/* Extra Links on Right */}
                    <div className="flex items-center gap-6">
                        <a href="#privacy" className="hover:text-gray-700 transition-colors">Privacy</a>
                        <a href="#terms" className="hover:text-gray-700 transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;