"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    Mail, 
    Lock, 
    ArrowLeft, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    AlertCircle,
    Crown,
    Building2,
    UserCheck,
    User,
    ArrowRight
} from 'lucide-react';
import gsap from 'gsap';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api-client';

const loginSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const demoRoles = [
    {
        title: "Super Admin",
        role: "Platform Owner",
        email: "superadmin@erp.com",
        password: "admin123",
        path: "/admin",
        icon: Crown,
        color: "from-amber-500/20 to-amber-600/20 border-amber-300 text-amber-900",
    },
    {
        title: "Org Admin",
        role: "Vertex Technologies",
        email: "antor@gmail.com",
        password: "123456",
        path: "/organizationadmin",
        icon: Building2,
        color: "from-emerald-500/20 to-emerald-600/20 border-emerald-300 text-emerald-900",
    },
    {
        title: "Team Manager",
        role: "IT Department Lead",
        email: "test@gmail.com",
        password: "manager123",
        path: "/manager",
        icon: UserCheck,
        color: "from-blue-500/20 to-blue-600/20 border-blue-300 text-blue-900",
    },
    {
        title: "Employee",
        role: "Sr. Software Engineer",
        email: "arif.c@vertextech.io",
        password: "password123",
        path: "/employee",
        icon: User,
        color: "from-purple-500/20 to-purple-600/20 border-purple-300 text-purple-900",
    },
];

