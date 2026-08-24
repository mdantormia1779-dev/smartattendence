import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { InputField } from './InputField';

export const OrgStep = ({ register, errors, onNext, onPrev }: any) => (
    <div className="space-y-6 animate-fadeIn">
        <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Organization Information</h2>
            <p className="text-xs text-gray-500">Provide official details regarding your enterprise.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <InputField 
                label="Company Name *" 
                {...register("companyName")} 
                error={errors.companyName?.message} 
                placeholder="e.g. Apex Technologies Ltd." 
            />
            
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Industry / Category *</label>
                <select 
                    {...register("industry")} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all"
                >
                    <option value="Software & IT">Software & IT</option>
                    <option value="Manufacturing">Manufacturing & Garments</option>
                    <option value="Retail & Superstore">Retail & Superstore</option>
                    <option value="Healthcare">Healthcare & Hospital</option>
                    <option value="Education">Education & University</option>
                    <option value="Banking & Finance">Banking & Finance</option>
                    <option value="Logistics">Logistics & Supply Chain</option>
                    <option value="General Corporate">General Corporate</option>
                </select>
                {errors.industry && <p className="text-[10px] text-red-500 font-medium">{errors.industry.message}</p>}
            </div>

            <InputField 
                label="Company Email *" 
                type="email" 
                {...register("companyEmail")} 
                error={errors.companyEmail?.message} 
                placeholder="contact@company.com" 
            />
            
            <InputField 
                label="Phone Number *" 
                {...register("phone")} 
                error={errors.phone?.message} 
                placeholder="+880 1700-000000" 
            />
            
            <InputField 
                label="Website URL" 
                {...register("website")} 
                error={errors.website?.message} 
                placeholder="https://company.com" 
            />
            
            <InputField 
                label="Company Logo (Image URL)" 
                {...register("companyLogo")} 
                error={errors.companyLogo?.message} 
                placeholder="https://example.com/logo.png" 
            />
        </div>

        <InputField 
            label="Head Office Full Address *" 
            {...register("address")} 
            error={errors.address?.message} 
            placeholder="Level 5, Gulshan-2, Dhaka, Bangladesh" 
        />

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