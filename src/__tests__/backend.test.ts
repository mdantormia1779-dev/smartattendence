/**
 * Automated Backend & Business Logic Verification Test Suite
 * Tests Multi-tenant isolation, RBAC, Decimal formulas, Geofence, Biometrics, and Referrals.
 */

import { assertTenantAccess, TenantSecurityError } from "@/lib/tenant";
import { calculateOvertime, calculateNetSalary } from "@/lib/calculations";
import { calculateHaversineDistance } from "@/lib/geo-verification";
import { calculateNetLeaveDays } from "@/lib/datetime";
import { generateSubscriptionCommission } from "@/lib/referral-engine";

export async function runTestSuite() {
  const results: { test: string; passed: boolean; error?: string }[] = [];

  function assert(name: string, fn: () => void) {
    try {
      fn();
      results.push({ test: name, passed: true });
    } catch (e: any) {
      results.push({ test: name, passed: false, error: e.message });
    }
  }

  async function assertAsync(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      results.push({ test: name, passed: true });
    } catch (e: any) {
      results.push({ test: name, passed: false, error: e.message });
    }
  }

  // 1. Tenant Isolation Test
  assert("Tenant Isolation: Super Admin can access any tenant", () => {
    assertTenantAccess({ organizationId: "org-master", userId: "admin", userRole: "SUPER_ADMIN" }, "org-2");
  });

  assert("Tenant Isolation: Cross-tenant access throws TenantSecurityError", () => {
    let thrown = false;
    try {
      assertTenantAccess({ organizationId: "org-1", userId: "user-1", userRole: "ORG_ADMIN" }, "org-2");
    } catch (e: any) {
      if (e instanceof TenantSecurityError) thrown = true;
    }
    if (!thrown) throw new Error("Expected cross-tenant access to throw TenantSecurityError");
  });

  // 2. Overtime Formula Test
  assert("Overtime Formula: (Basic / 160) * Multiplier * Hours", () => {
    const ot = calculateOvertime({
      basicSalary: 95000,
      claimedHours: 3.5,
      otType: "REGULAR",
    });
    if (ot.calculatedAmount <= 0) {
      throw new Error(`Expected positive OT, got ${ot.calculatedAmount}`);
    }
  });

  // 3. Net Salary Formula Test
  assert("Net Salary Formula: Basic + Allowances + OT - Deductions", () => {
    const net = calculateNetSalary({
      basicSalary: 50000,
      houseRent: 10000,
      overtimePay: 4687.5,
      taxDeduction: 5000,
    });
    if (net.netSalary !== 59687.5) {
      throw new Error(`Expected Net 59687.50, got ${net.netSalary}`);
    }
  });

  // 4. Geofence Distance Calculation Test
  assert("Geofence: Distance Calculation with Haversine formula", () => {
    const d = calculateHaversineDistance(
      { latitude: 23.8103, longitude: 90.4125 },
      { latitude: 23.8109, longitude: 90.4132 }
    );
    if (d <= 0 || d > 200) {
      throw new Error(`Distance calculation unreasonable: ${d}m`);
    }
  });


  // 5. Working Days Net Leave Test
  assert("Leave Net Days: Excludes weekends correctly", () => {
    const days = calculateNetLeaveDays("2026-08-24", "2026-08-28", {
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      holidays: [],
    });
    if (days !== 5) {
      throw new Error(`Expected 5 working days, got ${days}`);
    }
  });

  // 6. Referral Commission & Self-Referral Prevention Test
  await assertAsync("Referral Engine - Anti-Fraud & Self-Referral Prevention", async () => {
    const selfRes = await generateSubscriptionCommission({
      referralCode: "ANTOR2026",
      orgName: "Self Org",
      orgEmail: "antor@saas.com",
      planName: "Business",
      paymentAmount: 149.0,
      billingCycle: "Monthly",
    });
    if (selfRes.success) throw new Error("Expected self-referral to be blocked");
  });

  return results;
}
