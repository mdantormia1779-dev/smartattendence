"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from "./Components/Shared/Header";
import Footer from './Components/Shared/Fotter';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // চেক করা হচ্ছে রুটটি ড্যাশবোর্ড বা অ্যাফিলিয়েট পেজ কিনা
  const isStandaloneRoute = 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/organizationadmin') || 
    pathname?.startsWith('/manager') || 
    pathname?.startsWith('/employee') ||
    pathname?.startsWith('/affiliate');

  return (
    <>
      {!isStandaloneRoute && <Header />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {!isStandaloneRoute && <Footer />}
    </>
  );
}