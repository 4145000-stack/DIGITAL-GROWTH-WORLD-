import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Send, Smile } from 'lucide-react';
import { ChatMessage, EmoteType } from '../types';

interface BottomChatBarProps {
  onSendMessage: (text: string) => void;
  recentMessages: ChatMessage[];
  onOpenFullChat: () => void;
  onTriggerEmote?: (emote: EmoteType) => void;
}

const AVAILABLE_EMOTES: { type: EmoteType; icon: string; label: string }[] = [
  { type: 'wave', icon: '👋', label: 'Wave' },
  { type: 'happy', icon: '😄', label: 'Happy' },
  { type: 'heart', icon: '❤️', label: 'Heart' },
  { type: 'confused', icon: '❓', label: 'Confused' },
  { type: 'laugh', icon: '😂', label: 'Laugh' },
  { type: 'sad', icon: '😢', label: 'Sad' },
  { type: 'angry', icon: '😠', label: 'Angry' },
  { type: 'thumb_up', icon: '👍', label: 'Thumbs Up' },
  { type: 'idea', icon: '💡', label: 'Idea' },
  { type: 'fire', icon: '🔥', label: 'Fire' },
];

export const BottomChatBar: React.FC<BottomChatBarProps> = ({
  onSendMessage,
  recentMessages,
  onOpenFullChat,
  onTriggerEmote,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showEmotes, setShowEmotes] = useState(false);
  const emoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emoteRef.current && !emoteRef.current.contains(event.target as Node)) {
        setShowEmotes(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const lastMessage = recentMessages[recentMessages.length - 1];

  return (
    <div className="absolute bottom-3 left-3 z-30 flex flex-col gap-2 max-w-md select-none">
      {/* Emote Picker Popup */}
      {showEmotes && (
        <div ref={emoteRef} className="absolute bottom-full mb-2 left-0 bg-[var(--color-surface)]/95 border border-[var(--color-border)] rounded-xl shadow-2xl backdrop-blur p-2 w-64 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="text-[10px] font-mono text-[var(--color-text-muted)] mb-2 uppercase tracking-wider px-1">Character Emotes</div>
          <div className="grid grid-cols-5 gap-1">
            {AVAILABLE_EMOTES.map((emote) => (
              <button
                key={emote.type}
                onClick={() => {
                  if (onTriggerEmote) onTriggerEmote(emote.type);
                  setShowEmotes(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--color-surface-elevated)] rounded-lg transition cursor-pointer"
                title={emote.label}
              >
                {emote.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent floating chat preview pill if not expanded */}
      {!isOpen && lastMessage && (
        <div
          onClick={onOpenFullChat}
          className="bg-[var(--color-surface)]/80 hover:bg-[var(--color-surface-elevated)]/90 text-[var(--color-text-primary)] text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] backdrop-blur shadow-md flex items-center gap-2 cursor-pointer transition max-w-sm truncate"
        >
          <span className="text-[var(--color-focus)] font-semibold font-mono text-[11px]">
            {lastMessage.senderName}:
          </span>
          <span className="truncate text-[var(--color-text-secondary)]">{lastMessage.text}</span>
        </div>
      )}

      {/* The Bottom-Left Chat Bar matching screenshot */}
      {!isOpen ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-between gap-4 bg-[var(--color-surface)]/90 hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3.5 py-1.5 rounded border border-[var(--color-border)] backdrop-blur shadow-lg transition cursor-pointer text-xs font-mono w-48 sm:w-64"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
              <span>Chat</span>
            </span>
            <Plus className="w-3.5 h-3.5 text-[var(--color-text-secondary)] hover:text-[var(--color-focus)] transition" />
          </button>
          <button
            onClick={() => setShowEmotes(!showEmotes)}
            className="p-1.5 bg-[var(--color-surface)]/90 hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded border border-[var(--color-border)] backdrop-blur shadow-lg transition cursor-pointer"
            title="Emotes"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-[var(--color-surface)]/95 border border-[var(--color-border)] rounded-lg p-1.5 shadow-2xl backdrop-blur w-72 sm:w-96 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <button
            type="button"
            onClick={() => setShowEmotes(!showEmotes)}
            className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] rounded transition cursor-pointer"
            title="Emotes"
          >
            <Smile className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type in-world message (press Enter)..."
            autoFocus
            className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded px-2.5 py-1 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-focus)] font-mono"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 disabled:opacity-40 text-[var(--color-text-primary)] rounded transition cursor-pointer"
            title="Send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-1 py-0.5 rounded cursor-pointer"
          >
            Esc
          </button>
        </form>
      )}
    </div>
  );
};
