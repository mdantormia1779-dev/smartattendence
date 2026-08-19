"use client"
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import gsap from 'gsap';

const Header = () => {
    const headerRef = useRef(null);

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
    const handleScrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    // লোগোতে ক্লিক করলে পেজের একদম উপরে যাওয়ার হ্যান্ডলার
    const handleScrollToTop = (e) => {
        if (window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    return (
        <header 
            ref={headerRef} 
            className="w-full bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm"
        >
            {/* Left Side: Logo & Brand Name with Scroll to Top */}
            <Link 
                href="/" 
                onClick={handleScrollToTop}
                className="flex items-center gap-3 cursor-pointer group"
            >
                <div className="bg-[#00B050] text-white font-bold px-3 py-1.5 rounded-lg text-lg tracking-wider flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                    VX
                </div>
                <div className="text-xl font-bold tracking-tight text-gray-900 group-hover:opacity-90 transition-opacity">
                    Attendance<span className="text-[#00B050]">ERP</span>
                </div>
            </Link>

            {/* Middle: Navigation Links with Smooth Scroll */}
            <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium text-sm">
                <a href="#features" onClick={(e) => handleScrollToSection(e, 'features')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">Features</a>
                <a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">How it works</a>
                <a href="#solutions" onClick={(e) => handleScrollToSection(e, 'solutions')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">Solutions</a>
                <a href="#pricing" onClick={(e) => handleScrollToSection(e, 'pricing')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">Pricing</a>
                <a href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')} className="nav-item hover:text-[#00B050] transition-colors cursor-pointer">FAQ</a>
            </nav>

            {/* Right Side: Sign in & Start Free Button */}
            <div className="flex items-center gap-6 nav-item">
                <Link 
                    href="/login" 
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                    Sign in
                </Link>

                <Link href="/login">
                    <Button className="bg-[#00B050] hover:bg-[#009644] text-white font-medium px-5 py-2 rounded-lg shadow-sm transition-transform hover:scale-105 cursor-pointer">
                        Start Free
                    </Button>
                </Link>
            </div>
        </header>
    );
};

export default Header;