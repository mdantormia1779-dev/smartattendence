import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const OperationStep = ({ register, errors, onPrev, isSubmitting }: any) => (
    <div className="space-y-6 animate-fadeIn">
        <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Regional & Operations Settings</h2>
            <p className="text-xs text-gray-500">Configure regional localization and daily office schedule.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Country */}
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Country *</label>
                <select 
                    {...register("country")} 
                    defaultValue="Bangladesh"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all"
                >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Singapore">Singapore</option>
                </select>
                {errors.country && <p className="text-[10px] text-red-500 font-medium">{errors.country.message}</p>}
            </div>

            {/* Language */}
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Language *</label>
                <select 
                    {...register("language")} 
                    defaultValue="English"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all"
                >
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Arabic">Arabic</option>
                </select>
                {errors.language && <p className="text-[10px] text-red-500 font-medium">{errors.language.message}</p>}
            </div>

            {/* Currency */}
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Currency *</label>
                <select 
                    {...register("currency")} 
                    defaultValue="BDT (৳)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all"
                >
                    <option value="BDT (৳)">BDT (৳)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="AED (د.إ)">AED (د.إ)</option>
                </select>
                {errors.currency && <p className="text-[10px] text-red-500 font-medium">{errors.currency.message}</p>}
            </div>

            {/* Time Zone */}
            <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Time Zone *</label>
                <select 
                    {...register("timezone")} 
                    defaultValue="Asia/Dhaka (GMT+6)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all"
                >
                    <option value="Asia/Dhaka (GMT+6)">GMT+6:00 (Dhaka / Bangladesh Standard Time)</option>
                    <option value="Asia/Kolkata (GMT+5:30)">GMT+5:30 (India Standard Time)</option>
                    <option value="Asia/Dubai (GMT+4)">GMT+4:00 (Gulf Standard Time)</option>
                    <option value="Europe/London (GMT+0)">GMT+0:00 (Greenwich Mean Time)</option>
                    <option value="America/New_York (GMT-5)">GMT-5:00 (Eastern Time)</option>
                </select>
                {errors.timezone && <p className="text-[10px] text-red-500 font-medium">{errors.timezone.message}</p>}
            </div>

            {/* Working Days */}
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Working Days *</label>
                <select 
                    {...register("workingDays")} 
                    defaultValue="Sun - Thu"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all"
                >
                    <option value="Sun - Thu">Sunday – Thursday (Standard)</option>
                    <option value="Sat - Thu">Saturday – Thursday (6 Days)</option>
                    <option value="Mon - Fri">Monday – Friday (Global)</option>
                    <option value="Mon - Sat">Monday – Saturday (Retail)</option>
                    <option value="Sun - Sat">24/7 Continuous</option>
                </select>
                {errors.workingDays && <p className="text-[10px] text-red-500 font-medium">{errors.workingDays.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Office Start Time *</label>
                <input 
                    type="time" 
                    defaultValue="09:00"
                    {...register("startTime")} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all" 
                />
                {errors.startTime && <p className="text-[10px] text-red-500 font-medium">{errors.startTime.message}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Office End Time *</label>
                <input 
                    type="time" 
                    defaultValue="17:00"
                    {...register("endTime")} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all" 
                />
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
                {isSubmitting ? "Creating Organization..." : "Complete Registration"} <CheckCircle2 className="w-4 h-4" />
            </Button>
        </div>
    </div>
);