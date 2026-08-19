import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { InputField } from './InputField';

export const OperationStep = ({ register, errors, onPrev, isSubmitting }: any) => (
    <div className="space-y-6 animate-fadeIn">
        <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Operational Preferences</h2>
            <p className="text-xs text-gray-500">Configure regional settings and daily office schedule.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <InputField label="Country" {...register("country")} error={errors.country?.message} placeholder="Bangladesh" />
            <InputField label="Language" {...register("language")} error={errors.language?.message} placeholder="English" />
            <InputField label="Currency" {...register("currency")} error={errors.currency?.message} placeholder="BDT (৳)" />
            <InputField label="Time Zone" {...register("timezone")} error={errors.timezone?.message} placeholder="UTC+6" />
            <InputField label="Working Days" {...register("workingDays")} error={errors.workingDays?.message} placeholder="Mon - Fri" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Office Start Time</label>
                <input type="time" {...register("startTime")} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all" />
                {errors.startTime && <p className="text-[10px] text-red-500 font-medium">{errors.startTime.message}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Office End Time</label>
                <input type="time" {...register("endTime")} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all" />
                {errors.endTime && <p className="text-[10px] text-red-500 font-medium">{errors.endTime.message}</p>}
            </div>
        </div>

        <div className="pt-4 flex justify-between items-center">
            <Button 
                type="button" 
                onClick={onPrev}
                variant="outline"
                className="px-6 py-3.5 rounded-xl font-semibold border-gray-200 flex items-center gap-2 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#00B050] hover:bg-[#009644] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#00B050]/20 flex items-center gap-2 cursor-pointer"
            >
                {isSubmitting ? "Processing..." : "Complete Registration"} <CheckCircle2 className="w-4 h-4" />
            </Button>
        </div>
    </div>
);