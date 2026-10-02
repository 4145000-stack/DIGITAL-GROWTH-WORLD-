import { AIAgent, Character, WorldObject } from '../types';
import { MAP_HEIGHT_TILES, MAP_WIDTH_TILES, ROOM_ZONES, TILE_SIZE } from './constants';
import { GameEngine } from './gameEngine';
import { PixelArtRenderer } from './pixelArt';

export class WorldRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private engine: GameEngine;

  constructor(canvas: HTMLCanvasElement, engine: GameEngine) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
    this.engine = engine;

    // Enable crisp pixel-art rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  public render(time: number) {
    const { ctx, canvas, engine } = this;
    const width = canvas.width;
    const height = canvas.height;
    const scale = engine.zoomScale;

    // Clear background
    ctx.fillStyle = '#14151f';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Center camera on screen
    ctx.translate(Math.floor(width / 2), Math.floor(height / 2));
    ctx.scale(scale, scale);
    ctx.translate(Math.floor(-engine.camera.x), Math.floor(-engine.camera.y));

    // Calculate visible tile range (Frustum culling)
    const halfViewW = (width / 2) / scale;
    const halfViewH = (height / 2) / scale;
    const minTileX = Math.max(0, Math.floor((engine.camera.x - halfViewW - TILE_SIZE) / TILE_SIZE));
    const maxTileX = Math.min(MAP_WIDTH_TILES - 1, Math.ceil((engine.camera.x + halfViewW + TILE_SIZE) / TILE_SIZE));
    const minTileY = Math.max(0, Math.floor((engine.camera.y - halfViewH - TILE_SIZE) / TILE_SIZE));
    const maxTileY = Math.min(MAP_HEIGHT_TILES - 1, Math.ceil((engine.camera.y + halfViewH + TILE_SIZE) / TILE_SIZE));

    // 1. Draw Ground & Wall Tiles
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      for (let tx = minTileX; tx <= maxTileX; tx++) {
        const tileType = engine.tileMap.tiles[ty]?.[tx];
        if (tileType && tileType !== 'void') {
          PixelArtRenderer.drawTile(ctx, tileType, tx * TILE_SIZE, ty * TILE_SIZE, time);
        }
      }
    }

    // 2. Draw Building Signage & Architectural Accents (Downtown Corporate Sign)
    this.drawBuildingSign(ctx, time);

    // 3. Draw Click Target Marker (if moving towards target)
    if (engine.targetClickPosition) {
      this.drawClickMarker(ctx, engine.targetClickPosition.x, engine.targetClickPosition.y, time);
    }

    // 4. Depth Sorting for Objects, Projected Ground Shadows, and Characters
    // Combine characters, objects, and dynamic projected shadows for proper isometric/top-down z-ordering
    type RenderItem =
      | { type: 'object'; item: WorldObject; sortY: number }
      | { type: 'shadow'; item: Character | AIAgent; isPlayer: boolean; sortY: number }
      | { type: 'character'; item: Character | AIAgent; isPlayer: boolean; sortY: number };

    const renderQueue: RenderItem[] = [];

    // Filter objects in view
    for (const obj of engine.objects) {
      if (
        obj.x + obj.width > engine.camera.x - halfViewW - 64 &&
        obj.x < engine.camera.x + halfViewW + 64 &&
        obj.y + obj.height > engine.camera.y - halfViewH - 64 &&
        obj.y < engine.camera.y + halfViewH + 64
      ) {
        renderQueue.push({
          type: 'object',
          item: obj,
          sortY: obj.y + (obj.isSeat ? 12 : obj.height),
        });
      }
    }

    // Add Agents (Dynamic ground shadow placed on floor immediately beneath character body)
    for (const agent of engine.agents) {
      renderQueue.push({
        type: 'shadow',
        item: agent,
        isPlayer: false,
        sortY: agent.position.y + (agent.isSitting ? 22 : 27),
      });
      renderQueue.push({
        type: 'character',
        item: agent,
        isPlayer: false,
        sortY: agent.position.y + 28,
      });
    }

    // Add Player
    renderQueue.push({
      type: 'shadow',
      item: engine.player,
      isPlayer: true,
      sortY: engine.player.position.y + (engine.player.isSitting ? 22 : 27),
    });
    renderQueue.push({
      type: 'character',
      item: engine.player,
      isPlayer: true,
      sortY: engine.player.position.y + 28,
    });

    // Sort by Y coordinate so foreground items draw over background items
    renderQueue.sort((a, b) => a.sortY - b.sortY);

    for (const entry of renderQueue) {
      if (entry.type === 'object') {
        PixelArtRenderer.drawObject(ctx, entry.item, time);
      } else if (entry.type === 'shadow') {
        this.drawDynamicProjectedShadow(ctx, entry.item, entry.isPlayer, time);
      } else {
        const activeTask = !entry.isPlayer ? engine.getActiveTaskForAgent(entry.item.id) : undefined;
        PixelArtRenderer.drawCharacter(ctx, entry.item, time, entry.isPlayer, activeTask);
      }
    }

    // Render A* path debugging lines if enabled
    if (engine.showPathDebug) {
      for (const agent of engine.agents) {
        if (agent.path && agent.path.length > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(agent.position.x + 16, agent.position.y + 16);
          for (let i = (agent.currentWaypointIndex || 0); i < agent.path.length; i++) {
            const wp = agent.path[i];
            ctx.lineTo(wp.x, wp.y);
          }
          ctx.stroke();

          // Waypoint dots
          for (let i = (agent.currentWaypointIndex || 0); i < agent.path.length; i++) {
            const wp = agent.path[i];
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(wp.x - 2, wp.y - 2, 4, 4);
          }
        }
      }
    }

    // 5. Draw Contextual In-World Interaction Indicator Prompt
    this.drawInteractionPrompts(ctx, time);
    
    // Draw Agent Mood
    for (const agent of engine.agents) {
      this.drawAgentMood(ctx, agent, time);
    }

    ctx.restore();
  }

  private drawAgentMood(ctx: CanvasRenderingContext2D, agent: AIAgent, time: number) {
    const { x, y } = agent.position;
    // Energy > 70 ⚡, > 40 🔋, else 💤. Satisfaction > 70 😊, > 40 😐, else 😔.
    const energyEmoji = agent.energy > 70 ? '⚡' : (agent.energy > 40 ? '🔋' : '💤');
    const moodEmoji = agent.satisfaction > 70 ? '😊' : (agent.satisfaction > 40 ? '😐' : '😔');
    
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${moodEmoji}`, x + 16, y - 8);
    ctx.fillText(`${energyEmoji}`, x + 16, y - 20);
  }

  private drawBuildingSign(ctx: CanvasRenderingContext2D, time: number) {
    // Corporate Header above entrance matching Screenshot 1
    const sx = 28 * TILE_SIZE;
    const sy = 0.5 * TILE_SIZE;
    const sw = 8 * TILE_SIZE;
    const sh = 1.2 * TILE_SIZE;

    // Sign backdrop
    ctx.fillStyle = '#334155';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.fillStyle = '#1e293b';
    ctx.strokeRect(sx, sy, sw, sh);

    // Glowing cyan logo icon
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(sx + 8, sy + 6, 8, 8);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(sx + 10, sy + 8, 4, 4);

    // Text: DIGITAL GROWTH CORP / G-NERIC CORP
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DIGITAL GROWTH CORP', sx + 22, sy + 18);
  }

  private drawClickMarker(
    ctx: CanvasRenderingContext2D,
    tx: number,
    ty: number,
    time: number
  ) {
    const pulse = (Math.sin(time * 0.01) + 1) * 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 6 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(tx - 2, ty - 2, 4, 4);
  }

  private drawInteractionPrompts(ctx: CanvasRenderingContext2D, time: number) {
    const { activeNearbyAgent, activeNearbyObject, player } = this.engine;

    if (activeNearbyAgent) {
      // Floating prompt above agent
      const ax = activeNearbyAgent.position.x + 16;
      const ay = activeNearbyAgent.position.y - 18;
      const pulseY = Math.sin(time * 0.008) * 2;

      ctx.save();
      ctx.translate(ax, ay + pulseY);

      // Prompt background pill
      const promptText = `[E] Talk with ${activeNearbyAgent.name}`;
      ctx.font = 'bold 10px monospace';
      const textWidth = ctx.measureText(promptText).width;
      const pillW = textWidth + 18;
      const pillH = 18;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(-pillW / 2, -pillH / 2, pillW, pillH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(-pillW / 2, -pillH / 2, pillW, pillH);

      // E Key Badge
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-pillW / 2 + 3, -pillH / 2 + 3, 12, 12);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('E', -pillW / 2 + 9, -pillH / 2 + 12);

      // Text label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Talk with ${activeNearbyAgent.name}`, -pillW / 2 + 18, -pillH / 2 + 12);

      ctx.restore();
    } else if (activeNearbyObject && activeNearbyObject.interactive) {
      // Floating prompt above object
      const ox = activeNearbyObject.x + activeNearbyObject.width / 2;
      const oy = activeNearbyObject.y - 12;
      const pulseY = Math.sin(time * 0.008) * 2;

      ctx.save();
      ctx.translate(ox, oy + pulseY);

      const label = activeNearbyObject.interactLabel || 'Interact';
      ctx.font = 'bold 9px monospace';
      const textWidth = ctx.measureText(label).width;
      const pillW = textWidth + 24;
      const pillH = 18;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(-pillW / 2, -pillH / 2, pillW, pillH);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(-pillW / 2, -pillH / 2, pillW, pillH);

      // Keycap
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-pillW / 2 + 3, -pillH / 2 + 3, 12, 12);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(activeNearbyObject.isSeat ? '␣' : 'E', -pillW / 2 + 9, -pillH / 2 + 12);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, -pillW / 2 + 18, -pillH / 2 + 12);

      ctx.restore();
    }
  }

  /**
   * Draw dynamic projected shadows beneath the player and AI agents based on their
   * current tile position, lighting environment (exterior sunlight vs. interior ceiling fixtures),
   * surface material absorption, and movement dynamics (walking stride & breathing elevation).
   */
  private drawDynamicProjectedShadow(
    ctx: CanvasRenderingContext2D,
    char: Character | AIAgent,
    isPlayer: boolean,
    time: number
  ) {
    const { x, y } = char.position;
    const centerX = x + 16;
    const isSitting = char.isSitting || char.animationState === 'sit';
    const isWalking = char.animationState === 'walk';
    const feetY = y + (isSitting ? 24 : 28);

    // Current tile index and tile type
    const tileX = Math.max(0, Math.min(MAP_WIDTH_TILES - 1, Math.floor(centerX / TILE_SIZE)));
    const tileY = Math.max(0, Math.min(MAP_HEIGHT_TILES - 1, Math.floor(feetY / TILE_SIZE)));
    const tileType = this.engine.tileMap.tiles[tileY]?.[tileX] || 'void';

    // Exterior vs. Interior environment check
    const isExterior =
      tileY <= 15 ||
      tileType.startsWith('road') ||
      tileType === 'sidewalk' ||
      tileType === 'parking_bay' ||
      tileType === 'curb' ||
      tileType.startsWith('exterior');

    let projOffsetX = 0;
    let projOffsetY = 0;
    let contactColor = 'rgba(15, 23, 42, 0.52)';
    let penumbraColor = 'rgba(24, 34, 52, 0.28)';
    let ambientBounceColor: string | null = null;

    if (isExterior) {
      // 1. Exterior: Natural directional sunlight cast from upper-left (azimuth ~50 deg)
      // Subtle solar azimuth drift with time creates organic diurnal lighting
      const sunAngle = Math.PI * 0.28 + Math.sin(time * 0.00015) * 0.03;
      const sunDx = Math.cos(sunAngle); // ~0.64 (pushes right)
      const sunDy = Math.sin(sunAngle); // ~0.76 (pushes down)

      const baseProjectionDist = isSitting ? 4 : 11;
      projOffsetX = sunDx * baseProjectionDist;
      projOffsetY = sunDy * (baseProjectionDist * 0.52);

      // Surface material adaptation for exterior tiles
      if (tileType.startsWith('road') || tileType === 'curb') {
        // Dark asphalt absorbs light heavily
        contactColor = 'rgba(10, 14, 22, 0.58)';
        penumbraColor = 'rgba(15, 20, 32, 0.34)';
      } else if (tileType === 'road_zebra' || tileType === 'road_line') {
        // High-contrast white road paint stripes
        contactColor = 'rgba(14, 20, 35, 0.62)';
        penumbraColor = 'rgba(22, 30, 48, 0.36)';
      } else {
        // Concrete sidewalk & parking bays
        contactColor = 'rgba(24, 34, 50, 0.48)';
        penumbraColor = 'rgba(38, 50, 68, 0.26)';
      }
    } else {
      // 2. Interior: Overhead ceiling light bays with tile-aware perspective projection
      const currentRoom = ROOM_ZONES.find(
        (r) =>
          centerX >= r.bounds.x &&
          centerX < r.bounds.x + r.bounds.width &&
          feetY >= r.bounds.y &&
          feetY < r.bounds.y + r.bounds.height
      );

      const bayW = 6 * TILE_SIZE; // Light fixture grid interval X (~192px)
      const bayH = 4.5 * TILE_SIZE; // Light fixture grid interval Y (~144px)
      const roomX0 = currentRoom ? currentRoom.bounds.x : 0;
      const roomY0 = currentRoom ? currentRoom.bounds.y : 16 * TILE_SIZE;

      const relX = centerX - roomX0;
      const relY = feetY - roomY0;

      // Closest ceiling luminaire coordinates
      const lightBayCol = Math.floor(relX / bayW);
      const lightBayRow = Math.floor(relY / bayH);
      const lightFixtureX = roomX0 + (lightBayCol + 0.5) * bayW;
      const lightFixtureY = roomY0 + (lightBayRow + 0.35) * bayH;

      const lightDiffX = centerX - lightFixtureX;
      const lightDiffY = feetY - lightFixtureY;

      // Project shadow away from the nearest ceiling light fixture
      const maxProj = isSitting ? 3 : 6.5;
      projOffsetX = Math.max(-maxProj, Math.min(maxProj, (lightDiffX / bayW) * 7.5));
      projOffsetY = Math.max(-1.5, Math.min(maxProj * 0.75, (lightDiffY / bayH) * 5 + 2));

      // Interior tile material absorption & ambiance
      switch (tileType) {
        case 'interior_floor_wood':
          // Strategy office mahogany hardwood
          contactColor = 'rgba(40, 20, 12, 0.56)';
          penumbraColor = 'rgba(56, 30, 18, 0.30)';
          break;
        case 'interior_floor_lab':
          // AI Operations lab with server rack ambient glow
          contactColor = 'rgba(8, 22, 38, 0.60)';
          penumbraColor = 'rgba(12, 34, 54, 0.32)';
          ambientBounceColor = 'rgba(56, 189, 248, 0.08)';
          break;
        case 'interior_floor_focus':
          // Focus room acoustic weave
          contactColor = 'rgba(18, 28, 22, 0.52)';
          penumbraColor = 'rgba(26, 42, 32, 0.28)';
          break;
        case 'interior_floor_tile':
          // Corporate polished terrazzo
          contactColor = 'rgba(18, 26, 38, 0.50)';
          penumbraColor = 'rgba(30, 42, 58, 0.26)';
          break;
        default:
          contactColor = 'rgba(16, 22, 32, 0.50)';
          penumbraColor = 'rgba(28, 38, 50, 0.26)';
          break;
      }
    }

    // 3. Stance, Movement, and Breathing Dynamics
    const idleBob = isSitting ? 0 : Math.sin(time * 0.005 + (char.id.length || 0)) * 1;
    const elevationScale = isSitting ? 0.85 : 1 - idleBob * 0.08;
    const elevationSpread = 1 + idleBob * 0.06;

    let strideWidthMult = 1;
    let walkDirOffsetX = 0;
    let walkDirOffsetY = 0;
    if (isWalking) {
      const stepPhase = Math.sin(time * 0.015);
      strideWidthMult = 1 + Math.abs(stepPhase) * 0.24;
      if (char.direction === 'right') walkDirOffsetX = 2;
      else if (char.direction === 'left') walkDirOffsetX = -2;
      else if (char.direction === 'down') walkDirOffsetY = 2;
      else if (char.direction === 'up') walkDirOffsetY = -1;
    }

    // Geometry calculations
    const penumbraCenterX = centerX + projOffsetX + walkDirOffsetX;
    const penumbraCenterY = feetY + projOffsetY + walkDirOffsetY;
    const penumbraRadiusX = (isSitting ? 9 : isExterior ? 12 : 10) * strideWidthMult * elevationSpread;
    const penumbraRadiusY = (isSitting ? 4.5 : isExterior ? 5.5 : 4.5) * elevationSpread;
    const penumbraAngle = Math.atan2(projOffsetY, projOffsetX || 0.1);

    const coreRadiusX = (isSitting ? 8.5 : 9.5) * strideWidthMult * elevationScale;
    const coreRadiusY = (isSitting ? 3.5 : 3.2) * elevationScale;

    // Pass A: Ambient bounce glow (if applicable, e.g. tech lab server glow)
    if (ambientBounceColor) {
      ctx.save();
      ctx.fillStyle = ambientBounceColor;
      ctx.beginPath();
      ctx.ellipse(centerX, feetY, coreRadiusX + 5, coreRadiusY + 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Pass B: Projected Penumbra (soft directional shadow)
    ctx.save();
    ctx.fillStyle = penumbraColor;
    ctx.beginPath();
    ctx.ellipse(
      penumbraCenterX,
      penumbraCenterY,
      penumbraRadiusX,
      penumbraRadiusY,
      penumbraAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Pass C: Umbra (core contact shadow directly grounding the feet onto the floor)
    ctx.save();
    ctx.fillStyle = contactColor;
    ctx.beginPath();
    ctx.ellipse(centerX, feetY, coreRadiusX, coreRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Pass D: For player, a subtle crisp contact rim to anchor onto pixel art tiles
    if (isPlayer) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.beginPath();
      ctx.ellipse(centerX, feetY, coreRadiusX * 0.75, coreRadiusY * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
