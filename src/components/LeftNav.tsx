import React from 'react';
import { DGWIcon, DGWIconProps } from './DGWIcon';

export type NavItemKey =
  | 'world'
  | 'home'
  | 'agents'
  | 'opportunities'
  | 'funnels'
  | 'leads'
  | 'marketing'
  | 'projects'
  | 'money'
  | 'analytics'
  | 'audits'
  | 'meeting'
  | 'tasks'
  | 'settings';

interface LeftNavProps {
  activeItem: NavItemKey;
  onSelect: (item: NavItemKey) => void;
  pendingTasksCount?: number;
  unreadChatCount?: number;
  activeOpportunitiesCount?: number;
}

interface NavConfig {
  id: NavItemKey;
  label: string;
  iconName: DGWIconProps['name'];
  badge?: number;
  badgeColor?: string;
  tag?: string;
}

export const LeftNav: React.FC<LeftNavProps> = ({
  activeItem,
  onSelect,
  pendingTasksCount = 0,
  unreadChatCount = 0,
  activeOpportunitiesCount = 4,
}) => {
  const primaryNav: NavConfig[] = [
    { id: 'world', label: 'Virtual World', iconName: 'world', tag: 'HQ' },
    { id: 'home', label: 'Command Centre', iconName: 'home' },
    { id: 'opportunities', label: 'Opportunities', iconName: 'opportunities', badge: activeOpportunitiesCount, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
    { id: 'agents', label: 'AI Agents', iconName: 'agents', tag: '5 LIVE' },
    { id: 'funnels', label: 'Funnels', iconName: 'funnels' },
    { id: 'leads', label: 'Leads & CRM', iconName: 'leads' },
    { id: 'marketing', label: 'Marketing', iconName: 'marketing' },
    { id: 'projects', label: 'Projects', iconName: 'projects' },
    { id: 'money', label: 'Money & MRR', iconName: 'money' },
    { id: 'analytics', label: 'Analytics', iconName: 'analytics' },
    { id: 'audits', label: 'Strategy Audits', iconName: 'reports' },
  ];

  const secondaryNav: NavConfig[] = [
    { id: 'meeting', label: 'Meeting Room', iconName: 'meeting' },
    { id: 'tasks', label: 'Tasks & Sprints', iconName: 'tasks', badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, badgeColor: 'bg-cyan-500 text-slate-950' },
    { id: 'settings', label: 'Settings', iconName: 'settings' },
  ];

  return (
    <aside className="h-full w-16 md:w-56 bg-[var(--color-surface)]/95 border-r border-[var(--color-border)] flex flex-col justify-between p-2 select-none z-30 shrink-0 backdrop-blur-md">
      {/* Primary Navigation Section */}
      <div className="space-y-1">
        <div className="hidden md:block px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] font-bold">
          Navigation
        </div>

        {primaryNav.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition group relative cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
              }`}
              title={item.label}
            >
              <div className={`${isActive ? 'text-cyan-400' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'} shrink-0`}>
                <DGWIcon name={item.iconName} size={18} />
              </div>

              <span className="hidden md:inline truncate">{item.label}</span>

              {/* Badge if present */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`hidden md:flex ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono leading-none ${
                    item.badgeColor || 'bg-cyan-500 text-slate-950'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tag if present */}
              {item.tag && (
                <span className="hidden md:flex ml-auto text-[9px] font-mono px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {item.tag}
                </span>
              )}

              {/* Mobile Tooltip */}
              <div className="md:hidden absolute left-full ml-2 px-2 py-1 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] whitespace-nowrap shadow-lg hidden group-hover:flex z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Secondary / Operational Section */}
      <div className="space-y-1 pt-3 border-t border-[var(--color-border)]">
        <div className="hidden md:block px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] font-bold">
          Collaboration
        </div>

        {secondaryNav.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition group relative cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
              }`}
              title={item.label}
            >
              <div className={`${isActive ? 'text-cyan-400' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'} shrink-0`}>
                <DGWIcon name={item.iconName} size={18} />
              </div>

              <span className="hidden md:inline truncate">{item.label}</span>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`hidden md:flex ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono leading-none ${
                    item.badgeColor || 'bg-cyan-500 text-slate-950'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              <div className="md:hidden absolute left-full ml-2 px-2 py-1 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] whitespace-nowrap shadow-lg hidden group-hover:flex z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
