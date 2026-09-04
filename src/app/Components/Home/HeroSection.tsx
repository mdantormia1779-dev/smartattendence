"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Smartphone } from "lucide-react";
import gsap from "gsap";

const HeroSection = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // GSAP Timeline দিয়ে সিকোয়েন্সিয়াল অ্যানিমেশন তৈরি করা হলো
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-badge",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
      )
        .fromTo(
          ".hero-title",
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          "-=0.5",
        )
        .fromTo(
          ".hero-desc",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          "-=0.6",
        )
        .fromTo(
          ".hero-cta",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6",
        )
        .fromTo(
          ".hero-stats",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.5",
        );
    }, heroRef);

    return () => ctx.revert(); // ক্লিনআপ
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-[90vh] flex items-center justify-center bg-gray-900 overflow-hidden px-6 py-20"
    >
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
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs md:text-sm font-medium text-gray-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#00B050] animate-pulse"></span>
          Multi-tenant SaaS · Face · GPS · Payroll · Mobile App
        </div>

        {/* Main Heading */}
        <h1 className="hero-title text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Smart Attendance for every <br className="hidden sm:inline" />
          <span className="text-white">modern workplace</span>
        </h1>

        {/* Description */}
        <p className="hero-desc max-w-2xl mx-auto text-base md:text-lg text-gray-300 font-normal leading-relaxed">
          Face recognition, GPS geo-fencing, shift & leave management, and
          automatic payroll — all in one secure ERP with real-time Android mobile tracking.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/signup">
            <Button className="w-full sm:w-auto bg-[#00B050] hover:bg-[#009644] text-white font-medium px-7 py-3.5 rounded-xl text-base shadow-lg transition-transform hover:scale-105 cursor-pointer">
              Start 30-Day Free Trial
            </Button>
          </Link>

          <a 
            href="https://github.com/mdantormia1779-dev/smartattendence/releases/download/v1.0.0/smartattendence.apk" 
            download="smartattendence.apk"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-base backdrop-blur-md border border-white/25 transition-all flex items-center justify-center gap-2.5 shadow-md hover:scale-105 cursor-pointer"
          >
            <ArrowDownToLine className="w-5 h-5 text-[#00B050]" />
            <span>Download Android App</span>
            <span className="bg-[#00B050]/30 text-[#4ade80] text-xs px-2 py-0.5 rounded-full font-bold">APK</span>
          </a>

          <Link href="#features">
            <button className="w-full sm:w-auto px-5 py-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white font-medium text-base transition-all flex items-center justify-center gap-1.5 group cursor-pointer">
              Features
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </Link>
        </div>

        {/* Statistics Section */}
        <div className="hero-stats grid grid-cols-3 gap-6 pt-12 border-t border-white/10 max-w-2xl mx-auto text-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">18k+</h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Employees</p>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">63</h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Organizations
            </p>
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
