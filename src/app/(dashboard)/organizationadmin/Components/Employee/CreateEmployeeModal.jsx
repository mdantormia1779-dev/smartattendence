"use client";

import React, { useState } from "react";
import { X, Lock, Upload, Image as ImageIcon } from "lucide-react";

export default function CreateEmployeeModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    // Account & Security
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    email: "",
    password: "",

    // Personal Information
    fullName: "",
    profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    gender: "Male",
    dob: "",
    bloodGroup: "B+",
    maritalStatus: "Single",

    // Contact Information
    phoneNumber: "",
    address: "",
    emergencyContact: "",

    // Official Information
    department: "Information Technology",
    designation: "",
    branch: "Head Office – Dhaka",
    manager: "",
    joiningDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    employmentType: "Full-time",
    employeeStatus: "Active",

    // Salary Information
    basicSalary: "",
    salaryType: "Monthly",
    salaryGrade: "Grade 8",
    hourlyRate: "",

    // Documents Status
    documents: [
      { title: "National ID (Front)", file: "id-front.pdf", status: "Pending" },
      { title: "National ID (Back)", file: "id-back.pdf", status: "Pending" },
      { title: "Passport (Optional)", file: "passport.pdf", status: "None" },
      { title: "Resume (Optional)", file: "resume.pdf", status: "Pending" },
      { title: "Appointment Letter", file: "appointment.pdf", status: "Pending" },
      { title: "Other Documents", file: "extra-doc.pdf", status: "None" },
    ]
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ছবি আপলোড এবং প্রিভিউ করার হ্যান্ডলার
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <h3 className="font-bold text-stone-900 text-lg">Add New Employee (All Details)</h3>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. Account & Security */}
          <div>
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Account & Security</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Employee ID</label>
                <input type="text" name="employeeId" value={formData.employeeId} readOnly className="w-full px-3 py-2 text-sm bg-stone-100 border border-stone-200 rounded-xl text-stone-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Email Address</label>
                <input type="email" name="email" required placeholder="email@company.com" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-stone-400" /> Password
                </label>
                <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
            </div>
          </div>

          {/* 2. Personal Information */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Personal Information</h4>
            
            {/* Picture Upload Section */}
            <div className="mb-4 flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0 bg-stone-200">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-stone-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-stone-700 mb-1">Profile Picture</label>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 transition shadow-xs cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-[11px] text-stone-400 mt-1">PNG, JPG, WEBP up to 5MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Full Name</label>
                <input type="text" name="fullName" required placeholder="e.g. Tanvir Ahmed" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Date of Birth</label>
                <input type="text" name="dob" placeholder="e.g. May 14, 1994" value={formData.dob} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Blood Group</label>
                <input type="text" name="bloodGroup" placeholder="e.g. B+" value={formData.bloodGroup} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Marital Status</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Contact Information */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Phone Number</label>
                <input type="text" name="phoneNumber" placeholder="+880 1700-000000" value={formData.phoneNumber} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Emergency Contact</label>
                <input type="text" name="emergencyContact" placeholder="+880 1800-000000 (Brother)" value={formData.emergencyContact} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Address</label>
                <input type="text" name="address" placeholder="House 12, Road 5, Dhaka" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
            </div>
          </div>

          {/* 4. Official Information */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Official Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Designation</label>
                <input type="text" name="designation" required placeholder="e.g. Software Engineer" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Branch</label>
                <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Manager</label>
                <input type="text" name="manager" placeholder="e.g. Sarah Rahman" value={formData.manager} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Joining Date</label>
                <input type="text" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Employment Type</label>
                <input type="text" name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Employee Status</label>
                <select name="employeeStatus" value={formData.employeeStatus} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Probation">Probation</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Salary Information */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Salary Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Basic Salary</label>
                <input type="text" name="basicSalary" placeholder="e.g. ৳95,000" value={formData.basicSalary} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Salary Type</label>
                <input type="text" name="salaryType" value={formData.salaryType} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Salary Grade</label>
                <input type="text" name="salaryGrade" value={formData.salaryGrade} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Hourly Rate</label>
                <input type="text" name="hourlyRate" placeholder="e.g. ৳550 / hr" value={formData.hourlyRate} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Create Employee
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}