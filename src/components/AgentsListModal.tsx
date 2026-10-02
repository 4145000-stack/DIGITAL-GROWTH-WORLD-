import React from 'react';
import { Compass, MessageSquare, Sparkles, UserCheck, X } from 'lucide-react';
import { AIAgent } from '../types';

interface AgentsListModalProps {
  agents: AIAgent[];
  onSelectAgentToChat: (agent: AIAgent) => void;
  onTeleportToAgent: (agent: AIAgent) => void;
  onClose: () => void;
}

export const AgentsListModal: React.FC<AgentsListModalProps> = ({
  agents,
  onSelectAgentToChat,
  onTeleportToAgent,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-mono tracking-tight flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Digital Growth World™ Agents</span>
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Autonomous AI colleagues stationed across the workplace
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-elevated)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agents Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-cyan-500/40 rounded-xl p-3.5 flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {/* Sprite color block */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-inner font-mono text-xs"
                      style={{ backgroundColor: agent.customization.outfitColor }}
                    >
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-text-primary)] font-mono">{agent.name}</h4>
                      <span className="text-[10px] text-cyan-400 font-mono block">
                        {agent.role}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[9px] font-mono text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    {agent.assignedRoom.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--color-text-secondary)] mb-2 leading-relaxed line-clamp-2">
                  {agent.status}
                </p>

                <div className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)] mb-3">
                  <span className="text-[var(--color-text-muted)] font-semibold block mb-0.5">Specialty:</span>
                  <span className="text-[var(--color-text-primary)]">{agent.specialty}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
                <button
                  onClick={() => {
                    onClose();
                    onSelectAgentToChat(agent);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Talk</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onTeleportToAgent(agent);
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg text-xs font-mono transition cursor-pointer"
                  title="Locate & walk to agent"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Locate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
