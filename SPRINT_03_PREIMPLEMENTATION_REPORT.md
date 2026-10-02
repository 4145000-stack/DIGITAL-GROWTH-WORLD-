# DIGITAL GROWTH WORLD™ — SPRINT 03 PRE-IMPLEMENTATION REPORT
**Operational Intelligence & Autonomous Agent Execution**
*Report Date: 2026-09-15*

---

## 1. Executive Summary & Context
Sprint 01 established the 2.5D Isometric World Engine, physical character controllers, and real-time canvas rendering.
Sprint 02 decoupled and established the modular Business OS Domain layer (`taskService`, `opportunityService`, `leadService`, `financeService`) unified behind `bosManager` and persisted in durable local storage.

Sprint 03 elevates DIGITAL GROWTH WORLD™ from a passive database and conversational chatbot playground into an **operational intelligence system**. Domain events will trigger intelligence evaluations, generating transparently scored opportunities, high-intent signals, Next Best Actions, agent work queues, stateful executions with permissions & HITL approval, durable audit ledgers, and bidirectional virtual world reflection.

---

## 2. Audit of Existing Architecture

### 2.1 Existing Intelligence Logic
- `AgentIntelligenceService` (`src/services/agentIntelligence.ts`) currently processes conversational chat messages via `/api/chat` and triggers tool execution only when Gemini returns a JSON `toolCall`.
- Intelligence is currently **reactive to user chat prompts** rather than being **proactive, event-driven domain intelligence**.
- Next Best Action exists as a static or manually updated record in `OpportunityDomainService`, without an autonomous recommendation engine evaluating pipeline velocity or commercial intent.

### 2.2 Existing Agent Execution Flow
- Chat message → `/api/chat` → Optional `data.toolCall` → `agentToolRegistry.executeTool(agentId, toolName, args)` → Follow-up prompt to model → Return text.
- Agents lack state machines: an agent is either animating (`think`, `work`, `talk`) or idle. There are no explicit lifecycle states (`AVAILABLE`, `ASSIGNED`, `THINKING`, `EXECUTING`, `WAITING_APPROVAL`, `BLOCKED`, `COMPLETED`, `FAILED`).
- Agent workloads and queues do not exist as structured persistent entities; tasks only exist in the global sprint backlog.

### 2.3 Existing Tool Registry
- `AgentToolRegistryService` (`src/services/agentToolRegistry.ts`) contains 7 registered tools:
  1. `createTask` (Level 3, no HITL)
  2. `startFocusSession` (Level 3, Coach only, no HITL)
  3. `getAudit` (Level 0, Nova only)
  4. `createActionPlan` (Level 2, Nova & Orbit)
  5. `sendProposal` (Level 4, Closer only, requires HITL)
  6. `addLead` (Level 2, Closer & Nova)
  7. `updateOpportunity` (Level 2, Nova & Orbit)
- Current limitation: HITL for `sendProposal` returns `{ status: 'PENDING_FOUNDER_APPROVAL' }` but does not persist an approval request to a durable queue or provide a review/sign-off UI.

### 2.4 Existing EventBus Events
- Defined in `src/services/eventBus.ts`:
  `AGENT_SELECTED`, `AGENT_ANIMATION_CHANGED`, `TASK_CREATED`, `TASK_PROGRESS_UPDATED`, `TASK_COMPLETED`, `OPPORTUNITY_UPDATED`, `OPPORTUNITY_SCORE_CHANGED`, `NEXT_BEST_ACTION_UPDATED`, `LEAD_CREATED`, `LEAD_STATUS_CHANGED`, `PROPOSAL_CREATED`, `FINANCE_METRICS_UPDATED`, `MEETING_STARTED`, `MEETING_TURN_COMPLETED`, `FOCUS_SESSION_STARTED`, `FOCUS_SESSION_COMPLETED`, `AGENT_TOOL_REQUESTED`, `AGENT_TOOL_EXECUTED`, `NOTIFICATION_DISPATCHED`.
- Missing events: Signal events (`SIGNAL_EMITTED`, `SIGNAL_RESOLVED`), Approval events (`APPROVAL_REQUESTED`, `APPROVAL_RESOLVED`), Execution Ledger events (`EXECUTION_STARTED`, `EXECUTION_COMPLETED`, `EXECUTION_FAILED`), Work Queue events (`WORK_ITEM_ASSIGNED`, `WORK_ITEM_STATE_CHANGED`), Autonomy events (`AUTONOMY_LEVEL_CHANGED`).

### 2.5 Existing Agent States
- Visual/Animation states: `idle`, `walk`, `sit`, `work`, `think`, `talk`, `happy`, `alert`, `sleep`.
- Operational states: None (strings in `AIAgent.status` are purely descriptive labels like `"Strategic Planning"` or `"Sales Discovery"`).

### 2.6 Existing Approval Architecture
- `requiresHITLApproval: boolean` flag in tool registry.
- Stubs an approval string in execution results, but has no durable queue, no founder approval dialog/dock, and no persistence across browser refreshes.

