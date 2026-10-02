import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Plus,
  X,
} from 'lucide-react';
import { AIAgent, TaskItem } from '../types';

interface TasksModalProps {
  tasks: TaskItem[];
  agents: AIAgent[];
  onToggleTaskStatus: (taskId: string) => void;
  onAddTask: (newTask: Omit<TaskItem, 'id'>) => void;
  onClose: () => void;
}

export const TasksModal: React.FC<TasksModalProps> = ({
  tasks,
  agents,
  onToggleTaskStatus,
  onAddTask,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'Growth' | 'Engineering' | 'Design' | 'Product'>('Growth');
  const [newAgentId, setNewAgentId] = useState('agent_maya');

  const taskList = tasks || [];
  const filteredTasks = taskList.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Workplace growth milestone',
      category: newCategory,
      assignedToAgentId: newAgentId,
      status: 'todo',
      priority: 'medium',
      xpReward: 300,
    });

    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  const totalXP = taskList
    .filter((t) => t.status === 'done')
    .reduce((acc, t) => acc + t.xpReward, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] pointer-events-auto ring-1 ring-black/50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-mono tracking-tight">
                Workplace Growth Backlog
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Tasks & milestones coordinated with AI colleagues
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs">
              <Award className="w-3.5 h-3.5" />
              <span>{totalXP} XP Earned</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-elevated)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar & Add button */}
        <div className="px-5 py-2.5 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {(['all', 'todo', 'in_progress', 'done'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded capitalize transition cursor-pointer ${
                  filter === tab
                    ? 'bg-[var(--color-surface-elevated)] text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>

        {/* New Task Inline Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateTask}
            className="p-4 bg-slate-950 border-b border-slate-800 space-y-3"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task Title (e.g., A/B test pricing page CTA)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newCategory}
                onChange={(e: any) => setNewCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-mono"
              >
                <option value="Growth">Growth</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
              </select>
              <select
                value={newAgentId}
                onChange={(e) => setNewAgentId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-mono"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    Assign to {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono rounded"
              >
                Add Task
              </button>
            </div>
          </form>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-mono">
              No tasks match this filter.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const assignedAgent = agents.find((a) => a.id === task.assignedToAgentId);
              const isDone = task.status === 'done';

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-65'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => onToggleTaskStatus(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h4
                        className={`text-xs font-bold font-mono ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                          {task.category}
                        </span>
                        {assignedAgent && (
                          <span className="text-[10px] text-sky-400 font-mono flex items-center gap-1">
                            <span>👤</span> {assignedAgent.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                      +{task.xpReward} XP
                    </span>
                    <span
                      className={`text-[9px] font-mono capitalize px-1.5 py-0.5 rounded ${
                        task.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : task.status === 'in_progress'
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
