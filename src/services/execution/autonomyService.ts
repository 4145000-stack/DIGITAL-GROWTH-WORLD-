/**
 * DIGITAL GROWTH WORLD™ — Agent Autonomy Control Service
 * Manages founder-controlled autonomy levels and execution pacing.
 */

import { AgentAutonomySetting, AutonomyLevel } from '../../types';
import { eventBus } from '../eventBus';

const STORAGE_KEY = 'dgw_domain_autonomy';

const DEFAULT_SETTINGS: Record<string, AgentAutonomySetting> = {
  nova: { agentId: 'nova', level: 1, isPaused: false, maxDailyExecutions: 50, currentDailyExecutions: 0, updatedAt: Date.now() },
  pixel: { agentId: 'pixel', level: 1, isPaused: false, maxDailyExecutions: 50, currentDailyExecutions: 0, updatedAt: Date.now() },
  closer: { agentId: 'closer', level: 1, isPaused: false, maxDailyExecutions: 50, currentDailyExecutions: 0, updatedAt: Date.now() },
  orbit: { agentId: 'orbit', level: 1, isPaused: false, maxDailyExecutions: 50, currentDailyExecutions: 0, updatedAt: Date.now() },
  coach: { agentId: 'coach', level: 1, isPaused: false, maxDailyExecutions: 50, currentDailyExecutions: 0, updatedAt: Date.now() },
};

export type AutonomyListener = (settings: Record<string, AgentAutonomySetting>) => void;

export class AutonomyService {
  private settings: Record<string, AgentAutonomySetting> = {};
  private listeners: Set<AutonomyListener> = new Set();

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          this.settings = { ...DEFAULT_SETTINGS, ...parsed };
          return;
        }
      }
    } catch {
      // ignore
    }
    this.settings = { ...DEFAULT_SETTINGS };
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.persist();
    const snapshot = JSON.parse(JSON.stringify(this.settings));
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[AutonomyService] Subscriber error:', err);
      }
    });
  }

  public subscribe(listener: AutonomyListener): () => void {
    this.listeners.add(listener);
    listener(JSON.parse(JSON.stringify(this.settings)));
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSettings(agentId: string): AgentAutonomySetting {
    const id = agentId.toLowerCase().replace(/^agent_/, '');
    return this.settings[id] || DEFAULT_SETTINGS[id] || { agentId: id, level: 0, isPaused: true, maxDailyExecutions: 0, currentDailyExecutions: 0, updatedAt: Date.now() };
  }

  public setLevel(agentId: string, level: AutonomyLevel) {
    const id = agentId.toLowerCase().replace(/^agent_/, '');
    if (!this.settings[id]) {
      this.settings[id] = DEFAULT_SETTINGS[id] 
        ? { ...DEFAULT_SETTINGS[id] } 
        : { agentId: id, level, isPaused: false, maxDailyExecutions: 50, currentDailyExecutions: 0, updatedAt: Date.now() };
    }
    this.settings[id].level = level;
    this.settings[id].updatedAt = Date.now();
    this.notify();
    
    eventBus.emit('AUTONOMY_LEVEL_CHANGED', { agentId: id, level });
  }

  public togglePause(agentId: string) {
    const id = agentId.toLowerCase().replace(/^agent_/, '');
    if (this.settings[id]) {
      this.settings[id].isPaused = !this.settings[id].isPaused;
      this.settings[id].updatedAt = Date.now();
      this.notify();
    }
  }
}

export const autonomyService = new AutonomyService();
