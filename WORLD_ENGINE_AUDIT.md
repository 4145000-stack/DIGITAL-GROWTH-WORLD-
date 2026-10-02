# DIGITAL GROWTH WORLD™ — WORLD ENGINE AUDIT
**Sprint:** 01 (Foundation Control)  
**Target:** Canvas 2D / 60 FPS Spatial Runtime Stability  

---

## 1. Engine Lifecycle Analysis
- **Mount & Unmount Lifecycle**:
  - `GameCanvas` mounts once on initial app load and remains in the DOM regardless of whether the user is in `'world'` mode or viewing business workspaces (`'home'`, `'opportunities'`, `'funnels'`, `'leads'`, `'money'`).
  - When non-world workspaces are active, the canvas is shielded via `pointer-events-none` with an overlay at `z-30`. This preserves simulation continuity without accidental clicks.
  - When `GameCanvas` unmounts (e.g. browser reload or hot restart), the cleanup callback disconnects the `ResizeObserver`, stops the engine, and cancels animation frame timers.

- **Double RAF Scheduling Identified (P1 Issue)**:
  - `GameCanvas.tsx` scheduled `requestAnimationFrame` for `renderer.render(time)`.
  - `GameEngine.ts` simultaneously scheduled `requestAnimationFrame` for `update(dt, currentTime)`.
  - *Risk*: Redundant browser frame scheduling, potential phase misalignment between physical simulation and visual rendering.
  - *Resolution*: Direct `renderer.render()` execution from the engine's main step or orchestrate both in a single coordinated RAF loop.

## 2. Collision & Physics
- Tile-based grid collision: Checks tile index collision against solid map boundaries (walls, borders, perimeter trees).
- Axis-Aligned Bounding Box (AABB) collision: Evaluates character bounding boxes against solid world objects (desks, conference tables, coffee machines, server racks).
- Movement vector normalization: Prevents diagonal walking speed amplification (`dx / dist * speed`).

## 3. Pathfinding & Agent Navigation
- `Pathfinder` class utilizes an A* search grid representation.
- Agents calculate waypoints across passable floor tiles, walking naturally along grid nodes towards desks, conference rooms, and stations without clipping through walls or furniture.

## 4. Rendering Performance & Frame Budget
- **Frustum Culling**: Computes visible tile bounds (`minTileX`, `maxTileX`, `minTileY`, `maxTileY`) based on `camera.x`, `camera.y`, canvas dimensions, and `zoomScale`. Non-visible tiles are skipped.
- **Y-Sorting**: Dynamic render list sorts all characters, players, and furniture by `y + height` so that entities visually overlap correctly in 2.5D isometric perspective.
- **Memory Footprint**: No per-frame allocations in render loops; reuse of canvas context state.
