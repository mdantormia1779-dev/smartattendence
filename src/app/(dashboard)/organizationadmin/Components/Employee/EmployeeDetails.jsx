"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  UserPlus,
  X,
  Lock,
  Upload,
  Image as ImageIcon,
  Briefcase,
  DollarSign,
  FileText,
  User
} from "lucide-react";

// ==========================================
// 1. Edit Employee Modal Component (আপনার দেওয়া সম্পূর্ণ ফিল্ড সহ)
// ==========================================
function EditEmployeeModal({ isOpen, onClose, employee, onSave }) {
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

// ==========================================
// 2. Create Employee Modal Component
// ==========================================
function CreateEmployeeModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    email: "",
    fullName: "",
    profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    gender: "Male",
    dob: "Jan 01, 1995",
    bloodGroup: "B+",
    maritalStatus: "Single",
    phoneNumber: "",
    address: "",
    emergencyContact: "",
    department: "Information Technology",
    designation: "Software Engineer",
    branch: "Head Office – Dhaka",
    manager: "Sarah Rahman",
    joiningDate: "Jul 26, 2026",
    employmentType: "Full-time",
    employeeStatus: "Active",
    basicSalary: "৳80,000",
    salaryType: "Monthly",
    salaryGrade: "Grade 8",
    hourlyRate: "৳500 / hr",
    documents: [
      { title: "National ID (Front)", file: "id-front.pdf", status: "Pending" },
      { title: "National ID (Back)", file: "id-back.pdf", status: "Pending" },
      { title: "Passport (Optional)", file: "passport.pdf", status: "None" },
      { title: "Resume (Optional)", file: "resume.pdf", status: "Pending" },
      { title: "Appointment Letter", file: "appointment.pdf", status: "Pending" },
      { title: "Other Documents", file: "extra-doc.pdf", status: "None" }
    ]
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <h3 className="font-bold text-stone-900 text-lg">Add New Employee</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Full Name</label>
            <input type="text" name="fullName" required placeholder="Tanvir Ahmed" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Email Address</label>
            <input type="email" name="email" required placeholder="email@company.com" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Designation</label>
            <input type="text" name="designation" placeholder="Frontend Developer" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600" />
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl cursor-pointer">Create Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. Main EmployeeDetails Component
// ==========================================
export default function EmployeeDetails({ employee, onBack }) {
  const [activeTab, setActiveTab] = useState("Overview");
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [emp, setEmp] = useState({
    employeeId: employee?.employeeId || "EMP-1042",
    fullName: employee?.fullName || "Arif Chowdhury",
    profilePicture: employee?.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    gender: employee?.gender || "Male",
    dob: employee?.dob || "May 14, 1994",
    bloodGroup: employee?.bloodGroup || "B+",
    maritalStatus: employee?.maritalStatus || "Married",
    email: employee?.email || "arif.c@vertextech.io",
    password: employee?.password || "",
    phoneNumber: employee?.phoneNumber || "+880 1712-100201",
    address: employee?.address || "House 12, Road 5, Dhanmondi, Dhaka",
    emergencyContact: employee?.emergencyContact || "+880 1811-998877 (Brother)",
    department: employee?.department || "Information Technology",
    designation: employee?.designation || "Senior Software Engineer",
    branch: employee?.branch || "Head Office – Dhaka",
    manager: employee?.manager || "Sarah Rahman",
    joiningDate: employee?.joiningDate || "Jan 12, 2020",
    employmentType: employee?.employmentType || "Full-time",
    employeeStatus: employee?.employeeStatus || "Active",
    basicSalary: employee?.basicSalary || "৳95,000",
    salaryType: employee?.salaryType || "Monthly",
    salaryGrade: employee?.salaryGrade || "Grade 8",
    hourlyRate: employee?.hourlyRate || "৳550 / hr",
    documents: employee?.documents || [
      { title: "National ID (Front)", file: "id-front.pdf", status: "Verified" },
      { title: "National ID (Back)", file: "id-back.pdf", status: "Verified" },
      { title: "Passport (Optional)", file: "passport.pdf", status: "None" },
      { title: "Resume (Optional)", file: "resume.pdf", status: "Verified" },
      { title: "Appointment Letter", file: "appointment.pdf", status: "Verified" },
      { title: "Other Documents", file: "extra-doc.pdf", status: "None" },
    ]
  });

  const handleSaveEdit = (updatedData) => {
    setEmp(updatedData);
  };

  const handleCreateNew = (newData) => {
    setEmp(newData);
    alert(`Employee ${newData.fullName} created successfully!`);
  };

  return (
    <div className="bg-[#FAF7F0] min-h-screen text-stone-800 font-sans p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navigation / Back & Add Button */}
        <div className="flex items-center justify-between">
          {onBack ? (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <span>←</span> Back to List
            </button>
          ) : <div />}

          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="h-32 md:h-40 bg-emerald-600 relative px-6 pt-6"></div>

          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-14 gap-4">
              <div className="flex items-end gap-4">
                <img 
                  src={emp.profilePicture} 
                  alt={emp.fullName} 
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-md bg-white flex-shrink-0" 
                />
                <div className="mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-bold text-stone-900">{emp.fullName}</h1>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {emp.employeeStatus}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {emp.designation} · {emp.department}
                  </p>
                  <p className="text-xs font-mono text-stone-400 mt-0.5">{emp.employeeId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button 
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-4 h-4 text-stone-500" /> Edit Profile
                </button>
              </div>
            </div>

            {/* Quick Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100 text-sm text-stone-600">
              <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-stone-400 flex-shrink-0" /><span className="truncate">{emp.email}</span></div>
              <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-stone-400 flex-shrink-0" /><span>{emp.phoneNumber}</span></div>
              <div className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" /><span>{emp.branch}</span></div>
              <div className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-stone-400 flex-shrink-0" /><span>Joined {emp.joiningDate}</span></div>
            </div>
          </div>

          {/* Tabs Header */}
          <div className="px-6 border-t border-stone-200 flex gap-8 text-sm font-medium overflow-x-auto">
            {["Overview", "Salary", "Documents"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab ? "border-emerald-600 text-emerald-600 font-semibold" : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Personal Information */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" /> Personal Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">Employee ID</span><span className="font-mono font-medium">{emp.employeeId}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Full Name</span><span className="font-medium">{emp.fullName}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Profile Picture</span>
                  <a href={emp.profilePicture} target="_blank" rel="noreferrer" className="text-emerald-600 text-xs underline truncate max-w-[120px]">View Link</a>
                </div>
                <div className="flex justify-between"><span className="text-stone-500">Gender</span><span className="font-medium">{emp.gender}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Date of Birth</span><span className="font-medium">{emp.dob}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Blood Group</span><span className="font-medium">{emp.bloodGroup}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Marital Status</span><span className="font-medium">{emp.maritalStatus}</span></div>
              </div>
            </div>

            {/* 2. Contact Information */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" /> Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">Email</span><span className="font-medium truncate max-w-[180px]">{emp.email}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Phone Number</span><span className="font-medium">{emp.phoneNumber}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Address</span><span className="font-medium truncate max-w-[160px]" title={emp.address}>{emp.address}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Emergency Contact</span><span className="font-medium text-xs truncate max-w-[150px]">{emp.emergencyContact}</span></div>
              </div>
            </div>

            {/* 3. Official Information */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" /> Official Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">Department</span><span className="font-medium">{emp.department}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Designation</span><span className="font-medium">{emp.designation}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Branch</span><span className="font-medium">{emp.branch}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Manager</span><span className="font-medium">{emp.manager}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Joining Date</span><span className="font-medium">{emp.joiningDate}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Employment Type</span><span className="font-medium">{emp.employmentType}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Employee Status</span><span className="font-medium text-emerald-600">{emp.employeeStatus}</span></div>
              </div>
            </div>

            {/* 4. Salary Information */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Salary Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">Basic Salary</span><span className="font-bold text-stone-900">{emp.basicSalary}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Salary Type</span><span className="font-medium">{emp.salaryType}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Salary Grade</span><span className="font-medium">{emp.salaryGrade}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Hourly Rate</span><span className="font-medium">{emp.hourlyRate}</span></div>
              </div>
            </div>

          </div>
        )}

        {activeTab === "Documents" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emp.documents.map((doc, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{doc.title}</h4>
                    <p className="text-xs text-stone-400">{doc.file}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  doc.status === "Verified" ? "bg-emerald-100 text-emerald-700" :
                  doc.status === "Pending" ? "bg-amber-100 text-amber-700" :
                  "bg-stone-100 text-stone-500"
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Salary" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3">Detailed Salary Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <p className="text-xs text-stone-500">Basic Salary</p>
                <p className="text-xl font-bold text-stone-900 mt-1">{emp.basicSalary}</p>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <p className="text-xs text-stone-500">Salary Type</p>
                <p className="text-lg font-semibold text-stone-800 mt-1">{emp.salaryType}</p>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <p className="text-xs text-stone-500">Salary Grade</p>
                <p className="text-lg font-semibold text-stone-800 mt-1">{emp.salaryGrade}</p>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <p className="text-xs text-stone-500">Hourly Rate</p>
                <p className="text-lg font-semibold text-stone-800 mt-1">{emp.hourlyRate}</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modals Integration */}
      <EditEmployeeModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        employee={emp} 
        onSave={handleSaveEdit} 
      />

      <CreateEmployeeModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onCreate={handleCreateNew} 
      />
    </div>
  );
}