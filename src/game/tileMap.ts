import { MAP_HEIGHT_TILES, MAP_WIDTH_TILES, ROOM_ZONES, TILE_SIZE } from './constants';
import { RoomZone } from '../types';

export type TileType =
  | 'road'
  | 'road_line'
  | 'road_zebra'
  | 'road_bus'
  | 'curb'
  | 'sidewalk'
  | 'parking_bay'
  | 'exterior_wall'
  | 'exterior_window'
  | 'exterior_door'
  | 'exterior_sign'
  | 'interior_wall_solid'
  | 'interior_wall_wood'
  | 'interior_glass_divider'
  | 'interior_floor_tile'
  | 'interior_floor_wood'
  | 'interior_floor_lab'
  | 'interior_floor_focus'
  | 'void';

export class TileMap {
  public width = MAP_WIDTH_TILES;
  public height = MAP_HEIGHT_TILES;
  public tiles: TileType[][] = [];
  public solidGrid: boolean[][] = [];

  constructor() {
    this.initMap();
  }

  private initMap() {
    // Initialize empty map
    this.tiles = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill('void'));
    this.solidGrid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(false));

    // 1. Downtown Exterior (y: 0 to 15)
    for (let y = 0; y <= 15; y++) {
      for (let x = 0; x < this.width; x++) {
        if (y < 2) {
          // Building facade wall
          this.tiles[y][x] = 'exterior_wall';
          this.solidGrid[y][x] = true;
        } else if (y === 2) {
          // Building windows & entrance
          if (x >= 30 && x <= 33) {
            this.tiles[y][x] = 'exterior_door';
            this.solidGrid[y][x] = false;
          } else if (x % 5 === 0) {
            this.tiles[y][x] = 'exterior_window';
            this.solidGrid[y][x] = true;
          } else {
            this.tiles[y][x] = 'exterior_wall';
            this.solidGrid[y][x] = true;
          }
        } else if (y >= 3 && y <= 10) {
          // Sidewalk
          if (y === 9 && (x >= 22 && x <= 27 || x >= 36 && x <= 41)) {
            this.tiles[y][x] = 'parking_bay';
          } else {
            this.tiles[y][x] = 'sidewalk';
          }
        } else if (y === 11) {
          // Curb edge
          this.tiles[y][x] = 'curb';
        } else if (y >= 12 && y <= 15) {
          // Road
          if (y === 12 && (x < 10 || (x >= 28 && x <= 35) || x > 54)) {
            this.tiles[y][x] = 'road_zebra'; // Pedestrian crosswalks
          } else if (y === 13) {
            this.tiles[y][x] = 'road_line'; // Dashed white lane
          } else if (y === 15 && x >= 52) {
            this.tiles[y][x] = 'road_bus'; // Yellow BUS lane
          } else {
            this.tiles[y][x] = 'road';
          }
        }
      }
    }

    // Outer exterior boundary solid walls
    for (let x = 0; x < this.width; x++) {
      this.solidGrid[0][x] = true;
      this.solidGrid[15][x] = true; // Bottom boundary of world downtown
    }
    for (let y = 0; y < this.height; y++) {
      this.solidGrid[y][0] = true;
      this.solidGrid[y][this.width - 1] = true;
    }

    // 2. Interior Corporate HQ (y: 16 to 47)
    // Floor setup
    for (let y = 16; y < this.height; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (y < 26) {
          // Lobby & Reception floor
          this.tiles[y][x] = 'interior_floor_tile';
        } else if (y >= 26 && x >= 30) {
          // Open Office
          if (y >= 38 && x >= 30) {
            // Wood breakout parquet
            this.tiles[y][x] = 'interior_floor_wood';
          } else {
            this.tiles[y][x] = 'interior_floor_tile';
          }
        } else if (y >= 26 && y < 38 && x < 30) {
          // AI Core Lab
          this.tiles[y][x] = 'interior_floor_lab';
        } else if (y >= 38 && x < 16) {
          // Executive Suite (Wood Parquet)
          this.tiles[y][x] = 'interior_floor_wood';
        } else if (y >= 38 && x >= 16 && x < 30) {
          // Focus Room
          this.tiles[y][x] = 'interior_floor_focus';
        }
      }
    }

    // Interior dividing walls and doors
    // Lobby top wall (y=16) with entrance in center
    for (let x = 1; x < this.width - 1; x++) {
      if (x < 30 || x > 34) {
        this.tiles[16][x] = 'interior_wall_solid';
        this.solidGrid[16][x] = true;
      }
    }

    // Horizontal divider between Lobby and Workspaces (y=26)
    for (let x = 1; x < this.width - 1; x++) {
      if (x === 15 || x === 45) {
        // Archways/doors
        continue;
      }
      this.tiles[26][x] = 'interior_wall_wood';
      this.solidGrid[26][x] = true;
    }

    // Vertical divider between AI Lab and Open Office (x=30, y: 26 to 47)
    for (let y = 26; y < this.height - 1; y++) {
      if (y === 32 || y === 43) {
        // Doorway
        continue;
      }
      this.tiles[y][30] = 'interior_wall_wood';
      this.solidGrid[y][30] = true;
    }

    // Divider between AI Lab and Executive / Focus (y=38, x: 1 to 30)
    for (let x = 1; x < 30; x++) {
      if (x === 8 || x === 22) {
        // Doorways
        continue;
      }
      this.tiles[38][x] = 'interior_wall_wood';
      this.solidGrid[38][x] = true;
    }

    // Divider between Executive Suite and Focus Room (x=16, y: 38 to 47)
    for (let y = 38; y < this.height - 1; y++) {
      if (y === 42) {
        // Doorway
        continue;
      }
      this.tiles[y][16] = 'interior_wall_wood';
      this.solidGrid[y][16] = true;
    }

    // South perimeter wall (y = 47)
    for (let x = 0; x < this.width; x++) {
      this.tiles[47][x] = 'interior_wall_solid';
      this.solidGrid[47][x] = true;
    }
  }

  public isSolid(x: number, y: number): boolean {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return true;
    }
    return this.solidGrid[tileY][tileX];
  }

  public getRoomAt(x: number, y: number): RoomZone {
    for (const room of ROOM_ZONES) {
      if (
        x >= room.bounds.x &&
        x < room.bounds.x + room.bounds.width &&
        y >= room.bounds.y &&
        y < room.bounds.y + room.bounds.height
      ) {
        return room;
      }
    }
    return ROOM_ZONES[0];
  }
}