### 2.7 Existing API Endpoints
- `GET /api/health`: Health check.
- `POST /api/chat`: Gemini interaction with function-calling fallbacks.
- `POST /api/meeting/turn`: Conference room turn generation.
- `POST /api/meeting/summary`: Meeting adjournment and action item synthesis.

### 2.8 Sprint 02 Domain Interfaces
- `taskService`: Sprint backlog, assigned agents, status (`todo`, `in_progress`, `done`), progress %, XP rewards.
- `opportunityService`: Opportunities with scoring, status, funnels, and NextBestAction.
- `leadService`: Leads, proposals, client accounts, strategy audits.
- `financeService`: MRR, ARR, pipeline valuation, gross margin, runway.
- `bosManager`: Unified facade with `getSnapshot(): BOSStateSnapshot` and event bus synchronization.

---

## 3. Integration Gaps & Risk Areas

| Domain Area | Current State | Gap / Risk | Sprint 03 Resolution |
| :--- | :--- | :--- | :--- |
| **Intelligence Triggering** | Only triggered by user chat prompt | Domain events (e.g. Lead created) do not trigger autonomous evaluation | Create `src/services/intelligence/` modular subscribers listening to domain events |
| **Scoring Transparency** | Numbers in `Opportunity` are hardcoded/opaque | No inspectable scoring factors or formula | Build explicit scoring engine with weighted factors: Intent (+25), Value (+20), Probability (+18), Urgency (+12), Fit (+8), Evidence (+4) |
| **Next Best Action** | Static snapshot property | Lacks dynamic recalculation based on global state | Dedicated `NextBestActionService` recalculating on state/signal changes with explicit rationale |
| **Signals & Anomalies** | No unified signal model | Anomalies (stalled deals, overdue tasks, capacity bottlenecks) go undetected | Build `SignalService` with deterministic anomaly rules & severity levels |
| **Agent Execution** | Synchronous tool execution in chat | No durable ledger, no task acceptance, no execution states | Implement `AgentExecutionService` state machine (`AVAILABLE` -> `EXECUTING` -> `WAITING_APPROVAL` -> `COMPLETED`) and `ToolExecutionLedger` |
| **Human In The Loop** | Static string response | Pending approvals disappear on reload; no UI to review/approve | Create `ApprovalService` with durable storage, founder review drawer, and approval/rejection lifecycle |
| **Agent Work Queues** | Tasks exist in generic backlog | No agent-specific prioritized work queue | Build `AgentWorkQueueService` mapping prioritized domain work items to Nova, Pixel, Closer, Orbit, Coach |
| **Autonomy Control** | Binary (can execute or cannot) | No founder-configurable autonomy level | Implement 5-tier Autonomy Matrix (Level 0: Observe to Level 4: Bounded Autonomous Execution) |
| **Learning Loop** | Non-existent | No measurement of action outcomes vs expected outcomes | Build `LearningService` recording action -> expected outcome -> actual outcome -> impact |

---

## 4. Migration & Implementation Plan

1. **Architecture & Types (`src/types.ts`)**:
   Add typed models for Signals, OpportunityScore, NextBestAction, AgentWorkItem, AgentExecutionRecord, ApprovalRequest, LearningRecord, and AutonomyLevel.
2. **Modular Intelligence Layer (`src/services/intelligence/`)**:
   - `signalService.ts`: Business signals and deterministic anomaly detection.
   - `opportunityIntelligence.ts`: Transparent multi-factor scoring engine.
   - `leadIntelligence.ts`: Lead qualification, temperature, and priority.
   - `nextBestActionService.ts`: Global state evaluation and inspectable action synthesis.
   - `agentContextService.ts`: Scoped operational memory builder (facts, history, recent tasks).
3. **Execution & Approval Subsystems (`src/services/execution/`)**:
   - `approvalService.ts`: Durable HITL approval queue with review, approve, reject handlers.
   - `executionLedger.ts`: Durable audit trail of all tool invocations with status and error logging.
   - `agentWorkQueueService.ts`: Role-specific prioritized queues for the 5 digital workers.
   - `agentExecutionService.ts`: Formal state machine managing task acceptance, execution, and verification.
   - `autonomyService.ts`: Founder autonomy settings (Level 0-4) with permission gates.
4. **Learning Subsystem (`src/services/intelligence/learningService.ts`)**:
   Record action outcomes, conversion deltas, and feedback loops.
5. **UI & World Integration**:
   - **Command Centre**: Integrate live Signals feed, Next Best Action executor, Agent Workload progress bars, and Revenue velocity.
   - **Founder Approval Center / Modal**: Pending approval banner with 1-click review, approve, and reject controls.
   - **Agent Work Queues View / Modal**: Visualizing active work items per agent with live execution states.
   - **World Engine**: Sync agent visual states and emote bubbles with actual operational states (`EXECUTING` -> work emote, `WAITING_APPROVAL` -> alert emote, `COMPLETED` -> happy emote).
6. **Testing & Audit Suite**:
   Create end-to-end integration tests verifying low-risk execution, HITL approval flow, founder rejection, permission enforcement, and persistence across refreshes.
7. **Documentation**:
   Produce all required architecture and handoff documents.
