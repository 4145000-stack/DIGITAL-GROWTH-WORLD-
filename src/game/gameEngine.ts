import { AIAgent, Character, Direction, EmoteType, FocusSessionState, Position, TaskItem, WorldObject } from '../types';
import { INITIAL_AGENTS, INITIAL_DOORWAYS, INITIAL_OBJECTS, MAP_HEIGHT_TILES, MAP_WIDTH_TILES, TILE_SIZE } from './constants';
import { TileMap } from './tileMap';
import { findPath } from './pathfinder';

export interface GameEngineEvents {
  onAgentTalk: (agent: AIAgent) => void;
  onObjectInteract: (obj: WorldObject) => void;
  onRoomChange: (roomName: string, floor: string) => void;
  onFocusSessionTick?: (secondsRemaining: number) => void;
  onTaskProgress?: (taskId: string, progress: number, isDone: boolean) => void;
  onInteractionBreak?: () => void;
}

export class GameEngine {
  public tileMap: TileMap;
  public player: Character;
  public agents: AIAgent[] = [];
  public objects: WorldObject[] = [];
  public tasks: TaskItem[] = [];
  private lastTaskProgressTick = 0;
  public currentRoomId = 'downtown';
  public currentRoomDisplayName = 'Downtown Plaza & Street';
  public currentFloor = 'Exterior Ground';

  public keysPressed: Record<string, boolean> = {};
  public targetClickPosition: Position | null = null;
  public activeNearbyAgent: AIAgent | null = null;
  public activeNearbyObject: WorldObject | null = null;
  public interactingAgentId: string | null = null;

  public buildMode = {
    active: false,
    action: 'place' as 'place' | 'move' | 'rotate' | 'remove',
    selectedType: 'desk',
    selectedObjectId: null as string | null
  };

  public zoomScale = 1.75;
  public showPathDebug = false;
  public camera = { x: 0, y: 0 };
  private lastTime = 0;
  private animFrameId: number | null = null;
  private events: GameEngineEvents;

  // Focus session state reference
  public focusSession: FocusSessionState | null = null;

  constructor(events: GameEngineEvents) {
    this.events = events;
    this.tileMap = new TileMap();
    this.agents = JSON.parse(JSON.stringify(INITIAL_AGENTS));
    this.objects = JSON.parse(JSON.stringify(INITIAL_OBJECTS));

    // Expose console path debug toggle
    if (typeof window !== 'undefined') {
      (window as any).togglePathDebug = () => {
        this.showPathDebug = !this.showPathDebug;
        console.log('A* Path Debug Mode:', this.showPathDebug);
        return this.showPathDebug;
      };
    }

    // Player initial position (Downtown Plaza near entrance)
    this.player = {
      id: 'player_user',
      name: 'Player',
      position: { x: 32 * TILE_SIZE, y: 10 * TILE_SIZE },
      direction: 'down',
      animationState: 'idle',
      speed: 3.2,
      customization: {
        hairColor: '#451a03',
        hairStyle: 'spiky',
        skinColor: '#fcd34d',
        outfitColor: '#1e293b', // Modern navy business suit
        pantColor: '#0f172a',
        accessory: 'tie',
      },
    };

    this.camera.x = this.player.position.x;
    this.camera.y = this.player.position.y;
  }

