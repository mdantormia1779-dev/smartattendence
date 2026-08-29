"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Users
} from "lucide-react";
import { api } from "@/lib/api-client";

const CATEGORIES = [
  { id: "SALES", label: "Sales & Pricing", desc: "Custom quotes & subscription plans" },
  { id: "ENTERPRISE", label: "Enterprise Deployment", desc: "Multi-branch, dedicated servers & custom biometric" },
  { id: "SUPPORT", label: "Technical Support", desc: "Geofencing, face recognition & integration assistance" },
  { id: "PARTNERSHIP", label: "Partner & Affiliate", desc: "Affiliate program & reseller opportunities" },
  { id: "BILLING", label: "Billing & Invoices", desc: "Payment verification, bKash & refunds" },
  { id: "GENERAL", label: "General Inquiry", desc: "Everything else" },
];

const FAQS = [
  {
    q: "How fast will I receive a response from your team?",
    a: "Our customer success and technical support teams typically respond within 1 to 2 hours during active business hours (Sunday to Thursday, 9:00 AM – 7:00 PM GMT+6).",
  },
  {
    q: "Can I request an on-site or live Zoom demonstration for our company?",
    a: "Yes, absolutely! Simply select 'Enterprise Deployment' or 'Sales & Pricing', include your organization's branch count and employee range, and our solutions architect will schedule a personalized live demo.",
  },
  {
    q: "Do you provide customized biometric device integrations (ZKTeco, Realtime, etc.)?",
    a: "Yes, AttendanceERP supports AI camera face-recognition, mobile GPS geofencing, QR punch, and standard biometric hardware integrations via our sync bridges.",
  },
  {
    q: "Is there a free trial available to test with our staff?",
    a: "Yes, you can register for our full-featured 30-Day Free Trial instantly without needing a credit card.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    category: "SALES",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please provide a valid work email address.");
      return;
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      setErrorMessage("Please enter an inquiry subject.");
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMessage("Please provide a detailed message (at least 10 characters).");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.contact.submit(formData);

      if (res.success) {
        setSubmittedData(res.data || { ...formData, id: `MSG-${Date.now()}` });
        setFormData({
          name: "",
          email: "",
          phone: "",
          companyName: "",
          category: "SALES",
          subject: "",
          message: "",
        });
      } else {
        setErrorMessage(res.message || "Failed to submit inquiry. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-neutral-800">
      {/* Hero Header Section */}
      <section className="bg-white border-b border-neutral-200/80 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#00B050]" />
            Enterprise Support & Client Advisory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
            We're Here to Help You <span className="text-[#00B050]">Transform Workforce Management</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about biometric attendance, automated salary disbursement, or custom enterprise solutions? Our engineering and sales team are standing by.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Direct Info Cards (4 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-900">Direct Contact Information</h3>
                <p className="text-xs text-neutral-500">Reach our headquarters and support desks directly.</p>
              </div>

              <div className="space-y-4">
                {/* Phone / Hotline */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-emerald-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Official Hotline & WhatsApp</span>
                    <a href="tel:+8801318964063" className="block text-sm font-bold text-neutral-900 hover:text-[#00B050] transition-colors mt-0.5">
                      +880 1318964063
                    </a>
                    <span className="text-[11px] text-emerald-700 font-semibold">Live support available</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-emerald-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-800 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Official Email Inquiries</span>
                    <a href="mailto:mdantormia1779@gmail.com" className="block text-sm font-bold text-neutral-900 hover:text-[#00B050] transition-colors mt-0.5">
                      mdantormia1779@gmail.com
                    </a>
                    <span className="text-[11px] text-neutral-500">mdantormia1779@gmail.com</span>
                  </div>
                </div>

                {/* Physical Address */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-emerald-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Corporate Headquarters</span>
                    <p className="text-sm font-bold text-neutral-900 mt-0.5 leading-snug">
                      Level 8, Vertex Tower, Gulshan-2
                    </p>
                    <span className="text-[11px] text-neutral-500">Dhaka 1212, Bangladesh</span>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-emerald-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Working Hours</span>
                    <p className="text-sm font-bold text-neutral-900 mt-0.5">
                      Sun – Thu: 9:00 AM – 7:00 PM
                    </p>
                    <span className="text-[11px] text-neutral-500">Weekend emergency on-call support</span>
                  </div>
                </div>
              </div>

              {/* Fast Response Guarantee Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#00B050]" />
                  <span>SLA & Response Guarantee</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  All enterprise client inquiries receive dedicated priority routing with guaranteed engineer response within 2 hours.
                </p>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Looking for immediate access?</span>
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-neutral-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#00B050]" />
                    Enterprise Portal Login
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </Link>
                <Link
                  href="/affiliate"
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 text-xs font-bold text-emerald-900 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00B050]" />
                    Affiliate Partner Program (20% Recurring)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Contact & Inquiry Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-xs space-y-6">
              
              {/* Form Title */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Send an Inquiry or Request a Demo
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500">
                  Fill out the form below and our team will review your requirements immediately.
                </p>
              </div>

              {/* Success Notification Modal / Card */}
              {submittedData ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-emerald-900">Inquiry Received Successfully!</h3>
                    <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{submittedData.name}</strong>. Your message regarding <strong>{submittedData.subject}</strong> has been logged in our system. An account advisor will contact you at <strong>{submittedData.email}</strong> shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmittedData(null)}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Category Selector Pills */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-2">
                      Select Inquiry Type *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            formData.category === cat.id
                              ? "bg-emerald-50/80 border-[#00B050] ring-1 ring-[#00B050] text-neutral-900 shadow-2xs"
                              : "border-neutral-200 hover:border-neutral-300 bg-white text-neutral-600"
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{cat.label}</div>
                          <div className="text-[10px] text-neutral-400 truncate mt-0.5">{cat.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personal & Organization Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Md Antor Mia"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        Work Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +880 17XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        Company / Organization Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Vertex Technologies Ltd."
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Inquiry Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Requesting custom quote for 250 employees across 4 branches"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-white font-medium"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Your Message / Specific Requirements *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Tell us about your organization, employee size, biometric hardware preferences, or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3.5 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#00B050] focus:outline-none bg-white leading-relaxed"
                    />
                  </div>

                  {/* Error Alert */}
                  {errorMessage && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#00B050] hover:bg-[#009b46] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00B050]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Team</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center">
                    🔒 We protect your data. Your information will never be shared with third parties.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Quick answers to common questions about deployment, pricing, and support.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-neutral-900">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? "rotate-180 text-[#00B050]" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 pt-0 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
