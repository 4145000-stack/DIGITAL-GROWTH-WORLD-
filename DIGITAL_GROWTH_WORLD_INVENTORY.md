# DIGITAL GROWTH WORLD™ — APPLICATION INVENTORY
**Generated:** September 15, 2026  
**Status:** Verified via Codebase Inspection  

---

## 1. Environment & Build Configuration
- `package.json`:
  - Runtime: Node.js (ESM `"type": "module"`)
  - Framework: React 19 (`react@^19.0.1`, `react-dom@^19.0.1`)
  - Build Tool: Vite 6 (`vite@^6.2.3`), TypeScript (`typescript@~5.8.2`), `esbuild@^0.25.0`, `tsx@^4.21.0`
  - Styling: Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`, `tailwindcss@^4.1.14`)
  - Backend: Express 4 (`express@^4.21.2`, `@types/express@^4.17.21`)
  - AI Engine: `@google/genai@^2.4.0` (server-side only)
  - Animation: `motion@^12.23.24`
  - Icons: `lucide-react@^0.546.0`
- `tsconfig.json`: Strict TypeScript compiler configuration targeting ES2022
- `vite.config.ts`: Configured with React plugin and Tailwind v4 Vite plugin
- `server.ts`: Custom Express backend integrating Vite in middleware mode during development, serving static bundle in production, and hosting server-side endpoints:
  - `GET /api/health`
  - `POST /api/chat`
  - `POST /api/meeting/turn`
  - `POST /api/meeting/summary`

---

## 2. Source Code Structure (`src/`)

### Entry & Core
- `src/main.tsx`: React DOM mount point mounting `<App />` into `#root`
- `src/App.tsx`: Main application orchestrator:
  - Mounts `<GameCanvas />` persistently at `z-0`
  - Manages spatial navigation (`activeNav`: `'world'`, `'home'`, `'opportunities'`, `'funnels'`, `'leads'`, `'money'`, `'marketing'`, `'projects'`, `'analytics'`, `'audits'`)
  - Manages contextual floating panels (`activePanel`: `'chat'`, `'agents'`, `'tasks'`, `'settings'`, `'profile'`, `'inspect'`, `'meeting'`, `'build'`)
  - Subscribes to `bosManager` state
- `src/types.ts`: Universal domain TypeScript declarations (Characters, Agents, Tools, WorldObjects, Tasks, BOS models, Funnels, Opportunities, Meetings)
- `src/index.css`: Semantic CSS variables design tokens (`--color-background`, `--color-surface`, `--color-accent`, `--color-agent`, etc.)

### Game Engine & Simulation (`src/game/`)
- `src/game/gameEngine.ts`: Core simulation engine:
  - Player state machine (idle, walk, sit, customizable clothing/hair)
  - Collision detection against solid world tiles and objects (AABB)
  - A* Pathfinding (`src/game/pathfinder.ts`)
  - Agent AI lifecycle, autonomous movement routines, waypoint navigation
  - Interaction zones (furniture, agents, doorways, zoom levels)
- `src/game/worldRenderer.ts`: Canvas 2D renderer:
  - Pixel-perfect camera tracking with zoom transformations
  - Frustum culling for tile and object efficiency
  - Depth-sorting (Y-index sorting for 2.5D visual overlap)
  - Dynamic projected shadows and room ambient lighting
- `src/game/pixelArt.ts`: Procedural pixel-art asset generation:
  - 16x16 and 32x32 character sprite frames (4 directional faces, walking bob cycle)
  - World furniture (desks, computers, conference tables, server racks, whiteboards, plants)
  - Emote speech bubbles (think, speech, alert, happy, heart, wave, confused, laugh, etc.)
- `src/game/tileMap.ts`: Grid tile definitions (wood floors, carpet, concrete, asphalt, decorative borders)
- `src/game/constants.ts`: World map layout, room boundaries (Executive Suite, Strategy Office, Creative Studio, Sales Office, Operations Centre, Focus Centre, Downtown Plaza), initial objects, and default agents.

### AI Agents (`src/agents/`)
- `src/agents/agentDefinitions.ts`: Comprehensive definitions for 5 core agents:
  - **NOVA**: Digital Strategist (Strategy Office) — Business maturity audit, opportunity diagnosis, strategic priority matrix
  - **PIXEL**: Marketing Agent (Creative Studio) — Multi-channel viral hooks, ad variants, campaign funnels
  - **CLOSER**: Sales Agent (Sales Office) — Objection handling, follow-up sequences, deal pipeline acceleration
  - **ORBIT**: Operations Agent (Operations Centre) — Work breakdown structure, sprint milestones, task dependency graphs
  - **COACH**: Focus & Accountability Agent (Focus Centre) — Pomodoro flow blocks, cognitive obstacle reframing, habit streaks

### Business & Intelligence Services (`src/services/`)
- `src/services/bosManager.ts`: Business Operating System in-memory singleton:
  - Opportunities, Funnels, Leads, Clients, Proposals, Projects, Campaigns, Analytics, Money Summary
  - Subscription pattern (`subscribe`, `notify`)
- `src/services/agentIntelligence.ts`: Agent conversational engine:
  - Multi-turn conversation persistence (`localStorage` sync)
  - Synchronizes agent state with in-world animations (`think`, `work`, `talk`, `happy`)
  - Proxies to `/api/chat` with tool calls
- `src/services/meetingManager.ts`: Multi-agent executive boardroom orchestrator:
  - Round-robin or directed agent speaking turns
  - Dynamic Gemini synthesis and structured takeaways / action items
- `src/services/geminiService.ts`: Client helper wrapper
- `src/services/soundManager.ts`: Web Audio synthetic soundscapes & chimes

### UI & Spatial Components (`src/components/`)
- `GameCanvas.tsx`: Canvas mount container with ResizeObserver and input listeners
- `TopBar.tsx`: Room status, floor level, zoom controls, profile, settings, world toggle
- `TopHUD.tsx`: Floating status HUD
- `LeftNav.tsx`: Technical navigation rail (World, Command Centre, Opportunities, Funnels, Leads, Money, Marketing, Projects, Analytics, Audits)
- `RightToolbar.tsx`: Quick floating workspace triggers (Agents, Chat, Tasks, Build, Teleport, Meeting Room)
- `RightIntelligencePanel.tsx`: The Intelligence Matrix (Live stats, Next Best Action, Agent statuses, Opportunities)
- `BottomChatBar.tsx`: Ambient chat preview, input bar, and interactive emote selector
- `AgentChatModal.tsx`: Floating conversational window with designated agent
- `MeetingRoomModal.tsx`: Multi-agent executive strategy session interface
- `BusinessCommandCentre.tsx`: High-level business overview and metric breakdown
- `OpportunitiesView.tsx`: Pipeline prioritization and commercial intent scores
- `FunnelsView.tsx`: Conversion stage breakdown with step drop-offs
- `LeadsView.tsx`: Lead pipeline and qualification tracker
- `MoneyView.tsx`: MRR, ARR, runway, and financial health
- `TasksModal.tsx`: Task backlog and active agent assignments
- `FocusSessionModal.tsx` & `FocusSummaryModal.tsx`: Deep-work session controls
- `FurnitureInspectModal.tsx`: Contextual inspector for interactive world objects
- `SettingsModal.tsx`, `ProfileModal.tsx`, `HomeTeleportModal.tsx`, `BuildModeToolbar.tsx`
- `DGWIcon.tsx`: Geometric, mitered stroke icon primitive
