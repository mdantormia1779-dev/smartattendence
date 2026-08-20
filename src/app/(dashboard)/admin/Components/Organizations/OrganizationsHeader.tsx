"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrganizationsHeaderProps {
    totalShown: number;
    totalCount: number;
}

export const OrganizationsHeader: React.FC<OrganizationsHeaderProps> = ({ totalShown, totalCount }) => {
    const router = useRouter();

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Organizations</h1>
                <p className="text-xs text-gray-500 mt-0.5">{totalShown} of {totalCount} total organizations shown</p>
            </div>
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/signup')}
                className="inline-flex items-center justify-center gap-2 bg-[#00B050] hover:bg-[#009845] text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all"
            >
                <Plus className="w-4 h-4" />
                Create Organization
            </motion.button>
        </motion.div>
    );
};