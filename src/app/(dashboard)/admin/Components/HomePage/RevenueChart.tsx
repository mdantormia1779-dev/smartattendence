"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Loader2, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api-client';

interface MonthlyRevenueItem {
    month: string;
    year: number;
    rawAmount: number;
    amount: string;
    height: string;
}

export const RevenueChart: React.FC = () => {
    const [chartData, setChartData] = useState<MonthlyRevenueItem[]>([]);
    const [gridIntervals, setGridIntervals] = useState<string[]>(['$18k', '$13.5k', '$9k', '$4.5k', '$0']);
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [totalMrr, setTotalMrr] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        const loadRevenueData = async () => {
            try {
                setIsLoading(true);
                const res = await api.reports.revenue();
                if (isMounted && res.success && res.data) {
                    const data = res.data;
                    if (Array.isArray(data.chartData) && data.chartData.length > 0) {
                        setChartData(data.chartData);
                    }
                    if (Array.isArray(data.gridIntervals) && data.gridIntervals.length > 0) {
                        setGridIntervals(data.gridIntervals);
                    }
                    if (data.currentYear) {
                        setCurrentYear(data.currentYear);
                    }
                    if (typeof data.mrr === 'number') {
                        setTotalMrr(data.mrr);
                    }
                }
            } catch (err) {
                console.error('Failed to load revenue chart data', err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadRevenueData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Fallback if data is empty: generate default 6 months with 0s
    const displayData: MonthlyRevenueItem[] = chartData.length > 0
        ? chartData
        : (() => {
            const now = new Date();
            const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const fallback: MonthlyRevenueItem[] = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                fallback.push({
                    month: names[d.getMonth()],
                    year: d.getFullYear(),
                    rawAmount: 0,
                    amount: '$0',
                    height: '6%',
                });
            }
            return fallback;
        })();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        Monthly Recurring Revenue
                        {totalMrr > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-[#00B050] font-semibold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                ${totalMrr.toLocaleString()}/mo
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Live real-time revenue trajectory across last 6 months</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-[#00B050] border border-emerald-100 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {currentYear}
                </span>
            </div>

            {/* Chart Area */}
            {isLoading ? (
                <div className="h-64 flex items-center justify-center border-b border-dashed border-gray-200">
                    <div className="flex flex-col items-center gap-2 text-gray-400 text-xs">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00B050]" />
                        <span>Loading live metrics...</span>
                    </div>
                </div>
            ) : (
                <div className="relative h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-dashed border-gray-200">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                        {gridIntervals.map((val, idx) => (
                            <div key={idx} className="border-b border-gray-100 w-full text-[10px] text-gray-400 text-right pr-1">
                                {val}
                            </div>
                        ))}
                    </div>

                    {/* Chart Bars */}
                    {displayData.map((item, index) => (
                        <div key={`${item.month}-${index}`} className="flex-1 flex flex-col items-center gap-2 relative z-10 h-full justify-end group">
                            {/* Hover Tooltip */}
                            <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md pointer-events-none whitespace-nowrap z-20">
                                {item.amount}
                            </div>

                            {/* Bar Column */}
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: item.height }}
                                transition={{ duration: 0.6, delay: index * 0.08 }}
                                whileHover={{ scale: 1.05 }}
                                className="w-full max-w-[48px] bg-gradient-to-t from-emerald-600 to-[#00B050] rounded-t-2xl transition-all shadow-[0_4px_12px_rgba(0,176,80,0.2)] group-hover:brightness-110 cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-gray-600 mt-1">{item.month}</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};