import React, { useState } from 'react';
import { Bot, MessageSquare, Send, Sparkles, User, X } from 'lucide-react';
import { ChatMessage } from '../types';

interface GlobalChatModalProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export const GlobalChatModal: React.FC<GlobalChatModalProps> = ({
  messages = [],
  onSendMessage,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'agents' | 'system'>('all');

  const messageList = messages || [];
  const filtered = messageList.filter((m) => {
    if (filter === 'agents') return m.isAgent;
    if (filter === 'system') return m.channel === 'system';
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-mono tracking-tight">
                Workplace Broadcast Comms
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                In-world communication channel across all rooms
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

        {/* Filter bar */}
        <div className="px-5 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 text-xs font-mono">
          {(['all', 'agents', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded capitalize transition cursor-pointer ${
                filter === tab
                  ? 'bg-slate-800 text-white font-bold border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px]">
          {filtered.map((m) => (
            <div key={m.id} className="flex items-start gap-2.5 text-xs">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  m.isAgent
                    ? 'bg-sky-950 border-sky-700 text-sky-400'
                    : m.channel === 'system'
                    ? 'bg-amber-950 border-amber-700 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                {m.isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-white font-mono">{m.senderName}</span>
                  {m.senderRole && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {m.senderRole}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-600 font-mono ml-auto">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 leading-relaxed font-sans">
                  {m.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Broadcast to Digital Growth World..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg transition cursor-pointer shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
