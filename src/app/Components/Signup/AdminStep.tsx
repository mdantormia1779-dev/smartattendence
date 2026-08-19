import React from 'react';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { InputField } from './InputField';

export const AdminStep = ({ register, errors, onNext }: any) => (
    <div className="space-y-6 animate-fadeIn">
        <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Administrator Credentials</h2>
            <p className="text-xs text-gray-500">Create the master account to manage your company portal.</p>
        </div>

        <div className="space-y-4 pt-2">
            <InputField label="Admin Full Name" {...register("adminName")} error={errors.adminName?.message} placeholder="e.g. Md Antor Mia" icon={<User className="w-4 h-4 text-gray-400" />} />
            <InputField label="Admin Work Email" type="email" {...register("adminEmail")} error={errors.adminEmail?.message} placeholder="admin@company.com" icon={<Mail className="w-4 h-4 text-gray-400" />} />
            <InputField label="Secure Password" type="password" {...register("password")} error={errors.password?.message} placeholder="••••••••" icon={<Lock className="w-4 h-4 text-gray-400" />} />
        </div>

        <div className="pt-4 flex justify-end">
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