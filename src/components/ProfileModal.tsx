import React, { useState } from 'react';
import { Palette, Sparkles, User, X } from 'lucide-react';
import { CharacterCustomization } from '../types';

interface ProfileModalProps {
  customization: CharacterCustomization;
  playerName: string;
  onUpdateCustomization: (newCust: CharacterCustomization, newName: string) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  customization,
  playerName,
  onUpdateCustomization,
  onClose,
}) => {
  const [name, setName] = useState(playerName);
  const [hairStyle, setHairStyle] = useState(customization.hairStyle || 'spiky');
  const [hairColor, setHairColor] = useState(customization.hairColor || '#451a03');
  const [outfitColor, setOutfitColor] = useState(customization.outfitColor || '#1e293b');
  const [accessory, setAccessory] = useState(customization.accessory || 'tie');

  const outfitColors = [
    { label: 'Navy Suit', hex: '#1e293b' },
    { label: 'Charcoal', hex: '#334155' },
    { label: 'Executive Purple', hex: '#581c87' },
    { label: 'Emerald Tech', hex: '#065f46' },
    { label: 'Crimson', hex: '#991b1b' },
    { label: 'Cyan Visionary', hex: '#0284c7' },
  ];

  const hairColors = [
    { label: 'Espresso', hex: '#451a03' },
    { label: 'Raven Black', hex: '#0f172a' },
    { label: 'Chestnut', hex: '#78350f' },
    { label: 'Honey Blonde', hex: '#d97706' },
    { label: 'Cyber Cyan', hex: '#06b6d4' },
    { label: 'Lavender', hex: '#8b5cf6' },
  ];

  const hairStyles: Array<'short' | 'spiky' | 'bob' | 'ponytail' | 'curly'> = [
    'short',
    'spiky',
    'bob',
    'ponytail',
    'curly',
  ];

  const accessories: Array<'tie' | 'glasses' | 'visor' | 'headphones' | 'badge'> = [
    'tie',
    'glasses',
    'visor',
    'headphones',
    'badge',
  ];

  const handleSave = () => {
    onUpdateCustomization(
      {
        ...customization,
        hairStyle,
        hairColor,
        outfitColor,
        accessory,
      },
      name.trim() || 'Player'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-mono tracking-tight">
                Player Character Customizer
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Style your top-down avatar for Digital Growth World
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

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Avatar Preview & Name */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div
              className="w-16 h-16 rounded-xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden shadow-inner shrink-0"
              style={{ backgroundColor: outfitColor }}
            >
              {/* Hair block */}
              <div
                className="w-8 h-4 rounded-t-md"
                style={{ backgroundColor: hairColor }}
              />
              {/* Face block */}
              <div
                className="w-6 h-5 rounded-b-sm relative flex items-center justify-center"
                style={{ backgroundColor: customization.skinColor || '#fcd34d' }}
              >
                <div className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-slate-900" />
                  <span className="w-1 h-1 rounded-full bg-slate-900" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter character name..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Outfit Color */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-2">
              Suit / Outfit Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {outfitColors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setOutfitColor(c.hex)}
                  className={`h-8 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                    outfitColor === c.hex
                      ? 'ring-2 ring-sky-400 border-white'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-2">
              Hairstyle
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {hairStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setHairStyle(style)}
                  className={`py-1.5 rounded-lg border text-xs font-mono capitalize transition cursor-pointer ${
                    hairStyle === style
                      ? 'bg-sky-600/30 border-sky-500 text-white font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-2">
              Hair Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {hairColors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setHairColor(c.hex)}
                  className={`h-8 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                    hairColor === c.hex
                      ? 'ring-2 ring-sky-400 border-white'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Accessory */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-2">
              Accessory
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {accessories.map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setAccessory(acc)}
                  className={`py-1.5 rounded-lg border text-xs font-mono capitalize transition cursor-pointer ${
                    accessory === acc
                      ? 'bg-rose-600/30 border-rose-500 text-white font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold rounded-lg shadow transition cursor-pointer"
          >
            Save Appearance
          </button>
        </div>
      </div>
    </div>
  );
};
