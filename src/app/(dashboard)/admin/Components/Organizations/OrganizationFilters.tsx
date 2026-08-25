"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

interface OrganizationFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedPlan: string;
    setSelectedPlan: (val: string) => void;
}

export const OrganizationFilters: React.FC<OrganizationFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    selectedPlan,
    setSelectedPlan,
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row items-center gap-3"
        >
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by organization name, category or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#00B050] transition-colors"
                />
            </div>
            <div className="relative w-full sm:w-48">
                <select 
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#00B050] cursor-pointer"
                >
                    <option value="All">All Plans</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Business">Business</option>
                    <option value="Starter">Starter</option>
                    <option value="Free">30-Day Free Trial</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        </motion.div>
    );
};