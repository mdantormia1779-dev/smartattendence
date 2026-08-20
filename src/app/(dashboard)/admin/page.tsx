"use client";
import React from 'react';
import { PlatformOverview } from './Components/HomePage/PlatformOverview';
import { RevenueChart } from './Components/HomePage/RevenueChart';
import { PlanDistribution } from './Components/HomePage/PlanDistribution';
import { RecentPayments } from './Components/HomePage/RecentPayments';
import { RecentOrganizations } from './Components/HomePage/RecentOrganizations';

const SuperAdminDashboard = () => {
    return (
        <div className="relative min-h-screen bg-[#F8FAFC] overflow-hidden">
            {/* Ambient Background Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

            {/* Main Content Wrapper */}
            <div className="relative z-10 space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Platform Overview Metrics */}
                <PlatformOverview />

                {/* Middle Section: Revenue Chart & Plan Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RevenueChart />
                    </div>
                    <div>
                        <PlanDistribution />
                    </div>
                </div>

                {/* Bottom Section: Recent Payments & Recent Organizations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RecentPayments />
                    </div>
                    <div>
                        <RecentOrganizations />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;