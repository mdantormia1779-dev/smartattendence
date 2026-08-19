import React from 'react';
import { Button } from "@/components/ui/button"; // shadcn button import
import Link from 'next/link';

const Header = () => {
    return (
        <header className="w-full bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex items-center justify-between">
            
            {/* Left Side: Logo & Brand Name */}
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-[#00B050] text-white font-bold px-3 py-1.5 rounded-lg text-lg tracking-wider flex items-center justify-center shadow-sm">
                VX
            </div>
            <div className="text-xl font-bold tracking-tight text-gray-900 group-hover:opacity-90 transition-opacity">
                Attendance<span className="text-[#00B050]">ERP</span>
            </div>
        </Link>

            {/* Middle: Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium text-sm">
                <a href="#features" className="hover:text-[#00B050] transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-[#00B050] transition-colors">How it works</a>
                <a href="#solutions" className="hover:text-[#00B050] transition-colors">Solutions</a>
                <a href="#pricing" className="hover:text-[#00B050] transition-colors">Pricing</a>
                <a href="#faq" className="hover:text-[#00B050] transition-colors">FAQ</a>
            </nav>

            {/* Right Side: Sign in & Start Free Button */}
            <div className="flex items-center gap-6">
                <a href="#signin" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    Sign in
                </a>
                
                {/* Shadcn Button */}
                <Button className="bg-[#00B050] hover:bg-[#009644] text-white font-medium px-5 py-2 rounded-lg shadow-sm">
                    Start Free
                </Button>
            </div>

        </header>
    );
};

export default Header;