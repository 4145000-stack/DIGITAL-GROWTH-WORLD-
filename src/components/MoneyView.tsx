import React from 'react';
import { DGWIcon } from './DGWIcon';
import { DollarSign, TrendingUp, CreditCard, PieChart, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface MoneyViewProps {
  moneySummary: {
    mrr: number;
    arr: number;
    pipelineValue: number;
    grossMargin: number;
    cashRunwayMonths: number;
    activeSubscribers: number;
    avgRevenuePerUser: number;
  };
  onOpenMeeting: () => void;
}

export const MoneyView: React.FC<MoneyViewProps> = ({ moneySummary, onOpenMeeting }) => {
  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DGWIcon name="money" size={20} className="text-emerald-400" />
            <h1 className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
              Money, Cashflow & MRR Engine
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            High-margin software and service contracts. Real-time unit economics and runway tracking.
          </p>
        </div>

        <button
          onClick={onOpenMeeting}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <span>Executive Financial Review</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
          <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
            Monthly Recurring Revenue (MRR)
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${moneySummary.mrr.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300 font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.8% vs last month
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
          <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
            Annual Run Rate (ARR)
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">
            ${moneySummary.arr.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400 font-mono">
            Target: $1,000,000 ARR
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
          <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
            Weighted Pipeline Value
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            ${moneySummary.pipelineValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] font-mono">
            4 Qualified Enterprise Deals
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
          <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
            Cash Runway
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {moneySummary.cashRunwayMonths} Months
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Default Alive / Profitable
          </div>
        </div>
      </div>

      {/* Unit Economics & Margin Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-primary)] font-bold">
            Unit Economics & Margins
          </h3>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)]">Gross Profit Margin:</span>
              <span className="font-bold text-emerald-400">{moneySummary.grossMargin}%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)]">Average Revenue Per User (ARPU):</span>
              <span className="font-bold text-[var(--color-text-primary)]">${moneySummary.avgRevenuePerUser}/mo</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)]">Customer Acquisition Cost (CAC):</span>
              <span className="font-bold text-cyan-300">$480</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[var(--color-text-secondary)]">LTV to CAC Ratio:</span>
              <span className="font-bold text-emerald-400">6.8x (Optimal)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-primary)] font-bold">
            Revenue Streams
          </h3>

          <div className="space-y-3">
            {[
              { name: 'Enterprise OS Licenses', share: '54%', amount: '$27,270/mo', color: 'bg-cyan-500' },
              { name: 'Migration & Growth Retainers', share: '32%', amount: '$16,160/mo', color: 'bg-emerald-500' },
              { name: 'Audit & Diagnostic Packages', share: '14%', amount: '$7,070/mo', color: 'bg-purple-500' },
            ].map((stream) => (
              <div key={stream.name} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--color-text-primary)]">{stream.name}</span>
                  <span className="text-emerald-400 font-bold">{stream.amount} ({stream.share})</span>
                </div>
                <div className="h-2 w-full bg-[var(--color-background)] rounded-full overflow-hidden">
                  <div className={`h-full ${stream.color} rounded-full`} style={{ width: stream.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