  public tick(currentTime: number) {
    if (!this.lastTime) {
      this.lastTime = currentTime;
    }
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt, currentTime);
  }

  public start() {
    if (this.animFrameId !== null) return;
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      this.tick(currentTime);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public handleKeyDown(key: string) {
    const k = key.toLowerCase();
    this.keysPressed[k] = true;

    // Interaction shortcuts
    if (k === 'e' || k === 'enter' || k === ' ') {
      this.triggerInteraction();
    }
  }

  public handleKeyUp(key: string) {
    const k = key.toLowerCase();
    this.keysPressed[k] = false;
  }

  public setClickTarget(worldX: number, worldY: number) {
    if (this.buildMode.active) {
      this.handleBuildModeClick(worldX, worldY);
      return;
    }
    
    // Stop sitting if clicking
    if (this.player.isSitting) {
      this.player.isSitting = false;
      this.player.animationState = 'idle';
    }
    this.targetClickPosition = { x: worldX, y: worldY };
  }

  private handleBuildModeClick(worldX: number, worldY: number) {
     const snapX = Math.floor(worldX / TILE_SIZE) * TILE_SIZE;
     const snapY = Math.floor(worldY / TILE_SIZE) * TILE_SIZE;
     
     const room = this.tileMap.getRoomAt(snapX, snapY);
     if (!room) return;

     if (this.buildMode.action === 'place') {
        // Prevent placing in walls (solid check)
        if (this.tileMap.isSolid(snapX, snapY)) return;

        const newObj: WorldObject = {
           id: `obj_${Date.now()}`,
           type: this.buildMode.selectedType as any,
           x: snapX,
           y: snapY,
           width: TILE_SIZE,
           height: TILE_SIZE,
           solid: true,
           room: room.id,
           interactive: true,
           owner: 'player',
           rotation: 0
        };
        
        // Adjust default sizes
        if (newObj.type === 'bed') { newObj.width = TILE_SIZE * 2; newObj.height = TILE_SIZE * 3; newObj.isSeat = true; }
        if (newObj.type === 'desk') { newObj.width = TILE_SIZE * 2; newObj.height = TILE_SIZE; }
        if (newObj.type === 'bookshelf') { newObj.width = TILE_SIZE * 2; newObj.height = TILE_SIZE; }

        this.objects.push(newObj);
     } else if (this.buildMode.action === 'move' && this.buildMode.selectedObjectId) {
        if (this.tileMap.isSolid(snapX, snapY)) return;
        const objToMove = this.objects.find(o => o.id === this.buildMode.selectedObjectId);
        if (objToMove) {
           objToMove.x = snapX;
           objToMove.y = snapY;
           objToMove.room = room.id;
        }
        this.buildMode.selectedObjectId = null;
     } else {
        // Find clicked object
        const clickedObj = this.objects.find(o => 
           worldX >= o.x && worldX <= o.x + o.width &&
           worldY >= o.y && worldY <= o.y + o.height &&
           o.owner === 'player'
        );

        if (!clickedObj) return;

        if (this.buildMode.action === 'remove') {
           this.objects = this.objects.filter(o => o.id !== clickedObj.id);
        } else if (this.buildMode.action === 'rotate') {
           clickedObj.rotation = (clickedObj.rotation || 0) + 90 as 0 | 90 | 180 | 270;
           if (clickedObj.rotation >= 360) clickedObj.rotation = 0;
           
           // Swap width and height for 90/270 degree rotations
           const oldW = clickedObj.width;
           clickedObj.width = clickedObj.height;
           clickedObj.height = oldW;
        } else if (this.buildMode.action === 'move') {
           this.buildMode.selectedObjectId = clickedObj.id;
        }
     }
  }

  public triggerEmote(emoteType: EmoteType) {
    this.player.emote = {
      type: emoteType,
      expiresAt: Date.now() + 3000,
    };
  }

  public triggerInteraction() {
    if (this.activeNearbyAgent) {
      this.events.onAgentTalk(this.activeNearbyAgent);
      return;
    }

    if (this.activeNearbyObject) {
      // If it's a seat, toggle sitting
      if (this.activeNearbyObject.isSeat) {
        if (this.player.isSitting) {
          this.player.isSitting = false;
          this.player.animationState = 'idle';
        } else {
          this.player.isSitting = true;
          this.player.animationState = 'sit';
          this.player.position.x = this.activeNearbyObject.x + (this.activeNearbyObject.width - 32) / 2;
          this.player.position.y = this.activeNearbyObject.y + 4;
        }
      }
      this.events.onObjectInteract(this.activeNearbyObject);
    }
  }

  public teleportTo(x: number, y: number, roomId?: string) {
    this.player.position.x = x;
    this.player.position.y = y;
    this.player.isSitting = false;
    this.player.animationState = 'idle';
    this.targetClickPosition = null;
    this.checkRoomTransition();
  }

  private update(dt: number, currentTime: number) {
    this.updatePlayerMovement(dt);
    this.updateAgents(dt, currentTime);
    this.updateProximity();
    this.checkDoorways();
    this.checkRoomTransition();
    this.updateCamera();
  }

  private updatePlayerMovement(dt: number) {
    if (this.player.isSitting) {
      // Check if player pressed movement key to stand up
      const hasMovementKey =
        this.keysPressed['w'] ||
        this.keysPressed['a'] ||
        this.keysPressed['s'] ||
        this.keysPressed['d'] ||
        this.keysPressed['arrowup'] ||
        this.keysPressed['arrowdown'] ||
        this.keysPressed['arrowleft'] ||
        this.keysPressed['arrowright'];

      if (hasMovementKey) {
        this.player.isSitting = false;
        this.player.animationState = 'idle';
      } else {
        return;
      }
    }

    let dx = 0;
    let dy = 0;

    // Keyboard inputs
    if (this.keysPressed['w'] || this.keysPressed['arrowup']) dy -= 1;
    if (this.keysPressed['s'] || this.keysPressed['arrowdown']) dy += 1;
    if (this.keysPressed['a'] || this.keysPressed['arrowleft']) dx -= 1;
    if (this.keysPressed['d'] || this.keysPressed['arrowright']) dx += 1;

    // Mouse / Tap click target movement
    if (dx === 0 && dy === 0 && this.targetClickPosition) {
      const distThreshold = 4;
      const tX = this.targetClickPosition.x - 16;
      const tY = this.targetClickPosition.y - 16;
      const diffX = tX - this.player.position.x;
      const diffY = tY - this.player.position.y;
      const dist = Math.hypot(diffX, diffY);

      if (dist > distThreshold) {
        dx = diffX / dist;
        dy = diffY / dist;
      } else {
        this.targetClickPosition = null;
      }
    } else if (dx !== 0 || dy !== 0) {
      // Keyboard overrides click destination
      this.targetClickPosition = null;
    }

    // Apply movement with diagonal normalization
    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);
      const moveDistance = this.player.speed * (dt * 60);
      const stepX = (dx / length) * moveDistance;
      const stepY = (dy / length) * moveDistance;

      // Determine direction
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.player.direction = dy > 0 ? 'down' : 'up';
      }

      // Collision checks with sliding along walls
      const newX = this.player.position.x + stepX;
      const newY = this.player.position.y + stepY;

      // Check X move
      if (!this.checkCollision(newX, this.player.position.y)) {
        this.player.position.x = newX;
      }
      // Check Y move
      if (!this.checkCollision(this.player.position.x, newY)) {
        this.player.position.y = newY;
      }

      this.player.animationState = 'walk';
    } else {
      if (this.player.animationState === 'walk') {
        this.player.animationState = 'idle';
      }
    }
  }

  private checkCollision(x: number, y: number): boolean {
    // Player collision bounding box (bottom half of sprite)
    const boxX = x + 8;
    const boxY = y + 16;
    const boxW = 16;
    const boxH = 14;

    // Check corners against solid tiles
    const corners = [
      { x: boxX, y: boxY },
      { x: boxX + boxW, y: boxY },
      { x: boxX, y: boxY + boxH },
      { x: boxX + boxW, y: boxY + boxH },
    ];

    for (const corner of corners) {
      if (this.tileMap.isSolid(corner.x, corner.y)) {
        return true;
      }
    }

    // Check against solid world objects
    for (const obj of this.objects) {
      if (!obj.solid) continue;
      // Object AABB overlap
      if (
        boxX < obj.x + obj.width &&
        boxX + boxW > obj.x &&
        boxY < obj.y + obj.height &&
        boxY + boxH > obj.y
      ) {
        return true;
      }
    }

    return false;
  }

  public setTasks(tasks: TaskItem[]) {
    this.tasks = tasks;
  }

  public getActiveTaskForAgent(agentId: string): TaskItem | undefined {
    return this.tasks.find((t) => t.assignedToAgentId === agentId && t.status === 'in_progress');
  }

  public setAgentAnimation(
    agentId: string,
    state: import('../types').AnimationState,
    emote?: { type: any; text?: string; expiresAt: number }
  ) {
    const cleanId = agentId.toLowerCase().replace(/^agent_/, '');
    const target = this.agents.find(
      (a) =>
        a.id.toLowerCase() === agentId.toLowerCase() ||
        a.id.toLowerCase() === `agent_${cleanId}` ||
        a.id.toLowerCase() === cleanId
    );

    if (target) {
      target.animationState = state;
      target.aiAnimationOverride = {
        state,
        expiresAt: Date.now() + 15000,
      };
      if (emote) {
        target.emote = emote;
      }
    }
  }

  public clearAgentAnimation(agentId: string) {
    const cleanId = agentId.toLowerCase().replace(/^agent_/, '');
    const target = this.agents.find(
      (a) =>
        a.id.toLowerCase() === agentId.toLowerCase() ||
        a.id.toLowerCase() === `agent_${cleanId}` ||
        a.id.toLowerCase() === cleanId
    );

    if (target) {
      target.aiAnimationOverride = undefined;
      target.animationState = 'idle';
    }
  }

  private updateAgents(dt: number, currentTime: number) {
    // 1. Check task simulation tick (e.g. every 2.5s, simulate progress on in-progress tasks)
    if (currentTime - this.lastTaskProgressTick > 2500) {
      this.lastTaskProgressTick = currentTime;
      for (const task of this.tasks) {
        if (task.status === 'in_progress' && (task.progress ?? 0) < 100) {
          const newProgress = Math.min(100, (task.progress || 0) + 1);
          task.progress = newProgress;
          const isDone = newProgress >= 100;
          if (isDone) {
            task.status = 'done';
            // Trigger happy emote
            const assignedAgent = this.agents.find(a => a.id === task.assignedToAgentId);
            if (assignedAgent) {
              assignedAgent.emote = { type: 'happy', expiresAt: currentTime + 4000 };
            }
          }
          this.events.onTaskProgress?.(task.id, newProgress, isDone);
        }
      }
    }

    // 2. Agent A* Pathfinding & Movement Routine
    for (const agent of this.agents) {
      // Dynamic mood calculation
      const isWorking = this.tasks.some(t => t.assignedToAgentId === agent.id && t.status === 'in_progress');
      if (isWorking) {
        agent.energy = Math.max(0, agent.energy - 0.01);
      } else {
        agent.energy = Math.min(100, agent.energy + 0.05);
      }
      
      // Satisfaction based on work/rest
      if (isWorking && agent.energy > 20) {
        agent.satisfaction = Math.min(100, agent.satisfaction + 0.01);
      } else if (agent.energy < 20) {
        agent.satisfaction = Math.max(0, agent.satisfaction - 0.05);
      }
      
      const activeTask = this.tasks.find(
        (t) => t.assignedToAgentId === agent.id && t.status === 'in_progress'
      );

      // Check if player is very close to agent
      const distToPlayer = Math.hypot(
        this.player.position.x - agent.position.x,
        this.player.position.y - agent.position.y
      );

      if (distToPlayer < 50 || this.interactingAgentId === agent.id) {
        const diffX = this.player.position.x - agent.position.x;
        const diffY = this.player.position.y - agent.position.y;
        if (Math.abs(diffX) > Math.abs(diffY)) {
          agent.direction = diffX > 0 ? 'right' : 'left';
        } else {
          agent.direction = diffY > 0 ? 'down' : 'up';
        }

        if (agent.aiAnimationOverride && Date.now() < agent.aiAnimationOverride.expiresAt) {
          agent.animationState = agent.aiAnimationOverride.state;
        } else if (this.interactingAgentId === agent.id) {
          agent.animationState = 'talk';
        }
        continue;
      }

      // Check if AI animation override is currently commanding this character
      if (agent.aiAnimationOverride && Date.now() < agent.aiAnimationOverride.expiresAt) {
        agent.animationState = agent.aiAnimationOverride.state;
        continue;
      }

      // Handle A* path navigation
      if (agent.path && agent.path.length > 0 && agent.currentWaypointIndex !== undefined) {
        const targetWp = agent.path[agent.currentWaypointIndex];
        const dx = targetWp.x - (agent.position.x + 16);
        const dy = targetWp.y - (agent.position.y + 16);
        const dist = Math.hypot(dx, dy);

        if (dist < 4) {
          agent.currentWaypointIndex++;
          if (agent.currentWaypointIndex >= agent.path.length) {
            agent.path = undefined;
            agent.currentWaypointIndex = undefined;
            agent.animationState = 'idle';
          }
        } else {
          const speed = (agent.speed || 1.4) * (dt * 60);
          const moveX = (dx / dist) * speed;
          const moveY = (dy / dist) * speed;

          if (Math.abs(dx) > Math.abs(dy)) {
            agent.direction = dx > 0 ? 'right' : 'left';
          } else {
            agent.direction = dy > 0 ? 'down' : 'up';
          }

          agent.position.x += moveX;
          agent.position.y += moveY;
          agent.animationState = 'walk';
        }
      } else {
        if (!agent.nextMoveTime || currentTime > agent.nextMoveTime) {
          agent.nextMoveTime = currentTime + 10000 + Math.random() * 8000;

          const basePos = { ...agent.position };
          const offsetX = (Math.random() - 0.5) * 5 * TILE_SIZE;
          const offsetY = (Math.random() - 0.5) * 5 * TILE_SIZE;
          const destX = Math.max(2 * TILE_SIZE, Math.min((MAP_WIDTH_TILES - 3) * TILE_SIZE, basePos.x + offsetX));
          const destY = Math.max(18 * TILE_SIZE, Math.min((MAP_HEIGHT_TILES - 3) * TILE_SIZE, basePos.y + offsetY));

          const computedPath = findPath(
            agent.position.x + 16,
            agent.position.y + 16,
            destX,
            destY,
            this.tileMap,
            this.objects
          );

          if (computedPath && computedPath.length > 1) {
            agent.path = computedPath;
            agent.currentWaypointIndex = 1;
          }
        }

        if (activeTask) {
          agent.animationState = 'work';
        } else {
          const pType = agent.personalityProfile?.idleBehaviorType;
          if (pType === 'calm_meditation' || pType === 'executive_planning') {
            agent.animationState = 'sit';
          } else if (pType === 'creative_sketching') {
            agent.animationState = 'think';
          } else if (pType === 'cheerful_welcoming') {
            agent.animationState = 'happy';
          } else {
            agent.animationState = 'idle';
          }
        }
      }

      // Personality emotes
      const pType = agent.personalityProfile?.idleBehaviorType;
      const tick = Math.floor(currentTime / 5000);
      const hash = (agent.name.charCodeAt(0) * 1000 + tick) % 7;

      if (hash === 1 && (!agent.emote || agent.emote.expiresAt < currentTime)) {
        let emoteType: 'idea' | 'think' | 'speech' | 'happy' | 'alert' | 'heart' = 'think';
        if (pType === 'energetic_pacing') {
          emoteType = Math.random() > 0.5 ? 'idea' : 'alert';
        } else if (pType === 'analytical_coding' || pType === 'vector_analysis') {
          emoteType = 'think';
        } else if (pType === 'creative_sketching') {
          emoteType = Math.random() > 0.5 ? 'idea' : 'heart';
        } else if (pType === 'cheerful_welcoming' || pType === 'calm_meditation') {
          emoteType = 'happy';
        } else if (pType === 'executive_planning') {
          emoteType = 'speech';
        }

        agent.emote = {
          type: emoteType,
          expiresAt: currentTime + 2800,
        };
      }
    }
  }

  private updateProximity() {
    const pX = this.player.position.x + 16;
    const pY = this.player.position.y + 16;

    // Check nearest agent
    let nearestAgent: AIAgent | null = null;
    let minAgentDist = 48; // Max interaction distance

    for (const agent of this.agents) {
      const aX = agent.position.x + 16;
      const aY = agent.position.y + 16;
      const dist = Math.hypot(pX - aX, pY - aY);
      if (dist < minAgentDist) {
        minAgentDist = dist;
        nearestAgent = agent;
      }
    }
    this.activeNearbyAgent = nearestAgent;

    // Break interaction if we walked away
    if (this.interactingAgentId && nearestAgent?.id !== this.interactingAgentId) {
      this.interactingAgentId = null;
      this.events.onInteractionBreak?.();
    }

    // Check nearest interactive object
    let nearestObj: WorldObject | null = null;
    let minObjDist = 44;

    for (const obj of this.objects) {
      if (!obj.interactive && !obj.isSeat) continue;
      const oX = obj.x + obj.width / 2;
      const oY = obj.y + obj.height / 2;
      const dist = Math.hypot(pX - oX, pY - oY);
      if (dist < minObjDist) {
        minObjDist = dist;
        nearestObj = obj;
      }
    }
    this.activeNearbyObject = nearestObj;
  }

  private checkDoorways() {
    const pX = this.player.position.x + 16;
    const pY = this.player.position.y + 16;

    for (const door of INITIAL_DOORWAYS) {
      const dist = Math.hypot(pX - (door.x + 16), pY - (door.y + 16));
      if (dist < 24) {
        // Warp player smoothly
        this.player.position.x = door.targetX;
        this.player.position.y = door.targetY;
        this.targetClickPosition = null;
        this.checkRoomTransition();
        break;
      }
    }
  }

  private checkRoomTransition() {
    const room = this.tileMap.getRoomAt(this.player.position.x + 16, this.player.position.y + 16);
    if (room.id !== this.currentRoomId) {
      this.currentRoomId = room.id;
      this.currentRoomDisplayName = room.displayName;
      this.currentFloor = room.floor;
      this.events.onRoomChange(room.displayName, room.floor);
    }
  }

  private updateCamera() {
    // Smooth camera follow target
    const targetX = this.player.position.x + 16;
    const targetY = this.player.position.y + 16;
    this.camera.x += (targetX - this.camera.x) * 0.12;
    this.camera.y += (targetY - this.camera.y) * 0.12;
  }
}
