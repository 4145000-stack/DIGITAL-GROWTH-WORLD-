import React from 'react';
import { CheckCircle2, Clock, Flame, Target, Trophy, X } from 'lucide-react';
import { FocusStats } from '../types';

interface FocusSummaryModalProps {
  durationMinutes: number;
  goal: string;
  stats: FocusStats;
  onClose: () => void;
}

export const FocusSummaryModal: React.FC<FocusSummaryModalProps> = ({
  durationMinutes,
  goal,
  stats,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-6">
        
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-xl font-bold text-white font-mono tracking-tight mb-1 text-center">
          Focus Session Complete
        </h2>
        <p className="text-sm text-emerald-400 font-mono mb-6 text-center">
          Agent Coach is proud of you!
        </p>

        <div className="w-full space-y-3 mb-6">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono text-slate-300">Time Focused</span>
            </div>
            <span className="text-sm font-bold text-white font-mono">{durationMinutes}m</span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono text-slate-300">Task Addressed</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">{goal}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 flex flex-col items-center">
                <Flame className="w-5 h-5 text-orange-400 mb-1" />
                <span className="text-xs font-mono text-slate-400">Streak</span>
                <span className="text-lg font-bold text-white font-mono">{stats.currentStreak}</span>
             </div>
             <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 flex flex-col items-center">
                <CheckCircle2 className="w-5 h-5 text-sky-400 mb-1" />
                <span className="text-xs font-mono text-slate-400">Total</span>
                <span className="text-lg font-bold text-white font-mono">{stats.completedSessions}</span>
             </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-sm font-bold rounded-xl transition cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
