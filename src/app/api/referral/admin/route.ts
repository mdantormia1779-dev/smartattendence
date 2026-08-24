import {
  syncDatabaseUsersToAffiliates,
  getAllReferralAccounts,
  getCommissions,
  getWithdrawals,
  getFraudAlerts,
  getReferralProgramConfig,
  updateReferralProgramConfig,
  processWithdrawalPayout,
} from "@/lib/referral-engine";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);

    await syncDatabaseUsersToAffiliates();

    const config = getReferralProgramConfig();
    const accounts = getAllReferralAccounts();
    const commissions = getCommissions();
    const withdrawals = getWithdrawals();
    const fraudAlerts = getFraudAlerts();

    // Compute real aggregated metrics
    const totalClicks = accounts.reduce((sum, a) => sum + (a.totalClicks || 0), 0);
    const totalRegistrations = accounts.reduce((sum, a) => sum + (a.totalRegistrations || 0), 0);
    const totalPaidCustomers = accounts.reduce((sum, a) => sum + (a.totalPaidCustomers || 0), 0);
    const totalReferralRevenue = accounts.reduce((sum, a) => sum + (a.totalRevenue || 0), 0);
    const pendingCommissionsTotal = accounts.reduce((sum, a) => sum + (a.pendingCommission || 0), 0);
    const availableCommissionsTotal = accounts.reduce((sum, a) => sum + (a.availableBalance || 0), 0);
    const totalPayoutsDistributed = accounts.reduce((sum, a) => sum + (a.paidCommission || 0), 0);

    return apiSuccess(
      {
        config,
        metrics: {
          totalAffiliates: accounts.length,
          totalClicks,
          totalRegistrations,
          totalPaidCustomers,
          totalReferralRevenue,
          pendingCommissionsTotal,
          availableCommissionsTotal,
          totalPayoutsDistributed,
          pendingWithdrawalsCount: withdrawals.filter((w) => w.status === "PENDING").length,
          fraudAlertsCount: fraudAlerts.length,
        },
        accounts,
        commissions,
        withdrawals,
        fraudAlerts,
      },
      "Referral administrative metrics retrieved successfully",
      undefined,
      200,
      {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      }
    );
  } catch (error: any) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const body = await request.json();

    // 1. Process Payout Action
    if (body.action === "PROCESS_PAYOUT") {
      const { withdrawalId, decision, rejectionReason } = body;
      const result = processWithdrawalPayout(withdrawalId, decision, rejectionReason);
      if (!result.success) {
        return apiError(new Error(result.message || "Failed to process withdrawal payout"));
      }
      return apiSuccess(result.withdrawal, `Withdrawal marked as ${decision} successfully`);
    }

    // 2. Update Program Config
    if (body.action === "UPDATE_CONFIG") {
      const updatedConfig = updateReferralProgramConfig(body.config);
      return apiSuccess(updatedConfig, "Referral program configuration updated successfully");
    }

    return apiError(new Error("Invalid referral action specified"));
  } catch (error: any) {
    return apiError(error);
  }
}
