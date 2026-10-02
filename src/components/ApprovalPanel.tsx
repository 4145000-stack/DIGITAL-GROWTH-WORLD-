import React from 'react';
import { ApprovalRequest } from '../types';
import { ShieldCheck, ShieldAlert, XCircle, CheckCircle2 } from 'lucide-react';
import { bosManager } from '../services/bosManager';
import { approvalService } from '../services/execution/approvalService';

interface ApprovalPanelProps {
  approvals: ApprovalRequest[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  approvals,
  onClose,
  onApprove,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[var(--color-background)]/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-elevated)]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="font-mono text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
              Human-in-the-Loop Approvals
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-background)] transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {approvals.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-muted)] font-mono text-sm">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-500" />
              All systems nominal. No pending approvals.
            </div>
          ) : (
            approvals.map((req) => (
              <div key={req.id} className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-background)]">
                <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      req.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      req.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {req.riskLevel} RISK
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
                      {req.action}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
                    Agent: {req.agentId}
                  </span>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {req.reason}
                  </div>
                  
                  {req.commercialValue && (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-[var(--color-text-muted)]">Commercial Impact:</span>
                      <span className="font-bold text-emerald-400">${req.commercialValue.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)] font-mono text-[10px] text-[var(--color-text-secondary)] overflow-x-auto">
                    <pre>{JSON.stringify(req.payload, null, 2)}</pre>
                  </div>
                  
                  <div className="pt-2 flex items-center gap-3 justify-end">
                    <button
                      onClick={() => onReject(req.id)}
                      className="px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => onApprove(req.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Authorize & Execute
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
