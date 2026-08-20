"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface Transaction {
  id: string;
  organization: string;
  plan: string;
  amount: string;
  date: string;
}

const transactions: Transaction[] = [
  { id: "TXN-9481", organization: "TechCorp Solutions", plan: "Business Plan (Monthly)", amount: "+$149.00", date: "Today, 2:45 PM" },
  { id: "TXN-9480", organization: "Alpha Industries", plan: "Starter Plan (Yearly)", amount: "+$390.00", date: "Today, 11:15 AM" },
  { id: "TXN-9479", organization: "Global Logistics", plan: "Enterprise Plan", amount: "+$319.00", date: "Yesterday" },
  { id: "TXN-9478", organization: "Delta Media", plan: "Business Plan (Monthly)", amount: "+$149.00", date: "Jun 02, 2026" },
];

export default function RecentTransactionsTable() {
  return (
    <div className="animate-section opacity-0 bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-neutral-900">Recent Transactions</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Latest successful platform subscription payments</p>
        </div>
      </div>

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
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-neutral-50/60 transition-colors">
                <td className="py-4 px-6 font-mono text-xs text-neutral-600 font-semibold">{txn.id}</td>
                <td className="py-4 px-6 font-bold text-neutral-900">{txn.organization}</td>
                <td className="py-4 px-6 text-neutral-500 text-xs">{txn.plan}</td>
                <td className="py-4 px-6 text-neutral-400 text-xs">{txn.date}</td>
                <td className="py-4 px-6 text-right font-extrabold text-[#10b981] flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {txn.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}