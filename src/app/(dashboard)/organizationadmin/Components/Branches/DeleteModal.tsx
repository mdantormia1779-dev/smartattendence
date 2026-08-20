"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { AlertTriangle } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(contentRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.2)" });
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div ref={contentRef} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-gray-900">Delete Branch</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Are you sure you want to delete this branch? This action cannot be undone.
                    </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}