"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, X, Smartphone, ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";

const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // হেডার এনিমেশন
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      // মেনু আইটেম এনিমেশন
      gsap.fromTo(
        ".nav-item",
        { y: -15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          delay: 0.2,
          ease: "power3.out",
        }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  // মোবাইল মেনু খোলা থাকলে বডি স্ক্রল বন্ধ রাখা এবং Esc বাটন প্রেস করলে মেনু ক্লোজ করা
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // স্মুথ স্ক্রলিং হ্যান্ডলার (সেকশনের জন্য)
  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // লোগোতে ক্লিক করলে পেজের একদম উপরে যাওয়ার হ্যান্ডলার
  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 py-3.5 px-4 sm:px-6 lg:px-8 xl:px-12 sticky top-0 z-50 shadow-xs transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Side: Logo & Brand Name */}
          <Link
            href="/"
            onClick={handleScrollToTop}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="bg-[#00B050] text-white font-extrabold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-base sm:text-lg tracking-wider flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              VX
            </div>
            <div className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-gray-900 group-hover:opacity-90 transition-opacity">
              Attendance<span className="text-[#00B050]">ERP</span>
            </div>
          </Link>

          {/* Middle: Desktop Navigation Links (Responsive for screens >= 1100px / xl) */}
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-7 text-gray-600 font-medium text-sm">
            <a
              href="#features"
              onClick={(e) => handleScrollToSection(e, "features")}
              className="nav-item hover:text-[#00B050] transition-colors py-1 cursor-pointer"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollToSection(e, "how-it-works")}
              className="nav-item hover:text-[#00B050] transition-colors py-1 cursor-pointer"
            >
              How it works
            </a>
            <a
              href="#download-app"
              onClick={(e) => handleScrollToSection(e, "download-app")}
              className="nav-item hover:text-[#00B050] text-emerald-600 font-semibold transition-colors py-1 cursor-pointer flex items-center gap-1.5"
            >
              <span>Mobile App</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                APK
              </span>
            </a>
            <a
              href="#solutions"
              onClick={(e) => handleScrollToSection(e, "solutions")}
              className="nav-item hover:text-[#00B050] transition-colors py-1 cursor-pointer"
            >
              Solutions
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleScrollToSection(e, "pricing")}
              className="nav-item hover:text-[#00B050] transition-colors py-1 cursor-pointer"
            >
              Pricing
            </a>
            <Link
              href="/affiliate"
              className="nav-item hover:text-[#00B050] transition-colors py-1 cursor-pointer text-emerald-700 font-semibold flex items-center gap-1.5"
            >
              <span>Affiliate</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                20%
              </span>
            </Link>
            <Link
              href="/contact"
              className="nav-item hover:text-[#00B050] transition-colors py-1 cursor-pointer"
            >
              Contact
            </Link>
            <a
              href="#faq"
              onClick={(e) => handleScrollToSection(e, "faq")}
              className="nav-item hover:text-[#00B050] transition-colors py-1 cursor-pointer"
            >
              FAQ
            </a>
          </nav>

          {/* Right Side: Desktop Actions */}
          <div className="hidden xl:flex items-center gap-4 nav-item shrink-0">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-2 py-1"
            >
              Sign in
            </Link>

            <Link href="/login">
              <Button className="bg-[#00B050] hover:bg-[#009644] text-white font-medium px-5 py-2 rounded-xl shadow-xs transition-transform hover:scale-105 cursor-pointer text-sm">
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Tablet Quick Actions + Mobile Hamburger Toggle */}
          <div className="flex xl:hidden items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden sm:inline-flex">
              <Button size="sm" className="bg-[#00B050] hover:bg-[#009644] text-white font-medium px-3.5 py-1.5 rounded-lg text-xs shadow-xs">
                Free Trial
              </Button>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-800" />
              ) : (
                <Menu className="w-6 h-6 text-gray-800" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile & Tablet Full-Screen / Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 top-[60px] sm:top-[65px] bg-black/40 backdrop-blur-xs z-40 xl:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Mobile & Tablet Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-[60px] sm:top-[65px] left-0 w-full bg-white border-b border-gray-200 shadow-2xl z-50 xl:hidden max-h-[calc(100vh-70px)] overflow-y-auto animate-in slide-in-from-top-4 duration-200">
          <div className="px-5 py-6 flex flex-col gap-1 divide-y divide-gray-100">
            
            {/* Primary Navigation Links */}
            <div className="flex flex-col gap-1 pb-4">
              <a
                href="#features"
                onClick={(e) => handleScrollToSection(e, "features")}
                className="px-3 py-2.5 rounded-xl text-gray-700 hover:text-[#00B050] hover:bg-emerald-50/60 font-medium text-base transition-colors flex items-center justify-between"
              >
                <span>Features</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>

              <a
                href="#how-it-works"
                onClick={(e) => handleScrollToSection(e, "how-it-works")}
                className="px-3 py-2.5 rounded-xl text-gray-700 hover:text-[#00B050] hover:bg-emerald-50/60 font-medium text-base transition-colors flex items-center justify-between"
              >
                <span>How it works</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>

              <a
                href="#download-app"
                onClick={(e) => handleScrollToSection(e, "download-app")}
                className="px-3 py-2.5 rounded-xl text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 font-semibold text-base transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00B050]" />
                  <span>Download Mobile App</span>
                </div>
                <span className="bg-[#00B050] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  APK
                </span>
              </a>

              <a
                href="#solutions"
                onClick={(e) => handleScrollToSection(e, "solutions")}
                className="px-3 py-2.5 rounded-xl text-gray-700 hover:text-[#00B050] hover:bg-emerald-50/60 font-medium text-base transition-colors flex items-center justify-between"
              >
                <span>Solutions</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>

              <a
                href="#pricing"
                onClick={(e) => handleScrollToSection(e, "pricing")}
                className="px-3 py-2.5 rounded-xl text-gray-700 hover:text-[#00B050] hover:bg-emerald-50/60 font-medium text-base transition-colors flex items-center justify-between"
              >
                <span>Pricing</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>

              <Link
                href="/affiliate"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-emerald-700 hover:bg-emerald-50/60 font-semibold text-base transition-colors flex items-center justify-between"
              >
                <span>Affiliate Program</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  Earn 20%
                </span>
              </Link>

              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-gray-700 hover:text-[#00B050] hover:bg-emerald-50/60 font-medium text-base transition-colors flex items-center justify-between"
              >
                <span>Contact</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <a
                href="#faq"
                onClick={(e) => handleScrollToSection(e, "faq")}
                className="px-3 py-2.5 rounded-xl text-gray-700 hover:text-[#00B050] hover:bg-emerald-50/60 font-medium text-base transition-colors flex items-center justify-between"
              >
                <span>FAQ</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col gap-3">
              <a
                href="https://github.com/mdantormia1779-dev/smartattendence/releases/download/v1.0.0/smartattendence.apk"
                download="smartattendence.apk"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-[#00B050]" />
                <span>Download smartattendence.apk</span>
              </a>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 py-3 rounded-xl transition-colors"
                >
                  Sign in
                </Link>

                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button className="w-full bg-[#00B050] hover:bg-[#009644] text-white font-medium py-3 h-auto rounded-xl shadow-xs text-sm">
                    Free Trial
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Header;
