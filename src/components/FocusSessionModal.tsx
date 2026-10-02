import React, { useState } from 'react';
import { Bot, Check, Clock, Headphones, Sparkles, Target, Volume2, VolumeX, X } from 'lucide-react';
import { AIAgent, FocusSessionState } from '../types';

interface FocusSessionModalProps {
  agents: AIAgent[];
  currentSession: FocusSessionState;
  onStartSession: (durationMinutes: number, partnerId: string, goal: string, sound: boolean) => void;
  onClose: () => void;
}

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  agents,
  currentSession,
  onStartSession,
  onClose,
}) => {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(
    currentSession.partnerAgentId || 'agent_coach'
  );
  const [goalText, setGoalText] = useState(currentSession.goal || 'Ship feature milestone');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const durations = [
    { label: '25m', minutes: 25, tag: 'Sprint' },
    { label: '50m', minutes: 50, tag: 'Deep Work' },
    { label: '90m', minutes: 90, tag: 'Flow State' },
  ];

  const handleStart = () => {
    const finalDuration = isCustom ? parseInt(customDuration, 10) || 25 : selectedDuration;
    onStartSession(finalDuration, selectedAgentId, goalText.trim(), soundEnabled);
    onClose();
  };

  const selectedPartner = agents.find((a) => a.id === selectedAgentId) || agents[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono tracking-tight">
                Start a Focus Session
              </h3>
              <p className="text-[11px] text-slate-400">
                AI Body-Doubling & Accountability Companion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Goal Input */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>What is your focus objective?</span>
            </label>
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g., Finalize growth model or write product spec"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Session Duration</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((d) => {
                const isSelected = !isCustom && selectedDuration === d.minutes;
                return (
                  <button
                    key={d.minutes}
                    type="button"
                    onClick={() => { setIsCustom(false); setSelectedDuration(d.minutes); }}
                    className={`py-2 px-1 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-sky-600/30 border-sky-500 text-white font-bold ring-1 ring-sky-500'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-mono text-sm">{d.label}</div>
                    <div className="text-[9px] text-slate-400 truncate">{d.tag}</div>
                  </button>
                );
              })}
              
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`py-2 px-1 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  isCustom
                    ? 'bg-sky-600/30 border-sky-500 text-white font-bold ring-1 ring-sky-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isCustom ? (
                   <input 
                      type="number"
                      autoFocus
                      min="1"
                      max="480"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      className="w-10 bg-transparent text-center text-sm font-mono focus:outline-none"
                      placeholder="min"
                   />
                ) : (
                   <div className="font-mono text-sm">Custom</div>
                )}
                <div className="text-[9px] text-slate-400 truncate">Duration</div>
              </button>
            </div>
          </div>

          {/* Select Body-Doubling Partner */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Select AI Accountability Partner</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {agents.map((agent) => {
                const isSelected = selectedAgentId === agent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: agent.customization.outfitColor }}
                    >
                      <span className="text-[10px] font-bold text-white">
                        {agent.name.charAt(0)}
                      </span>
                    </div>
                    <div className="truncate text-left">
                      <div className="font-mono text-xs font-semibold truncate leading-tight">
                        {agent.name.split(' ')[0]}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate leading-tight">
                        {agent.role.split('&')[0]}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ambient Tone Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-slate-400" />
              <span>Ambient focus sound & bell</span>
            </span>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded border transition cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-mono">
            Partner: <span className="text-white font-semibold">{selectedPartner?.name}</span>
          </p>
          <button
            onClick={handleStart}
            disabled={!goalText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition active:scale-95 cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enter Focus Mode ({isCustom ? (parseInt(customDuration, 10) || 25) : selectedDuration}m)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
