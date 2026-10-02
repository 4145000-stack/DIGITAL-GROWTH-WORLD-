import { AgentDefinition, AnimationState } from '../types';
import { getAgentDefinition, getCharacterIdForAgent } from '../agents/agentDefinitions';
import { GameEngine } from '../game/gameEngine';
import { agentToolRegistry } from './agentToolRegistry';

export interface AgentChatMessageItem {
  id: string;
  sender: 'user' | 'agent' | 'system';
  role?: 'user' | 'model' | 'assistant';
  text: string;
  timestamp: number;
  animation?: AnimationState;
  suggestedAction?: string;
  createdTask?: {
    title: string;
    description: string;
    category: 'Growth' | 'Engineering' | 'Design' | 'Product' | 'Operations';
  };
}

export interface AgentChatResponse {
  reply: string;
  animation: AnimationState;
  suggestedAction?: string;
  createdTask?: {
    title: string;
    description: string;
    category: 'Growth' | 'Engineering' | 'Design' | 'Product' | 'Operations';
  };
}

// In-memory conversation stores per agent
const CONVERSATION_STORE: Record<string, AgentChatMessageItem[]> = {};

export class AgentIntelligenceService {
  /**
   * Get an agent's individual conversation history, loading persisted storage or initializing default greeting
   */
  public static getConversation(agentId: string): AgentChatMessageItem[] {
    const def = getAgentDefinition(agentId);
    const key = def ? def.id : agentId.toLowerCase().replace(/^agent_/, '');

    if (!CONVERSATION_STORE[key]) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(`dgw_agent_chat_${key}`) : null;
      if (stored) {
        try {
          CONVERSATION_STORE[key] = JSON.parse(stored);
        } catch {
          CONVERSATION_STORE[key] = [];
        }
      } else {
        CONVERSATION_STORE[key] = [];
      }

      // If empty, initialize with the agent's signature welcome message
      if (CONVERSATION_STORE[key].length === 0 && def) {
        let initialGreeting = `Hello! I'm ${def.name}, your ${def.role}.`;
        if (def.id === 'nova') {
          initialGreeting = `Greetings. I am Nova, Digital Strategist for Digital Growth World. I analyse business information, digital readiness, priorities, opportunities and strategy. What business challenge are we evaluating today?`;
        } else if (def.id === 'pixel') {
          initialGreeting = `Hey! Pixel in the studio. I help with content strategy, social media, campaigns, advertising and lead generation. Let's create some viral momentum!`;
        } else if (def.id === 'closer') {
          initialGreeting = `Hello! Closer here, your Sales Agent. I help analyse leads, customer conversations, sales opportunities, follow-ups and objections. How can we advance our deal pipeline today?`;
        } else if (def.id === 'orbit') {
          initialGreeting = `Systems synchronized. I am Orbit, your Operations Agent. I convert ideas into tasks, projects, milestones, workflows and execution plans. What are we building?`;
        } else if (def.id === 'coach') {
          initialGreeting = `Welcome! I'm Coach, your Focus and Accountability Agent. I help you structure focus sessions, set clear goals, maintain accountability and work through tasks. Ready for a deep work sprint?`;
        }

        CONVERSATION_STORE[key].push({
          id: `welcome-${Date.now()}`,
          sender: 'agent',
          role: 'model',
          text: initialGreeting,
          timestamp: Date.now(),
          animation: 'talk',
        });
      }
    }

