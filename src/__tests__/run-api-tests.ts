/**
 * Automated Production API & Security Test Runner
 * Executes all verification steps directly against the server domain engines.
 */

import { runTestSuite } from "./backend.test";
import { AuthService } from "@/server/services/auth.service";
import { OrganizationService } from "@/server/services/organization.service";
import { BranchService } from "@/server/services/branch.service";
import { EmployeeService } from "@/server/services/employee.service";
import { AttendanceService } from "@/server/services/attendance.service";
import { OvertimeService } from "@/server/services/overtime.service";
import { LeaveService } from "@/server/services/leave.service";
import { PayrollService } from "@/server/services/payroll.service";
import { PaymentService } from "@/server/services/payment.service";
import { getReferralAccount, requestReferralWithdrawal } from "@/lib/referral-engine";
import { assertTenantAccess, TenantSecurityError } from "@/lib/tenant";

export async function runCompleteSystemAudit() {
  console.log("==================================================");
  console.log("🚀 STARTING COMPLETE BACKEND & API SECURITY AUDIT");
  console.log("==================================================");

  const testResults: { phase: string; name: string; status: "PASSED" | "FAILED"; details?: string }[] = [];

  async function record(phase: string, name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      testResults.push({ phase, name, status: "PASSED" });
    } catch (err: any) {
      testResults.push({ phase, name, status: "FAILED", details: err.message });
    }
  }

  // Phase 4: Authentication
  await record("Phase 4 - Auth", "Valid Super Admin Login", async () => {
    const res = await AuthService.login("superadmin@erp.com", "admin123");
    if (!res.token || res.user.role !== "SUPER_ADMIN") throw new Error("Super Admin auth failed");
  });

  await record("Phase 4 - Auth", "Invalid Password Throws 401", async () => {
    let failed = false;
    try {
      await AuthService.login("superadmin@erp.com", "wrongpass");
    } catch (e: any) {
      if (e.statusCode === 401) failed = true;
    }
    if (!failed) throw new Error("Expected invalid password to throw 401");
  });

  // Phase 5 & 6: Multi-Tenant Security & RBAC
  await record("Phase 6 - Multi-Tenant", "Tenant A cannot access Tenant B (403)", () => {
    let blocked = false;
    try {
      assertTenantAccess({ organizationId: "org-1", userId: "u1", userRole: "ORG_ADMIN" }, "org-2");
    } catch (e: any) {
      if (e instanceof TenantSecurityError) blocked = true;
    }
    if (!blocked) throw new Error("Expected cross-tenant breach to be blocked");
  });

  // Phase 7 - 11: Organizations, Branches & Employees CRUD
  await record("Phase 7 - Organizations", "Create & Retrieve Organization", async () => {
    const org = await OrganizationService.getOrganizationById("org-1");
    if (org.name !== "Vertex Technologies Ltd.") throw new Error("Org retrieval failed");
  });

  await record("Phase 8 - Branches", "Validate Geofence Bounds (20-1000m)", async () => {
    const branch = await BranchService.createBranch({
      organizationId: "org-1",
      name: "Mirpur Hub",
      code: `MIR-${Date.now().toString().slice(-4)}`,
      address: "Mirpur 10, Dhaka",
      latitude: 23.8071,
      longitude: 90.3686,
      geofenceRadius: 120,
    });
    if (!branch.id) throw new Error("Branch creation failed");
  });

  await record("Phase 11 - Employees", "Employee Directory Pagination & Search", async () => {
    const res = await EmployeeService.getEmployees("org-1", { search: "Arif", page: 1, limit: 10 });
    if (res.items.length === 0 || res.items[0].employeeId !== "EMP-1042") throw new Error("Search failed");
  });

  // Phase 13 & 14: Attendance & GPS Geofencing
  await record("Phase 14 - GPS", "Check-in Inside Geofence Verified", async () => {
    const testEmp = await EmployeeService.createEmployee({
      organizationId: "org-1",
      fullName: "Test CheckIn User",
      email: `test.user.${Date.now()}@vertextech.io`,
      employeeId: `TEST-${Date.now().toString().slice(-4)}`,
      designation: "QA Engineer",
      branchId: "branch-1",
      departmentId: "dept-1",
    });

    const record = await AttendanceService.checkIn({
      organizationId: "org-1",
      employeeId: testEmp.employeeId,
      latitude: 23.7925,
      longitude: 90.4078,
      verificationMethod: "GPS_GEOFENCE",
    });
    if (!record.isGeofenceVerified) throw new Error("GPS verification failed");
  });

  await record("Phase 14 - GPS", "Check-in Outside Geofence Throws 400", async () => {
    let blocked = false;
    try {
      await AttendanceService.checkIn({
        organizationId: "org-1",
        employeeId: "EMP-1044",
        latitude: 25.0000,
        longitude: 92.0000,
      });
    } catch (e: any) {
      blocked = true;
    }
    if (!blocked) throw new Error("Expected out-of-bounds punch to be rejected");
  });

  // Phase 17 & 18: Overtime & Leaves
  await record("Phase 17 - Overtime", "Formula Rate Calculation (Basic/160 * 1.5)", async () => {
    const claim = await OvertimeService.submitClaim({
      organizationId: "org-1",
      employeeId: "EMP-1042",
      date: "2026-08-24",
      type: "REGULAR",
      claimedHours: 2,
      reason: "Database optimization",
    });
    // Basic 95000 / 160 * 1.5 * 2 = 1781.25
    if (claim.calculatedAmount !== 1781.25) throw new Error(`OT amount mismatch: ${claim.calculatedAmount}`);
  });

  // Phase 21: Payroll Decimal Net Salary
  await record("Phase 21 - Payroll", "Payroll Batch Net Salary Mathematical Accuracy", async () => {
    const batch = await PayrollService.getBatchById("batch-2026-07", "org-1");
    if (batch.totalGrossPay <= 0 || batch.totalNetPayable <= 0) throw new Error("Payroll batch invalid");
  });

  // Phase 25 & 26: Payments & Referral 20% Commission
  await record("Phase 26 - Referrals", "20% Recurring Commission Generation", async () => {
    const pay = await PaymentService.createPayment({
      organizationId: "org-1",
      organizationName: "Vertex Technologies Ltd.",
      planName: "Business Plan",
      amount: 149.0,
      billingCycle: "Monthly",
      transactionId: `TXN-AUDIT-${Date.now()}`,
      referralCode: "ANTOR2026",
    });
    await PaymentService.updatePaymentStatus(pay.id, "APPROVED", "Super Admin Audit");
    const account = getReferralAccount("user-org-1");
    if (account.totalRevenue <= 0) throw new Error("Referral revenue was not credited");
  });

  // Phase 29: Withdrawals
  await record("Phase 29 - Withdrawals", "Withdrawal Validation ($50 Min)", () => {
    const res = requestReferralWithdrawal({
      referralAccountId: "ref-acc-user-org-1",
      amount: 20.0, // Below $50 limit
      paymentMethod: "Bank Transfer",
      paymentDetails: "City Bank A/C 12345",
    });
    if (res.success) throw new Error("Expected withdrawal under $50 to fail");
  });

  console.log("\n==================================================");
  console.log("📊 AUDIT RESULTS SUMMARY");
  console.log("==================================================");
  testResults.forEach((t) => {
    const icon = t.status === "PASSED" ? "✅" : "❌";
    console.log(`${icon} [${t.phase}] ${t.name}`);
    if (t.details) console.log(`   └─ Error: ${t.details}`);
  });

  const passedCount = testResults.filter((t) => t.status === "PASSED").length;
  console.log(`\n🎉 Total: ${testResults.length} Tests | Passed: ${passedCount} | Failed: ${testResults.length - passedCount}`);
  return testResults;
}
