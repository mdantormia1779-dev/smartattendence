import { PaymentService } from "@/server/services/payment.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);
    const payments = await PaymentService.getPayments();

    const approvedPayments = payments.filter((p) => p.status === "APPROVED");
    const totalRevenue = approvedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Generate last 6 rolling months
    const last6Months: { month: string; year: number; rawAmount: number; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const key = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      last6Months.push({
        month: mName,
        year,
        rawAmount: 0,
        key,
      });
    }

    // Accumulate real approved payments into respective month buckets
    approvedPayments.forEach((p: any) => {
      if (!p.createdAt) return;
      const pDate = new Date(p.createdAt);
      if (isNaN(pDate.getTime())) return;
      const pKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, "0")}`;
      const match = last6Months.find((m) => m.key === pKey);
      if (match) {
        match.rawAmount += Number(p.amount) || 0;
      }
    });

    const maxRaw = Math.max(...last6Months.map((m) => m.rawAmount), 100);

    // Compute dynamic heights and formatted currency strings
    const chartData = last6Months.map((m) => {
      const heightPercentage =
        m.rawAmount === 0 ? 6 : Math.max(8, Math.round((m.rawAmount / maxRaw) * 100));
      return {
        month: m.month,
        year: m.year,
        rawAmount: m.rawAmount,
        amount:
          m.rawAmount >= 1000
            ? `$${(m.rawAmount / 1000).toFixed(1)}k`
            : `$${m.rawAmount.toLocaleString()}`,
        height: `${heightPercentage}%`,
      };
    });

    // Dynamic grid scale
    const gridMax = Math.ceil(maxRaw / 100) * 100;
    const gridIntervals = [
      `$${gridMax >= 1000 ? (gridMax / 1000).toFixed(1) + "k" : gridMax}`,
      `$${(gridMax * 0.75) >= 1000 ? ((gridMax * 0.75) / 1000).toFixed(1) + "k" : Math.round(gridMax * 0.75)}`,
      `$${(gridMax * 0.5) >= 1000 ? ((gridMax * 0.5) / 1000).toFixed(1) + "k" : Math.round(gridMax * 0.5)}`,
      `$${(gridMax * 0.25) >= 1000 ? ((gridMax * 0.25) / 1000).toFixed(1) + "k" : Math.round(gridMax * 0.25)}`,
      `$0`,
    ];

    const currentMonthAmount = last6Months[last6Months.length - 1]?.rawAmount ?? totalRevenue;

    const summary = {
      totalRevenue,
      mrr: currentMonthAmount || totalRevenue,
      arr: (currentMonthAmount || totalRevenue) * 12,
      paymentsCount: payments.length,
      chartData,
      gridIntervals,
      currentYear: now.getFullYear(),
      payments,
    };

    return apiSuccess(summary, "Platform revenue report generated successfully");
  } catch (error: any) {
    return apiError(error);
  }
}
