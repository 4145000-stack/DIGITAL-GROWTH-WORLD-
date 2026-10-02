import { AIAgent, Direction, MeetingUtterance, MultiAgentMeetingSession, TaskItem } from '../types';
import { GameEngine } from '../game/gameEngine';
import { TILE_SIZE } from '../game/constants';
import { getAgentDefinition } from '../agents/agentDefinitions';

export interface PresetAgenda {
  id: string;
  title: string;
  description: string;
  recommendedAttendees: string[];
}

export const PRESET_MEETING_AGENDAS: PresetAgenda[] = [
  {
    id: 'q4_launch',
    title: 'Q4 Product Launch & Inbound Growth Engine',
    description: 'Synchronize positioning, viral campaigns, objection handling, and sprint milestones.',
    recommendedAttendees: ['nova', 'pixel', 'closer', 'orbit', 'coach'],
  },
  {
    id: 'pricing_sales',
    title: 'Pricing, Objection Handling & Sales Pipeline Acceleration',
    description: 'Diagnose conversion bottlenecks, establish proof-of-value guarantees, and standardize sales cadences.',
    recommendedAttendees: ['closer', 'nova', 'pixel'],
  },
  {
    id: 'operations_sprint',
    title: 'Operational Milestones & Workflow Sprint Breakdown',
    description: 'Deconstruct high-level roadmap into 2-week sprint swimlanes with zero circular dependencies.',
    recommendedAttendees: ['orbit', 'nova', 'coach'],
  },
  {
    id: 'viral_campaign',
    title: 'Multi-Channel Viral Content & Lead Magnet Campaign',
    description: 'Design contrarian hooks, educational carousels, and high-converting lead magnet kits.',
    recommendedAttendees: ['pixel', 'closer', 'orbit'],
  },
  {
    id: 'flow_state',
    title: 'Deep Work Sprint & Maker Flow State Optimization',
    description: 'Protect maker hours, set up 25-minute Pomodoro sprints, and eliminate operational context-switching.',
    recommendedAttendees: ['coach', 'orbit', 'nova'],
  },
];

// Meeting Room Seat Coordinates (around the conference table in Meeting Room)
export const AGENT_MEETING_SEATS: Record<string, { x: number; y: number; direction: Direction }> = {
  nova: { x: 43.5 * TILE_SIZE, y: 40.5 * TILE_SIZE, direction: 'down' },
  pixel: { x: 46.5 * TILE_SIZE, y: 40.5 * TILE_SIZE, direction: 'down' },
  closer: { x: 49.5 * TILE_SIZE, y: 40.5 * TILE_SIZE, direction: 'down' },
  orbit: { x: 43.5 * TILE_SIZE, y: 44.8 * TILE_SIZE, direction: 'up' },
  coach: { x: 46.5 * TILE_SIZE, y: 44.8 * TILE_SIZE, direction: 'up' },
};

// Home Department Positions
export const AGENT_HOME_POSITIONS: Record<string, { x: number; y: number; direction: Direction }> = {
  nova: { x: 8 * TILE_SIZE, y: 32 * TILE_SIZE, direction: 'down' },
  pixel: { x: 8 * TILE_SIZE, y: 21 * TILE_SIZE, direction: 'right' },
  closer: { x: 52 * TILE_SIZE, y: 21 * TILE_SIZE, direction: 'down' },
  orbit: { x: 52 * TILE_SIZE, y: 32 * TILE_SIZE, direction: 'down' },
  coach: { x: 16 * TILE_SIZE, y: 42 * TILE_SIZE, direction: 'down' },
};

export class MeetingManager {
  private static activeSession: MultiAgentMeetingSession | null = null;
  private static listeners: Array<(session: MultiAgentMeetingSession | null) => void> = [];

  public static getSession(): MultiAgentMeetingSession | null {
    return this.activeSession;
  }

