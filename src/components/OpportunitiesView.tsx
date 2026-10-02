import React, { useState } from 'react';
import { Opportunity, FunnelRecord } from '../types';
import { DGWIcon } from './DGWIcon';
import { Target, Zap, ArrowUpRight, CheckCircle2, TrendingUp, Users, ChevronRight, Plus } from 'lucide-react';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  funnels: FunnelRecord[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onSelectAgentToChat: (agentId: string) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities = [],
  funnels = [],
  onSelectOpportunity,
  onSelectAgentToChat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'High-Intent Search', 'Expansion', 'Conversion Funnel', 'Pricing Leverage'];

  const oppList = opportunities || [];
  const filtered = selectedCategory === 'all'
    ? oppList
    : oppList.filter(o => o.category === selectedCategory);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DGWIcon name="opportunities" size={20} className="text-amber-400" />
            <h1 className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
              Commercial Opportunity Pipeline
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Prioritized by Revenue Potential, Commercial Intent, and Conversion Probability.
          </p>
        </div>

        {/* Categories filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent'
              }`}
            >
              {cat === 'all' ? 'All Opportunities' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            onClick={() => onSelectOpportunity(opp)}
            className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-amber-500/50 transition cursor-pointer shadow-lg space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] text-cyan-300 border border-[var(--color-border)] font-bold">
                {opp.category}
              </span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                ${(opp.estimatedValue / 1000).toFixed(0)}k Pipeline
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold font-mono text-[var(--color-text-primary)] group-hover:text-amber-300 transition">
                {opp.name}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {opp.trafficPotential}
              </p>
            </div>

            {/* Structured Scoring Table */}
            <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-center font-mono">
              <div>
                <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Score</div>
                <div className="text-xs font-bold text-amber-400">{opp.score}/100</div>
              </div>
              <div>
                <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Intent</div>
                <div className="text-xs font-bold text-cyan-400">{opp.commercialIntent}</div>
              </div>
              <div>
                <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Offer Fit</div>
                <div className="text-xs font-bold text-emerald-400">{opp.offerFit}%</div>
              </div>
              <div>
                <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Comp.</div>
                <div className="text-xs font-bold text-slate-400">{opp.competition}</div>
              </div>
            </div>

            {/* Agent Assignment & Recommended Action */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
              <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Assigned: <strong className="text-[var(--color-text-primary)]">{opp.assignedAgentId.replace('agent_', '').toUpperCase()}</strong></span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAgentToChat(opp.assignedAgentId);
                }}
                className="px-3 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center gap-1 transition"
              >
                <span>Consult Agent</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
