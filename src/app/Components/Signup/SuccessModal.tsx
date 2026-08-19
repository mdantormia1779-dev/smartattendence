"use client"
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop with Smooth Blur */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Content Box */}
                    <motion.div 
                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-[32px] p-8 md:p-10 max-w-md w-full shadow-2xl shadow-emerald-950/20 border border-slate-100 text-center space-y-6 relative overflow-hidden z-10"
                    >
                        {/* Ambient Glow & Background Decor */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Top Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mx-auto">
                            <Sparkles className="w-3.5 h-3.5" /> Setup Completed
                        </div>

                        {/* Animated Check Icon with Ripple Effect */}
                        <div className="flex justify-center relative py-2">
                            {/* Ripple Ring */}
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0.8 }}
                                animate={{ scale: 1.4, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                className="absolute w-20 h-20 bg-emerald-500/20 rounded-full"
                            />
                            
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                                className="w-20 h-20 bg-gradient-to-tr from-[#00B050] to-emerald-400 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30 relative z-10"
                            >
                                <Check className="w-10 h-10 stroke-[3]" />
                            </motion.div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                Organization is Ready!
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed px-2">
                                Your enterprise workspace and master admin profile have been successfully initialized.
                            </p>
                        </div>

                        {/* Security Note Box */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3 text-left">
                            <div className="p-2 bg-emerald-100 text-[#00B050] rounded-xl shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="text-xs">
                                <p className="font-bold text-slate-700">Encrypted & Secured</p>
                                <p className="text-slate-400">Database configured with automated tracking.</p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                            onClick={onClose}
                            className="w-full bg-[#00B050] hover:bg-[#009644] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#00B050]/25 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Proceed to Admin Login <ArrowRight className="w-4 h-4" />
                        </Button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};