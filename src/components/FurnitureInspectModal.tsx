import React from 'react';
import {
  Activity,
  Brain,
  CheckCircle,
  Clock,
  Coffee,
  Cpu,
  Droplets,
  FileText,
  Layers,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Tv,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { WorldObject } from '../types';

interface FurnitureInspectModalProps {
  object: WorldObject;
  onClose: () => void;
  onApplyBuff?: (buff: string) => void;
  onAskAgent?: (agentId: string, promptTopic?: string) => void;
  onStartFocus?: (durationMinutes?: number) => void;
  onOpenMeetingRoom?: () => void;
}

export const FurnitureInspectModal: React.FC<FurnitureInspectModalProps> = ({
  object,
  onClose,
  onApplyBuff,
  onAskAgent,
  onStartFocus,
  onOpenMeetingRoom,
}) => {
  const renderContent = () => {
    // 1. Check for Meeting Room furniture
    if (
      object.room === 'meeting_room' ||
      object.type === 'conference_table' ||
      object.type === 'presentation_screen' ||
      object.type === 'agenda_board' ||
      object.type === 'conference_chair'
    ) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
            <Users className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white font-mono">
                Meeting Room: Executive Conference Table
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                A shared collaborative workspace where you can invite multiple agents (Nova, Pixel, Closer, Orbit, Coach) into a synchronized roundtable meeting.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-bold">Room Capabilities:</div>
            <div>• Real-time multi-agent roundtable discussions</div>
            <div>• Automatic character gathering around conference seats</div>
            <div>• Synthesize strategic insights into actionable backlog tasks</div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenMeetingRoom?.();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Users className="w-4 h-4" />
            <span>Open Meeting Room / Convene Agents</span>
          </button>
        </div>
      );
    }

    // 2. Strategy Office (Nova)
    if (
      object.room === 'strategy_office' ||
      object.type === 'planning_desk' ||
      object.type === 'documents' ||
      (object.data?.targetAgentId === 'agent_nova')
    ) {
      const topic = object.data?.promptTopic || 'Strategic digital readiness audit and growth priorities';
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
            <Brain className="w-8 h-8 text-blue-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white font-mono">
                  Strategy Office — Workstation
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  NOVA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Contains planning desk, whiteboard, computer, and growth strategy documents.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="text-slate-500 font-bold block mb-1">Workstation Focus:</span>
            <span>"{topic}"</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onAskAgent?.('agent_nova', topic);
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Nova (Digital Strategist)</span>
          </button>
        </div>
      );
    }

    // 3. Creative Studio (Pixel)
    if (
      object.room === 'creative_studio' ||
      object.type === 'design_board' ||
      object.type === 'content_workspace' ||
      (object.data?.targetAgentId === 'agent_pixel')
    ) {
      const topic = object.data?.promptTopic || 'Viral marketing campaigns, content hooks, and lead generation';
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-pink-950/40 border border-pink-500/30">
            <Sparkles className="w-8 h-8 text-pink-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white font-mono">
                  Creative Studio — Workstation
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  PIXEL
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Contains creative computers, design boards, and dynamic content workspace.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="text-slate-500 font-bold block mb-1">Workstation Focus:</span>
            <span>"{topic}"</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onAskAgent?.('agent_pixel', topic);
            }}
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Pixel (Marketing Agent)</span>
          </button>
        </div>
      );
    }

    // 4. Sales Office (Closer)
    if (
      object.room === 'sales_office' ||
      object.type === 'sales_desk' ||
      object.type === 'lead_board' ||
      object.type === 'communication_device' ||
      (object.data?.targetAgentId === 'agent_closer')
    ) {
      const topic = object.data?.promptTopic || 'CRM lead pipeline, discovery conversations, and objection handling';
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <TrendingUp className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white font-mono">
                  Sales Office — Workstation
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CLOSER
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Contains sales desks, real-time CRM lead board, and client communication devices.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="text-slate-500 font-bold block mb-1">Workstation Focus:</span>
            <span>"{topic}"</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onAskAgent?.('agent_closer', topic);
            }}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Closer (Sales Agent)</span>
          </button>
        </div>
      );
    }

    // 5. Operations Centre (Orbit)
    if (
      object.room === 'operations_centre' ||
      object.type === 'project_board' ||
      object.type === 'task_desk' ||
      object.type === 'workflow_area' ||
      (object.data?.targetAgentId === 'agent_orbit')
    ) {
      const topic = object.data?.promptTopic || 'Project milestones, sprint tickets, workflows, and execution plans';
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
            <Workflow className="w-8 h-8 text-purple-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white font-mono">
                  Operations Centre — Workstation
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ORBIT
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Contains project boards, task management desks, and workflow coordination area.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="text-slate-500 font-bold block mb-1">Workstation Focus:</span>
            <span>"{topic}"</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onAskAgent?.('agent_orbit', topic);
            }}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Orbit (Operations Agent)</span>
          </button>
        </div>
      );
    }

    // 6. Focus Centre (Coach)
    if (
      object.room === 'focus_centre' ||
      object.type === 'quiet_desk' ||
      object.type === 'focus_timer' ||
      object.type === 'focus_station'
    ) {
      const duration = object.data?.defaultDuration || 25;
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30">
            <Target className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white font-mono">
                  Focus Centre — Deep Work Station
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  COACH
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Contains quiet desks, Pomodoro timer display, and acoustic focus stations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                onClose();
                onStartFocus?.(25);
              }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>25m Sprint</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onStartFocus?.(50);
              }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>50m Deep Flow</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onStartFocus?.(duration);
            }}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30"
          >
            <Zap className="w-4 h-4" />
            <span>Start Focus Session ({duration}m)</span>
          </button>
        </div>
      );
    }

    // 7. General interactive objects (Water cooler, coffee, etc.)
    switch (object.type) {
      case 'water_cooler':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-950/40 border border-sky-500/30">
              <Droplets className="w-8 h-8 text-sky-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white font-mono">
                  Natural Alpine Spring Water
                </h4>
                <p className="text-[11px] text-slate-300">
                  Crisp, chilled hydration to sustain peak mental clarity throughout long coding sessions.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onApplyBuff?.('Hydrated (Focus +15%)');
                onClose();
              }}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Droplets className="w-4 h-4" />
              <span>Drink a Cold Cup (Hydrate)</span>
            </button>
          </div>
        );

      case 'coffee_maker':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
              <Coffee className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white font-mono">
                  Artisan Dark Roast Espresso
                </h4>
                <p className="text-[11px] text-slate-300">
                  Freshly extracted double shot with rich crema. Guaranteed +25% walking speed burst.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onApplyBuff?.('Caffeinated (Speed Boost!)');
                onClose();
              }}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Brew Double Shot Espresso</span>
            </button>
          </div>
        );

      case 'vending_machine':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30">
              <Sparkles className="w-8 h-8 text-purple-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white font-mono">
                  Digital Fuel & Nootropics Vending
                </h4>
                <p className="text-[11px] text-slate-300">
                  Chilled electrolyte sodas, matcha tonics, and healthy workstation snacks.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onApplyBuff?.('Matcha Zen (Flow State)');
                  onClose();
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-lg transition cursor-pointer text-left"
              >
                🍵 Sparkling Matcha ($3)
              </button>
              <button
                onClick={() => {
                  onApplyBuff?.('Electrolyte Surge');
                  onClose();
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-lg transition cursor-pointer text-left"
              >
                ⚡ Blue Nitro Fuel ($4)
              </button>
            </div>
          </div>
        );

      case 'server_rack':
        return (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>AI Neural Cluster Node #8</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">GPU Tensor Utilization:</span>
                <span className="text-emerald-400 font-bold">78.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Memory Bandwidth:</span>
                <span className="text-sky-400 font-bold">2.4 TB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Multi-Agent Threads:</span>
                <span className="text-purple-400 font-bold">64 Cores</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inference P95 Latency:</span>
                <span className="text-emerald-400 font-bold">142ms</span>
              </div>
            </div>
          </div>
        );

      case 'whiteboard':
        return (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <FileText className="w-4 h-4" />
              <span>Growth Canvas</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
              <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30 text-amber-200">
                📌 "Ship autonomous referral loop with token reward before Q3 investor review."
              </div>
              <div className="p-2 rounded bg-sky-950/30 border border-sky-500/30 text-sky-200">
                💡 "Reduce onboarding friction to 1-click Google Workspace token pairing."
              </div>
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                ✅ "Weekly Active Collaborations grew +34% after introducing Pomodoro body-doubling."
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <p>{object.interactLabel || 'An interactive workplace object.'}</p>
            <p className="text-slate-400 text-[11px]">
              Room: <span className="text-white font-semibold">{object.room.replace('_', ' ')}</span>
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[60] flex items-start justify-end w-full max-w-sm pointer-events-none sm:w-[420px] animate-in slide-in-from-right-4 fade-in duration-200 select-none">
      <div className="relative w-full bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto ring-1 ring-black/50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-mono tracking-tight truncate pr-2">
            {object.interactLabel || 'Workplace Station'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-elevated)] transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">{renderContent()}</div>

        <div className="px-5 py-3 bg-[var(--color-surface-subtle)] border-t border-[var(--color-border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-mono rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
