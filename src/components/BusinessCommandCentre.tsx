import React from 'react';
import { Opportunity, FunnelRecord, AIAgent, NextBestAction, BusinessSignal, AgentWorkItem } from '../types';
import { DGWIcon } from './DGWIcon';
import {
  TrendingUp,
  Target,
  Zap,
  ArrowUpRight,
  DollarSign,
  Users,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
} from 'lucide-react';

interface BusinessCommandCentreProps {
  opportunities: Opportunity[];
  funnels: FunnelRecord[];
  agents: AIAgent[];
  nextBestAction: NextBestAction;
  moneySummary: {
    mrr: number;
    arr: number;
    pipelineValue: number;
    grossMargin: number;
    cashRunwayMonths: number;
    activeSubscribers: number;
  };
  signals?: BusinessSignal[];
  agentWorkQueues?: AgentWorkItem[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onSelectFunnel: (funnel: FunnelRecord) => void;
  onExecuteAction: (action: NextBestAction) => void;
  onOpenMeetingRoom: () => void;
  onOpenAgentChat: (agentId: string) => void;
}

export const BusinessCommandCentre: React.FC<BusinessCommandCentreProps> = ({
  opportunities = [],
  funnels = [],
  agents = [],
  nextBestAction,
  moneySummary,
  signals = [],
  agentWorkQueues = [],
  onSelectOpportunity,
  onSelectFunnel,
  onExecuteAction,
  onOpenMeetingRoom,
  onOpenAgentChat,
}) => {
  const oppList = opportunities || [];
  const funnelList = funnels || [];
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. HERO COMMAND STATUS BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface-elevated)] to-[var(--color-surface)] border border-[var(--color-border)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                BUSINESS OPERATING SYSTEM
              </span>
              <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                Autonomous AI Multi-Agent Mesh
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-text-primary)] tracking-tight">
              Global Command & Growth Engine
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl leading-relaxed">
              Real-time synchronization across commercial opportunities, conversion funnels, AI agent taskforces, and revenue pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMeetingRoom}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/25 transition cursor-pointer active:scale-95"
            >
              <DGWIcon name="meeting" size={16} />
              <span>Convene Strategy Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FIVE CORE QUESTIONS CARDS (Requirement 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Q1: What is happening? */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-cyan-500/30 transition">
          <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1">
            1. What is Happening?
          </div>
          <div className="text-lg font-bold font-mono text-[var(--color-text-primary)]">
            5 Active Workflows
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            Nova, Pixel, Closer, Orbit & Coach executing synchronized schedules.
          </div>
        </div>

        {/* Q2: What opportunities exist? */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-amber-500/30 transition">
          <div className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1">
            2. Opportunities
          </div>
          <div className="text-lg font-bold font-mono text-[var(--color-text-primary)]">
            {opportunities.length} High-Intent
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            ${(moneySummary.pipelineValue / 1000).toFixed(0)}k pipeline with 87+ average opportunity score.
          </div>
        </div>

        {/* Q3: What should I do next? */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-cyan-500/50 shadow-md shadow-cyan-500/10">
          <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            3. Next Best Action
          </div>
          <div className="text-xs font-bold font-mono text-[var(--color-text-primary)] truncate">
            {nextBestAction.actionLabel}
          </div>
          <div className="text-[11px] text-cyan-300 mt-1 truncate">
            Impact: {nextBestAction.impactScore}/100 • {nextBestAction.metrics.commercialIntent}
          </div>
        </div>

        {/* Q4: What is making money? */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-emerald-500/30 transition">
          <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">
            4. Revenue Engine
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            ${(moneySummary.mrr).toLocaleString()}/mo
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            ${(moneySummary.arr / 1000).toFixed(0)}k ARR • 84.5% gross margin
          </div>
        </div>

        {/* Q5: What needs attention? */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-rose-500/30 transition">
          <div className="text-[10px] font-mono uppercase text-rose-400 font-bold mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            5. Bottlenecks
          </div>
          <div className="text-xs font-bold font-mono text-[var(--color-text-primary)]">
            Step 3 Conversion
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            Objection handling in sales pipeline needs script refinement.
          </div>
        </div>
      </div>

      {/* NEW: OPERATIONAL SIGNALS & AGENT WORKLOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SIGNALS */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-border)]">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Operational Signals
            </h2>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {signals.filter(s => s.status !== 'resolved').length === 0 ? (
              <div className="text-xs text-[var(--color-text-muted)] italic py-2">No active signals. Systems nominal.</div>
            ) : (
              signals.filter(s => s.status !== 'resolved').map(signal => {
                const isPositive = signal.type.includes('WIN');
                const Icon = isPositive ? CheckCircle2 : AlertTriangle;
                const iconColor = isPositive ? 'text-emerald-400' : (signal.severity === 'critical' ? 'text-rose-500' : 'text-amber-400');
                return (
                  <div key={signal.id} className="flex gap-2 p-2 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-xs">
                    <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${iconColor}`} />
                    <div>
                      <div className="font-bold text-[var(--color-text-primary)]">{signal.title}</div>
                      <div className="text-[var(--color-text-secondary)] mt-0.5 leading-snug">{signal.description}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AGENT WORKLOAD */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-border)]">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Agent Workload
            </h2>
          </div>
          <div className="space-y-3">
            {['nova', 'pixel', 'closer', 'orbit', 'coach'].map(agentId => {
              const q = agentWorkQueues.filter(item => item.agentId === agentId && !['COMPLETED', 'FAILED'].includes(item.state));
              const activeCount = q.length;
              // visual bar, max 10
              const blocks = Math.min(activeCount, 10);
              return (
                <div key={agentId} className="flex items-center justify-between text-xs font-mono">
                  <div className="w-16 capitalize text-[var(--color-text-secondary)] font-bold">{agentId}</div>
                  <div className="flex-1 flex gap-1 mx-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-sm ${i < blocks ? 'bg-cyan-400' : 'bg-[var(--color-background)] border border-[var(--color-border)]'}`}
                      />
                    ))}
                  </div>
                  <div className="w-8 text-right text-[var(--color-text-muted)]">{activeCount}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. OPPORTUNITY-FIRST MATRIX (Requirement 11 & 12) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DGWIcon name="opportunities" size={18} className="text-amber-400" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              High-Value Commercial Opportunities
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              PRIORITY HIERARCHY
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            Ranked by Intent & Revenue Fit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {oppList.map((opp) => {
            const isTop = opp.score >= 90;
            return (
              <div
                key={opp.id}
                onClick={() => onSelectOpportunity(opp)}
                className={`p-4 rounded-xl bg-[var(--color-surface)] border transition cursor-pointer hover:shadow-xl group relative overflow-hidden ${
                  isTop
                    ? 'border-amber-500/50 shadow-md shadow-amber-500/5'
                    : 'border-[var(--color-border)] hover:border-cyan-500/40'
                }`}
              >
                {/* Category & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-cyan-300 font-bold">
                    {opp.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      ${(opp.estimatedValue / 1000).toFixed(0)}k Est. Value
                    </span>
                  </div>
                </div>

                <h3 className="font-mono text-sm font-bold text-[var(--color-text-primary)] group-hover:text-cyan-300 transition mb-2">
                  {opp.name}
                </h3>

                {/* Score Grid: Intent, Fit, Competition */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-lg bg-[var(--color-background)]/80 border border-[var(--color-border)] text-center font-mono mb-3">
                  <div>
                    <div className="text-[9px] text-[var(--color-text-muted)]">Opp Score</div>
                    <div className="text-xs font-bold text-amber-400">{opp.score}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[var(--color-text-muted)]">Intent</div>
                    <div className="text-xs font-bold text-cyan-400">{opp.commercialIntent}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[var(--color-text-muted)]">Offer Fit</div>
                    <div className="text-xs font-bold text-emerald-400">{opp.offerFit}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[var(--color-text-muted)]">Comp.</div>
                    <div className="text-xs font-bold text-[var(--color-text-secondary)]">{opp.competition}</div>
                  </div>
                </div>

                {/* Recommendation & Action */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-[var(--color-text-secondary)] truncate max-w-[240px]">
                    <span className="text-[var(--color-text-muted)]">Next: </span>
                    {opp.recommendedAction}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOpportunity(opp);
                    }}
                    className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-semibold flex items-center gap-1 transition"
                  >
                    <span>Build Funnel</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CONVERSION FUNNELS & REVENUE PIPELINE (Requirement 26: Full Loop) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DGWIcon name="funnels" size={18} className="text-cyan-400" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Active Conversion Funnels
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            Demand → Lead → Conversion → Scale
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {funnelList.map((funnel) => (
            <div
              key={funnel.id}
              onClick={() => onSelectFunnel(funnel)}
              className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-cyan-500/40 transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
                    {funnel.name}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    Source: {funnel.trafficSource} • Target: {funnel.targetOffer}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    ${(funnel.totalRevenue).toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-300">
                    {funnel.conversionRate}% Avg. Conv.
                  </div>
                </div>
              </div>

              {/* Step Flow Visualization */}
              <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                {funnel.steps.map((step, idx) => (
                  <div key={step.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[9px] text-cyan-400">
                          {idx + 1}
                        </span>
                        {step.name}
                      </span>
                      <span className="text-[var(--color-text-muted)]">
                        {step.visitors.toLocaleString()} visits • <strong className="text-cyan-300">{step.conversionRate}%</strong>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-[var(--color-background)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                        style={{ width: `${Math.min(100, step.conversionRate * 2.5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. BUSINESS ENVIRONMENTS (Spatial & Functional Metaphors - Requirement 13) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DGWIcon name="business" size={18} className="text-purple-400" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Business Departments & Workspaces
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            Linked to World Coordinates & NPCs
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { name: 'Strategy Office', agent: 'NOVA', specialty: 'Audits & Positioning', color: 'border-sky-500/30 text-sky-400' },
            { name: 'Creative Studio', agent: 'PIXEL', specialty: 'Marketing & Ad Kits', color: 'border-pink-500/30 text-pink-400' },
            { name: 'Sales Office', agent: 'CLOSER', specialty: 'Leads & Negotiations', color: 'border-blue-500/30 text-blue-400' },
            { name: 'Operations Centre', agent: 'ORBIT', specialty: 'Sprints & Delivery', color: 'border-emerald-500/30 text-emerald-400' },
            { name: 'Focus Centre', agent: 'COACH', specialty: 'Flow State & Pomodoro', color: 'border-amber-500/30 text-amber-400' },
            { name: 'Meeting Room', agent: 'ALL', specialty: 'Executive Decisions', color: 'border-purple-500/30 text-purple-400' },
          ].map((dept) => (
            <div
              key={dept.name}
              onClick={() => {
                const agent = dept.agent === 'ALL' ? 'agent_nova' : `agent_${dept.agent.toLowerCase()}`;
                onOpenAgentChat(agent);
              }}
              className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-cyan-500/40 transition cursor-pointer text-center group"
            >
              <div className="text-xs font-bold font-mono text-[var(--color-text-primary)] group-hover:text-cyan-300 transition truncate">
                {dept.name}
              </div>
              <div className={`text-[10px] font-mono mt-1 font-bold ${dept.color}`}>
                Lead: {dept.agent}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">
                {dept.specialty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
