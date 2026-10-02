import React from 'react';
import { Compass, Home, MapPin, Sparkles, X } from 'lucide-react';
import { ROOM_ZONES, TILE_SIZE } from '../game/constants';

interface HomeTeleportModalProps {
  currentRoomId: string;
  onTeleportToLocation: (x: number, y: number, roomId: string) => void;
  onClose: () => void;
}

export const HomeTeleportModal: React.FC<HomeTeleportModalProps> = ({
  currentRoomId,
  onTeleportToLocation,
  onClose,
}) => {
  const locations = [
    {
      id: 'downtown',
      name: 'Downtown Plaza & Street',
      desc: 'Exterior plaza with benches, trees, parking, street lamps & corporate front',
      x: 32 * TILE_SIZE,
      y: 9 * TILE_SIZE,
      badge: 'Exterior',
      accent: 'border-slate-600 text-slate-300',
    },
    {
      id: 'business_hq',
      name: 'Business HQ & Reception',
      desc: 'Main corporate headquarters, grand entryway, water cooler, and directory',
      x: 32 * TILE_SIZE,
      y: 19 * TILE_SIZE,
      badge: 'Main Floor',
      accent: 'border-blue-500/40 text-blue-400',
    },
    {
      id: 'creative_studio',
      name: 'Creative Studio (Pixel)',
      desc: 'High-end design computers, creative boards, content workspace & marketing ads',
      x: 10 * TILE_SIZE,
      y: 21 * TILE_SIZE,
      badge: 'Creative Wing',
      accent: 'border-pink-500/40 text-pink-400',
    },
    {
      id: 'strategy_office',
      name: 'Strategy Office (Nova)',
      desc: 'Planning desks, whiteboard, strategic documents, and digital readiness roadmap',
      x: 10 * TILE_SIZE,
      y: 32 * TILE_SIZE,
      badge: 'Strategy Wing',
      accent: 'border-blue-500/40 text-blue-400',
    },
    {
      id: 'sales_office',
      name: 'Sales Office (Closer)',
      desc: 'Sales desks, CRM lead board, high-value deals & communication devices',
      x: 50 * TILE_SIZE,
      y: 21 * TILE_SIZE,
      badge: 'Sales Wing',
      accent: 'border-emerald-500/40 text-emerald-400',
    },
    {
      id: 'operations_centre',
      name: 'Operations Centre (Orbit)',
      desc: 'Sprint project boards, workflow area, execution plans & task desks',
      x: 50 * TILE_SIZE,
      y: 32 * TILE_SIZE,
      badge: 'Operations Wing',
      accent: 'border-purple-500/40 text-purple-400',
    },
    {
      id: 'focus_centre',
      name: 'Focus Centre (Coach)',
      desc: 'Quiet desks, Pomodoro focus timer, deep flow pods & espresso station',
      x: 14 * TILE_SIZE,
      y: 43 * TILE_SIZE,
      badge: 'Focus Wing',
      accent: 'border-amber-500/40 text-amber-400',
    },
    {
      id: 'meeting_room',
      name: 'Meeting Room (Shared Workspace)',
      desc: 'Conference table, presentation screen, agenda board & multi-agent roundtable',
      x: 44 * TILE_SIZE,
      y: 43 * TILE_SIZE,
      badge: 'Collaboration',
      accent: 'border-indigo-500/40 text-indigo-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-cyan-400">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-mono tracking-tight">
                Workplace Navigation & Fast Travel
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Instant teleport to any department in Digital Growth World
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-elevated)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2.5 overflow-y-auto">
          {locations.map((loc) => {
            const isCurrent = currentRoomId === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => {
                  onTeleportToLocation(loc.x, loc.y, loc.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                  isCurrent
                    ? 'bg-cyan-500/15 border-cyan-500 text-[var(--color-text-primary)] ring-1 ring-cyan-500/50'
                    : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] hover:border-cyan-500/40 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-surface-elevated)] text-cyan-400 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold font-mono text-[var(--color-text-primary)]">{loc.name}</h4>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${loc.accent}`}>
                        {loc.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{loc.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 font-mono text-xs">
                  {isCurrent ? (
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/30">
                      Here
                    </span>
                  ) : (
                    <span className="text-[10px] text-cyan-400 font-semibold px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 transition">
                      Travel
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
