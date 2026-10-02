import { AIAgent, AnimationState, TaskItem } from '../types';
import { AgentIntelligenceService } from './agentIntelligence';

export interface AgentResponseResult {
  reply: string;
  animation: AnimationState;
  suggestedAction?: string;
  mood?: 'happy' | 'think' | 'alert' | 'work';
  createdTask?: {
    title: string;
    description: string;
    category: 'Growth' | 'Engineering' | 'Design' | 'Product' | 'Operations';
  };
}

export class AgentAIService {
  /**
   * Generates a reply for an NPC Agent by delegating to the unified AgentIntelligenceService
   */
  public static async generateAgentReply(
    agent: AIAgent,
    userMessage: string,
    history: Array<{ sender: string; text: string }> = [],
    tasks: TaskItem[] = []
  ): Promise<AgentResponseResult> {
    const result = await AgentIntelligenceService.sendMessage({
      agentId: agent.id,
      message: userMessage,
    });

    let mood: 'happy' | 'think' | 'alert' | 'work' = 'think';
    if (result.animation === 'work') mood = 'work';
    else if (result.animation === 'happy') mood = 'happy';

    return {
      reply: result.reply,
      animation: result.animation,
      suggestedAction: result.suggestedAction,
      mood,
      createdTask: result.createdTask,
    };
  }
}
