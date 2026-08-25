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
  User,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  FileDown,
  ExternalLink,
  FileCheck,
  Eye,
  Printer,
  QrCode,
  FileSpreadsheet,
  CheckCheck
} from "lucide-react";

// ==========================================
// 1. Edit Employee Modal Component
// ==========================================
function EditEmployeeModal({ isOpen, onClose, employee, onSave, branches = [], departments = [], managers = [] }) {
  const [formData, setFormData] = useState(employee || {});

  useEffect(() => {
    if (employee) setFormData(employee);
  }, [employee]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result, image: reader.result }));
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
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">Edit Employee Profile</h3>
            <p className="text-xs text-stone-400">Update official records, department assignments, and contact data</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Personal Information */}
          <div>
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Personal Details</h4>
            
            {/* Picture Upload Section */}
            <div className="mb-4 flex items-center gap-4 bg-stone-50/60 p-3.5 rounded-2xl border border-stone-200/80">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-600/30 shrink-0 bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-sm">
                {formData.profilePicture || formData.image ? (
                  <img src={formData.profilePicture || formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span>{formData.fullName || formData.name ? (formData.fullName || formData.name).slice(0, 2).toUpperCase() : "EMP"}</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-stone-700 mb-0.5">Profile Picture</label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition shadow-2xs cursor-pointer">
                  <Upload className="w-3 h-3 text-stone-500" />
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-[10px] text-stone-400 mt-1">PNG, JPG or WEBP (Max 3MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Employee ID</label>
                <input 
                  type="text" 
                  name="employeeId" 
                  value={formData.employeeId || formData.id || ""} 
                  readOnly 
                  className="w-full px-3 py-2.5 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-500 font-mono font-bold uppercase cursor-not-allowed" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName || formData.name || ""} 
                  onChange={handleChange} 
                  required
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender || "Male"} 
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
                  type="text" 
                  name="dob" 
                  value={formData.dob || ""} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Blood Group</label>
                <select 
                  name="bloodGroup" 
                  value={formData.bloodGroup || "B+"} 
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
            </div>
          </div>

          {/* Contact Information */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email || ""} 
                  onChange={handleChange} 
                  required
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Change Password (Optional)</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Leave blank to keep current" 
                  value={formData.password || ""} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number *</label>
                <input 
                  type="text" 
                  name="phoneNumber" 
                  value={formData.phoneNumber || formData.phone || ""} 
                  onChange={handleChange} 
                  required
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Emergency Contact</label>
                <input 
                  type="text" 
                  name="emergencyContact" 
                  value={formData.emergencyContact || ""} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Residential Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address || ""} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
            </div>
          </div>

          {/* Official Information */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Official Assignment</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Department</label>
                <select 
                  name="department" 
                  value={formData.department || ""} 
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
                  value={formData.designation || ""} 
                  onChange={handleChange} 
                  required
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Branch</label>
                <select 
                  name="branch" 
                  value={formData.branch || ""} 
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
                  value={formData.manager || "Unassigned"} 
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
                <label className="block text-xs font-bold text-stone-700 mb-1">Employment Type</label>
                <select 
                  name="employmentType" 
                  value={formData.employmentType || formData.type || "Full-time"} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Status</label>
                <select 
                  name="employeeStatus" 
                  value={formData.employeeStatus || formData.status || "Active"} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-800 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Salary Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Basic Salary (BDT)</label>
                <input 
                  type="text" 
                  name="basicSalary" 
                  value={formData.basicSalary || formData.salary || "50000"} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Salary Type</label>
                <select 
                  name="salaryType" 
                  value={formData.salaryType || "Monthly"} 
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
                  value={formData.salaryGrade || formData.grade || "Grade 8"} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Hourly Rate</label>
                <input 
                  type="text" 
                  name="hourlyRate" 
                  value={formData.hourlyRate || "350"} 
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
              className="px-4 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              Save Profile Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

// ==========================================
// 2. Main EmployeeDetails Component
// ==========================================
export default function EmployeeDetails({ 
  employee, 
  onBack, 
  onUpdate, 
  onDelete, 
  branches = [], 
  departments = [], 
  managers = [] 
}) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [emp, setEmp] = useState({
    id: employee?.id || employee?.employeeId || "EMP-1042",
    dbId: employee?.dbId || employee?.id,
    employeeId: employee?.employeeId || employee?.id || "EMP-1042",
    fullName: employee?.fullName || employee?.name || "Arif Chowdhury",
    name: employee?.name || employee?.fullName || "Arif Chowdhury",
    profilePicture: employee?.profilePicture || employee?.image || "",
    image: employee?.image || employee?.profilePicture || "",
    gender: employee?.gender || "Male",
    dob: employee?.dob || "May 14, 1994",
    bloodGroup: employee?.bloodGroup || "B+",
    maritalStatus: employee?.maritalStatus || "Single",
    email: employee?.email || "arif.c@vertextech.io",
    password: employee?.password || "",
    phoneNumber: employee?.phoneNumber || employee?.phone || "+880 1712-100201",
    phone: employee?.phone || employee?.phoneNumber || "+880 1712-100201",
    address: employee?.address || "House 12, Road 5, Dhanmondi, Dhaka",
    emergencyContact: employee?.emergencyContact || "+880 1811-998877",
    department: employee?.department || "Information Technology",
    designation: employee?.designation || "Senior Software Engineer",
    branch: employee?.branch || "Head Office – Dhaka",
    manager: employee?.manager || "Unassigned",
    joiningDate: employee?.joiningDate || "Jan 12, 2024",
    employmentType: employee?.employmentType || employee?.type || "Full-time",
    type: employee?.type || employee?.employmentType || "Full-time",
    employeeStatus: employee?.employeeStatus || employee?.status || "Active",
    status: employee?.status || employee?.employeeStatus || "Active",
    basicSalary: employee?.basicSalary || employee?.salary || "৳50,000",
    salary: employee?.salary || employee?.basicSalary || "৳50,000",
    salaryType: employee?.salaryType || "Monthly",
    salaryGrade: employee?.salaryGrade || employee?.grade || "Grade 8",
    grade: employee?.grade || employee?.salaryGrade || "Grade 8",
    hourlyRate: employee?.hourlyRate || "৳350 / hr",
    documents: employee?.documents || [
      { title: "National ID (Front)", file: "id-front.pdf", status: "Verified" },
      { title: "National ID (Back)", file: "id-back.pdf", status: "Verified" },
      { title: "Passport (Optional)", file: "passport.pdf", status: "None" },
      { title: "Resume (Optional)", file: "resume.pdf", status: "Verified" },
      { title: "Appointment Letter", file: "appointment.pdf", status: "Verified" },
    ]
  });

  useEffect(() => {
    if (employee) {
      setEmp({
        ...employee,
        id: employee.id || employee.employeeId,
        dbId: employee.dbId || employee.id,
        employeeId: employee.employeeId || employee.id,
        fullName: employee.fullName || employee.name,
        name: employee.name || employee.fullName,
        profilePicture: employee.profilePicture || employee.image,
        image: employee.image || employee.profilePicture,
        phoneNumber: employee.phoneNumber || employee.phone,
        phone: employee.phone || employee.phoneNumber,
        status: employee.status || employee.employeeStatus || "Active",
        employeeStatus: employee.employeeStatus || employee.status || "Active",
        type: employee.type || employee.employmentType || "Full-time",
        employmentType: employee.employmentType || employee.type || "Full-time",
      });
    }
  }, [employee]);

  const handleSaveEdit = async (updatedData) => {
    setEmp(updatedData);
    if (onUpdate) {
      await onUpdate(updatedData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      await onDelete(emp.dbId || emp.id || emp.employeeId);
    }
  };

  const handlePrintIdCard = () => {
    const printWindow = window.open("", "_blank", "width=900,height=950");
    if (!printWindow) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "https://smartattendance.io";
    const verifyUrl = `${origin}/verify/employee/${encodeURIComponent(emp.employeeId || emp.id || emp.dbId)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}&color=065f46`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Employee ID Card - ${emp.fullName || emp.name} (${emp.employeeId || emp.id})</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      background: #f5f5f4;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .no-print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #1c1917;
      color: white;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    }
    .btn-print {
      background: #059669;
      color: white;
      border: none;
      padding: 8px 20px;
      font-weight: 700;
      font-size: 13px;
      border-radius: 8px;
      cursor: pointer;
    }
    .sheet-title {
      font-size: 14px;
      font-weight: 700;
      color: #78716c;
      margin-top: 40px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cards-container {
      display: flex;
      gap: 30px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .id-card {
      width: 260px;
      height: 420px;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      border: 1px solid #e7e5e4;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    /* Front Card Styling */
    .card-header-front {
      background: linear-gradient(135deg, #065f46 0%, #059669 100%);
      color: white;
      padding: 16px 12px 20px;
      text-align: center;
      position: relative;
    }
    .lanyard-hole {
      width: 32px;
      height: 6px;
      background: rgba(255,255,255,0.3);
      border-radius: 4px;
      margin: 0 auto 10px;
    }
    .org-brand {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .org-sub {
      font-size: 8px;
      opacity: 0.85;
      margin-top: 1px;
    }
    .avatar-wrapper {
      margin-top: -24px;
      display: flex;
      justify-content: center;
      position: relative;
      z-index: 2;
    }
    .avatar-img {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      object-fit: cover;
      background: #ecfdf5;
    }
    .avatar-placeholder {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      background: #ecfdf5;
      color: #065f46;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
    }
    .emp-info {
      text-align: center;
      padding: 6px 14px;
    }
    .emp-name {
      font-size: 15px;
      font-weight: 800;
      color: #1c1917;
      margin: 0;
    }
    .emp-designation {
      font-size: 11px;
      font-weight: 600;
      color: #059669;
      margin: 2px 0 0;
    }
    .emp-department {
      font-size: 9px;
      color: #78716c;
      margin: 1px 0 6px;
    }
    .badge-code {
      display: inline-block;
      background: #f5f5f4;
      border: 1px solid #e7e5e4;
      padding: 3px 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 11px;
      font-weight: 800;
      color: #292524;
    }
    .emp-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      padding: 8px 14px;
      background: #fafaf9;
      margin: 0 12px;
      border-radius: 8px;
      font-size: 9px;
      border: 1px solid #f5f5f4;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-lbl { color: #a8a29e; font-size: 7.5px; text-transform: uppercase; font-weight: 600; }
    .meta-val { color: #292524; font-weight: 700; }
    .card-footer-front {
      background: #065f46;
      height: 12px;
      width: 100%;
    }

    /* Back Card Styling */
    .card-header-back {
      background: #1c1917;
      color: white;
      padding: 12px;
      text-align: center;
    }
    .card-body-back {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
      justify-content: space-between;
    }
    .qr-box {
      background: #ffffff;
      padding: 6px;
      border-radius: 10px;
      border: 1px solid #e7e5e4;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    .qr-img { width: 90px; height: 90px; display: block; }
    .emergency-box {
      font-size: 8.5px;
      color: #57534e;
      line-height: 1.4;
      margin: 6px 0;
    }
    .barcode-lines {
      font-family: monospace;
      letter-spacing: 3px;
      font-size: 14px;
      color: #292524;
      font-weight: 800;
      margin-top: 4px;
    }
    .terms-text {
      font-size: 7px;
      color: #a8a29e;
      line-height: 1.3;
      border-top: 1px dashed #e7e5e4;
      padding-top: 6px;
      margin-top: 4px;
    }

    @media print {
      .no-print-bar { display: none; }
      body { background: white; padding: 0; }
      .sheet-title { margin-top: 0; }
    }
  </style>
</head>
<body style="padding-top: 50px;">
  <div class="no-print-bar">
    <div><strong>Official Digital ID Card</strong> — ${emp.fullName || emp.name} (${emp.employeeId || emp.id})</div>
    <button class="btn-print" onclick="window.print()">🖨️ Print ID Card (Front & Back)</button>
  </div>

  <div class="sheet-title">Official Staff Identification Badge (CR80 Standard)</div>

  <div class="cards-container">
    
    <!-- FRONT SIDE -->
    <div class="id-card">
      <div>
        <div class="card-header-front">
          <div class="lanyard-hole"></div>
          <div class="org-brand">SMART ATTENDANCE</div>
          <div class="org-sub">Personnel Identity Card</div>
        </div>

        <div class="avatar-wrapper">
          ${emp.profilePicture || emp.image ? (
            `<img src="${emp.profilePicture || emp.image}" class="avatar-img" alt="Photo" />`
          ) : (
            `<div class="avatar-placeholder">${getInitials(emp.fullName || emp.name)}</div>`
          )}
        </div>

        <div class="emp-info">
          <h2 class="emp-name">${emp.fullName || emp.name}</h2>
          <div class="emp-designation">${emp.designation}</div>
          <div class="emp-department">${emp.department}</div>
          <div class="badge-code">${emp.employeeId || emp.id}</div>
        </div>

        <div class="emp-meta-grid">
          <div class="meta-item"><span class="meta-lbl">Blood Group</span><span class="meta-val" style="color:#e11d48;">${emp.bloodGroup || "B+"}</span></div>
          <div class="meta-item"><span class="meta-lbl">Joining Date</span><span class="meta-val">${emp.joiningDate || "N/A"}</span></div>
          <div class="meta-item"><span class="meta-lbl">Branch</span><span class="meta-val">${emp.branch || "HQ"}</span></div>
          <div class="meta-item"><span class="meta-lbl">Status</span><span class="meta-val" style="color:#059669;">Active</span></div>
        </div>
      </div>

      <div class="card-footer-front"></div>
    </div>

    <!-- BACK SIDE -->
    <div class="id-card">
      <div class="card-header-back">
        <div class="lanyard-hole" style="background: rgba(255,255,255,0.2);"></div>
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">SECURITY & VERIFICATION</div>
      </div>

      <div class="card-body-back">
        <div class="qr-box">
          <img src="${qrUrl}" class="qr-img" alt="QR Code" />
        </div>
        <div style="font-size:8px; font-weight:700; color:#059669; text-transform:uppercase;">Scan to Verify Identity</div>

        <div class="emergency-box">
          <div><strong>Emergency Helpline:</strong> ${emp.emergencyContact || "+880 1800-000000"}</div>
          <div><strong>Official Email:</strong> ${emp.email}</div>
          <div><strong>Branch Address:</strong> ${emp.address || emp.branch}</div>
        </div>

        <div>
          <div class="barcode-lines">||| | || |||| | ||| ||</div>
          <div style="font-size: 8px; font-family: monospace; color:#78716c;">${emp.employeeId || emp.id}</div>
        </div>

        <div class="terms-text">
          This card is the property of the organization. If found, please return to the Human Resources Department or nearest office.
        </div>
      </div>

      <div style="background: #1c1917; height: 10px; width: 100%;"></div>
    </div>

  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="bg-[#FAF7F0] min-h-screen text-stone-800 font-sans p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navigation / Back & Actions */}
        <div className="flex items-center justify-between">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-emerald-600 transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-2xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={handlePrintIdCard}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" /> Print ID Card
            </button>
            <button 
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" /> Edit Profile
            </button>
            <button 
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden border-2 border-emerald-500/30 bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-2xl shadow-inner shrink-0">
                {emp.profilePicture || emp.image ? (
                  <img src={emp.profilePicture || emp.image} alt={emp.fullName || emp.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(emp.fullName || emp.name)}</span>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-stone-900 leading-tight">
                    {emp.fullName || emp.name}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                    {emp.employeeStatus || emp.status || "Active"}
                  </span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> {emp.designation} <span className="text-stone-300">•</span> <span className="text-stone-600">{emp.department}</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap pt-1 font-mono">
                  <span>ID: <strong className="text-stone-800">{emp.employeeId || emp.id}</strong></span>
                  <span>•</span>
                  <span>Branch: <strong className="text-stone-800">{emp.branch}</strong></span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 text-right w-full md:w-auto">
              <span className="text-[11px] text-stone-400 font-medium">Assigned Manager</span>
              <p className="text-sm font-bold text-stone-800 flex items-center justify-end gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {emp.manager || "Unassigned"}
              </p>
              <p className="text-[10px] text-stone-400 mt-1">Joined {emp.joiningDate}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 mt-8 -mb-2 overflow-x-auto">
            {["Overview", "Salary", "ID Card"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === tab 
                    ? "border-emerald-600 text-emerald-700" 
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                {tab === "ID Card" ? "Digital ID Card 🪪" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Personal Information */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" /> Personal Details
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-stone-400">Gender</span><span className="font-semibold text-stone-800">{emp.gender}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Date of Birth</span><span className="font-semibold text-stone-800">{emp.dob}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Blood Group</span><span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-mono">{emp.bloodGroup}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Marital Status</span><span className="font-semibold text-stone-800">{emp.maritalStatus}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Nationality</span><span className="font-semibold text-stone-800">Bangladeshi</span></div>
              </div>
            </div>

            {/* 2. Contact Information */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" /> Contact Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-stone-400">Email</span><span className="font-semibold text-stone-800 truncate max-w-[180px]">{emp.email}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Phone Number</span><span className="font-semibold text-stone-800">{emp.phoneNumber || emp.phone}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Address</span><span className="font-semibold text-stone-800 truncate max-w-[160px]" title={emp.address}>{emp.address}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Emergency Contact</span><span className="font-semibold text-stone-800 truncate max-w-[150px]">{emp.emergencyContact}</span></div>
              </div>
            </div>

            {/* 3. Official Assignment */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" /> Official Assignment
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-stone-400">Department</span><span className="font-semibold text-stone-800">{emp.department}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Designation</span><span className="font-semibold text-stone-800">{emp.designation}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Branch</span><span className="font-semibold text-stone-800">{emp.branch}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Manager</span><span className="font-semibold text-stone-800">{emp.manager}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Employment Type</span><span className="font-semibold text-stone-800">{emp.employmentType || emp.type}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Salary" && (
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs p-6 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Compensation & Payroll Structure
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70">
                <p className="text-xs text-stone-400 font-medium">Basic Monthly Salary</p>
                <p className="text-xl font-bold text-stone-900 mt-1">{emp.basicSalary || emp.salary || "৳50,000"}</p>
              </div>
              <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70">
                <p className="text-xs text-stone-400 font-medium">Salary Type</p>
                <p className="text-sm font-bold text-stone-800 mt-1">{emp.salaryType || "Monthly"}</p>
              </div>
              <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70">
                <p className="text-xs text-stone-400 font-medium">Salary Grade</p>
                <p className="text-sm font-bold text-stone-800 mt-1">{emp.salaryGrade || emp.grade || "Grade 8"}</p>
              </div>
              <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70">
                <p className="text-xs text-stone-400 font-medium">Hourly Rate</p>
                <p className="text-sm font-bold text-stone-800 mt-1">{emp.hourlyRate || "350"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Digital ID Card Tab */}
        {activeTab === "ID Card" && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Workforce Digital ID Badge
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Ready-to-print dual-sided identity badge with scannable QR verification code.
                </p>
              </div>
              <button
                onClick={handlePrintIdCard}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <Printer className="w-4 h-4" /> Print ID Card (Front & Back)
              </button>
            </div>

            {/* ID Card Display Grid (Side by Side) */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
              
              {/* 1. FRONT SIDE BADGE */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-stone-100 px-3 py-0.5 rounded-full">Front Side</span>
                <div className="w-[270px] h-[430px] bg-white rounded-2xl shadow-xl border border-stone-200/90 overflow-hidden flex flex-col justify-between relative transform hover:scale-[1.02] transition-transform duration-200">
                  
                  <div>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white px-3 py-4 text-center relative">
                      <div className="w-8 h-1.5 bg-white/30 rounded-full mx-auto mb-2"></div>
                      <h3 className="font-black text-xs tracking-wider uppercase">Smart Attendance</h3>
                      <p className="text-[8px] text-emerald-100 tracking-wide">Personnel Identity Badge</p>
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center -mt-6 relative z-10">
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-emerald-50 overflow-hidden flex items-center justify-center text-emerald-700 font-extrabold text-2xl">
                        {emp.profilePicture || emp.image ? (
                          <img src={emp.profilePicture || emp.image} alt={emp.fullName || emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{getInitials(emp.fullName || emp.name)}</span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center px-4 pt-2 space-y-1">
                      <h2 className="font-extrabold text-sm text-stone-900 leading-tight">{emp.fullName || emp.name}</h2>
                      <p className="text-xs font-bold text-emerald-600">{emp.designation}</p>
                      <p className="text-[10px] text-stone-400">{emp.department}</p>
                      <div className="inline-block mt-1 px-3 py-0.5 bg-stone-100 border border-stone-200 rounded-md font-mono text-xs font-bold text-stone-800">
                        {emp.employeeId || emp.id}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 mx-4 mt-3 p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-[10px]">
                      <div>
                        <span className="block text-[8px] text-stone-400 uppercase font-semibold">Blood Group</span>
                        <span className="font-bold text-rose-600">{emp.bloodGroup || "B+"}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-stone-400 uppercase font-semibold">Joining</span>
                        <span className="font-bold text-stone-800 truncate">{emp.joiningDate || "Jan 2024"}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-stone-400 uppercase font-semibold">Branch</span>
                        <span className="font-bold text-stone-800 truncate">{emp.branch || "HQ"}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-stone-400 uppercase font-semibold">Status</span>
                        <span className="font-bold text-emerald-600">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-3 bg-emerald-700 w-full"></div>
                </div>
              </div>

              {/* 2. BACK SIDE BADGE */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-stone-100 px-3 py-0.5 rounded-full">Back Side</span>
                <div className="w-[270px] h-[430px] bg-white rounded-2xl shadow-xl border border-stone-200/90 overflow-hidden flex flex-col justify-between relative transform hover:scale-[1.02] transition-transform duration-200">
                  
                  {/* Header */}
                  <div className="bg-stone-900 text-white px-3 py-3 text-center">
                    <div className="w-8 h-1.5 bg-white/20 rounded-full mx-auto mb-1.5"></div>
                    <span className="text-[9px] font-extrabold tracking-wider uppercase text-emerald-400">Security & Authentication</span>
                  </div>

                  {/* Body with QR */}
                  <div className="p-4 flex flex-col items-center text-center space-y-3 flex-1 justify-between">
                    <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-2xs">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          (typeof window !== "undefined" ? window.location.origin : "https://smartattendance.io") + 
                          `/verify/employee/${encodeURIComponent(emp.employeeId || emp.id || emp.dbId)}`
                        )}&color=065f46`} 
                        alt="QR Code" 
                        className="w-24 h-24"
                      />
                    </div>
                    
                    <div>
                      <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Scan to Verify Identity
                      </span>
                      <a
                        href={`/verify/employee/${encodeURIComponent(emp.employeeId || emp.id || emp.dbId)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[8px] text-emerald-600 hover:text-emerald-800 hover:underline font-semibold mt-0.5 inline-flex items-center gap-0.5"
                      >
                        Preview Verification Page <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <div className="space-y-1 text-[9px] text-stone-600 leading-tight">
                      <p><strong>Helpline:</strong> {emp.emergencyContact || "+880 1800-000000"}</p>
                      <p className="truncate max-w-[220px]"><strong>Email:</strong> {emp.email}</p>
                      <p className="truncate max-w-[220px]"><strong>Branch:</strong> {emp.address || emp.branch}</p>
                    </div>

                    <div className="w-full pt-1">
                      <div className="font-mono font-bold tracking-widest text-xs text-stone-800">||| | || |||| | ||| ||</div>
                      <div className="text-[8px] font-mono text-stone-400">{emp.employeeId || emp.id}</div>
                    </div>

                    <p className="text-[7.5px] text-stone-400 leading-tight border-t border-stone-100 pt-2">
                      Property of organization. If found, please return to the HR Department.
                    </p>
                  </div>

                  <div className="h-2.5 bg-stone-900 w-full"></div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
      
      {/* Edit Modal */}
      <EditEmployeeModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        employee={emp} 
        branches={branches}
        departments={departments}
        managers={managers}
        onSave={handleSaveEdit} 
      />

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-stone-100 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Remove Employee Record</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Are you sure you want to permanently remove <strong className="text-stone-800">"{emp.fullName || emp.name}"</strong>? Their profile, attendance history, and logins will be deleted.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setIsDeleteOpen(false)} 
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-colors cursor-pointer active:scale-95"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}