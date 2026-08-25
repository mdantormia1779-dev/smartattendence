"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Lock, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Building2, 
  Layers, 
  UserCheck, 
  Loader2, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Paperclip,
  ShieldCheck,
  FileCheck
} from "lucide-react";

export default function CreateEmployeeModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  existingEmployees = [], 
  branches = [], 
  departments = [], 
  managers = [] 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    // Account & Security
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    email: "",
    password: "emp12345",

    // Personal Information
    fullName: "",
    profilePicture: "",
    gender: "Male",
    dob: "1995-05-15",
    bloodGroup: "B+",
    maritalStatus: "Single",

    // Contact Information
    phoneNumber: "+880 1700-000000",
    address: "House 12, Road 5, Dhaka",
    emergencyContact: "+880 1800-000000",

    // Official Information
    department: departments[0]?.name || "Information Technology",
    designation: "Software Engineer",
    branch: branches[0]?.name || "Head Office – Dhaka",
    manager: managers[0]?.name || "Unassigned",
    joiningDate: new Date().toISOString().split("T")[0],
    employmentType: "Full-time",
    employeeStatus: "Active",

    // Salary Information
    basicSalary: "50000",
    salaryType: "Monthly",
    salaryGrade: "Grade 8",
    hourlyRate: "350",

    // Official Documents
    documents: [
      { id: "nid_front", title: "National ID (Front)", file: "", fileName: "nid_front.pdf", status: "Verified" },
      { id: "nid_back", title: "National ID (Back)", file: "", fileName: "nid_back.pdf", status: "Verified" },
      { id: "appointment", title: "Appointment Letter", file: "", fileName: "appointment_letter.pdf", status: "Verified" },
      { id: "resume", title: "Resume / CV", file: "", fileName: "resume.pdf", status: "Verified" },
      { id: "passport", title: "Passport (Optional)", file: "", fileName: "", status: "None" },
      { id: "other", title: "Other Certificates", file: "", fileName: "", status: "None" },
    ]
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setIsSubmitting(false);
      const nextNum = (existingEmployees.length || 0) + 1;
      setFormData((prev) => ({
        ...prev,
        employeeId: `EMP-${String(nextNum).padStart(4, "0")}`,
        department: departments[0]?.name || "Information Technology",
        branch: branches[0]?.name || "Head Office – Dhaka",
        manager: managers[0]?.name || "Unassigned",
      }));
    }
  }, [isOpen, existingEmployees, branches, departments, managers]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegenerateId = () => {
    const nextNum = (existingEmployees.length || 0) + 1;
    setFormData((prev) => ({ ...prev, employeeId: `EMP-${String(nextNum).padStart(4, "0")}` }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => {
          const newDocs = [...prev.documents];
          newDocs[index] = {
            ...newDocs[index],
            file: reader.result,
            fileName: file.name,
            status: "Verified",
          };
          return { ...prev, documents: newDocs };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveDocument = (index) => {
    setFormData((prev) => {
      const newDocs = [...prev.documents];
      newDocs[index] = {
        ...newDocs[index],
        file: "",
        fileName: "",
        status: "None",
      };
      return { ...prev, documents: newDocs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      setIsSubmitting(true);
      const res = await onCreate(formData);
      if (res && res.success === false) {
        const msg = typeof res.error === "string" 
          ? res.error 
          : (res.error?.message || "Failed to create employee profile. Please verify all details.");
        setErrorMsg(msg);
        return;
      }
      onClose();
    } catch (err) {
      const msg = typeof err === "string" ? err : (err?.message || "An unexpected error occurred while saving employee.");
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">Add New Employee Profile</h3>
            <p className="text-xs text-stone-400">Register employee account, credentials, and departmental allocation</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <span>⚠️ {typeof errorMsg === "string" ? errorMsg : (errorMsg?.message || "Error saving employee")}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* 1. Account & Security */}
          <div className="bg-stone-50/60 p-4 rounded-2xl border border-stone-100">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Account & Login Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">Employee ID *</label>
                  <button 
                    type="button" 
                    onClick={handleRegenerateId}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Auto
                  </button>
                </div>
                <input 
                  type="text" 
                  name="employeeId" 
                  value={formData.employeeId} 
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-800 font-mono font-bold focus:outline-none focus:border-emerald-600 uppercase" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Official Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="employee@company.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Login Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="w-full pl-3 pr-8 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Personal Information */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Personal Information</h4>
            
            {/* Picture Upload Section */}
            <div className="mb-4 flex items-center gap-4 bg-stone-50/60 p-3.5 rounded-2xl border border-stone-200/80">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-600/30 shrink-0 bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-sm">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span>{formData.fullName ? formData.fullName.slice(0, 2).toUpperCase() : "EMP"}</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-stone-700 mb-0.5">Profile Picture</label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition shadow-2xs cursor-pointer">
                  <Upload className="w-3 h-3 text-stone-500" />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-[10px] text-stone-400 mt-1">PNG, JPG or WEBP (Max 3MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  required 
                  placeholder="e.g. Tanvir Ahmed" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Gender *</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Blood Group</label>
                <select 
                  name="bloodGroup" 
                  value={formData.bloodGroup} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Marital Status</label>
                <select 
                  name="maritalStatus" 
                  value={formData.maritalStatus} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Contact Information */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number *</label>
                <input 
                  type="text" 
                  name="phoneNumber" 
                  required
                  placeholder="+880 1700-000000" 
                  value={formData.phoneNumber} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Emergency Contact</label>
                <input 
                  type="text" 
                  name="emergencyContact" 
                  placeholder="+880 1800-000000" 
                  value={formData.emergencyContact} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Residential Address</label>
                <input 
                  type="text" 
                  name="address" 
                  placeholder="House 12, Road 5, Dhaka" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
            </div>
          </div>

          {/* 4. Official Information (Dynamic Branches, Departments, Managers) */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Official Employment & Hierarchy</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Department *</label>
                <select 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer"
                >
                  {departments.length > 0 ? (
                    departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name} ({d.code || "DEPT"})</option>
                    ))
                  ) : (
                    <option value="Information Technology">Information Technology</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Designation *</label>
                <input 
                  type="text" 
                  name="designation" 
                  required 
                  placeholder="e.g. Software Engineer" 
                  value={formData.designation} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Branch Location *</label>
                <select 
                  name="branch" 
                  value={formData.branch} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer"
                >
                  {branches.length > 0 ? (
                    branches.map((b) => (
                      <option key={b.id} value={b.name}>{b.name} ({b.code || "Branch"})</option>
                    ))
                  ) : (
                    <option value="Head Office – Dhaka">Head Office – Dhaka</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Reporting Manager</label>
                <select 
                  name="manager" 
                  value={formData.manager} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer"
                >
                  <option value="Unassigned">Unassigned / Direct to Org Admin</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.name}>{m.name} ({m.designation || "Manager"})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Joining Date</label>
                <input 
                  type="date" 
                  name="joiningDate" 
                  value={formData.joiningDate} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Employment Type</label>
                <select 
                  name="employmentType" 
                  value={formData.employmentType} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Salary Information */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Compensation & Salary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Basic Salary (BDT)</label>
                <input 
                  type="number" 
                  name="basicSalary" 
                  placeholder="50000" 
                  value={formData.basicSalary} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Salary Type</label>
                <select 
                  name="salaryType" 
                  value={formData.salaryType} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer" 
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Contractual">Contractual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Salary Grade</label>
                <input 
                  type="text" 
                  name="salaryGrade" 
                  value={formData.salaryGrade} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Hourly Overtime Rate</label>
                <input 
                  type="number" 
                  name="hourlyRate" 
                  placeholder="350" 
                  value={formData.hourlyRate} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                "Create Employee Profile"
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}