  public static subscribe(listener: (session: MultiAgentMeetingSession | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify() {
    for (const listener of this.listeners) {
      listener(this.activeSession ? { ...this.activeSession } : null);
    }
  }

  /**
   * Convenes a new meeting, gathering character avatars around the conference table in the Meeting Room.
   */
  public static async conveneMeeting(
    agenda: string,
    attendeeIds: string[],
    engine?: GameEngine | null
  ): Promise<MultiAgentMeetingSession> {
    const cleanAttendeeIds = attendeeIds.map((id) => id.toLowerCase().replace(/^agent_/, ''));

    const session: MultiAgentMeetingSession = {
      id: `meeting_${Date.now()}`,
      agenda,
      status: 'in_session',
      attendeeIds: cleanAttendeeIds,
      currentSpeakerId: null,
      transcript: [],
      actionItems: [],
      startedAt: Date.now(),
    };

    this.activeSession = session;
    this.notify();

    // 1. Physically position the visual character avatars into the conference seats in Meeting Room
    if (engine) {
      for (const agent of engine.agents) {
        const cleanId = agent.id.toLowerCase().replace(/^agent_/, '');
        if (cleanAttendeeIds.includes(cleanId) && AGENT_MEETING_SEATS[cleanId]) {
          const seat = AGENT_MEETING_SEATS[cleanId];
          agent.position.x = seat.x;
          agent.position.y = seat.y;
          agent.direction = seat.direction;
          agent.animationState = 'sit';
          agent.path = undefined;
          agent.currentWaypointIndex = undefined;
          agent.emote = {
            type: 'speech',
            text: 'Conveying to Meeting Room',
            expiresAt: Date.now() + 2500,
          };
        }
      }

      // Move player into the meeting room if far away
      const playerX = engine.player.position.x;
      const playerY = engine.player.position.y;
      const distToMeeting = Math.hypot(playerX - 47 * TILE_SIZE, playerY - 43 * TILE_SIZE);
      if (distToMeeting > 15 * TILE_SIZE) {
        engine.player.position.x = 49.5 * TILE_SIZE;
        engine.player.position.y = 44.8 * TILE_SIZE;
        engine.player.direction = 'up';
      }
    }

    // Automatically trigger the opening statement from the first attendee (usually Nova or chosen lead)
    await this.advanceTurn(undefined, cleanAttendeeIds[0], engine);

    return this.activeSession!;
  }

  /**
   * Advances the meeting to the next turn or responds to an interjection/prompt from the user.
   */
  public static async advanceTurn(
    userPrompt?: string,
    targetSpeakerId?: string,
    engine?: GameEngine | null
  ): Promise<MeetingUtterance | null> {
    if (!this.activeSession || this.activeSession.status !== 'in_session') {
      return null;
    }

    // If user provided a prompt, record it in the transcript first
    if (userPrompt && userPrompt.trim()) {
      const userUtterance: MeetingUtterance = {
        id: `utterance_user_${Date.now()}`,
        speakerId: 'founder',
        speakerName: 'Founder',
        speakerRole: 'Executive Chair',
        department: 'Business HQ',
        text: userPrompt.trim(),
        timestamp: Date.now(),
        animation: 'talk',
      };
      this.activeSession.transcript.push(userUtterance);
      this.notify();
    }

    try {
      const response = await fetch('/api/meeting/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agenda: this.activeSession.agenda,
          attendeeIds: this.activeSession.attendeeIds,
          transcript: this.activeSession.transcript.map((t) => ({
            speakerId: t.speakerId,
            speakerName: t.speakerName,
            speakerRole: t.speakerRole,
            text: t.text,
            timestamp: t.timestamp,
          })),
          userPrompt: userPrompt?.trim() || undefined,
          targetSpeakerId: targetSpeakerId?.toLowerCase().replace(/^agent_/, ''),
        }),
      });

      const data = await response.json();
      if (!data.success && !data.reply) {
        throw new Error(data.error || 'Failed to fetch meeting turn');
      }

      const speakerId = (data.speakerId || 'nova').toLowerCase().replace(/^agent_/, '');
      const def = getAgentDefinition(speakerId);
      const speakerName = data.speakerName || def?.name || speakerId.toUpperCase();
      const speakerRole = data.speakerRole || def?.role || 'Executive';
      const department = data.department || def?.specialty || 'Meeting Room';
      const anim = data.animation || 'talk';

      const utterance: MeetingUtterance = {
        id: `utterance_${Date.now()}`,
        speakerId,
        speakerName,
        speakerRole,
        department,
        text: data.reply,
        timestamp: Date.now(),
        animation: anim,
        suggestedAction: data.suggestedAction,
        createdTask: data.createdTask,
      };

      this.activeSession.transcript.push(utterance);
      this.activeSession.currentSpeakerId = speakerId;

      // If a task was created during this speaking turn, add to session action items
      if (data.createdTask && data.createdTask.title) {
        const newTask: TaskItem = {
          id: `task_meeting_${Date.now()}`,
          title: data.createdTask.title,
          description: data.createdTask.description || `Task generated in executive meeting on ${this.activeSession.agenda}`,
          assignedToAgentId: `agent_${speakerId}`,
          status: 'todo',
          progress: 0,
          priority: 'high',
          xpReward: 150,
          category: data.createdTask.category || 'Growth',
          createdAt: Date.now(),
        };

        // Avoid duplicate titles
        if (!this.activeSession.actionItems.some((a) => a.title === newTask.title)) {
          this.activeSession.actionItems.push(newTask);
        }
      }

      // Animate the physical character in the meeting room
      if (engine) {
        engine.setAgentAnimation(speakerId, anim, {
          type: 'speech',
          text: utterance.text.slice(0, 48) + '...',
          expiresAt: Date.now() + 4500,
        });
      }

      this.notify();
      return utterance;
    } catch (err) {
      console.error('Failed to advance meeting turn:', err);
      return null;
    }
  }

  /**
   * Adjourns the meeting, computes the executive summary, and returns character avatars to their home departments.
   */
  public static async adjournMeeting(
    engine?: GameEngine | null
  ): Promise<{ decision: string; actionItems: TaskItem[] }> {
    if (!this.activeSession) {
      return { decision: '', actionItems: [] };
    }

    try {
      const response = await fetch('/api/meeting/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agenda: this.activeSession.agenda,
          transcript: this.activeSession.transcript,
          attendeeIds: this.activeSession.attendeeIds,
        }),
      });

      const data = await response.json();
      this.activeSession.decision = data.decision || 'Meeting successfully adjourned.';
      this.activeSession.nextSteps = data.nextSteps || 'Review action items.';
      this.activeSession.status = 'adjourned';
      this.activeSession.endedAt = Date.now();

      // Merge any suggested action items
      if (Array.isArray(data.actionItems)) {
        for (const item of data.actionItems) {
          if (!this.activeSession.actionItems.some((a) => a.title === item.title)) {
            const assigneeId = item.responsibleAgent ? `agent_${item.responsibleAgent}` : 'agent_orbit';
            this.activeSession.actionItems.push({
              id: `task_summary_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              title: item.title,
              description: item.description,
              category: item.category || 'Growth',
              priority: item.priority || 'high',
              status: 'todo',
              assignedToAgentId: assigneeId,
              progress: 0,
              xpReward: item.xpReward || 200,
              createdAt: Date.now(),
            });
          }
        }
      }

      // Return visual character avatars to their respective department offices
      if (engine) {
        for (const agent of engine.agents) {
          const cleanId = agent.id.toLowerCase().replace(/^agent_/, '');
          if (AGENT_HOME_POSITIONS[cleanId]) {
            const home = AGENT_HOME_POSITIONS[cleanId];
            agent.position.x = home.x;
            agent.position.y = home.y;
            agent.direction = home.direction;
            agent.animationState = 'work';
            agent.emote = {
              type: 'happy',
              text: 'Returning to Department',
              expiresAt: Date.now() + 3000,
            };
          }
        }
      }

      this.notify();
      return {
        decision: this.activeSession.decision || '',
        actionItems: this.activeSession.actionItems,
      };
    } catch (err) {
      console.error('Failed to adjourn meeting:', err);
      this.activeSession.status = 'adjourned';
      this.notify();
      return { decision: 'Meeting concluded.', actionItems: this.activeSession.actionItems };
    }
  }

  /**
   * Automates the entire discussion for a given problem over a set number of rounds.
   */
  public static async runAutomatedDiscussion(
    problem: string,
    attendeeIds: string[],
    rounds: number,
    engine?: GameEngine | null
  ): Promise<void> {
    await this.conveneMeeting(problem, attendeeIds, engine);

    // Initial problem prompt
    await this.advanceTurn(problem, 'nova', engine);
    await new Promise(r => setTimeout(r, 4500)); // wait for animation

    for (let i = 1; i < rounds; i++) {
      await this.advanceTurn(undefined, 'auto', engine);
      await new Promise(r => setTimeout(r, 4500));
    }

    // Force NOVA to synthesize
    await this.advanceTurn("NOVA, please summarize the strategy decisions we've made.", 'nova', engine);
    await new Promise(r => setTimeout(r, 4500));

    // Force ORBIT to draft action tasks
    await this.advanceTurn("ORBIT, please convert our decisions into concrete actionable tasks.", 'orbit', engine);
    await new Promise(r => setTimeout(r, 4500));

    await this.adjournMeeting(engine);
  }

  public static reset() {
    this.activeSession = null;
    this.notify();
  }
}
