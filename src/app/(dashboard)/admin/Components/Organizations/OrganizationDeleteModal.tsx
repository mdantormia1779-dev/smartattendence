"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Organization } from './OrganizationTable'; // আপনার সঠিক পাথ দিয়ে নিবেন

interface OrganizationDeleteModalProps {
    organization: Organization | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (org: Organization) => void;
}

export const OrganizationDeleteModal: React.FC<OrganizationDeleteModalProps> = ({
    organization,
    isOpen,
    onClose,
    onConfirm
}) => {
    if (!isOpen || !organization) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0"
                />

                {/* Modal Box */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 p-6 text-center"
                >
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Warning Icon */}
                    <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
                        <AlertTriangle className="w-7 h-7" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Organization?</h3>
                    <p className="text-xs text-gray-500 mb-6 px-2">
                        Are you sure you want to delete <strong className="text-gray-800">{organization.name}</strong>? This action is permanent and cannot be undone.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => onConfirm(organization)}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200 flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Yes, Delete
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};