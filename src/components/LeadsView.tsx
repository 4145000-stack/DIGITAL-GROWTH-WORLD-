import React, { useState } from 'react';
import { Lead } from '../types';
import { DGWIcon } from './DGWIcon';
import { Target, Users, Mail, DollarSign, Plus, CheckCircle2, ChevronRight, Phone } from 'lucide-react';

interface LeadsViewProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, 'id'>) => void;
  onSelectAgentToChat: (agentId: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ leads = [], onAddLead, onSelectAgentToChat }) => {
  const leadList = leads || [];
  const [showAddForm, setShowAddForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [source, setSource] = useState('Inbound');
  const [status, setStatus] = useState<Lead['status']>('new');
  const [estimatedValue, setEstimatedValue] = useState(25000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    onAddLead({
      companyName,
      contactName,
      source,
      status,
      estimatedValue: Number(estimatedValue),
    });
    setCompanyName('');
    setContactName('');
    setShowAddForm(false);
  };

  const getStatusBadge = (s: Lead['status']) => {
    switch (s) {
      case 'qualified':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'contacted':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'new':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'lost':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DGWIcon name="leads" size={20} className="text-cyan-400" />
            <h1 className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
              Leads & Commercial CRM Pipeline
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            High-intent prospects synchronized with CLOSER's sales cadences and objection playbooks.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Add Lead Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl bg-[var(--color-surface)] border border-cyan-500/40 shadow-xl space-y-3 font-mono"
        >
          <div className="text-xs font-bold text-cyan-300 uppercase">Create New Prospect</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="px-3 py-2 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-cyan-400"
            />
            <input
              type="text"
              placeholder="Contact Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="px-3 py-2 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-cyan-400"
            />
            <input
              type="number"
              placeholder="Estimated Value ($)"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(Number(e.target.value))}
              className="px-3 py-2 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-cyan-400"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-cyan-400"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 rounded text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Save Prospect
            </button>
          </div>
        </form>
      )}

      {/* Leads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {leadList.map((lead) => (
          <div
            key={lead.id}
            className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-cyan-500/40 transition flex flex-col justify-between gap-3 shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${getStatusBadge(lead.status)}`}>
                  {lead.status}
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  ${lead.estimatedValue.toLocaleString()}
                </span>
              </div>

              <div className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
                {lead.companyName}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Contact: {lead.contactName} • Source: {lead.source}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => onSelectAgentToChat('agent_closer')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <span>Closer Objection Script</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
