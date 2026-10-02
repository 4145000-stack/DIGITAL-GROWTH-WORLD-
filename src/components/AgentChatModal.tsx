import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  HelpCircle,
  PlusCircle,
  Send,
  Sparkles,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { AIAgent, AnimationState } from '../types';
import { getAgentDefinition } from '../agents/agentDefinitions';
import {
  AgentChatMessageItem,
  AgentIntelligenceService,
} from '../services/agentIntelligence';
import { GameEngine } from '../game/gameEngine';

interface AgentChatModalProps {
  agent: AIAgent;
  engine?: GameEngine | null;
  onClose: () => void;
  onStartFocusWithAgent: (agent: AIAgent) => void;
  onTaskCreated?: (task: {
    title: string;
    description: string;
    category: 'Growth' | 'Engineering' | 'Design' | 'Product' | 'Operations';
  }) => void;
}

export const AgentChatModal: React.FC<AgentChatModalProps> = ({
  agent,
  engine,
  onClose,
  onStartFocusWithAgent,
  onTaskCreated,
}) => {
  const def = getAgentDefinition(agent.id);
  const [messages, setMessages] = useState<AgentChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [aiState, setAiState] = useState<AnimationState>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDirectives, setShowDirectives] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load individual agent conversation context & set initial animation state
  useEffect(() => {
    const history = AgentIntelligenceService.getConversation(agent.id);
    setMessages([...history]);
    setAiState('talk');

    // Face towards player when talking
    if (engine) {
      engine.interactingAgentId = agent.id;
      engine.setAgentAnimation(agent.id, 'talk', {
        type: 'speech',
        text: `Connected with ${agent.name}`,
        expiresAt: Date.now() + 3000,
      });
    }

    return () => {
      if (engine) {
        if (engine.interactingAgentId === agent.id) {
          engine.interactingAgentId = null;
        }
        engine.clearAgentAnimation(agent.id);
      }
    };
  }, [agent.id, engine]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isProcessing) return;

    setInputText('');
    setIsProcessing(true);
    // AI analysing: animation = think
    setAiState('think');

    try {
      const result = await AgentIntelligenceService.sendMessage({
        agentId: agent.id,
        message: text,
        engine,
        onTaskCreated,
        onStartFocusSession: () => onStartFocusWithAgent(agent),
      });

      setAiState(result.animation);
      // Reload updated messages from context store
      const updatedHistory = AgentIntelligenceService.getConversation(agent.id);
      setMessages([...updatedHistory]);
    } catch (err) {
      console.error('Failed to send agent message:', err);
      setAiState('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyTask = (task: {
    title: string;
    description: string;
    category: 'Growth' | 'Engineering' | 'Design' | 'Product' | 'Operations';
  }) => {
    if (onTaskCreated) {
      onTaskCreated(task);
    }
  };

  const starterPrompts = def?.starterPrompts || [
    'What are your top priorities today?',
    'How can you help scale our business?',
    'Give me your best tactical advice right now.',
  ];

  const getAnimationBadge = () => {
    switch (aiState) {
      case 'think':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            <Brain className="w-3 h-3 text-amber-400" />
            <span>AI Analysing (think)</span>
          </span>
        );
      case 'work':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Cpu className="w-3 h-3 text-blue-400" />
            <span>AI Working (work)</span>
          </span>
        );
      case 'happy':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>AI Celebrating (happy)</span>
          </span>
        );
      case 'talk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Bot className="w-3 h-3 text-sky-400" />
            <span>AI Responding (talk)</span>
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-700/40 text-slate-400 border border-slate-700">
            <Zap className="w-3 h-3 text-slate-400" />
            <span>AI Standby (idle)</span>
          </span>
        );
    }
  };

  // Helper to render bold markdown and lists nicely without extra packages
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bullet list item
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().replace(/^[-*]\s+/, '') : line;

      // Parse **bold** parts
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const parsedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1">
            <span className="text-sky-400 text-xs">•</span>
            <span>{parsedParts}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }

      return <p key={idx}>{parsedParts}</p>;
    });
  };

  return (
    <div
      id="agent-chat-modal-backdrop"
      className="fixed bottom-4 right-4 z-[60] flex flex-col justify-end w-full max-w-sm pointer-events-none sm:w-[420px] animate-in slide-in-from-right-4 fade-in duration-200 select-none"
    >
      <div
        id="agent-chat-modal-container"
        className="relative w-full bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto max-h-[85vh] ring-1 ring-black/50"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <div className="flex items-center gap-3 min-w-0">
            {/* Visual Pixel Avatar Representation */}
            <div
              className="w-11 h-11 rounded-xl border border-[var(--color-border)] flex items-center justify-center relative overflow-hidden shadow-inner shrink-0"
              style={{
                backgroundColor:
                  def?.avatarColor || agent.customization.outfitColor || '#1e293b',
              }}
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  backgroundColor: agent.customization.skinColor || '#fcd34d',
                }}
              />
              <span className="absolute bottom-0 w-full h-3 bg-black/35" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-mono tracking-tight">
                  {def?.name || agent.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] text-[10px] font-mono border border-[var(--color-border)]">
                  {def?.department || agent.department}
                </span>
                {getAnimationBadge()}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {def?.role || agent.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowDirectives(!showDirectives)}
              className={`p-1.5 rounded-lg border text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
                showDirectives
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border-[var(--color-border)]'
              }`}
              title="View Agent System Instructions & Directives"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">System Prompt</span>
            </button>

            {agent.id === 'agent_coach' || def?.id === 'coach' ? (
              <button
                onClick={() => onStartFocusWithAgent(agent)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-lg transition cursor-pointer"
                title="Start 25-minute Pomodoro Sprint"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Start Sprint</span>
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-elevated)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Intelligence System Instructions Popover Tray */}
        {showDirectives && def && (
          <div className="bg-slate-950/95 border-b border-sky-500/30 p-4 text-xs space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between text-sky-400 font-mono text-[11px] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                Loaded Agent System Instructions
              </span>
              <span className="text-slate-500">ID: {def.id}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed font-mono whitespace-pre-wrap bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 max-h-36 overflow-y-auto">
              {def.systemInstructions}
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              <span className="text-[10px] text-slate-400 font-mono mr-1">Capabilities:</span>
              {def.capabilities.map((cap, cIdx) => (
                <span
                  key={cIdx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-300"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Agent Specialty & Status Bar */}
        <div className="px-4 sm:px-5 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="truncate text-slate-300">
              {def?.specialty || agent.specialty}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
            Context: Separate Layer
          </span>
        </div>

        {/* Message Log */}
        <div
          id="agent-chat-messages-container"
          className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[260px] bg-gradient-to-b from-slate-900/60 to-slate-950/80"
        >
          {messages.map((msg, i) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id || i}
                className={`flex gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
              >
                {isAgent && (
                  <div
                    className="w-7 h-7 rounded-lg border border-sky-500/40 flex items-center justify-center shrink-0 text-sky-400 shadow"
                    style={{
                      backgroundColor:
                        def?.avatarColor || agent.customization.outfitColor || '#0284c7',
                    }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-lg ${
                    isAgent
                      ? 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-sm'
                      : 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-sm'
                  }`}
                >
                  <div className="space-y-1">
                    {renderMessageContent(msg.text)}
                  </div>

                  {/* Optional Created Task Card */}
                  {msg.createdTask && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-200 flex items-start justify-between gap-2 shadow">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Generated Task: {msg.createdTask.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          {msg.createdTask.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApplyTask(msg.createdTask!)}
                        className="shrink-0 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  )}

                  {/* Suggested Action Pill */}
                  {msg.suggestedAction && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Suggested Action:
                      </span>
                      <button
                        onClick={() => handleSend(msg.suggestedAction)}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        <span>{msg.suggestedAction}</span>
                      </button>
                    </div>
                  )}

                  <span className="block text-[9px] opacity-45 mt-1.5 text-right font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {!isAgent && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 shadow">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-2.5 text-slate-300 text-xs py-2 px-3 bg-slate-800/40 rounded-xl border border-slate-800 w-fit">
              <Brain className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="font-mono text-[11px]">
                {def?.name || agent.name} is analysing... (animation = think)
              </span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Starter Prompts tailored to this Agent's specific role */}
        <div className="px-4 py-2.5 bg-[var(--color-surface-subtle)] border-t border-[var(--color-border)] flex flex-wrap gap-1.5">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isProcessing}
              className="text-[11px] font-mono text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] border border-[var(--color-border)] px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${def?.name || agent.name} (${def?.role || agent.role})...`}
            disabled={isProcessing}
            className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-cyan-400 font-mono disabled:opacity-60"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold disabled:opacity-40 rounded-xl transition cursor-pointer shadow active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
