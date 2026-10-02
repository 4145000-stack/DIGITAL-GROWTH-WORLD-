# DIGITAL GROWTH WORLD™ — STATE OWNERSHIP MAP
**Sprint:** 01 (Foundation Control)  

---

| State Domain | Variable / Entity | Current Owner | Authoritative Target | Mutation Path | Risk Assessment |
|---|---|---|---|---|---|
| **World Spatial** | Player Coordinates `(x, y, dir, state)` | `GameEngine` | `GameEngine` | WASD / Pointer -> `updatePlayerMovement()` | **LOW** (Well-isolated) |
| **World Entities** | NPC Agent Waypoints & Coordinates | `GameEngine` | `GameEngine` | A* Pathfinding -> `updateAgents()` | **LOW** (Well-isolated) |
| **World Navigation** | Active Room / Floor | `GameEngine` -> `App.tsx` | `GameEngine` (detection) -> React Context | `onRoomChange` event callback | **LOW** |
| **Spatial Overlays** | `activePanel`, `activeNav`, `showRightIntel` | `App.tsx` | React UI State Manager | User UI click / hotkey | **LOW** |
| **Focus Session** | Active sprint timer, goal, stats | `App.tsx` | Focus Domain Service | `onStartFocusSession`, interval | **MEDIUM** (Coupled in App.tsx) |
| **Tasks Backlog** | `TaskItem[]` | `App.tsx` + `GameEngine.tasks` | Business OS Task Service | UI modal + Agent tool execution | **HIGH** (Duplicated in state & engine) |
| **Opportunities** | `Opportunity[]` | `bosManager.ts` | Business OS Opportunity Service | User status toggle + Nova analysis | **MEDIUM** (In-memory singleton) |
| **Funnels & Leads** | `FunnelRecord[]`, `Lead[]` | `bosManager.ts` | Business OS Sales/Marketing Service | LeadsView + Closer/Pixel tool | **MEDIUM** (In-memory singleton) |
| **Financial Health** | `moneySummary`, MRR, ARR | `bosManager.ts` | Business OS Finance Service | Read-only in UI, calculated | **LOW** |
| **Agent Chat Logs** | `AgentChatMessageItem[]` | `agentIntelligence.ts` + `localStorage` | Agent Session Store | User chat input + `/api/chat` | **MEDIUM** (Local only, lacks server sync) |
| **Meeting Board** | `MultiAgentMeetingSession` | `meetingManager.ts` | Meeting Orchestrator Service | User agenda prompt + `/api/meeting/turn` | **MEDIUM** (In-memory session) |
