import { prisma } from "@/lib/prisma";
import { PaymentService } from "@/server/services/payment.service";
import { requireRole } from "@/server/authorization";
import { apiSuccess, apiError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    requireRole(request, ["SUPER_ADMIN"]);

    const [payments, activeSubscriptionsCount, pendingPaymentsAgg] = await Promise.all([
      PaymentService.getPayments(),
      prisma.subscriptions
        .count({
          where: {
            status: "ACTIVE",
          },
        })
        .catch(async () => {
          return prisma.organizations.count({
            where: {
              status: "ACTIVE",
            },
          }).catch(() => 0);
        }),
      prisma.payments
        .aggregate({
          where: {
            status: "PENDING",
          },
          _sum: {
            amount: true,
          },
          _count: true,
        })
        .catch(() => ({ _sum: { amount: 0 }, _count: 0 })),
    ]);

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
          m.rawAmount >= 100000
            ? `৳${(m.rawAmount / 1000).toFixed(0)}k`
            : m.rawAmount >= 1000
            ? `৳${(m.rawAmount / 1000).toFixed(1)}k`
            : `৳${m.rawAmount.toLocaleString()}`,
        height: `${heightPercentage}%`,
      };
    });

    const currentMonthAmount = last6Months[last6Months.length - 1]?.rawAmount ?? 0;
    const previousMonthAmount = last6Months[last6Months.length - 2]?.rawAmount ?? 0;

    let monthlyGrowth = "+0.0%";
    if (previousMonthAmount > 0) {
      const diff = ((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100;
      monthlyGrowth = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
    } else if (currentMonthAmount > 0) {
      monthlyGrowth = "+100.0%";
    }

    const pendingPayoutsAmount = Number(pendingPaymentsAgg?._sum?.amount || 0);

    const summary = {
      totalRevenue,
      formattedTotalRevenue: `৳${totalRevenue.toLocaleString()}`,
      mrr: currentMonthAmount || totalRevenue,
      formattedMrr: `৳${(currentMonthAmount || totalRevenue).toLocaleString()}`,
      arr: (currentMonthAmount || totalRevenue) * 12,
      formattedArr: `৳${((currentMonthAmount || totalRevenue) * 12).toLocaleString()}`,
      monthlyGrowth,
      activeSubscriptions: activeSubscriptionsCount,
      pendingPayouts: pendingPayoutsAmount,
      formattedPendingPayouts: `৳${pendingPayoutsAmount.toLocaleString()}`,
      pendingPayoutsCount: pendingPaymentsAgg?._count || 0,
      paymentsCount: payments.length,
      chartData,
      currentYear: now.getFullYear(),
      payments: payments.slice(0, 10),
    };

    return apiSuccess(summary, "Platform revenue report generated successfully", undefined, 200, {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
  } catch (error: any) {
    return apiError(error);
  }
}
