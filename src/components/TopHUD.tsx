import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { TaskItem } from '../types';

export interface TopHUDProps {
  roomName?: string;
  floor?: string;
  zoomScale?: number;
  onToggleZoom?: () => void;
  onlineCount?: number;
  tasks?: TaskItem[];
  onOpenTasks?: () => void;
  compact?: boolean;
  approvalsCount?: number;
  onOpenApprovals?: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  roomName = 'Executive Suite',
  floor = 'Floor 2',
  zoomScale = 1.5,
  onToggleZoom,
  onlineCount = 1,
  tasks = [],
  onOpenTasks,
  compact = false,
  approvalsCount = 0,
  onOpenApprovals,
}) => {
  // 1. Calculate Growth Progress Metrics
  const taskList = tasks || [];
  const completedTasks = taskList.filter((t) => t.status === 'done');
  const completedCount = completedTasks.length;
  const totalCount = taskList.length;
  const totalEarnedXP = completedTasks.reduce((acc, t) => acc + (t.xpReward || 100), 0);

  // 500 XP required per growth level
  const XP_PER_LEVEL = 500;
  const currentLevel = Math.floor(totalEarnedXP / XP_PER_LEVEL) + 1;
  const currentLevelXP = totalEarnedXP % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;
  const levelProgressPercent = Math.min(100, Math.round((currentLevelXP / xpForNextLevel) * 100));

  // 2. Visual XP Gain Pulse Animation
  const [hasGainedXP, setHasGainedXP] = useState(false);
  const prevXPRef = useRef(totalEarnedXP);

  useEffect(() => {
    if (totalEarnedXP > prevXPRef.current) {
      setHasGainedXP(true);
      const timer = setTimeout(() => setHasGainedXP(false), 2000);
      return () => clearTimeout(timer);
    }
    prevXPRef.current = totalEarnedXP;
  }, [totalEarnedXP]);

  // Experience Bar Sub-Component
  const renderExperienceBar = () => (
    <div
      onClick={onOpenTasks}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onOpenTasks) {
          onOpenTasks();
        }
      }}
      title={`Growth Level ${currentLevel} • ${totalEarnedXP} Total XP • ${completedCount}/${totalCount} tasks completed. Click to manage backlog.`}
      className={`group flex items-center gap-2.5 px-3 py-1 rounded-full bg-[var(--color-surface-elevated)]/90 hover:bg-[var(--color-surface-elevated)] border transition-all select-none ${
        hasGainedXP
          ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] scale-105'
          : 'border-[var(--color-border)] hover:border-cyan-500/40 shadow-sm'
      } ${onOpenTasks ? 'cursor-pointer active:scale-98' : ''}`}
    >
      {/* Level Badge */}
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold tracking-tight shrink-0">
        <Sparkles className={`w-3 h-3 ${hasGainedXP ? 'text-emerald-400 animate-spin' : 'text-cyan-400'}`} />
        <span>LVL {currentLevel}</span>
      </div>

      {/* Bar Label & Percentage */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-3 text-[10px] font-mono leading-none">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1 uppercase tracking-wider">
            <span>Growth</span>
            {hasGainedXP && (
              <span className="text-emerald-400 font-semibold animate-pulse text-[9px]">
                +XP!
              </span>
            )}
          </span>
          <span className="text-cyan-300 font-medium">
            {currentLevelXP} / {xpForNextLevel} XP
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="relative w-24 sm:w-32 md:w-40 h-2 bg-slate-950/80 rounded-full overflow-hidden border border-white/10 p-[1px] shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 relative ${
              hasGainedXP
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]'
            }`}
            style={{ width: `${levelProgressPercent}%` }}
          >
            {hasGainedXP && (
              <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* Task Completion Pill Counter */}
      <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">
        <CheckCircle2 className="w-3 h-3 text-emerald-400/80 shrink-0" />
        <span>{completedCount}/{totalCount}</span>
      </div>
    </div>
  );

  // If in compact mode (e.g. inside TopBar header)
  if (compact) {
    return renderExperienceBar();
  }

  // Default Standalone / Floating HUD mode
  return (
    <div className="flex items-center justify-between w-full pointer-events-none z-30 select-none">
      {/* Top Left Room Badge */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {onToggleZoom ? (
          <button
            onClick={onToggleZoom}
            className="flex items-center gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-md backdrop-blur transition active:scale-95 group cursor-pointer"
            title={`Click to toggle zoom (Current: ${zoomScale}x)`}
          >
            <span className="font-mono text-xs font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              {roomName}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              {floor}
            </span>
            <Maximize2 className="w-3.5 h-3.5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-focus)] transition-colors ml-1" />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-text-primary)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-md backdrop-blur">
            <span className="font-mono text-xs font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              {roomName}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
              {floor}
            </span>
          </div>
        )}
      </div>

      {/* Center: Persistent Growth Experience Bar */}
      <div className="pointer-events-auto">
        {renderExperienceBar()}
      </div>

      {/* Top Right Online Player Indicator & Approvals */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {approvalsCount > 0 && (
          <button
            onClick={onOpenApprovals}
            className="bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/30 shadow backdrop-blur flex items-center gap-2 cursor-pointer transition animate-pulse"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[11px] font-mono text-rose-400 font-semibold tracking-wide">
              {approvalsCount} Pending Approval{approvalsCount !== 1 ? 's' : ''}
            </span>
          </button>
        )}
        <div className="bg-[var(--color-background)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] shadow backdrop-blur flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
          <span className="text-[11px] font-mono text-[var(--color-success)] font-semibold tracking-wide">
            {onlineCount} {onlineCount === 1 ? 'player' : 'players'} online
          </span>
        </div>
      </div>
    </div>
  );
};
