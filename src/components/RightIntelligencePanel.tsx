import React from 'react';
import { AIAgent, NextBestAction, Opportunity } from '../types';
import { Sparkles, ChevronRight, Zap, Target, ArrowUpRight, MessageSquare } from 'lucide-react';
import { DGWIcon } from './DGWIcon';

interface RightIntelligencePanelProps {
  agents: AIAgent[];
  nextBestAction: NextBestAction;
  opportunities: Opportunity[];
  onSelectAgent: (agent: AIAgent) => void;
  onExecuteAction: (action: NextBestAction) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onClose?: () => void;
}

export const RightIntelligencePanel: React.FC<RightIntelligencePanelProps> = ({
  agents = [],
  nextBestAction,
  opportunities = [],
  onSelectAgent,
  onExecuteAction,
  onSelectOpportunity,
  onClose,
}) => {
  // Color cues per agent
  const getAgentColor = (name: string) => {
    switch (name.toUpperCase()) {
      case 'NOVA':
        return 'border-sky-500/40 text-sky-400 bg-sky-500/10';
      case 'PIXEL':
        return 'border-pink-500/40 text-pink-400 bg-pink-500/10';
      case 'CLOSER':
        return 'border-blue-500/40 text-blue-400 bg-blue-500/10';
      case 'ORBIT':
        return 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10';
      case 'COACH':
        return 'border-amber-500/40 text-amber-400 bg-amber-500/10';
      default:
        return 'border-purple-500/40 text-purple-400 bg-purple-500/10';
    }
  };

  const oppList = opportunities || [];
  const highPriorityOpp = oppList[0];

  return (
    <aside className="w-80 max-w-[85vw] h-full bg-[var(--color-surface)]/95 border-l border-[var(--color-border)] flex flex-col p-3.5 space-y-4 select-none z-30 shrink-0 backdrop-blur-md overflow-y-auto">
      {/* 1. Header with Intelligence Title */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[var(--color-text-primary)]">
            Intelligence Matrix
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            REAL-TIME
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition cursor-pointer"
              title="Close Panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Current Task / Next Best Action Panel (Requirement 08) */}
      <div className="p-3 rounded-xl bg-gradient-to-b from-[var(--color-surface-elevated)] to-[var(--color-surface-subtle)] border border-cyan-500/40 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono tracking-wider text-cyan-400 uppercase font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Next Best Action
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
            HIGH IMPACT: {nextBestAction.impactScore}/100
          </span>
        </div>

        <h4 className="text-xs font-bold text-[var(--color-text-primary)] font-mono leading-snug mb-1">
          {nextBestAction.title}
        </h4>
        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mb-3">
          {nextBestAction.reason}
        </p>

        {/* Metrics Badge Row */}
        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-[var(--color-background)]/80 border border-[var(--color-border)] mb-3 text-center font-mono">
          <div>
            <div className="text-[9px] text-[var(--color-text-muted)]">Intent</div>
            <div className="text-[11px] font-bold text-cyan-400">{nextBestAction.metrics.commercialIntent}</div>
          </div>
          <div className="border-x border-[var(--color-border)]">
            <div className="text-[9px] text-[var(--color-text-muted)]">Opp Score</div>
            <div className="text-[11px] font-bold text-amber-400">{nextBestAction.metrics.opportunityScore}</div>
          </div>
          <div>
            <div className="text-[9px] text-[var(--color-text-muted)]">Offer Fit</div>
            <div className="text-[11px] font-bold text-emerald-400">{nextBestAction.metrics.offerFit}%</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onExecuteAction(nextBestAction)}
          className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-cyan-500/20 cursor-pointer active:scale-98"
        >
          <span>{nextBestAction.actionLabel}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. AI Agents Live Activity (Requirement 07 & 09) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider font-bold">
          <span>AI Agents ({agents.length})</span>
          <span>Status</span>
        </div>

        <div className="space-y-1.5">
          {agents.map((agent) => {
            const isWorking = agent.animationState === 'work' || agent.animationState === 'think';
            const colorClass = getAgentColor(agent.name);

            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-cyan-500/30 transition cursor-pointer group flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Agent Character Avatar Badge */}
                  <div
                    className={`w-7 h-7 rounded-md border flex items-center justify-center font-mono font-bold text-xs shrink-0 ${colorClass}`}
                  >
                    {agent.name.slice(0, 1)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[var(--color-text-primary)] group-hover:text-cyan-300 transition">
                        {agent.name}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">
                        {agent.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-[var(--color-text-secondary)] truncate">
                      {agent.status}
                    </div>
                  </div>
                </div>

                {/* State Indicator */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isWorking ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    {isWorking ? 'Active' : 'Ready'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Active Commercial Opportunity Spotlight */}
      {highPriorityOpp && (
        <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-amber-400 uppercase font-bold flex items-center gap-1">
              <Target className="w-3 h-3" /> Top Opportunity
            </span>
            <span className="text-emerald-400 font-bold font-mono">
              ${(highPriorityOpp.estimatedValue / 1000).toFixed(0)}k Est. Value
            </span>
          </div>

          <div className="text-xs font-bold text-[var(--color-text-primary)] font-mono">
            {highPriorityOpp.name}
          </div>

          <div className="text-[11px] text-[var(--color-text-secondary)]">
            {highPriorityOpp.recommendedAction}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
              Score: <strong className="text-amber-300">{highPriorityOpp.score}/100</strong>
            </span>
            <button
              onClick={() => onSelectOpportunity(highPriorityOpp)}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <span>View Funnel</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
