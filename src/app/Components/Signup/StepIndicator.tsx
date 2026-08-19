import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepIndicatorProps {
    num: number;
    title: string;
    currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ num, title, currentStep }) => {
    const isActive = currentStep === num;
    const isCompleted = currentStep > num;

    return (
        <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                isCompleted 
                    ? 'bg-[#00B050] text-white' 
                    : isActive 
                    ? 'bg-[#00B050]/10 text-[#00B050] border-2 border-[#00B050]' 
                    : 'bg-gray-100 text-gray-400'
            }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : num}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {title}
            </span>
        </div>
    );
};