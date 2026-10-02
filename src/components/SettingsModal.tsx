import React, { useEffect, useState } from 'react';
import { Keyboard, Monitor, Music, Settings, Sliders, Volume2, X, ZoomIn } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface SettingsModalProps {
  zoomScale: number;
  onSetZoomScale: (scale: number) => void;
  playerSpeed: number;
  onSetPlayerSpeed: (speed: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showPathDebug: boolean;
  onTogglePathDebug: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  zoomScale,
  onSetZoomScale,
  playerSpeed,
  onSetPlayerSpeed,
  soundEnabled,
  onToggleSound,
  showPathDebug,
  onTogglePathDebug,
  onClose,
}) => {
  const [ambientEnabled, setAmbientEnabled] = useState(() => soundManager.isAmbientEnabled());
  const [ambientVolume, setAmbientVolume] = useState(() => soundManager.getAmbientVolume());

  useEffect(() => {
    const unsub = soundManager.subscribe(() => {
      setAmbientEnabled(soundManager.isAmbientEnabled());
      setAmbientVolume(soundManager.getAmbientVolume());
    });
    return unsub;
  }, []);

  const zoomOptions = [1.25, 1.5, 1.75, 2.0, 2.25];
  const speedOptions = [
    { label: 'Relaxed', val: 2.5 },
    { label: 'Standard', val: 3.2 },
    { label: 'Brisk Walk', val: 4.2 },
    { label: 'Sprint', val: 5.2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] pointer-events-auto ring-1 ring-black/50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-mono tracking-tight">
                Workplace Preferences
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Display, movement, and audio settings
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

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Zoom Scale */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
              <span>Pixel Art Viewport Zoom: {zoomScale}x</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {zoomOptions.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => onSetZoomScale(z)}
                  className={`py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                    zoomScale === z
                      ? 'bg-sky-600/30 border-sky-500 text-white font-bold ring-1 ring-sky-500'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {z}x
                </button>
              ))}
            </div>
          </div>

          {/* Movement Speed */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Walking Speed</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {speedOptions.map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => onSetPlayerSpeed(s.val)}
                  className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer ${
                    playerSpeed === s.val
                      ? 'bg-emerald-600/30 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-mono">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Lo-Fi Synth Soundscape & Audio */}
          <div className="space-y-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
            <label className="block text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>World Mode Ambient Lo-Fi Synth</span>
              </span>
              <span className="text-[10px] text-purple-300 font-mono">
                {Math.round(ambientVolume * 100)}%
              </span>
            </label>
            <button
              type="button"
              onClick={() => soundManager.setAmbientEnabled(!ambientEnabled)}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-mono flex items-center justify-between transition cursor-pointer ${
                ambientEnabled
                  ? 'bg-purple-600/25 border-purple-500 text-white font-bold ring-1 ring-purple-500/50'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <span>Trigger Warm Lo-Fi Synth in 'World' Mode</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ambientEnabled ? 'bg-purple-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {ambientEnabled ? 'ACTIVE' : 'MUTED'}
              </span>
            </button>

            <div className="flex items-center gap-3 pt-1">
              <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={ambientVolume}
                onChange={(e) => soundManager.setAmbientVolume(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                onToggleSound();
                soundManager.setMuted(soundEnabled);
              }}
              className={`w-full py-1.5 px-3 rounded-lg border text-xs font-mono flex items-center justify-between transition cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-800/90 border-slate-600 text-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <span>Agent & Focus Session Audio Cues</span>
              <span className="text-[10px] font-bold">
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Path Debug Toggle */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>A* Pathfinding Debug Mode</span>
            </label>
            <button
              type="button"
              onClick={onTogglePathDebug}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-mono flex items-center justify-between transition cursor-pointer ${
                showPathDebug
                  ? 'bg-cyan-600/30 border-cyan-500 text-white font-bold ring-1 ring-cyan-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <span>Draw Agent A* Navigation Lines</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${showPathDebug ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                {showPathDebug ? 'ENABLED' : 'DISABLED'}
              </span>
            </button>
          </div>

          {/* Controls Reminder Guide */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Keyboard & Interaction Controls</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">
                  W A S D / Arrows
                </span>
                <span className="text-slate-400">Move</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">
                  Click / Tap
                </span>
                <span className="text-slate-400">Path to Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">
                  E / Enter
                </span>
                <span className="text-slate-400">Talk / Interact</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">
                  Space
                </span>
                <span className="text-slate-400">Sit on Bench/Chair</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
