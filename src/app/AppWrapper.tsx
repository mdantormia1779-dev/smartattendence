"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from "./Components/Shared/Header";
import Footer from './Components/Shared/Fotter';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // চেক করা হচ্ছে রুটটি admin রুট কিনা (যেমন /super-admin দিয়ে শুরু হলে)
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}