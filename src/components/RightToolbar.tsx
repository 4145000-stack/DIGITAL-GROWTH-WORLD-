import React from 'react';
import {
  BookOpen,
  Briefcase,
  Coins,
  DollarSign,
  Hammer,
  Home,
  MessageSquare,
  Presentation,
  Settings,
  TrendingUp,
  User,
  Users,
  ClipboardCheck,
  FileText,
  Target,
  BarChart2
} from 'lucide-react';

export type ActivePanel =
  | 'settings'
  | 'agents'
  | 'meeting'
  | 'tasks'
  | 'business'
  | 'opportunities'
  | 'funnels'
  | 'money'
  | 'projects'
  | 'home'
  | 'profile'
  | 'chat'
  | 'build'
  | 'clients'
  | 'audits'
  | 'proposals'
  | 'leads'
  | 'marketing'
  | 'analytics'
  | null;

interface RightToolbarProps {
  activePanel: ActivePanel;
  onSelectPanel: (panel: ActivePanel) => void;
  unreadChatCount?: number;
  pendingTasksCount?: number;
}

export const RightToolbar: React.FC<RightToolbarProps> = ({
  activePanel,
  onSelectPanel,
  unreadChatCount = 0,
  pendingTasksCount = 0,
}) => {
  const tools = [
    {
      id: 'build' as const,
      label: 'Build',
      icon: Hammer,
      color: 'text-[var(--color-warning)]',
      bgHover: 'hover:bg-[var(--color-warning)]/20',
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      color: 'text-[var(--color-text-secondary)]',
      bgHover: 'hover:bg-[var(--color-surface-elevated)]',
    },
    {
      id: 'agents' as const,
      label: 'Agents',
      icon: Users,
      color: 'text-[var(--color-focus)]',
      bgHover: 'hover:bg-[var(--color-focus)]/20',
    },
    {
      id: 'meeting' as const,
      label: 'Meeting Room',
      icon: Presentation,
      color: 'text-[var(--color-accent)]',
      bgHover: 'hover:bg-[var(--color-accent)]/20',
    },
    {
      id: 'tasks' as const,
      label: 'Tasks',
      icon: BookOpen,
      color: 'text-[var(--color-warning)]',
      bgHover: 'hover:bg-[var(--color-warning)]/20',
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'clients' as const,
      label: 'Clients',
      icon: Users,
      color: 'text-[var(--color-success)]',
      bgHover: 'hover:bg-[var(--color-success)]/20',
    },
    {
      id: 'leads' as const,
      label: 'Leads',
      icon: Target,
      color: 'text-[var(--color-danger)]',
      bgHover: 'hover:bg-[var(--color-danger)]/20',
    },
    {
      id: 'marketing' as const,
      label: 'Marketing',
      icon: TrendingUp,
      color: 'text-[var(--color-agent)]',
      bgHover: 'hover:bg-[var(--color-agent)]/20',
    },
    {
      id: 'audits' as const,
      label: 'Audits',
      icon: ClipboardCheck,
      color: 'text-[var(--color-warning)]',
      bgHover: 'hover:bg-[var(--color-warning)]/20',
    },
    {
      id: 'proposals' as const,
      label: 'Proposals',
      icon: FileText,
      color: 'text-[var(--color-accent)]',
      bgHover: 'hover:bg-[var(--color-accent)]/20',
    },
    {
      id: 'projects' as const,
      label: 'Projects',
      icon: Briefcase,
      color: 'text-[var(--color-focus)]',
      bgHover: 'hover:bg-[var(--color-focus)]/20',
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart2,
      color: 'text-[var(--color-focus)]',
      bgHover: 'hover:bg-[var(--color-focus)]/20',
    },
    {
      id: 'chat' as const,
      label: 'Chat',
      icon: MessageSquare,
      color: 'text-[var(--color-accent)]',
      bgHover: 'hover:bg-[var(--color-accent)]/20',
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
    },
  ];

  return (
    <aside className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center select-none">
        <div className="flex flex-col gap-1.5 p-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl backdrop-blur-md">
          {tools.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPanel(isActive ? null : item.id)}
                className={`relative p-2.5 rounded-lg transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-inner ring-1 ring-[var(--color-focus)]'
                    : `text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] ${item.bgHover}`
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 ${item.color} transition-transform group-hover:scale-110`} />

                {/* Badge for notifications */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-bold text-[var(--color-text-primary)] shadow">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on hover */}
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center">
                  <span className="px-2 py-1 text-xs font-medium text-[var(--color-text-primary)] bg-[var(--color-background)] border border-[var(--color-border)] rounded shadow-md whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
    </aside>
  );
};
