import { NextResponse } from "next/server";
import {
  getAllReferralAccounts,
  getCommissions,
  getWithdrawals,
  getFraudAlerts,
  getReferralProgramConfig,
  updateReferralProgramConfig,
  processWithdrawalPayout,
} from "@/lib/referral-engine";

export async function GET() {
  try {
    const config = getReferralProgramConfig();
    const accounts = getAllReferralAccounts();
    const commissions = getCommissions();
    const withdrawals = getWithdrawals();
    const fraudAlerts = getFraudAlerts();

    // Compute aggregated metrics
    const totalClicks = accounts.reduce((sum, a) => sum + a.totalClicks, 0);
    const totalRegistrations = accounts.reduce((sum, a) => sum + a.totalRegistrations, 0);
    const totalPaidCustomers = accounts.reduce((sum, a) => sum + a.totalPaidCustomers, 0);
    const totalReferralRevenue = accounts.reduce((sum, a) => sum + a.totalRevenue, 0);
    const pendingCommissionsTotal = accounts.reduce((sum, a) => sum + a.pendingCommission, 0);
    const availableCommissionsTotal = accounts.reduce((sum, a) => sum + a.availableBalance, 0);
    const totalPayoutsDistributed = accounts.reduce((sum, a) => sum + a.paidCommission, 0);

    return NextResponse.json({
      success: true,
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
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Process Payout Action
    if (body.action === "PROCESS_PAYOUT") {
      const { withdrawalId, decision, rejectionReason } = body;
      const res = processWithdrawalPayout(withdrawalId, decision, rejectionReason);
      if (!res.success) {
        return NextResponse.json({ success: false, error: "Withdrawal not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, withdrawal: res.withdrawal });
    }

    // 2. Update Program Config
    if (body.action === "UPDATE_CONFIG") {
      const updated = updateReferralProgramConfig(body.config);
      return NextResponse.json({ success: true, config: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
