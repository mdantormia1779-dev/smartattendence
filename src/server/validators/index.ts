import { z } from "zod";

// ==========================================
// Auth Validators
// ==========================================
export const LoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignupSchema = z.object({
  adminName: z.string().min(2, "Admin name is required"),
  adminEmail: z.string().email("Valid admin email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(2, "Company name is required"),
  companyLogo: z.string().optional().or(z.literal("")),
  industry: z.string().optional(),
  companyEmail: z.string().email("Valid company email is required"),
  phone: z.string().optional(),
  website: z.string().optional().or(z.literal("")),
  address: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  workingDays: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  referralCode: z.string().optional().nullable(),
});

// ==========================================
// Organization & Settings Validators
// ==========================================
export const CreateOrganizationSchema = z.object({
  name: z.string().min(2, "Company / Organization name is required"),
  slug: z.string().min(2, "Slug is required"),
  email: z.string().email("Valid company email is required"),
  customLogoUrl: z.string().optional().or(z.literal("")),
  industry: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional().or(z.literal("")),
  address: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  workingDays: z.union([z.string(), z.array(z.string())]).optional(),
  defaultOfficeStart: z.string().optional(),
  defaultOfficeEnd: z.string().optional(),
  planTier: z.enum(["FREE", "STARTER", "BUSINESS", "ENTERPRISE"]).default("STARTER"),
  defaultGeofenceM: z.number().int().min(20).max(1000).default(120),
  adminName: z.string().optional(),
  adminEmail: z.string().email("Valid admin email is required").optional().or(z.literal("")),
  adminPassword: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export const UpdateOrgSettingsSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().optional().nullable(),
  industry: z.string().optional(),
  address: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  planTier: z.enum(["FREE", "STARTER", "BUSINESS", "ENTERPRISE"]).optional(),
  brandColor: z.string().optional(),
  customLogoUrl: z.string().optional().nullable(),
  customDomain: z.string().optional().nullable(),
  defaultOfficeStart: z.string().optional(),
  defaultOfficeEnd: z.string().optional(),
  defaultGeofenceM: z.number().int().min(20).max(1000).optional(),
  antiSpoofingMode: z.string().optional(),
  timezone: z.string().optional(),
  workingDays: z.union([z.string(), z.array(z.string())]).optional(),
  isSuspended: z.boolean().optional(),
  suspensionReason: z.string().optional().nullable(),
  status: z.string().optional(),
  adminPassword: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  adminEmail: z.string().email().optional().or(z.literal("")),
  adminName: z.string().optional().or(z.literal("")),
});

// ==========================================
// Branch & Department Validators
// ==========================================
export const CreateBranchSchema = z.object({
  name: z.string().min(2, "Branch name is required"),
  code: z.string().min(2, "Branch code is required"),
  address: z.string().min(3, "Address is required"),
  phone: z.string().optional(),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  geofenceRadius: z.number().int().min(20).max(1000, "Geofence radius must be 20 to 1000 meters").default(120),
});

export const CreateDepartmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  code: z.string().optional(),
  branchId: z.string().optional().nullable(),
  headOfDept: z.string().optional().nullable(),
  headPhone: z.string().optional().nullable(),
  headEmail: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});

// ==========================================
// Employee Validators
// ==========================================
export const CreateEmployeeSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  employeeId: z.string().optional(),
  employeeCode: z.string().optional(),
  designation: z.string().min(1, "Designation is required"),
  branchId: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  branchName: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  departmentName: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  manager: z.string().optional().nullable(),
  managerName: z.string().optional().nullable(),
  shiftId: z.string().optional().nullable(),
  basicSalary: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0).default(0),
  salaryGrade: z.string().default("Grade 8"),
  salaryType: z.string().default("Monthly"),
  hourlyRate: z.union([z.number(), z.string()]).optional(),
  phone: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  joiningDate: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  employeeStatus: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  profilePicture: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  documents: z.array(z.any()).optional().nullable(),
});

