import React, { useState } from 'react';
import { Hammer, Move, RotateCw, Trash2, X } from 'lucide-react';
import { WorldObject } from '../types';

interface BuildModeToolbarProps {
  onClose: () => void;
  onSelectFurniture: (type: string) => void;
  selectedFurnitureType: string | null;
  activeAction: 'place' | 'move' | 'rotate' | 'remove';
  onActionChange: (action: 'place' | 'move' | 'rotate' | 'remove') => void;
}

export const BuildModeToolbar: React.FC<BuildModeToolbarProps> = ({
  onClose,
  onSelectFurniture,
  selectedFurnitureType,
  activeAction,
  onActionChange,
}) => {
  const categories = [
    { type: 'desk', label: 'Desk' },
    { type: 'computer_desk', label: 'Computer Desk' },
    { type: 'chair', label: 'Chair' },
    { type: 'couch', label: 'Couch' },
    { type: 'plant', label: 'Plant' },
    { type: 'bookshelf', label: 'Shelf' },
    { type: 'bed', label: 'Bed' },
    { type: 'decoration', label: 'Decor' },
    { type: 'table', label: 'Table' },
    { type: 'whiteboard', label: 'Whiteboard' },
    { type: 'board', label: 'Board' },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-3xl mb-4 pointer-events-auto">
      <div className="bg-slate-900 border border-amber-500/50 rounded-xl shadow-2xl p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 text-amber-400" />
            <span className="text-white font-mono font-bold text-sm">BUILD MODE</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1 border-r border-slate-800 pr-4">
            <button
              onClick={() => onActionChange('place')}
              className={`p-2 rounded-lg transition ${
                activeAction === 'place' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Place"
            >
              <Hammer className="w-4 h-4" />
            </button>
            <button
              onClick={() => onActionChange('move')}
              className={`p-2 rounded-lg transition ${
                activeAction === 'move' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Move"
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              onClick={() => onActionChange('rotate')}
              className={`p-2 rounded-lg transition ${
                activeAction === 'rotate' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onActionChange('remove')}
              className={`p-2 rounded-lg transition ${
                activeAction === 'remove' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.type}
                onClick={() => {
                  onActionChange('place');
                  onSelectFurniture(cat.type);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition border ${
                  selectedFurnitureType === cat.type && activeAction === 'place'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