const LoginPage: React.FC = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<string>("Org Admin");
    const containerRef = useRef<HTMLDivElement | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: 'sarah.admin@vertextech.io',
            password: 'password123',
            rememberMe: true,
        },
    });

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".login-content",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );

            gsap.fromTo(
                ".brand-side",
                { x: -50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const isDemoEnabled = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

    const roleCookieMap: Record<string, string> = {
        "Super Admin": "SUPER_ADMIN",
        "Org Admin": "ORG_ADMIN",
        "Team Manager": "MANAGER",
        "Employee": "EMPLOYEE",
    };

    const [loginError, setLoginError] = useState<string | null>(null);

    const handleSelectDemoRole = (roleItem: typeof demoRoles[0]) => {
        setSelectedRole(roleItem.title);
        setValue("email", roleItem.email);
        setValue("password", roleItem.password);
        setLoginError(null);
    };

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        try {
            setLoginError(null);
            const res = await api.auth.login({
                email: data.email,
                password: data.password,
            });

            if (res.success && res.data) {
                const userRole = res.data.user?.role || "ORG_ADMIN";
                if (typeof window !== "undefined") {
                    if (res.data.token) {
                        localStorage.setItem("auth_token", res.data.token);
                    }
                    localStorage.setItem("user_info", JSON.stringify(res.data.user || {}));
                    document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
                    document.cookie = `auth_session=${res.data.token || "active"}; path=/; max-age=86400; SameSite=Lax`;
                }

                if (userRole === "SUPER_ADMIN") router.push("/admin");
                else if (userRole === "MANAGER") router.push("/manager");
                else if (userRole === "EMPLOYEE") {
                    setLoginError("Employees use the Smart Attendance Mobile App (iOS / Android) for attendance and dashboard access. Please sign in via the mobile app.");
                }
                else router.push("/organizationadmin");
                return;
            } else {
                setLoginError(res.message || "Invalid email or password");
            }
        } catch (e: any) {
            setLoginError(e.message || "Authentication failed. Please check your credentials.");
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen w-full bg-[#FBF9F5] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left Side: Brand Showcase */}
            <div className="brand-side hidden lg:flex lg:col-span-5 bg-gradient-to-br from-gray-900 to-gray-800 p-12 flex-col justify-between text-white relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00B050_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* Top Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="bg-[#00B050] text-white font-bold px-3.5 py-2 rounded-xl text-xl tracking-wider shadow-md">
                            VX
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-white">
                            Attendance<span className="text-[#00B050]">ERP</span>
                        </div>
                    </Link>
                </div>

                {/* Middle Content */}
                <div className="relative z-10 space-y-6 max-w-md">
                    <span className="inline-block bg-[#00B050]/20 text-[#00B050] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                        Multi-Tenant SaaS ERP
                    </span>
                    <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
                        Intelligent AI-Powered Attendance & Workforce Suite.
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Access automated payroll, face-recognition clock-in, GPS tracking, and real-time analytics from a unified multi-tenant dashboard.
                    </p>

                    {/* Feature Bullets */}
                    <div className="space-y-3 pt-2 text-sm text-gray-300">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#00B050] shrink-0" />
                            <span>Anti-spoofing face recognition clock-in</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-[#00B050] shrink-0" />
                            <span>GPS branch geo-fencing validation</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-[#00B050] shrink-0" />
                            <span>Automatic payroll, allowances & tax calculation</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="relative z-10 text-xs text-gray-500">
                    © 2026 Smart Attendance SaaS. All rights reserved.
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto">
                <div className="w-full flex justify-between items-center">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to home
                    </Link>
                    
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="bg-[#00B050] text-white font-bold px-2.5 py-1 rounded-lg text-sm tracking-wider">
                            VX
                        </div>
                        <span className="font-bold text-gray-900">AttendanceERP</span>
                    </div>
                </div>

                <div className="login-content w-full max-w-lg mx-auto my-auto py-6 space-y-6">
                    <div className="space-y-2 text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back 👋
                        </h1>
                        <p className="text-xs text-gray-500">
                            Select any persona below to preview its dedicated workspace:
                        </p>
                    </div>

                    {/* Quick Demo Role Switcher Grid (Dev/Demo Only) */}
                    {isDemoEnabled && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                <span>⚡ Demo Mode Active: Select persona to test</span>
                                <span className="font-mono text-[10px]">NEXT_PUBLIC_DEMO_MODE</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                {demoRoles.map((roleItem) => {
                                    const Icon = roleItem.icon;
                                    const isSelected = selectedRole === roleItem.title;

                                    return (
                                        <button
                                            key={roleItem.title}
                                            type="button"
                                            onClick={() => handleSelectDemoRole(roleItem)}
                                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                                isSelected
                                                    ? "bg-[#00B050]/10 border-[#00B050] shadow-xs"
                                                    : "bg-white border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                                isSelected ? "bg-[#00B050] text-white" : "bg-gray-100 text-gray-600"
                                            }`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{roleItem.title}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{roleItem.role}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {loginError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                                <span>{loginError}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input 
                                    type="email" 
                                    {...register("email")}
                                    placeholder="name@company.com" 
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-[#00B050] focus:ring-2 focus:ring-[#00B050]/20 transition-all shadow-xs"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                                    Password
                                </label>
                                <span className="text-xs font-semibold text-[#00B050] hover:underline cursor-pointer">
                                    Forgot password?
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    {...register("password")}
                                    placeholder="••••••••" 
                                    className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-[#00B050] focus:ring-2 focus:ring-[#00B050]/20 transition-all shadow-xs"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Direct Role Portal Shortcut Link */}
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                            <div>
                                <span className="font-bold">Enter {selectedRole} Portal</span>
                                <p className="text-[10px] text-emerald-700">Direct instant dashboard launch</p>
                            </div>
                            <Link
                                href={demoRoles.find(r => r.title === selectedRole)?.path || "/organizationadmin"}
                                className="px-3.5 py-1.5 bg-[#00B050] text-white rounded-xl font-bold flex items-center gap-1 shadow-sm hover:bg-[#009b46] transition-colors"
                            >
                                Launch <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-[#00B050] hover:bg-[#009644] text-white font-semibold py-3.5 rounded-2xl shadow-md transition-transform hover:scale-[1.01] cursor-pointer text-sm disabled:opacity-50"
                        >
                            Sign In to {selectedRole} Dashboard
                        </Button>
                    </form>

                    <div className="text-center text-xs text-gray-500">
                        Don't have an account yet?{" "}
                        <Link href="/signup" className="font-semibold text-[#00B050] hover:underline">
                            Start Free Trial
                        </Link>
                    </div>
                </div>

                <div className="lg:hidden text-center text-xs text-gray-400 pt-4">
                    © 2026 AttendanceERP. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default LoginPage;