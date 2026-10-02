import React, { useState, useEffect } from 'react';
import { DGWIcon } from './DGWIcon';
import { Maximize2, Minimize2, Bell, Sparkles, MapPin, Search, Volume2, VolumeX, Radio } from 'lucide-react';
import { TaskItem } from '../types';
import { TopHUD } from './TopHUD';
import { soundManager, AmbientChordName } from '../services/soundManager';

interface TopBarProps {
  currentRoomName: string;
  currentFloor: string;
  zoomScale: number;
  onToggleZoom: () => void;
  onlineCount?: number;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onQuickSearch?: () => void;
  isWorldView?: boolean;
  onToggleWorldView?: () => void;
  isRightIntelOpen?: boolean;
  onToggleRightIntel?: () => void;
  tasks?: TaskItem[];
  onOpenTasks?: () => void;
  approvalsCount?: number;
  onOpenApprovals?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRoomName,
  currentFloor,
  zoomScale,
  onToggleZoom,
  onlineCount = 1,
  onOpenSettings,
  onOpenProfile,
  onQuickSearch,
  isWorldView = false,
  onToggleWorldView,
  isRightIntelOpen = true,
  onToggleRightIntel,
  tasks = [],
  onOpenTasks,
  approvalsCount = 0,
  onOpenApprovals,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(() => soundManager.isAmbientEnabled());
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.isMuted());
  const [currentChord, setCurrentChord] = useState<AmbientChordName>(() => soundManager.getCurrentChordName());

  useEffect(() => {
    const unsub = soundManager.subscribe(() => {
      setAmbientEnabled(soundManager.isAmbientEnabled());
      setIsMuted(soundManager.isMuted());
      setCurrentChord(soundManager.getCurrentChordName());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-[var(--color-surface)]/95 border-b border-[var(--color-border)] px-4 flex items-center justify-between z-40 backdrop-blur-md select-none shrink-0 shadow-sm">
      {/* Left: Product Identity & Workspace Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-black text-sm tracking-wider font-mono">
            DG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wider uppercase text-[var(--color-text-primary)] font-mono">
                DIGITAL GROWTH WORLD™
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                PROD v2.4
              </span>
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5 font-medium">
              <span>Apex Enterprise HQ</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Systems Normal
              </span>
            </div>
          </div>
        </div>

        {/* Location / Zone Indicator */}
        <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-[var(--color-border)]">
          <button
            onClick={onToggleZoom}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
            title={`Zoom Level: ${zoomScale}x`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] font-semibold text-[var(--color-text-primary)]">
              {currentRoomName}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">({currentFloor})</span>
          </button>
        </div>
      </div>

      {/* Center: Persistent Growth Experience Bar (TopHUD) */}
      <div className="flex items-center gap-3">
        <TopHUD
          tasks={tasks}
          onOpenTasks={onOpenTasks}
          compact={true}
          approvalsCount={approvalsCount}
          onOpenApprovals={onOpenApprovals}
        />
        <div className="hidden xl:flex items-center gap-3 text-xs font-mono">
          <div className="text-[var(--color-text-muted)] font-mono text-[11px]">
            UTC {timeStr}
          </div>
        </div>
      </div>

      {/* Right: Quick Actions, Notifications & Profile */}
      <div className="flex items-center gap-2.5">
        {isWorldView && (
          <button
            onClick={() => {
              if (isMuted) {
                soundManager.setMuted(false);
                soundManager.setAmbientEnabled(true);
              } else {
                soundManager.setAmbientEnabled(!ambientEnabled);
              }
            }}
            className={`px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-2 border transition cursor-pointer ${
              ambientEnabled && !isMuted
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border-[var(--color-border)]'
            }`}
            title={
              ambientEnabled && !isMuted
                ? `World Ambient Lo-Fi Synth Active (${currentChord}) — Click to mute soundscape`
                : 'Enable World Ambient Lo-Fi Synth Soundscape'
            }
          >
            {ambientEnabled && !isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="hidden lg:inline font-semibold">LO-FI SYNTH</span>
                <span className="hidden xl:inline px-1.5 py-0.2 rounded bg-purple-500/20 text-[10px] text-purple-200 border border-purple-400/30">
                  {currentChord}
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">LO-FI OFF</span>
              </>
            )}
          </button>
        )}

        {onToggleWorldView && (
          <button
            onClick={onToggleWorldView}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              isWorldView
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-[var(--color-border)]'
            }`}
          >
            <DGWIcon name="world" size={14} />
            <span className="hidden sm:inline">{isWorldView ? 'Return to Command' : 'World View'}</span>
          </button>
        )}

        <button
          onClick={onToggleZoom}
          className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer"
          title={`Toggle Camera Zoom (${zoomScale}x)`}
        >
          {zoomScale > 1.5 ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer"
          title="System Settings"
        >
          <DGWIcon name="settings" size={16} />
        </button>

        {onToggleRightIntel && (
          <button
            onClick={onToggleRightIntel}
            className={`p-1.5 rounded transition cursor-pointer ${
              isRightIntelOpen
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
            title="Toggle Intelligence Matrix Panel"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        {/* User Profile Pill */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] border border-[var(--color-border)] transition cursor-pointer ml-1"
        >
          <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
            AF
          </div>
          <span className="text-xs font-medium text-[var(--color-text-primary)] hidden sm:inline">
            Alex Founder
          </span>
        </button>
      </div>
    </header>
  );
};
