import React, { useEffect, useRef, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CornerDownLeft,
  Cpu,
  FileText,
  ListTodo,
  LogOut,
  MessageSquare,
  Play,
  PlusCircle,
  RefreshCw,
  Send,
  Sparkles,
  Users,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { AgentDefinition, AIAgent, MeetingUtterance, MultiAgentMeetingSession, TaskItem } from '../types';
import { GameEngine } from '../game/gameEngine';
import { getAllAgentDefinitions } from '../agents/agentDefinitions';
import { MeetingManager, PRESET_MEETING_AGENDAS, PresetAgenda } from '../services/meetingManager';

interface MeetingRoomModalProps {
  engine?: GameEngine | null;
  onClose: () => void;
  onTaskCreated?: (task: {
    title: string;
    description: string;
    category: 'Growth' | 'Engineering' | 'Design' | 'Product' | 'Operations';
  }) => void;
}

export const MeetingRoomModal: React.FC<MeetingRoomModalProps> = ({
  engine,
  onClose,
  onTaskCreated,
}) => {
  const [session, setSession] = useState<MultiAgentMeetingSession | null>(MeetingManager.getSession());
  const [selectedAgenda, setSelectedAgenda] = useState<string>(PRESET_MEETING_AGENDAS[0].title);
  const [customAgenda, setCustomAgenda] = useState<string>('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['nova', 'pixel', 'closer', 'orbit', 'coach']);
  const [isConvening, setIsConvening] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isAdjourning, setIsAdjourning] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [targetedSpeaker, setTargetedSpeaker] = useState<string>('auto');
  const [activeTab, setActiveTab] = useState<'transcript' | 'action_items'>('transcript');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to session updates
  useEffect(() => {
    const unsub = MeetingManager.subscribe((newSession) => {
      setSession(newSession);
    });
    return unsub;
  }, []);

  // Auto-scroll transcript on new utterances
  useEffect(() => {
    if (session?.transcript.length) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.transcript.length, isAdvancing]);

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const handleConvene = async () => {
    const agendaText = customAgenda.trim() || selectedAgenda;
    if (!agendaText || selectedAgents.length === 0 || isConvening) return;

    setIsConvening(true);
    try {
      await MeetingManager.conveneMeeting(agendaText, selectedAgents, engine);
    } catch (err) {
      console.error('Failed to convene meeting:', err);
    } finally {
      setIsConvening(false);
    }
  };

  const handleAutoRun = async () => {
    const agendaText = customAgenda.trim() || selectedAgenda;
    if (!agendaText || selectedAgents.length === 0 || isConvening) return;

    setIsConvening(true);
    try {
      await MeetingManager.runAutomatedDiscussion(agendaText, selectedAgents, 3, engine);
    } catch (err) {
      console.error('Failed to auto-run meeting:', err);
    } finally {
      setIsConvening(false);
    }
  };

  const handleNextTurn = async () => {
    if (isAdvancing || !session || session.status !== 'in_session') return;
    setIsAdvancing(true);
    try {
      const target = targetedSpeaker === 'auto' ? undefined : targetedSpeaker;
      await MeetingManager.advanceTurn(undefined, target, engine);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = userInput.trim();
    if (!prompt || isAdvancing || !session || session.status !== 'in_session') return;

    setUserInput('');
    setIsAdvancing(true);
    try {
      const target = targetedSpeaker === 'auto' ? undefined : targetedSpeaker;
      await MeetingManager.advanceTurn(prompt, target, engine);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleAdjourn = async () => {
    if (isAdjourning || !session) return;
    setIsAdjourning(true);
    try {
      await MeetingManager.adjournMeeting(engine);
    } finally {
      setIsAdjourning(false);
    }
  };

  const handleApplyTask = (task: TaskItem) => {
    if (onTaskCreated) {
      onTaskCreated({
        title: task.title,
        description: task.description,
        category: task.category,
      });
    }
  };

  const handleApplyAllTasks = () => {
    if (!session || !onTaskCreated) return;
    for (const task of session.actionItems) {
      onTaskCreated({
        title: task.title,
        description: task.description,
        category: task.category,
      });
    }
  };

  const handleResetSession = () => {
    MeetingManager.reset();
    setSession(null);
  };

  const allAgentsList: AgentDefinition[] = getAllAgentDefinitions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-none animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[780px] pointer-events-auto ring-1 ring-black/50">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-mono tracking-tight">
                  Meeting Room & Multi-Agent Workspace
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    !session || session.status === 'idle'
                      ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                      : session.status === 'in_session'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse'
                      : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  {!session || session.status === 'idle'
                    ? 'Setup Agenda'
                    : session.status === 'in_session'
                    ? '● Live Discussion'
                    : '✓ Adjourned'}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Synchronize Nova, Pixel, Closer, Orbit & Coach around the Conference Table
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-elevated)] transition cursor-pointer"
            title="Close workspace"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View 1: Setup & Convene Meeting */}
        {(!session || session.status === 'idle') && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Agenda Selection */}
            <div>
              <label className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider block mb-2">
                1. Select Strategic Agenda
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
                {PRESET_MEETING_AGENDAS.map((preset) => {
                  const isSelected = selectedAgenda === preset.title && !customAgenda;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedAgenda(preset.title);
                        setCustomAgenda('');
                        setSelectedAgents(preset.recommendedAttendees);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <h4 className="text-xs font-bold font-mono text-indigo-300 mb-1">
                        {preset.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {preset.recommendedAttendees.map((id) => (
                          <span
                            key={id}
                            className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300 border border-slate-700"
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Agenda Input */}
              <div className="relative">
                <input
                  type="text"
                  value={customAgenda}
                  onChange={(e) => setCustomAgenda(e.target.value)}
                  placeholder="Or type a custom strategic meeting topic..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Invite Attendees */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider block">
                  2. Invite Agent Colleagues to Shared Table
                </label>
                <span className="text-[11px] font-mono text-indigo-400">
                  {selectedAgents.length} of {allAgentsList.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {allAgentsList.map((agent) => {
                  const isInvited = selectedAgents.includes(agent.id);
                  return (
                    <div
                      key={agent.id}
                      onClick={() => toggleAgentSelection(agent.id)}
                      className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                        isInvited
                          ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40 text-white'
                          : 'bg-slate-950/50 border-slate-800/80 opacity-60 hover:opacity-100 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs font-mono shadow-inner"
                          style={{
                            backgroundColor:
                              agent.id === 'nova'
                                ? '#3b82f6'
                                : agent.id === 'pixel'
                                ? '#ec4899'
                                : agent.id === 'closer'
                                ? '#10b981'
                                : agent.id === 'orbit'
                                ? '#8b5cf6'
                                : '#f59e0b',
                          }}
                        >
                          {agent.name.charAt(0)}
                        </div>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isInvited
                              ? 'bg-indigo-600 text-white'
                              : 'border border-slate-700 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold font-mono text-white">{agent.name}</h5>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{agent.role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Convene Action Footer */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-400 max-w-sm">
                Gather characters around the Conference Table. Choose manual control or fully automated discussion.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConvene}
                  disabled={isConvening || selectedAgents.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-mono text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Manual Mode</span>
                </button>
                <button
                  onClick={handleAutoRun}
                  disabled={isConvening || selectedAgents.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition"
                >
                  {isConvening ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running Sequence...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Auto-Run Discussion</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Live Meeting Discussion */}
        {session && session.status === 'in_session' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Session Sub-Header */}
            <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider shrink-0">
                  Agenda:
                </span>
                <span className="text-xs font-bold text-white font-mono truncate">
                  {session.agenda}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'transcript'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion ({session.transcript.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('action_items')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'action_items'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>Action Items ({session.actionItems.length})</span>
                </button>
                <button
                  onClick={handleAdjourn}
                  disabled={isAdjourning}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-mono transition cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isAdjourning ? 'Synthesizing...' : 'Adjourn Meeting'}</span>
                </button>
              </div>
            </div>

            {/* Main Area: Transcript or Action Items */}
            {activeTab === 'transcript' ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {session.transcript.map((utterance) => {
                  const isUser = utterance.speakerId === 'founder';
                  return (
                    <div
                      key={utterance.id}
                      className={`flex gap-3.5 ${
                        isUser ? 'flex-row-reverse text-right' : 'flex-row text-left'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs font-mono shadow shrink-0 ${
                          isUser ? 'bg-sky-600' : 'bg-indigo-600'
                        }`}
                        style={{
                          backgroundColor:
                            utterance.speakerId === 'nova'
                              ? '#3b82f6'
                              : utterance.speakerId === 'pixel'
                              ? '#ec4899'
                              : utterance.speakerId === 'closer'
                              ? '#10b981'
                              : utterance.speakerId === 'orbit'
                              ? '#8b5cf6'
                              : utterance.speakerId === 'coach'
                              ? '#f59e0b'
                              : undefined,
                        }}
                      >
                        {utterance.speakerName.charAt(0)}
                      </div>

                      {/* Content Bubble */}
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 border ${
                          isUser
                            ? 'bg-sky-950/50 border-sky-600/50 text-slate-100 rounded-tr-sm'
                            : 'bg-slate-950/70 border-slate-800 text-slate-200 rounded-tl-sm'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-1.5 ${
                            isUser ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span className="text-xs font-bold font-mono text-white">
                            {utterance.speakerName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {utterance.speakerRole}
                          </span>
                          {utterance.animation && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {utterance.animation}
                            </span>
                          )}
                        </div>

                        <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
                          {utterance.text}
                        </div>

                        {/* Generated Task Card inside Utterance */}
                        {utterance.createdTask && (
                          <div className="mt-3 p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between gap-3 text-left">
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">
                                Generated Action Task
                              </span>
                              <h6 className="text-xs font-bold text-white font-mono truncate">
                                {utterance.createdTask.title}
                              </h6>
                              <p className="text-[10px] text-slate-300 truncate">
                                {utterance.createdTask.description}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleApplyTask({
                                  id: `task_${Date.now()}`,
                                  title: utterance.createdTask!.title,
                                  description: utterance.createdTask!.description,
                                  category: utterance.createdTask!.category,
                                  status: 'todo',
                                  progress: 0,
                                  priority: 'high',
                                  xpReward: 150,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold shrink-0 cursor-pointer transition flex items-center gap-1"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Add to Backlog</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Advancing Indicator */}
                {isAdvancing && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 text-xs font-mono animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Colleagues are conferring at the table...</span>
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>
            ) : (
              /* Action Items Tab */
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
                    Agreed Strategic Action Items
                  </h4>
                  {session.actionItems.length > 0 && (
                    <button
                      onClick={handleApplyAllTasks}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Apply All to Backlog</span>
                    </button>
                  )}
                </div>

                {session.actionItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-xl">
                    No action items recorded yet. Continue discussion or ask the room to synthesize next steps.
                  </div>
                ) : (
                  session.actionItems.map((task, idx) => (
                    <div
                      key={task.id || idx}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold font-mono text-white">
                            {task.title}
                          </span>
                          {task.assignedToAgentId && (
                             <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/50 text-amber-400 border border-amber-800/50 flex items-center gap-1">
                               <Users className="w-3 h-3" />
                               {task.assignedToAgentId.replace('agent_', '').toUpperCase()}
                             </span>
                          )}
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {task.category}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${task.priority === 'high' ? 'bg-rose-950 text-rose-400 border-rose-800' : task.priority === 'medium' ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{task.description}</p>
                      </div>

                      <button
                        onClick={() => handleApplyTask(task)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-xs flex items-center gap-1 cursor-pointer transition shrink-0"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Bottom Interaction Bar */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 shrink-0 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-slate-400">
                  <span className="shrink-0 text-slate-500">Target Speaker:</span>
                  <button
                    onClick={() => setTargetedSpeaker('auto')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition ${
                      targetedSpeaker === 'auto'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Auto-Next
                  </button>
                  {session.attendeeIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => setTargetedSpeaker(id)}
                      className={`px-2 py-0.5 rounded uppercase cursor-pointer transition ${
                        targetedSpeaker === id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {id}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextTurn}
                  disabled={isAdvancing}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Next Turn</span>
                </button>
              </div>

              <form onSubmit={handleSendPrompt} className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask a question or steer the meeting..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || isAdvancing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask Room</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* View 3: Adjourned Executive Summary */}
        {session && session.status === 'adjourned' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold font-mono text-emerald-400 mb-1">
                  Strategic Decision Reached
                </h4>
                <p className="text-sm font-semibold text-white leading-relaxed mb-3">
                  {session.decision}
                </p>
                {session.nextSteps && (
                  <>
                    <h4 className="text-[10px] font-bold font-mono text-emerald-500/70 uppercase mb-1">
                      Immediate Next Steps
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {session.nextSteps}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Generated Backlog Tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase">
                  Actionable Sprint Backlog ({session.actionItems.length})
                </h4>
                {session.actionItems.length > 0 && (
                  <button
                    onClick={handleApplyAllTasks}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Apply All to Backlog (+XP)</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {session.actionItems.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold font-mono text-white">
                          {task.title}
                        </span>
                        {task.assignedToAgentId && (
                           <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/50 text-amber-400 border border-amber-800/50 flex items-center gap-1">
                             <Users className="w-3 h-3" />
                             {task.assignedToAgentId.replace('agent_', '').toUpperCase()}
                           </span>
                        )}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {task.category}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          +{task.xpReward} XP
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${task.priority === 'high' ? 'bg-rose-950 text-rose-400 border-rose-800' : task.priority === 'medium' ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{task.description}</p>
                    </div>

                    <button
                      onClick={() => handleApplyTask(task)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-xs flex items-center gap-1 cursor-pointer transition shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleResetSession}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs cursor-pointer transition"
              >
                Convene Another Meeting
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold cursor-pointer transition"
              >
                Return to Virtual Office
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
