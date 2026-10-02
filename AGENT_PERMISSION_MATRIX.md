# DIGITAL GROWTH WORLD™ — AGENT PERMISSION MATRIX
**Sprint:** 01 (Foundation Control)  

---

## 1. Security & Autonomy Level Definitions
- **Level 0 (Observe)**: Read-only access to public context and diagnostics.
- **Level 1 (Recommend)**: Propose recommendations and structured plans without state mutation.
- **Level 2 (Draft)**: Create drafts (e.g. draft tasks, draft proposals, draft ad copy).
- **Level 3 (Reversible Action)**: Directly execute non-destructive state mutations (e.g. start focus timer, assign task, update opportunity status).
- **Level 4 (High Impact)**: Requires explicit Human-in-the-Loop (HITL) approval before execution (e.g. send proposal, modify financial parameters, delete records).

---

## 2. Agent Permission Matrix

| Tool / Capability | NOVA | PIXEL | CLOSER | ORBIT | COACH | Required Level | HITL Approval Required? |
|---|---|---|---|---|---|---|---|
| `getAudit` | ALLOWED | DENIED | DENIED | DENIED | DENIED | Level 0 | No |
| `calculateReadiness` | ALLOWED | DENIED | DENIED | DENIED | DENIED | Level 0 | No |
| `createActionPlan` | ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED | Level 2 | No |
| `generateCampaign` | DENIED | ALLOWED | DENIED | DENIED | DENIED | Level 2 | No |
| `draftAdCopy` | DENIED | ALLOWED | DENIED | DENIED | DENIED | Level 2 | No |
| `qualifyLead` | DENIED | DENIED | ALLOWED | DENIED | DENIED | Level 3 | No |
| `sendProposal` | DENIED | DENIED | PROPOSE | DENIED | DENIED | Level 4 | **YES** |
| `createTask` | ALLOWED | ALLOWED | ALLOWED | ALLOWED | ALLOWED | Level 3 | No |
| `assignTask` | DENIED | DENIED | DENIED | ALLOWED | DENIED | Level 3 | No |
| `updateMilestone` | DENIED | DENIED | DENIED | ALLOWED | DENIED | Level 3 | No |
| `startFocusSession` | DENIED | DENIED | DENIED | DENIED | ALLOWED | Level 3 | No |
| `mutateFinance` | DENIED | DENIED | DENIED | DENIED | DENIED | Level 4 | **STRICTLY BLOCKED** |
