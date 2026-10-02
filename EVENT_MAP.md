# DIGITAL GROWTH WORLD™ — EVENT MAP
**Sprint:** 01 (Foundation Control)  

---

## 1. System Event Contracts

| Event Name | Source | Payload | Primary Consumers | Purpose |
|---|---|---|---|---|
| `AGENT_SELECTED` | Canvas Click / HUD | `{ agentId: string, location?: Position }` | UI (ChatModal), World (Camera Pan) | Opens agent dialogue & directs camera |
| `AGENT_ANIMATION_CHANGED` | AgentIntelligence / Meeting | `{ agentId: string, animation: AnimationState, emote?: any }` | World Engine (Sprite Rendering) | Displays thought bubbles, work gears, speech emotes |
| `TASK_CREATED` | Agent Tool / User Modal | `{ task: TaskItem }` | BOS, TaskModal, World Engine | Adds task to sprint backlog |
| `TASK_PROGRESS_UPDATED` | World Simulation Tick | `{ taskId: string, progress: number, isDone: boolean }` | TaskModal, TopHUD, Audio Synthesizer | Updates progress bar & triggers completion chimes |
| `TASK_COMPLETED` | World Engine / User Action | `{ taskId: string, xpReward: number }` | CompanyMetrics, Agent Happiness, Sound | Celebrates task completion |
| `OPPORTUNITY_UPDATED` | UI / Nova Tool | `{ opportunityId: string, status: string }` | OpportunitiesView, NextBestAction | Modifies pipeline readiness |
| `LEAD_CREATED` | User Modal / Closer Tool | `{ lead: Lead }` | LeadsView, Sales Office, Notifications | Enters new sales prospect |
| `MEETING_STARTED` | User UI / Boardroom Click | `{ agenda: string, attendeeIds: string[] }` | MeetingRoomModal, World Engine | Gathers agents at conference table |
| `MEETING_TURN_COMPLETED` | Server Gemini / Simulator | `{ utterance: MeetingUtterance }` | MeetingRoomModal, Audio, Canvas | Animates current speaker |
| `FOCUS_SESSION_STARTED` | Coach Tool / User HUD | `{ durationMinutes: number, goal: string }` | FocusSessionModal, World Engine | Anchors player & Coach in Focus Centre |
| `FOCUS_SESSION_COMPLETED` | Timer / User Action | `{ durationMinutes: number, goal: string }` | FocusStats, SoundSynthesizer | Triggers completion summary |
| `AGENT_TOOL_REQUESTED` | Gemini Response | `{ agentId: string, toolName: string, args: any }` | AgentToolRegistry | Validates permissions and payload schema |
| `AGENT_TOOL_EXECUTED` | AgentToolRegistry | `{ agentId: string, toolName: string, result: any, success: boolean }` | AgentIntelligence, Audit Log | Feeds tool execution results back to AI |
