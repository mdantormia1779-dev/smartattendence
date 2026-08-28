"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';

const Header = () => {
    const headerRef = useRef<HTMLElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // পুরো হেডার ওপর থেকে নেমে আসবে
            gsap.fromTo(
                headerRef.current,
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );

            // মেনু আইটেমগুলো একে একে ফেড-ইন হবে
            gsap.fromTo(
                ".nav-item",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.3, ease: "power3.out" }
            );
        }, headerRef);

        return () => ctx.revert();
    }, []);

    // স্মুথ স্ক্রলিং হ্যান্ডলার (সেকশনের জন্য)
    const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        setIsMobileMenuOpen(false); // মোবাইল মেনু ওপেন থাকলে ক্লিক করলে বন্ধ হয়ে যাবে
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    // লোগোতে ক্লিক করলে পেজের একদম উপরে যাওয়ার হ্যান্ডলার
    const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (window.location.pathname === '/') {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    return (
        <header 
            ref={headerRef} 
            className="w-full bg-white border-b border-gray-100 py-4 px-4 sm:px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm"
        >
            {/* Left Side: Logo & Brand Name with Scroll to Top */}
            <Link 
                href="/" 
                onClick={handleScrollToTop}
                className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
                <div className="bg-[#00B050] text-white font-bold px-3 py-1.5 rounded-lg text-lg tracking-wider flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                    VX
                </div>
                <div className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 group-hover:opacity-90 transition-opacity">
                    Attendance<span className="text-[#00B050]">ERP</span>
                </div>
            </Link>

            {/* Middle: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-gray-600 font-medium text-sm">
                <a href="#features" onClick={(e) => handleScrollToSection(e, 'features')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">Features</a>
                <a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">How it works</a>
                <a href="#solutions" onClick={(e) => handleScrollToSection(e, 'solutions')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">Solutions</a>
                <a href="#pricing" onClick={(e) => handleScrollToSection(e, 'pricing')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">Pricing</a>
                <Link href="/affiliate" className="nav-item hover:text-[#00B050] transition-colors cursor-pointer text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span>Affiliate</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">20%</span>
                </Link>
                <a href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">FAQ</a>
            </nav>

            {/* Right Side: Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6 nav-item shrink-0">
                <Link 
                    href="/login" 
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                    Sign in
                </Link>

                <Link href="/login">
                    <Button className="bg-[#00B050] hover:bg-[#009644] text-white font-medium px-5 py-2 rounded-lg shadow-sm transition-transform hover:scale-105 cursor-pointer">
                        Start Free Trial
                    </Button>
                </Link>
            </div>

            {/* Mobile & Tablet Menu Toggle Button */}
            <div className="flex lg:hidden items-center">
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-gray-700 hover:text-gray-900 focus:outline-none p-1 cursor-pointer"
                    aria-label="Toggle Menu"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile & Tablet Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-6 px-6 flex flex-col gap-4 lg:hidden animate-fadeIn">
                    <a href="#features" onClick={(e) => handleScrollToSection(e, 'features')} className="text-gray-700 hover:text-[#00B050] font-medium py-2 transition-colors">Features</a>
                    <a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="text-gray-700 hover:text-[#00B050] font-medium py-2 transition-colors">How it works</a>
                    <a href="#solutions" onClick={(e) => handleScrollToSection(e, 'solutions')} className="text-gray-700 hover:text-[#00B050] font-medium py-2 transition-colors">Solutions</a>
                    <a href="#pricing" onClick={(e) => handleScrollToSection(e, 'pricing')} className="text-gray-700 hover:text-[#00B050] font-medium py-2 transition-colors">Pricing</a>
                    <Link href="/affiliate" onClick={() => setIsMobileMenuOpen(false)} className="text-emerald-700 font-semibold py-2 transition-colors flex items-center justify-between">
                        <span>Affiliate Program</span>
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">Earn 20%</span>
                    </Link>
                    <a href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')} className="text-gray-700 hover:text-[#00B050] font-medium py-2 transition-colors">FAQ</a>
                    
                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-sm font-medium text-gray-700 hover:text-gray-900 py-2">
                            Sign in
                        </Link>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full bg-[#00B050] hover:bg-[#009644] text-white font-medium py-3 rounded-xl shadow-sm">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;