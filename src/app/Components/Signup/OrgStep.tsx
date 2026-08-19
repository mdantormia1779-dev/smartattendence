import React from 'react';
import { Image as ImageIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { InputField } from './InputField';

export const OrgStep = ({ register, errors, onNext, onPrev }: any) => (
    <div className="space-y-6 animate-fadeIn">
        <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Organization Information</h2>
            <p className="text-xs text-gray-500">Provide official details regarding your enterprise.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <InputField label="Company Name" {...register("companyName")} error={errors.companyName?.message} placeholder="Antor Tech Ltd." />
            <InputField label="Industry Type" {...register("industry")} error={errors.industry?.message} placeholder="Software & IT" />
            <InputField label="Company Email" type="email" {...register("companyEmail")} error={errors.companyEmail?.message} placeholder="hr@company.com" />
            <InputField label="Phone Number" {...register("phone")} error={errors.phone?.message} placeholder="+8801XXXXXXXXX" />
            <InputField label="Website URL" {...register("website")} error={errors.website?.message} placeholder="https://company.com" />
            
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Company Logo</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                    <ImageIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500 truncate">Upload Logo (PNG/JPG)</span>
                </div>
            </div>
        </div>

        <InputField label="Office Full Address" {...register("address")} error={errors.address?.message} placeholder="123 Corporate Avenue, Tech City" />

        <div className="pt-4 flex justify-between">
            <Button 
                type="button" 
                onClick={onPrev}
                variant="outline"
                className="px-6 py-3.5 rounded-xl font-semibold border-gray-200 flex items-center gap-2 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button 
                type="button" 
                onClick={onNext}
                className="bg-[#00B050] hover:bg-[#009644] text-white px-8 py-3.5 rounded-xl font-semibold shadow-md flex items-center gap-2 cursor-pointer"
            >
                Next Step <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
    </div>
);