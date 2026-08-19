"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { StepIndicator } from '@/app/Components/Signup/StepIndicator';
import { AdminStep } from '@/app/Components/Signup/AdminStep';
import { OrgStep } from '@/app/Components/Signup/OrgStep';
import { OperationStep } from '@/app/Components/Signup/OperationStep';
import { SuccessModal } from '@/app/Components/Signup/SuccessModal';

const signupSchema = z.object({
    adminName: z.string().min(2, { message: "Admin name is required" }),
    adminEmail: z.string().email({ message: "Valid email is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    
    companyName: z.string().min(2, { message: "Company name is required" }),
    industry: z.string().min(2, { message: "Industry is required" }),
    companyEmail: z.string().email({ message: "Valid company email is required" }),
    phone: z.string().min(6, { message: "Phone number is required" }),
    website: z.string().url({ message: "Valid URL is required" }),
    address: z.string().min(5, { message: "Address is required" }),
    
    country: z.string().min(2, { message: "Country is required" }),
    language: z.string().min(2, { message: "Language is required" }),
    currency: z.string().min(1, { message: "Currency is required" }),
    timezone: z.string().min(2, { message: "Timezone is required" }),
    workingDays: z.string().min(2, { message: "Working days are required" }),
    startTime: z.string().min(1, { message: "Start time is required" }),
    endTime: z.string().min(1, { message: "End time is required" }),
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false); // <-- মডাল স্টেট
    const router = useRouter();

    const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        mode: "onChange"
    });

    const nextStep = async () => {
        let fieldsToValidate: (keyof SignupFormData)[] = [];
        if (step === 1) {
            fieldsToValidate = ['adminName', 'adminEmail', 'password'];
        } else if (step === 2) {
            fieldsToValidate = ['companyName', 'industry', 'companyEmail', 'phone', 'website', 'address'];
        }

        const output = await trigger(fieldsToValidate);
        if (output) setStep((prev) => Math.min(prev + 1, 3));
    };

    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const onSubmit = async (data: SignupFormData) => {
        console.log("Modular Signup Data:", data);
        
        // ব্যাকএন্ড API কল সফল হওয়ার পর মডাল ওপেন হবে
        setIsSuccessModalOpen(true);
    };

    // মডালের বাটন ক্লিক করলে লগইন পেজে যাবে
    const handleModalClose = () => {
        setIsSuccessModalOpen(false);
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#F4F7F6] relative overflow-hidden flex items-center justify-center py-12 px-4 md:px-8">
            <div className="absolute inset-0 opacity-30 pointer-events-none" 
                 style={{ backgroundImage: "radial-gradient(#00B050 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }}></div>
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#00B050]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-3xl w-full relative z-10">
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center gap-2">
                        <div className="bg-[#00B050] text-white font-extrabold px-3 py-1.5 rounded-xl text-lg shadow-md">
                            VX
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900">
                            Attendance<span className="text-[#00B050]">ERP</span>
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">Enterprise Resource Planning & Smart Attendance System</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
                    <StepIndicator num={1} title="Admin Setup" currentStep={step} />
                    <div className={`flex-1 h-0.5 mx-4 transition-all ${step > 1 ? 'bg-[#00B050]' : 'bg-gray-200'}`} />
                    <StepIndicator num={2} title="Organization" currentStep={step} />
                    <div className={`flex-1 h-0.5 mx-4 transition-all ${step > 2 ? 'bg-[#00B050]' : 'bg-gray-200'}`} />
                    <StepIndicator num={3} title="Operations" currentStep={step} />
                </div>

                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {step === 1 && <AdminStep register={register} errors={errors} onNext={nextStep} />}
                        {step === 2 && <OrgStep register={register} errors={errors} onNext={nextStep} onPrev={prevStep} />}
                        {step === 3 && <OperationStep register={register} errors={errors} onPrev={prevStep} isSubmitting={isSubmitting} />}
                    </form>
                </div>

                <div className="text-center text-xs text-gray-500 mt-6">
                    Already registered your organization?{" "}
                    <a href="/login" className="font-semibold text-[#00B050] hover:underline">
                        Sign in to Dashboard
                    </a>
                </div>
            </div>

            {/* Success Modal Component */}
            <SuccessModal isOpen={isSuccessModalOpen} onClose={handleModalClose} />
        </div>
    );
};

export default SignupPage;