"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Receipt } from "lucide-react";
import { api } from "@/lib/api-client";

interface Transaction {
  id: string;
  organization: string;
  plan: string;
  amount: string;
  date: string;
}

export default function RecentTransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await api.payments.getAll();
        if (res.success && Array.isArray(res.data)) {
          const mapped: Transaction[] = res.data.map((p: any) => {
            const sym = p.currency === "BDT" || p.provider === "bKash" ? "৳" : "$";
            return {
              id: p.transactionId || `TXN-${p.id?.substring(0, 8).toUpperCase()}`,
              organization: p.organizationName || p.organization || "Enterprise Tenant",
              plan: `${p.planName || p.plan || "Standard Plan"} (${p.billingCycle || "Monthly"})`,
              amount: `+${sym}${Number(p.amount || 0).toLocaleString()}`,
              date: p.date || (p.createdAt ? (p.createdAt.includes("T") ? p.createdAt.split("T")[0] : p.createdAt) : "Today"),
            };
          });
          setTransactions(mapped);
        }
      } catch (e) {
        console.error("Failed to load revenue transactions", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="animate-section bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden mt-8">
      <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#10b981]" /> Recent Subscription Transactions
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">Latest recorded platform payments from tenant organizations</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#10b981] mr-2" />
          <span className="text-xs">Loading database transactions...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Transaction ID</th>
                <th className="py-3.5 px-6">Organization</th>
                <th className="py-3.5 px-6">Subscription Plan</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-neutral-400">
                    No payment transactions recorded in the database yet.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-neutral-600 font-bold">{txn.id}</td>
                    <td className="py-4 px-6 font-bold text-neutral-900 text-xs">{txn.organization}</td>
                    <td className="py-4 px-6 text-neutral-600 text-xs">{txn.plan}</td>
                    <td className="py-4 px-6 text-neutral-400 text-xs">{txn.date}</td>
                    <td className="py-4 px-6 text-right font-extrabold text-[#10b981] text-xs">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {txn.amount}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}