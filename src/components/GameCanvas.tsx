import React, { useEffect, useRef } from 'react';
import { AIAgent, TaskItem, WorldObject } from '../types';
import { GameEngine } from '../game/gameEngine';
import { WorldRenderer } from '../game/worldRenderer';
import { taskService } from '../services/domain/taskService';

interface GameCanvasProps {
  engineRef: React.MutableRefObject<GameEngine | null>;
  tasks: TaskItem[];
  onAgentTalk: (agent: AIAgent) => void;
  onObjectInteract: (obj: WorldObject) => void;
  onRoomChange: (roomName: string, floor: string) => void;
  onInteractionBreak?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engineRef,
  tasks,
  onAgentTalk,
  onObjectInteract,
  onRoomChange,
  onInteractionBreak,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WorldRenderer | null>(null);

  // Sync tasks
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTasks(tasks);
    }
  }, [tasks, engineRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 1. Initialize GameEngine if not created
    if (!engineRef.current) {
      engineRef.current = new GameEngine({
        onAgentTalk,
        onObjectInteract,
        onRoomChange,
        onInteractionBreak,
        onTaskProgress: (taskId, progress) => {
          taskService.updateTaskProgress(taskId, progress);
        },
      });
    }
    const engine = engineRef.current;

    // 2. Initialize WorldRenderer
    const renderer = new WorldRenderer(canvas, engine);
    rendererRef.current = renderer;

    // 3. ResizeObserver to handle container size
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(container);

    // 4. Unified Frame Loop - Synchronously updates physics and renders canvas in a single RAF cycle
    let animId: number;
    const unifiedLoop = (time: number) => {
      engine.tick(time);
      renderer.render(time);
      animId = requestAnimationFrame(unifiedLoop);
    };
    animId = requestAnimationFrame(unifiedLoop);

    // 6. Keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling on arrow keys & space when canvas is focused
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(e.key)) {
        // If typing in an input field, do not prevent default
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        e.preventDefault();
      }

      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      engine.handleKeyDown(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      engine.handleKeyUp(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      engine.stop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer click / tap handler to walk to spot
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const rect = canvas.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates taking camera and zoom into account
    const scale = engine.zoomScale;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const worldX = (clickScreenX - centerX) / scale + engine.camera.x;
    const worldY = (clickScreenY - centerY) / scale + engine.camera.y;

    engine.setClickTarget(worldX, worldY);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#14151f] select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full block cursor-crosshair touch-none outline-none select-none drop-shadow-sm transition-opacity duration-200"
        style={
          {
            imageRendering: 'pixelated',
            WebkitImageRendering: 'pixelated',
          } as React.CSSProperties
        }
      />

      {/* Subtle bottom control hint bar matching Screenshot 2 */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none z-20">
        <div className="bg-black/75 px-3 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-800/60 shadow backdrop-blur whitespace-nowrap">
          WASD or Arrows to move • Click/Tap to walk • E to talk/interact • Space to sit
        </div>
      </div>
    </div>
  );
};