// ==========================================
// Attendance & Face Biometric Validators
// ==========================================
export const CheckInSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  verificationMethod: z.enum(["FACE_RECOGNITION", "GPS_GEOFENCE", "BIOMETRIC_DEVICE", "MANUAL_OVERRIDE"]).default("FACE_RECOGNITION"),
  faceVector: z.array(z.number()).length(128).optional(),
  livenessScore: z.number().min(0).max(100).optional(),
});

export const CheckOutSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const RegularizeAttendanceSchema = z.object({
  attendanceId: z.string().min(1, "Attendance ID is required"),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE"]),
  reason: z.string().min(3, "Reason for regularization is required"),
});

export const RegisterFaceSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  vectorData: z.array(z.number()).length(128, "128-dimensional embedding vector is required"),
  antiSpoofScore: z.number().min(0).max(100).default(99.0),
});

// ==========================================
// Shifts & Overtime Validators
// ==========================================
export const CreateShiftSchema = z.object({
  name: z.string().min(2, "Shift name is required"),
  type: z.enum(["MORNING", "EVENING", "NIGHT", "FLEXIBLE", "ROTATIONAL"]).default("MORNING").optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  branchId: z.string().optional().nullable(),
  breakMinutes: z.number().int().min(0).default(60).optional(),
  graceMinutes: z.number().int().min(0).default(15).optional(),
  overtimeThresholdHours: z.number().min(1).default(8.0).optional(),
  workingDays: z.array(z.string()).optional().default(["Sun", "Mon", "Tue", "Wed", "Thu"]),
  status: z.string().optional(),
});

export const CreateOvertimeClaimSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["REGULAR", "WEEKEND", "HOLIDAY", "EMERGENCY"]).default("REGULAR"),
  claimedHours: z.number().min(0.5).max(24),
  reason: z.string().min(3, "Reason is required"),
});

// ==========================================
// Leaves & Holidays Validators
// ==========================================
export const ApplyLeaveSchema = z.object({
  employeeId: z.string().optional(),
  type: z.enum(["CASUAL", "SICK", "ANNUAL", "MATERNITY", "UNPAID"]).default("CASUAL"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(1, "Reason is required"),
  attachmentS3Key: z.string().optional(),
});

export const ApproveLeaveSchema = z.object({
  leaveId: z.string().min(1, "Leave ID is required"),
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().optional(),
});

// ==========================================
// Payroll & Payslip Validators
// ==========================================
export const GeneratePayrollSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
});

export const LockPayrollSchema = z.object({
  payrollBatchId: z.string().min(1, "Payroll Batch ID is required"),
});

// ==========================================
// Referrals & Withdrawals Validators
// ==========================================
export const ReferralTrackSchema = z.object({
  code: z.string().min(2, "Referral code is required"),
  landingPage: z.string().optional(),
});

export const RequestWithdrawalSchema = z.object({
  referralAccountId: z.string().min(1, "Referral account ID is required"),
  amount: z.number().min(50, "Minimum withdrawal amount is $50.00"),
  paymentMethod: z.enum(["Bank Transfer", "bKash", "Nagad", "PayPal", "Wise", "Payoneer"]),
  paymentDetails: z.string().min(3, "Payment details are required"),
});

export const ProcessPayoutSchema = z.object({
  withdrawalId: z.string().min(1, "Withdrawal ID is required"),
  decision: z.enum(["APPROVED", "PAID", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

// ==========================================
// Notifications Validator
// ==========================================
export const SendNotificationSchema = z.object({
  scope: z.enum(["GLOBAL_BROADCAST", "ORG_BROADCAST", "ROLE_BROADCAST", "TARGETED_USER"]).default("TARGETED_USER"),
  targetOrgId: z.string().optional().nullable(),
  targetRole: z.enum(["SUPER_ADMIN", "ORG_ADMIN", "MANAGER", "EMPLOYEE"]).optional().nullable(),
  recipientUserId: z.string().optional().nullable(),
  title: z.string().min(2, "Title is required"),
  message: z.string().min(2, "Message is required"),
  category: z.enum(["SYSTEM", "ATTENDANCE", "LEAVE", "PAYROLL", "REFERRAL", "SECURITY", "ALERT"]).default("SYSTEM"),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ALERT"]).default("INFO"),
  link: z.string().optional(),
});