    return CONVERSATION_STORE[key];
  }

  /**
   * Persist conversation updates
   */
  private static saveConversation(agentId: string) {
    const def = getAgentDefinition(agentId);
    const key = def ? def.id : agentId.toLowerCase().replace(/^agent_/, '');
    if (typeof window !== 'undefined' && CONVERSATION_STORE[key]) {
      try {
        localStorage.setItem(`dgw_agent_chat_${key}`, JSON.stringify(CONVERSATION_STORE[key]));
      } catch {
        // Ignore quota limits
      }
    }
  }

  /**
   * Clear conversation for an agent
   */
  public static clearConversation(agentId: string) {
    const def = getAgentDefinition(agentId);
    const key = def ? def.id : agentId.toLowerCase().replace(/^agent_/, '');
    CONVERSATION_STORE[key] = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`dgw_agent_chat_${key}`);
    }
  }

  /**
   * Send user message to an NPC Agent, dynamically commanding virtual world animations
   */
  public static async sendMessage(params: {
    agentId: string;
    message: string;
    engine?: GameEngine | null;
    onTaskCreated?: (task: {
      title: string;
      description: string;
      category: 'Growth' | 'Engineering' | 'Design' | 'Product' | 'Operations';
    }) => void;
    onStartFocusSession?: (duration: number) => void;
  }): Promise<AgentChatResponse> {
    const { agentId, message, engine, onTaskCreated, onStartFocusSession } = params;
    const def = getAgentDefinition(agentId);
    const normalizedId = def ? def.id : agentId.toLowerCase().replace(/^agent_/, '');
    const characterId = getCharacterIdForAgent(normalizedId);

    // 1. Get history and append user message
    const history = this.getConversation(normalizedId);
    const userMsg: AgentChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      role: 'user',
      text: message,
      timestamp: Date.now(),
    };
    history.push(userMsg);
    this.saveConversation(normalizedId);

    // 2. Command the Character in the virtual world:
    // AI analysing: animation = think
    if (engine) {
      engine.setAgentAnimation(characterId, 'think', {
        type: 'think',
        text: 'Analysing...',
        expiresAt: Date.now() + 12000,
      });
    }

    try {
      // 3. Make server-side call to Gemini
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: normalizedId,
          message,
          conversationHistory: history.slice(-8),
          systemInstructions: def?.systemInstructions || '',
          role: def?.role || '',
          specialty: def?.specialty || '',
          personality: def?.personality || '',
          capabilities: def?.capabilities || [],
          tools: def?.tools || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to reach agent intelligence server`);
      }

      const data = await response.json();

      if (data.toolCall) {
        // Step 4a: Handle tool execution animation and logic
        if (engine) {
          engine.setAgentAnimation(characterId, 'work', {
            type: 'gear',
            text: `Executing ${data.toolCall.name}...`,
            expiresAt: Date.now() + 4000,
          });
        }

        const toolMsg: AgentChatMessageItem = {
          id: `tool-${Date.now()}`,
          sender: 'agent',
          role: 'model',
          text: `*[Executing Tool: ${data.toolCall.name}]*`,
          timestamp: Date.now(),
          animation: 'work',
        };
        history.push(toolMsg);
        this.saveConversation(normalizedId);

        // Application State Changes Handled by Secure Tool Registry
        const executionResult = await agentToolRegistry.executeTool(
          normalizedId,
          data.toolCall.name,
          data.toolCall.args,
          { onTaskCreated, onStartFocusSession, engine }
        );

        // Simulate brief work delay for physical world realism
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Inject tool execution feedback message into conversation context
        const toolResultText = executionResult.success
          ? `System: Tool "${data.toolCall.name}" executed successfully: ${JSON.stringify(executionResult.result || 'OK')}. Summarize outcome for the founder.`
          : `System Notice: Tool "${data.toolCall.name}" failed: ${executionResult.error}. Explain this constraint gracefully.`;

        history.push({
          id: `tool-res-${Date.now()}`,
          sender: 'user',
          role: 'user',
          text: toolResultText,
          timestamp: Date.now(),
        });

        // Step 4b: Make follow-up API call for final conversational response
        const response2 = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: normalizedId,
            message: toolResultText,
            conversationHistory: history.slice(-10),
            systemInstructions: def?.systemInstructions || '',
            role: def?.role || '',
            specialty: def?.specialty || '',
            personality: def?.personality || '',
            capabilities: def?.capabilities || [],
            tools: def?.tools || [],
          }),
        });
        
        const data2 = await response2.json();
        const reply = data2.reply || `I have successfully completed the ${data.toolCall.name} action.`;
        const animation: AnimationState = data2.animation || 'talk';

        if (engine) {
          engine.setAgentAnimation(characterId, animation, {
            type: animation === 'happy' ? 'happy' : 'speech',
            text: reply.slice(0, 48) + (reply.length > 48 ? '...' : ''),
            expiresAt: Date.now() + 6000,
          });
        }

        const finalMsg: AgentChatMessageItem = {
          id: `agent-final-${Date.now()}`,
          sender: 'agent',
          role: 'model',
          text: reply,
          timestamp: Date.now(),
          animation,
          suggestedAction: data2.suggestedAction,
          createdTask: data2.createdTask,
        };
        history.push(finalMsg);
        this.saveConversation(normalizedId);

        return {
          reply,
          animation,
          suggestedAction: data2.suggestedAction,
          createdTask: data2.createdTask,
        };
      }

      // Default path (no tool call)
      const reply = data.reply || "I'm processing this request.";
      const animation: AnimationState = data.animation || 'talk';
      const suggestedAction = data.suggestedAction;
      const createdTask = data.createdTask;

      // 4. Command the Character in the virtual world based on AI outcome
      if (engine) {
        let emoteType: 'idea' | 'speech' | 'happy' | 'gear' = 'speech';
        if (animation === 'think') emoteType = 'idea';
        else if (animation === 'work') emoteType = 'gear';
        else if (animation === 'happy') emoteType = 'happy';

        engine.setAgentAnimation(characterId, animation, {
          type: emoteType,
          text: reply.slice(0, 48) + (reply.length > 48 ? '...' : ''),
          expiresAt: Date.now() + 6000,
        });
      }

      // 5. Append agent reply to individual context
      const agentMsg: AgentChatMessageItem = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        role: 'model',
        text: reply,
        timestamp: Date.now(),
        animation,
        suggestedAction,
        createdTask,
      };
      history.push(agentMsg);
      this.saveConversation(normalizedId);

      // 6. Handle task creation if agent outputted one
      if (createdTask && onTaskCreated) {
        onTaskCreated(createdTask);
      }

      return {
        reply,
        animation,
        suggestedAction,
        createdTask,
      };
    } catch (err: any) {
      console.error('Agent intelligence error:', err);
      // AI unavailable: animation = idle
      if (engine) {
        engine.setAgentAnimation(characterId, 'idle', {
          type: 'alert',
          text: 'Signal lost',
          expiresAt: Date.now() + 4000,
        });
      }

      const fallbackReply = `I'm having momentary trouble contacting my neural core. Let me reset my working parameters.`;
      const agentMsg: AgentChatMessageItem = {
        id: `agent-error-${Date.now()}`,
        sender: 'agent',
        role: 'model',
        text: fallbackReply,
        timestamp: Date.now(),
        animation: 'idle',
      };
      history.push(agentMsg);
      this.saveConversation(normalizedId);

      return {
        reply: fallbackReply,
        animation: 'idle',
      };
    }
  }
}
