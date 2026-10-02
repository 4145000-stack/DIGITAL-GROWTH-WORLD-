import React from 'react';
import { Clock, Pause, Play, Square } from 'lucide-react';
import { FocusSessionState } from '../types';

interface FocusSessionButtonProps {
  focusSession: FocusSessionState;
  onOpenFocusModal: () => void;
  onTogglePause: () => void;
  onEndSession: () => void;
}

export const FocusSessionButton: React.FC<FocusSessionButtonProps> = ({
  focusSession,
  onOpenFocusModal,
  onTogglePause,
  onEndSession,
}) => {
  if (focusSession.isActive) {
    const minutes = Math.floor(focusSession.secondsRemaining / 60);
    const seconds = focusSession.secondsRemaining % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;

    return (
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2 select-none">
        <div className="flex items-center gap-3 bg-[var(--color-surface)]/95 border border-[var(--color-focus)]/50 shadow-xl px-3.5 py-1.5 rounded-lg backdrop-blur text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[var(--color-focus)] font-bold">
            <Clock className="w-3.5 h-3.5 animate-spin text-[var(--color-focus)]" />
            <span>{formatted}</span>
          </span>
          <span className="text-[var(--color-text-secondary)] text-[11px] hidden sm:inline truncate max-w-[120px]">
            {focusSession.goal || 'Focus Sprint'}
          </span>
          <div className="flex items-center gap-1 border-l border-[var(--color-border)] pl-2">
            <button
              onClick={onTogglePause}
              className="p-1 hover:bg-[var(--color-surface-elevated)] rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer"
              title={focusSession.isPaused ? 'Resume' : 'Pause'}
            >
              {focusSession.isPaused ? (
                <Play className="w-3 h-3 text-[var(--color-success)] fill-[var(--color-success)]" />
              ) : (
                <Pause className="w-3 h-3 text-[var(--color-warning)] fill-[var(--color-warning)]" />
              )}
            </button>
            <button
              onClick={onEndSession}
              className="p-1 hover:bg-[var(--color-surface-elevated)] rounded text-[var(--color-danger)] hover:text-[var(--color-danger)]/80 transition cursor-pointer"
              title="End Session"
            >
              <Square className="w-3 h-3 fill-[var(--color-danger)]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-3 right-3 z-30 select-none">
      <button
        onClick={onOpenFocusModal}
        className="flex items-center gap-2 bg-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)]/90 text-[var(--color-background)] px-4 py-1.5 rounded border border-[var(--color-border)] shadow-xl hover:shadow-2xl transition active:scale-95 cursor-pointer font-mono text-xs font-semibold tracking-tight"
      >
        <Clock className="w-3.5 h-3.5 text-[var(--color-background)]" />
        <span>Start a focus session</span>
      </button>
    </div>
  );
};
