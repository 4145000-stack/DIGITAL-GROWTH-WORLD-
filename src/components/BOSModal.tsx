import React, { useEffect, useState } from 'react';
import { bosManager, BOSStateSnapshot } from '../services/bosManager';
import { X, Users, ClipboardCheck, FileText, FolderGit2, Target, BarChart2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type BOSModule = 'clients' | 'audits' | 'proposals' | 'projects' | 'leads' | 'marketing' | 'analytics' | null;

interface BOSModalProps {
  module: BOSModule;
  onClose: () => void;
}

export const BOSModal: React.FC<BOSModalProps> = ({ module, onClose }) => {
  const [data, setData] = useState<BOSStateSnapshot>(() => bosManager.getSnapshot());

  useEffect(() => {
    const unsubscribe = bosManager.subscribe((snapshot) => {
      setData(snapshot);
    });
    return unsubscribe;
  }, []);

  if (!module) return null;

  const renderContent = () => {
    switch (module) {
      case 'clients':
        return (
          <div className="space-y-2">
            {(data.clients || []).map(c => (
              <div key={c.id} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex justify-between items-center">
                <div>
                  <div className="font-mono text-xs text-[var(--color-text-primary)]">{c.name}</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)]">{c.industry}</div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--color-success)] font-mono text-xs">${c.mrr}/mo</div>
                  <div className="text-[9px] text-[var(--color-text-secondary)] uppercase">{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'audits':
        return (
          <div className="space-y-2">
            {(data.audits || []).map(a => (
              <div key={a.id} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-mono text-xs text-[var(--color-text-primary)]">{a.title}</div>
                  <div className={`font-mono text-xs ${a.score > 90 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>{a.score}/100</div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(a.findings || []).map(f => (
                    <span key={f} className="text-[9px] px-1.5 py-0.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded text-[var(--color-text-secondary)]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'proposals':
        return (
          <div className="space-y-2">
            {(data.proposals || []).map(p => (
              <div key={p.id} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex justify-between items-center">
                <div>
                  <div className="font-mono text-xs text-[var(--color-text-primary)]">{p.title}</div>
                  <div className="text-[10px] text-[var(--color-accent)] uppercase">{p.status}</div>
                </div>
                <div className="text-[var(--color-success)] font-mono text-xs">${p.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-2">
            {(data.projects || []).map(p => (
              <div key={p.id} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-mono text-xs text-[var(--color-text-primary)]">{p.name}</div>
                  <div className="text-[10px] text-[var(--color-focus)] uppercase">{p.status}</div>
                </div>
                <div className="w-full bg-[var(--color-background)] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--color-focus)] h-full" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="text-[9px] text-[var(--color-text-secondary)] mt-1">{p.description}</div>
              </div>
            ))}
          </div>
        );
      case 'leads':
        return (
          <div className="space-y-2">
            {(data.leads || []).map(l => (
              <div key={l.id} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex justify-between items-center">
                <div>
                  <div className="font-mono text-xs text-[var(--color-text-primary)]">{l.companyName}</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)]">{l.contactName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--color-warning)] font-mono text-xs">${l.estimatedValue.toLocaleString()}</div>
                  <div className="text-[9px] text-[var(--color-text-secondary)] uppercase">{l.status}</div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'marketing':
        return (
          <div className="space-y-2">
            {(data.campaigns || []).map(c => (
              <div key={c.id} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-mono text-xs text-[var(--color-text-primary)]">{c.name}</div>
                  <div className="text-[10px] text-[var(--color-agent)] uppercase">{c.status}</div>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--color-text-secondary)]">
                  <span>Spend: <span className="text-[var(--color-text-primary)]">${c.spend}</span> / ${c.budget}</span>
                  <span>Leads: <span className="text-[var(--color-success)]">{c.leadsGenerated}</span></span>
                </div>
              </div>
            ))}
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-2 text-center">
                <div className="text-xs font-bold text-[var(--color-text-primary)] font-mono">{data.analytics?.pageViews?.toLocaleString() ?? 0}</div>
                <div className="text-[9px] text-[var(--color-text-secondary)] uppercase">Views</div>
              </div>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-2 text-center">
                <div className="text-xs font-bold text-[var(--color-success)] font-mono">{data.analytics?.conversionRate ?? 0}%</div>
                <div className="text-[9px] text-[var(--color-text-secondary)] uppercase">Conv.</div>
              </div>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-2 text-center">
                <div className="text-xs font-bold text-[var(--color-danger)] font-mono">{data.analytics?.bounceRate ?? 0}%</div>
                <div className="text-[9px] text-[var(--color-text-secondary)] uppercase">Bounce</div>
              </div>
            </div>
            <div className="space-y-1 mt-2">
              <div className="text-[10px] text-[var(--color-text-secondary)] uppercase mb-1">Top Channels</div>
              {(data.analytics?.topChannels || []).map(ch => (
                <div key={ch.channel} className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-text-primary)]">{ch.channel}</span>
                  <span className="font-mono text-[var(--color-focus)]">{ch.visitors.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getModuleTitle = () => {
    switch (module) {
      case 'clients': return { title: 'CLIENT DB', icon: Users, color: 'text-[var(--color-success)]' };
      case 'audits': return { title: 'STRATEGY AUDITS', icon: ClipboardCheck, color: 'text-[var(--color-warning)]' };
      case 'proposals': return { title: 'PROPOSALS', icon: FileText, color: 'text-[var(--color-accent)]' };
      case 'projects': return { title: 'ACTIVE PROJECTS', icon: FolderGit2, color: 'text-[var(--color-focus)]' };
      case 'leads': return { title: 'LEAD PIPELINE', icon: Target, color: 'text-[var(--color-danger)]' };
      case 'marketing': return { title: 'CAMPAIGNS', icon: TrendingUp, color: 'text-[var(--color-agent)]' };
      case 'analytics': return { title: 'SYSTEM ANALYTICS', icon: BarChart2, color: 'text-[var(--color-accent)]' };
      default: return { title: 'SYSTEM', icon: BarChart2, color: 'text-[var(--color-text-secondary)]' };
    }
  };

  const mod = getModuleTitle();
  const Icon = mod.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed top-1/2 right-20 -translate-y-1/2 w-72 bg-[var(--color-surface)]/90 backdrop-blur-md border border-[var(--color-border)] shadow-2xl rounded-lg z-[90] overflow-hidden flex flex-col pointer-events-auto"
        style={{ maxHeight: '70vh' }}
      >
        <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${mod.color}`} />
            <span className="font-mono text-xs font-bold text-[var(--color-text-primary)]">{mod.title}</span>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 overflow-y-auto custom-scrollbar flex-1">
          {renderContent()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
