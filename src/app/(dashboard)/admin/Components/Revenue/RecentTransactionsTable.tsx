"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
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
          const mapped: Transaction[] = res.data.map((p: any) => ({
            id: p.transactionId || `TXN-${p.id?.substring(0, 4)}`,
            organization: p.organizationName || p.organization || "Company",
            plan: `${p.plan || "Business Plan"} (${p.billingCycle || "Monthly"})`,
            amount: `+$${p.amount || "149.00"}`,
            date: p.date || (p.createdAt ? p.createdAt.split("T")[0] : "Today"),
          }));
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
    <div className="animate-section opacity-0 bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-neutral-900">Recent Transactions</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Latest successful platform subscription payments</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#00B050] mr-2" />
          <span className="text-xs">Loading transactions...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Transaction ID</th>
                <th className="py-3.5 px-6">Organization</th>
                <th className="py-3.5 px-6">Subscription Plan</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-neutral-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-neutral-600 font-semibold">{txn.id}</td>
                    <td className="py-4 px-6 font-bold text-neutral-900 text-xs">{txn.organization}</td>
                    <td className="py-4 px-6 text-neutral-500 text-xs">{txn.plan}</td>
                    <td className="py-4 px-6 text-neutral-400 text-xs">{txn.date}</td>
                    <td className="py-4 px-6 text-right font-extrabold text-[#10b981] text-xs flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {txn.amount}
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