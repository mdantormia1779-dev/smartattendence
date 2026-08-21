"use client";

import React, { useState, useEffect } from "react";
import { X, Lock, Upload, Image as ImageIcon } from "lucide-react";

export default function EditEmployeeModal({ isOpen, onClose, employee, onSave }) {
  const [formData, setFormData] = useState(employee || {});

  useEffect(() => {
    if (employee) setFormData(employee);
  }, [employee]);

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
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <h3 className="font-bold text-stone-900 text-lg">Edit Employee Details</h3>
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
          
          {/* Personal Information */}
          <div>
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
                  Change Image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-[11px] text-stone-400 mt-1">PNG, JPG, WEBP up to 5MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Employee ID</label>
                <input type="text" name="employeeId" value={formData.employeeId || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Gender</label>
                <input type="text" name="gender" value={formData.gender || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Date of Birth</label>
                <input type="text" name="dob" value={formData.dob || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Blood Group</label>
                <input type="text" name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Marital Status</label>
                <input type="text" name="maritalStatus" value={formData.maritalStatus || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
                <input type="email" name="email" value={formData.email || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-stone-400" /> New Password (Optional)
                </label>
                <input type="password" name="password" placeholder="Leave blank to keep old" value={formData.password || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Phone Number</label>
                <input type="text" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Address</label>
                <input type="text" name="address" value={formData.address || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Emergency Contact</label>
                <input type="text" name="emergencyContact" value={formData.emergencyContact || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
            </div>
          </div>

          {/* Official Information */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Official Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Department</label>
                <input type="text" name="department" value={formData.department || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Designation</label>
                <input type="text" name="designation" value={formData.designation || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Branch</label>
                <input type="text" name="branch" value={formData.branch || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Manager</label>
                <input type="text" name="manager" value={formData.manager || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Joining Date</label>
                <input type="text" name="joiningDate" value={formData.joiningDate || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Employment Type</label>
                <input type="text" name="employmentType" value={formData.employmentType || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Employee Status</label>
                <input type="text" name="employeeStatus" value={formData.employeeStatus || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Salary Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Basic Salary</label>
                <input type="text" name="basicSalary" value={formData.basicSalary || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Salary Type</label>
                <input type="text" name="salaryType" value={formData.salaryType || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Salary Grade</label>
                <input type="text" name="salaryGrade" value={formData.salaryGrade || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Hourly Rate</label>
                <input type="text" name="hourlyRate" value={formData.hourlyRate || ""} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
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
              Save Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}