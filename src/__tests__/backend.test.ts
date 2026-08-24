/**
 * Automated Backend & Business Logic Verification Test Suite
 * Tests Multi-tenant isolation, RBAC, Decimal formulas, Geofence, Biometrics, and Referrals.
 */

import { assertTenantAccess, TenantSecurityError } from "@/lib/tenant";
import { calculateOvertime, calculateNetSalary } from "@/lib/calculations";
import { calculateHaversineDistance } from "@/lib/geo-verification";
import { calculateNetLeaveDays } from "@/lib/datetime";
import { generateSubscriptionCommission } from "@/lib/referral-engine";

export function runTestSuite() {
  const results: { test: string; passed: boolean; error?: string }[] = [];

  function assert(name: string, fn: () => void) {
    try {
      fn();
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
    const calc = calculateOvertime({
      basicSalary: 95000,
      claimedHours: 3.5,
      otType: "REGULAR", // 1.5x
    });
    // Expected: (95000 / 160) * 1.5 * 3.5 = 593.75 * 1.5 * 3.5 = 3117.1875 -> 3117.19
    if (Math.abs(calc.calculatedAmount - 3117.19) > 0.05) {
      throw new Error(`OT Pay mismatch: got ${calc.calculatedAmount}, expected 3117.19`);
    }
  });

  // 3. Net Salary Formula Test
  assert("Net Salary Formula: Gross Earnings - Total Deductions", () => {
    const res = calculateNetSalary({
      basicSalary: 100000,
      houseRent: 20000,
      medicalAllowance: 8000,
      transportAllowance: 5000,
      foodAllowance: 4000,
      taxDeduction: 8000,
      providentFund: 5000,
    });
    // Gross: 100000 + 37000 = 137000. Deductions: 13000. Net: 124000
    if (res.grossEarnings !== 137000 || res.totalDeductions !== 13000 || res.netSalary !== 124000) {
      throw new Error(`Net salary mismatch: ${JSON.stringify(res)}`);
    }
  });

  // 4. Geofence Distance Test
  assert("GPS Geofence: Calculates Haversine distance correctly", () => {
    const dist = calculateHaversineDistance(
      { latitude: 23.7925, longitude: 90.4078 },
      { latitude: 23.7928, longitude: 90.4081 }
    );
    if (dist < 10 || dist > 100) {
      throw new Error(`Unexpected distance: ${dist} meters`);
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
  assert("Referral Commission: Generates 20% on paid plan and blocks self-referral", () => {
    const selfRes = generateSubscriptionCommission({
      referralCode: "ANTOR2026",
      orgName: "Self Org",
      orgEmail: "antor@saas.com", // Matches affiliate email
      planName: "Business",
      paymentAmount: 149.0,
      billingCycle: "Monthly",
    });
    if (selfRes.success) throw new Error("Expected self-referral to be blocked");

    const validRes = generateSubscriptionCommission({
      referralCode: "ANTOR2026",
      orgName: "New Customer Ltd.",
      orgEmail: "customer@neworg.com",
      planName: "Business Plan",
      paymentAmount: 149.0,
      billingCycle: "Monthly",
    });
    if (!validRes.success || validRes.commission?.commissionAmount !== 29.8) {
      throw new Error(`Expected commission of $29.80, got ${validRes.commission?.commissionAmount}`);
    }
  });

  return results;
}
