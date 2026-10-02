import React, { useState } from 'react';
import { FunnelRecord } from '../types';
import { DGWIcon } from './DGWIcon';
import { TrendingUp, Users, DollarSign, ArrowRight, CheckCircle, RefreshCw, Zap } from 'lucide-react';

interface FunnelsViewProps {
  funnels: FunnelRecord[];
  onSelectAgentToChat: (agentId: string) => void;
}

export const FunnelsView: React.FC<FunnelsViewProps> = ({ funnels = [], onSelectAgentToChat }) => {
  const funnelList = funnels || [];
  const [activeFunnelId, setActiveFunnelId] = useState<string>(funnelList[0]?.id || '');

  const activeFunnel = funnelList.find((f) => f.id === activeFunnelId) || funnelList[0];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DGWIcon name="funnels" size={20} className="text-cyan-400" />
            <h1 className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
              Conversion Funnels & Acquisition Infrastructure
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            End-to-end attribution: Demand → Lead → Conversion → Scale / Kill.
          </p>
        </div>

        {/* Funnel Selector */}
        <div className="flex items-center gap-2">
          {funnelList.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFunnelId(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                activeFunnel?.id === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {activeFunnel && (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Total Revenue</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                ${activeFunnel.totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Traffic Source</div>
              <div className="text-sm font-bold font-mono text-[var(--color-text-primary)] mt-1 truncate">
                {activeFunnel.trafficSource}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Target Offer</div>
              <div className="text-sm font-bold font-mono text-cyan-300 mt-1 truncate">
                {activeFunnel.targetOffer}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Overall Conv. Rate</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {activeFunnel.conversionRate}%
              </div>
            </div>
          </div>

          {/* Funnel Steps Breakdown */}
          <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-primary)] font-bold">
              Step-by-Step Dropoff & Agent Attribution
            </h3>

            <div className="space-y-3">
              {activeFunnel.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
                          {step.name}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
                          Responsible Agent: <span className="text-cyan-300 font-bold">{step.assignedAgent}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[var(--color-text-muted)]">Visitors: </span>
                        <strong className="text-[var(--color-text-primary)]">{step.visitors.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Conversion: </span>
                        <strong className="text-emerald-400">{step.conversionRate}%</strong>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Dropoff: </span>
                        <strong className="text-rose-400">{step.dropoffRate}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-2 w-full bg-[var(--color-background)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, step.conversionRate * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
