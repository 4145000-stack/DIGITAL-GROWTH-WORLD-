// A* Pathfinding Algorithm for AI Agents and Player Navigation

import { Position, WorldObject } from '../types';
import { TileMap } from './tileMap';
import { TILE_SIZE, MAP_WIDTH_TILES, MAP_HEIGHT_TILES } from './constants';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export function findPath(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  tileMap: TileMap,
  objects: WorldObject[]
): Position[] {
  const startTileX = Math.floor(startX / TILE_SIZE);
  const startTileY = Math.floor(startY / TILE_SIZE);
  const targetTileX = Math.floor(targetX / TILE_SIZE);
  const targetTileY = Math.floor(targetY / TILE_SIZE);

  if (startTileX === targetTileX && startTileY === targetTileY) {
    return [{ x: targetX, y: targetY }];
  }

  // Build temporary obstacle grid including solid objects
  const grid: boolean[][] = Array(MAP_HEIGHT_TILES)
    .fill(false)
    .map((_, y) =>
      Array(MAP_WIDTH_TILES)
        .fill(false)
        .map((_, x) => tileMap.solidGrid[y] && tileMap.solidGrid[y][x])
    );

  for (const obj of objects) {
    if (!obj.solid) continue;
    const minX = Math.floor(obj.x / TILE_SIZE);
    const maxX = Math.floor((obj.x + obj.width - 1) / TILE_SIZE);
    const minY = Math.floor(obj.y / TILE_SIZE);
    const maxY = Math.floor((obj.y + obj.height - 1) / TILE_SIZE);

    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        if (ty >= 0 && ty < MAP_HEIGHT_TILES && tx >= 0 && tx < MAP_WIDTH_TILES) {
          grid[ty][tx] = true;
        }
      }
    }
  }

  if (targetTileY >= 0 && targetTileY < MAP_HEIGHT_TILES && targetTileX >= 0 && targetTileX < MAP_WIDTH_TILES) {
    grid[targetTileY][targetTileX] = false; // Ensure target is walkable
  }

  const openSet: Node[] = [];
  const closedSet: boolean[][] = Array(MAP_HEIGHT_TILES)
    .fill(false)
    .map(() => Array(MAP_WIDTH_TILES).fill(false));

  const startNode: Node = {
    x: startTileX,
    y: startTileY,
    g: 0,
    h: Math.abs(targetTileX - startTileX) + Math.abs(targetTileY - startTileY),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);

  const neighbors = [
    { x: 0, y: -1, cost: 1 },
    { x: 0, y: 1, cost: 1 },
    { x: -1, y: 0, cost: 1 },
    { x: 1, y: 0, cost: 1 },
    { x: -1, y: -1, cost: 1.414 },
    { x: 1, y: -1, cost: 1.414 },
    { x: -1, y: 1, cost: 1.414 },
    { x: 1, y: 1, cost: 1.414 },
  ];

  let iterations = 0;
  const maxIterations = 1500;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;

    // Find node with lowest f
    let lowestIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }

    const current = openSet.splice(lowestIndex, 1)[0];

    if (current.x === targetTileX && current.y === targetTileY) {
      // Reconstruct path
      const path: Position[] = [];
      let curr: Node | null = current;
      while (curr !== null) {
        path.unshift({
          x: curr.x * TILE_SIZE + TILE_SIZE / 2,
          y: curr.y * TILE_SIZE + TILE_SIZE / 2,
        });
        curr = curr.parent;
      }
      return path;
    }

    closedSet[current.y][current.x] = true;

    for (const n of neighbors) {
      const nx = current.x + n.x;
      const ny = current.y + n.y;

      if (nx < 0 || nx >= MAP_WIDTH_TILES || ny < 0 || ny >= MAP_HEIGHT_TILES) continue;
      if (closedSet[ny][nx] || grid[ny][nx]) continue;

      // Prevent diagonal corner cutting
      if (n.x !== 0 && n.y !== 0) {
        if (grid[current.y][nx] || grid[ny][current.x]) continue;
      }

      const tentativeG = current.g + n.cost;

      let neighborNode = openSet.find((node) => node.x === nx && node.y === ny);

      if (!neighborNode) {
        neighborNode = {
          x: nx,
          y: ny,
          g: tentativeG,
          h: Math.abs(targetTileX - nx) + Math.abs(targetTileY - ny),
          f: 0,
          parent: current,
        };
        neighborNode.f = neighborNode.g + neighborNode.h;
        openSet.push(neighborNode);
      } else if (tentativeG < neighborNode.g) {
        neighborNode.g = tentativeG;
        neighborNode.f = neighborNode.g + neighborNode.h;
        neighborNode.parent = current;
      }
    }
  }

  // Fallback direct path if no A* path found
  return [{ x: targetX, y: targetY }];
}
