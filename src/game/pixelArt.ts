import { AIAgent, Character, Direction, TaskItem, WorldObject } from '../types';
import { TILE_SIZE } from './constants';
import { TileType } from './tileMap';

export class PixelArtRenderer {
  // Tile drawing routines
  public static drawTile(
    ctx: CanvasRenderingContext2D,
    tile: TileType,
    x: number,
    y: number,
    time: number
  ) {
    switch (tile) {
      case 'sidewalk':
        this.drawSidewalk(ctx, x, y);
        break;
      case 'parking_bay':
        this.drawParkingBay(ctx, x, y);
        break;
      case 'curb':
        this.drawCurb(ctx, x, y);
        break;
      case 'road':
        this.drawRoad(ctx, x, y);
        break;
      case 'road_line':
        this.drawRoadWithDashedLine(ctx, x, y);
        break;
      case 'road_zebra':
        this.drawZebraCrosswalk(ctx, x, y);
        break;
      case 'road_bus':
        this.drawBusLane(ctx, x, y);
        break;
      case 'exterior_wall':
        this.drawExteriorWall(ctx, x, y);
        break;
      case 'exterior_window':
        this.drawExteriorWindow(ctx, x, y);
        break;
      case 'exterior_door':
        this.drawExteriorDoor(ctx, x, y);
        break;
      case 'interior_floor_tile':
        this.drawOfficeTile(ctx, x, y);
        break;
      case 'interior_floor_wood':
        this.drawParquetWood(ctx, x, y);
        break;
      case 'interior_floor_lab':
        this.drawLabTile(ctx, x, y, time);
        break;
      case 'interior_floor_focus':
        this.drawFocusTile(ctx, x, y);
        break;
      case 'interior_wall_solid':
        this.drawInteriorSolidWall(ctx, x, y);
        break;
      case 'interior_wall_wood':
        this.drawInteriorWainscotWall(ctx, x, y);
        break;
      default:
        ctx.fillStyle = '#14151f';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;
    }
  }

  // --- EXTERIOR TILES ---

  private static drawSidewalk(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Light grey paving stone with bevel
    ctx.fillStyle = '#b5c0cc';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Inner lighter square
    ctx.fillStyle = '#c5d0dc';
    ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    // Grid joint line
    ctx.fillStyle = '#9aa5b3';
    ctx.fillRect(x, y, TILE_SIZE, 1);
    ctx.fillRect(x, y, 1, TILE_SIZE);

    // Subtle texture speckles
    ctx.fillStyle = '#a6b1bf';
    ctx.fillRect(x + 6, y + 8, 2, 2);
    ctx.fillRect(x + 20, y + 18, 2, 2);
  }

  private static drawParkingBay(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Dark asphalt parking pad
    ctx.fillStyle = '#4b4d58';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // White parking border line
    ctx.fillStyle = '#e8ecf2';
    ctx.fillRect(x, y, TILE_SIZE, 2);
    ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);

    // Centered pixel 'P'
    ctx.fillStyle = '#f8fafc';
    const px = x + 12;
    const py = y + 8;
    ctx.fillRect(px, py, 3, 16);
    ctx.fillRect(px + 3, py, 6, 3);
    ctx.fillRect(px + 3, py + 7, 6, 3);
    ctx.fillRect(px + 9, py + 2, 3, 6);
  }

  private static drawCurb(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Concrete curb edge
    ctx.fillStyle = '#838e9d';
    ctx.fillRect(x, y, TILE_SIZE, 8);
    ctx.fillStyle = '#656f7d';
    ctx.fillRect(x, y + 8, TILE_SIZE, 4);
    // Dark road below
    ctx.fillStyle = '#383a45';
    ctx.fillRect(x, y + 12, TILE_SIZE, TILE_SIZE - 12);
  }

  private static drawRoad(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#383a45';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Subtle aggregate texture
    ctx.fillStyle = '#40424f';
    ctx.fillRect(x + 5, y + 12, 2, 2);
    ctx.fillRect(x + 19, y + 24, 2, 2);
  }

  private static drawRoadWithDashedLine(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#383a45';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Dashed white highway stripe in center
    if ((Math.floor(x / TILE_SIZE) % 2) === 0) {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x + 4, y + 14, TILE_SIZE - 8, 4);
    }
  }

  private static drawZebraCrosswalk(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#383a45';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Thick white pedestrian stripes
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 2, y, 6, TILE_SIZE);
    ctx.fillRect(x + 14, y, 6, TILE_SIZE);
    ctx.fillRect(x + 26, y, 6, TILE_SIZE);
  }

  private static drawBusLane(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#383a45';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Yellow bus border line
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, y, 4, TILE_SIZE);

    // Pixel letters for BUS lane
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('BUS', x + 6, y + 20);
  }

  private static drawExteriorWall(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Modern architectural granite facade
    ctx.fillStyle = '#8e9aaf';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#a2adb8';
    ctx.fillRect(x, y, TILE_SIZE, 3);
    ctx.fillStyle = '#788296';
    ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);
    ctx.fillStyle = '#717b8f';
    ctx.fillRect(x, y, 2, TILE_SIZE);
  }

  private static drawExteriorWindow(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#717b8f';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Tinted dark glass
    ctx.fillStyle = '#2b394e';
    ctx.fillRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);

    // Sky glass reflection
    ctx.fillStyle = '#486581';
    ctx.fillRect(x + 5, y + 5, 8, 8);
    ctx.fillStyle = '#627d98';
    ctx.fillRect(x + 5, y + 5, 4, 4);
  }

  private static drawExteriorDoor(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Glass double automatic corporate entrance
    ctx.fillStyle = '#475569';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 2);

    // Glass panes with cyan shine
    ctx.fillStyle = '#38bdf8';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + 4, y + 4, (TILE_SIZE - 10) / 2, TILE_SIZE - 8);
    ctx.fillRect(x + TILE_SIZE / 2 + 1, y + 4, (TILE_SIZE - 10) / 2, TILE_SIZE - 8);
    ctx.globalAlpha = 1.0;

    // Welcome mat
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 2, y + TILE_SIZE - 4, TILE_SIZE - 4, 4);
  }

  // --- INTERIOR TILES ---

  private static drawOfficeTile(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Clean bright office floor tile (as in Screenshot 3)
    ctx.fillStyle = '#e5e9f0';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Subtle grid joint
    ctx.fillStyle = '#d8dee9';
    ctx.fillRect(x, y, TILE_SIZE, 1);
    ctx.fillRect(x, y, 1, TILE_SIZE);

    // Subtle shine
    ctx.fillStyle = '#eceff4';
    ctx.fillRect(x + 2, y + 2, 4, 4);
  }

  private static drawParquetWood(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Warm diagonal herringbone parquet wood (as in Screenshot 3 & 4)
    ctx.fillStyle = '#cbaf96';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    ctx.strokeStyle = '#b3957b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x + 24, y + 32);
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 32, y + 24);
    ctx.moveTo(x, y + 24);
    ctx.lineTo(x + 8, y + 32);
    ctx.stroke();

    ctx.fillStyle = '#d9c2ad';
    ctx.fillRect(x + 4, y + 10, 6, 2);
  }

  private static drawLabTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    // High-tech AI lab floor with cyber grid
    ctx.fillStyle = '#1e2433';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#293245';
    ctx.fillRect(x, y, TILE_SIZE, 1);
    ctx.fillRect(x, y, 1, TILE_SIZE);

    // Animated pulse on selected circuit lines
    const pulse = Math.sin(time * 0.003 + (x + y) * 0.05) > 0.7;
    if (pulse && (x % 96 === 0 || y % 96 === 0)) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 14, y + 14, 4, 4);
    }
  }

  private static drawFocusTile(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Calm bamboo/sage green wood floor
    ctx.fillStyle = '#a7b8a5';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#92a390';
    ctx.fillRect(x, y, TILE_SIZE, 1);
    ctx.fillRect(x, y + 16, TILE_SIZE, 1);

    ctx.fillStyle = '#b7c7b5';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 4);
  }

  private static drawInteriorSolidWall(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Solid white/cream wall with dark top edge
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Wall top border
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x, y, TILE_SIZE, 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x, y + 6, TILE_SIZE, 2);

    // Wall base trim
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
  }

  private static drawInteriorWainscotWall(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Wall with upper white and bottom wood paneling (as in Screenshot 3!)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x, y, TILE_SIZE, 14);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x, y, TILE_SIZE, 4);

    // Wood wainscoting bottom half
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(x, y + 14, TILE_SIZE, TILE_SIZE - 14);

    // Vertical wood slats
    ctx.fillStyle = '#bc8a5f';
    ctx.fillRect(x + 6, y + 14, 2, TILE_SIZE - 14);
    ctx.fillRect(x + 16, y + 14, 2, TILE_SIZE - 14);
    ctx.fillRect(x + 26, y + 14, 2, TILE_SIZE - 14);

    // Baseboard
    ctx.fillStyle = '#8a5a36';
    ctx.fillRect(x, y + TILE_SIZE - 3, TILE_SIZE, 3);
  }

  // --- FURNITURE & OBJECTS ---

  public static drawObject(
    ctx: CanvasRenderingContext2D,
    obj: WorldObject,
    time: number
  ) {
    const { x, y, width, height, type, rotation } = obj;

    ctx.save();
    
    let drawW = width;
    let drawH = height;
    
    if (rotation) {
      const cx = x + width / 2;
      const cy = y + height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.translate(-cx, -cy);
      
      if (rotation === 90 || rotation === 270) {
         drawW = height;
         drawH = width;
      }
    }
    
    // Top-left coordinate for drawing (accounting for swapped width/height)
    const drawX = x + width / 2 - drawW / 2;
    const drawY = y + height / 2 - drawH / 2;

    switch (type) {
      case 'bench':
        this.drawBench(ctx, drawX, drawY, drawW, drawH);
        break;
      case 'plant_tree':
        this.drawTree(ctx, drawX, drawY, drawW, drawH);
        break;
      case 'street_lamp':
        this.drawStreetLamp(ctx, drawX, drawY, time);
        break;
      case 'parking_meter':
        this.drawParkingMeter(ctx, drawX, drawY);
        break;
      case 'parking_sign':
        this.drawParkingSign(ctx, drawX, drawY);
        break;
      case 'flower_planter':
        this.drawFlowerPlanter(ctx, drawX, drawY, drawW, drawH);
        break;
      case 'cubicle_desk':
      case 'desk_computer':
      case 'computer_desk':
        this.drawComputerDesk(ctx, drawX, drawY, drawW, drawH, time);
        break;
      case 'desk':
      case 'table':
        this.drawDesk(ctx, drawX, drawY, drawW, drawH);
        break;
      case 'desk_laptop':
        this.drawLaptopDesk(ctx, drawX, drawY, drawW, drawH, time);
        break;
      case 'office_chair':
      case 'chair':
        this.drawOfficeChair(ctx, drawX, drawY);
        break;
      case 'couch':
        this.drawCouch(ctx, drawX, drawY, drawW, drawH);
        break;
      case 'vending_machine':
        this.drawVendingMachine(ctx, drawX, drawY, drawW, drawH, time);
        break;
      case 'water_cooler':
        this.drawWaterCooler(ctx, drawX, drawY, time);
        break;
      case 'whiteboard':
      case 'board':
        this.drawWhiteboard(ctx, drawX, drawY, drawW, drawH);
        break;
      case 'wall_chart':
        this.drawWallChart(ctx, drawX, drawY, drawW, drawH);
        break;
      case 'plant_potted':
      case 'plant':
        this.drawPottedPlant(ctx, drawX, drawY);
        break;
      case 'server_rack':
        this.drawServerRack(ctx, drawX, drawY, drawW, drawH, time);
        break;
      case 'coffee_maker':
        this.drawCoffeeMaker(ctx, drawX, drawY, time);
        break;
      case 'bookshelf':
        this.drawBookshelf(ctx, drawX, drawY, drawW, drawH);
        break;
      case 'bed':
        this.drawBed(ctx, drawX, drawY, drawW, drawH);
        break;
      case 'decoration':
        this.drawDecoration(ctx, drawX, drawY, drawW, drawH);
        break;
      default:
        ctx.fillStyle = '#64748b';
        ctx.fillRect(drawX, drawY, drawW, drawH);
        break;
    }
    
    ctx.restore();
  }

  private static drawBench(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Park bench (wooden slats + black iron frames) matching Screenshot 1
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 2, y + h - 4, w - 4, 6);

    // Cast iron frame
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 2, y, 4, h);
    ctx.fillRect(x + w - 6, y, 4, h);

    // Wood slats (backrest & seat)
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 6, y + 2, w - 12, 6);
    ctx.fillRect(x + 6, y + 10, w - 12, 6);
    ctx.fillRect(x + 6, y + 18, w - 12, 10);

    // Slat highlights
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 7, y + 3, w - 14, 2);
    ctx.fillRect(x + 7, y + 11, w - 14, 2);
    ctx.fillRect(x + 7, y + 19, w - 14, 3);
  }

  private static drawTree(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Tree matching Screenshot 1: Planter box, trunk, lush foliage
    // Planter base
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 4, y + h - 16, w - 8, 16);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 6, y + h - 14, w - 12, 4);
    // Green grass inside planter
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(x + 8, y + h - 10, w - 16, 8);

    // Brown twisted trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + w / 2 - 4, y + h - 34, 8, 24);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + w / 2 - 2, y + h - 32, 4, 20);

    // Lush circular pixel tree crown
    const cx = x + w / 2;
    const cy = y + 26;

    // Dark outline foliage
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();

    // Medium green leaves
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 24, 0, Math.PI * 2);
    ctx.fill();

    // Light highlights
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 8, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawStreetLamp(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    // Ornate street lamp matching Screenshot 1
    // Base & pole
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 10, y + 24, 12, 50);
    ctx.fillRect(x + 8, y + 70, 16, 8);

    // Arched lamp arm
    ctx.fillRect(x + 4, y + 10, 24, 6);
    ctx.fillRect(x + 2, y + 14, 6, 12);

    // Lantern fixture
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y + 20, 10, 14);

    // Glowing warm yellow bulb
    const glow = 0.8 + Math.sin(time * 0.005) * 0.15;
    ctx.fillStyle = `rgba(254, 240, 138, ${glow})`;
    ctx.fillRect(x + 2, y + 24, 6, 8);

    // Ground glow halo
    ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
    ctx.beginPath();
    ctx.arc(x + 16, y + 74, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawParkingMeter(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Blue parking meter terminal
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 12, y + 24, 8, 24);

    // Terminal box
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 6, y + 6, 20, 24);

    // Screen
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 9, y + 10, 14, 8);

    // Coin/card slot
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 11, y + 22, 10, 2);
  }

  private static drawParkingSign(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Pole
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 14, y + 16, 4, 32);

    // Blue square 'P' sign
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x + 6, y + 2, 20, 18);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 7, y + 3, 18, 16);

    // White P
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('P', x + 12, y + 15);
  }

  private static drawFlowerPlanter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Wooden planter with blooming flowers
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, y + 10, w, h - 10);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 2, y + 12, w - 4, 4);

    // Flowers & foliage
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + 4, y + 2, w - 8, 10);

    // Blossoms (pink, red, yellow)
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(x + 8, y + 3, 4, 4);
    ctx.fillRect(x + 24, y + 4, 4, 4);
    ctx.fillRect(x + 40, y + 2, 4, 4);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 16, y + 4, 4, 4);
    ctx.fillRect(x + 32, y + 3, 4, 4);
  }

  private static drawComputerDesk(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    time: number
  ) {
    // Office workstation with dual monitors, partition divider, desk lamp
    // Privacy divider partition at back
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x, y, w, 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 1, y + 1, w - 2, 4);

    // Desk surface
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 2, y + 6, w - 4, h - 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 4, y + 8, w - 8, 6);

    // Desk legs
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 4, y + h - 6, 4, 6);
    ctx.fillRect(x + w - 8, y + h - 6, 4, 6);

    // Dual Monitors (as in Screenshot 3)
    const monitor1X = x + 10;
    const monitor2X = x + 40;

    // Monitor 1 (Main display - charts)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(monitor1X, y + 10, 24, 16);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(monitor1X + 2, y + 12, 20, 12);
    // Graph lines on monitor
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(monitor1X + 4, y + 18, 4, 4);
    ctx.fillRect(monitor1X + 9, y + 15, 4, 7);
    ctx.fillRect(monitor1X + 14, y + 13, 4, 9);
    // Stand
    ctx.fillStyle = '#475569';
    ctx.fillRect(monitor1X + 9, y + 26, 6, 4);

    // Monitor 2 (Side display - code / chat)
    if (w >= 70) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(monitor2X, y + 10, 24, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(monitor2X + 2, y + 12, 20, 12);
      // Code syntax lines
      const anim = (time * 0.005) % 4;
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(monitor2X + 4, y + 14, 8, 2);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(monitor2X + 4, y + 17, 12, 2);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(monitor2X + 4, y + 20, anim > 2 ? 14 : 9, 2);
      // Stand
      ctx.fillStyle = '#475569';
      ctx.fillRect(monitor2X + 9, y + 26, 6, 4);
    }

    // Keyboard & mouse
    ctx.fillStyle = '#334155';
    ctx.fillRect(monitor1X + 4, y + 32, 16, 6);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(monitor1X + 22, y + 33, 4, 5);

    // Desk lamp
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + w - 16, y + 14, 3, 14);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + w - 20, y + 12, 10, 5);
  }

  private static drawLaptopDesk(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    time: number
  ) {
    // Clean executive / focus laptop table
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(x, y + 4, w, h - 8);
    ctx.fillStyle = '#faedcd';
    ctx.fillRect(x + 2, y + 6, w - 4, 6);

    // Slim laptop
    const lx = x + w / 2 - 12;
    ctx.fillStyle = '#475569';
    ctx.fillRect(lx, y + 12, 24, 14);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(lx + 2, y + 14, 20, 10);
    // Glowing prompt line
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(lx + 4, y + 16, 6, 2);

    // Coffee mug
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 10, y + 18, 6, 8);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 11, y + 19, 4, 3);
  }

  private static drawOfficeChair(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Ergonomic office chair matching Screenshot 3
    // Wheel base
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 6, y + 20, 20, 4);
    ctx.fillRect(x + 14, y + 16, 4, 6);

    // Seat cushion
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 7, y + 10, 18, 10);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 9, y + 11, 14, 4);

    // Backrest with mesh grid pattern
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 8, y, 16, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 10, y + 2, 12, 8);
  }

  private static drawCouch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Executive sectional sofa matching Screenshot 3
    ctx.fillStyle = '#475569';
    ctx.fillRect(x, y, w, h);

    // Sofa backrest
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, y, w, 8);

    // Cushions
    ctx.fillStyle = '#64748b';
    const cWidth = (w - 8) / 3;
    ctx.fillRect(x + 4, y + 10, cWidth - 2, h - 14);
    ctx.fillRect(x + 4 + cWidth, y + 10, cWidth - 2, h - 14);
    ctx.fillRect(x + 4 + cWidth * 2, y + 10, cWidth - 2, h - 14);
  }

  private static drawVendingMachine(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    time: number
  ) {
    // Snack/drink vending machine matching Screenshot 3
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, y, w, h);

    // Glass display window
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 4, y + 6, w - 16, h - 24);

    // Rows of colorful drinks
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.fillStyle = colors[(row + col) % colors.length];
        ctx.fillRect(x + 8 + col * 8, y + 10 + row * 10, 5, 8);
      }
    }

    // Number keypad & coin slot
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + w - 10, y + 10, 6, 16);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + w - 9, y + 12, 4, 3);

    // Dispenser tray
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 6, y + h - 14, w - 12, 8);
  }

  private static drawWaterCooler(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    // Water cooler matching Screenshot 3
    // Plastic base stand
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 4, y + 24, 24, 30);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 6, y + 26, 20, 6);

    // Hot/cold dispenser levers
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 8, y + 36, 4, 6);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 20, y + 36, 4, 6);

    // Blue inverted water jug
    ctx.fillStyle = '#38bdf8';
    ctx.globalAlpha = 0.85;
    ctx.fillRect(x + 6, y + 4, 20, 20);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 10, y + 2, 12, 3);
    // Water bubbles
    const bubbleY = y + 14 + Math.sin(time * 0.006) * 3;
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(x + 14, bubbleY, 3, 3);
    ctx.globalAlpha = 1.0;
  }

  private static drawWhiteboard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Office presentation whiteboard matching Screenshot 3
    // Frame & stand
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y, w, h);

    // White surface
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 3, y + 3, w - 6, h - 8);

    // Marker tray at bottom
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 6, y + h - 5, w - 12, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 10, y + h - 6, 6, 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 18, y + h - 6, 6, 2);

    // Diagrams & growth graph drawn on board
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 10, y + 12, 20, 2);
    ctx.fillRect(x + 10, y + 14, 2, 16);

    // Upward trend line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 28);
    ctx.lineTo(x + 20, y + 24);
    ctx.lineTo(x + 28, y + 16);
    ctx.lineTo(x + 36, y + 10);
    ctx.stroke();

    // Sticky notes on board (yellow, pink)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + w - 30, y + 10, 10, 10);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(x + w - 16, y + 10, 10, 10);
  }

  private static drawWallChart(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Framed wall analytics poster matching Screenshot 3
    ctx.fillStyle = '#475569';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

    // Mini bar chart
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 8, y + 24, 6, 18);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x + 18, y + 16, 6, 26);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(x + 28, y + 10, 6, 32);

    // Mini title
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 8, y + 6, 26, 3);
  }

  private static drawPottedPlant(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Potted office snake plant matching Screenshot 3
    // Ceramic pot
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 8, y + 24, 16, 18);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 6, y + 22, 20, 4);

    // Pot soil
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 8, y + 24, 16, 3);

    // Green plant fronds
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + 10, y + 4, 4, 20);
    ctx.fillRect(x + 18, y + 6, 4, 18);
    ctx.fillRect(x + 14, y, 4, 24);

    ctx.fillStyle = '#4ade80';
    ctx.fillRect(x + 11, y + 6, 2, 16);
    ctx.fillRect(x + 15, y + 2, 2, 20);
  }

  private static drawServerRack(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    time: number
  ) {
    // AI server rack with glowing blinkers
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, w, h);

    // Glass server door
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

    // Server blades (3 rows)
    for (let r = 0; r < 4; r++) {
      const sy = y + 8 + r * 16;
      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 6, sy, w - 12, 12);

      // Blinking LEDs
      const blink1 = Math.sin(time * 0.01 + r) > 0;
      const blink2 = Math.cos(time * 0.008 + r * 2) > 0;

      ctx.fillStyle = blink1 ? '#22c55e' : '#14532d';
      ctx.fillRect(x + 10, sy + 4, 3, 3);

      ctx.fillStyle = blink2 ? '#38bdf8' : '#0369a1';
      ctx.fillRect(x + 16, sy + 4, 3, 3);

      // Drive bay handles
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 24, sy + 5, w - 34, 2);
    }
  }

  private static drawCoffeeMaker(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    // Chrome espresso machine
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 4, y + 10, 24, 30);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 6, y + 12, 20, 6);

    // Coffee cup
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 14, y + 28, 8, 8);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 15, y + 29, 6, 3);

    // Steam particles
    const steamY = y + 24 - ((time * 0.05) % 10);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x + 17, steamY, 2, 3);
  }

  private static drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Basic desk/table
    ctx.fillStyle = '#b45309'; // Wood
    ctx.fillRect(x, y + 8, w, h - 16);
    
    // Top edge
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x, y + 8, w, 2);
    
    // Legs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 4, y + h - 8, 4, 8);
    ctx.fillRect(x + w - 8, y + h - 8, 4, 8);
  }

  private static drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, y, w, h);
    
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    
    // Shelves
    ctx.fillStyle = '#451a03';
    for(let i=10; i<h-5; i+=10) {
       ctx.fillRect(x + 2, y + i, w - 4, 2);
    }
    
    // Books
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 6, y + 4, 4, 6);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x + 12, y + 4, 6, 6);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + 8, y + 14, 5, 6);
  }

  private static drawBed(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Bed frame
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(x, y, w, h);
    
    // Mattress
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 2, y + 4, w - 4, h - 8);
    
    // Pillow
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 6, y + 6, w - 12, 12);
    
    // Blanket
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(x + 2, y + 30, w - 4, h - 34);
  }

  private static drawDecoration(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Generic decor - a small rug
    ctx.fillStyle = '#be123c';
    ctx.fillRect(x, y, w, h);
    
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(x + w/2 - 4, y + h/2 - 4, 8, 8);
  }

  // --- CHARACTER & AGENT RENDERING ---

  public static drawCharacter(
    ctx: CanvasRenderingContext2D,
    char: Character | AIAgent,
    time: number,
    isPlayer: boolean,
    activeTask?: TaskItem
  ) {
    const { position, direction, animationState, customization } = char;
    const { x, y } = position;
    const isSitting = char.isSitting || animationState === 'sit';
    const isWorking = animationState === 'work' || !!activeTask;

    // Step animation frames for walking
    let stepOffset = 0;
    if (animationState === 'walk') {
      stepOffset = Math.sin(time * 0.015) * 3;
    }

    // Breathing / idle bob
    const idleBob = Math.sin(time * 0.005 + (char.id.length || 0)) * 1;
    const renderY = y + (isSitting ? 4 : idleBob);

    // Dynamic tile-aware projected shadows are rendered in the depth-sorted ground pass immediately beneath the character
    // 2. Legs / Shoes
    if (!isSitting) {
      ctx.fillStyle = customization.pantColor || '#1e293b';
      // Left leg
      ctx.fillRect(x + 11, renderY + 18, 4, 8 + (direction === 'up' || direction === 'down' ? stepOffset : 0));
      // Right leg
      ctx.fillRect(x + 17, renderY + 18, 4, 8 - (direction === 'up' || direction === 'down' ? stepOffset : 0));

      // Shoes (dark leather)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 10, renderY + 25 + (stepOffset > 0 ? 1 : 0), 5, 3);
      ctx.fillRect(x + 17, renderY + 25 + (stepOffset < 0 ? 1 : 0), 5, 3);
    } else {
      // Seated tucked legs
      ctx.fillStyle = customization.pantColor || '#1e293b';
      ctx.fillRect(x + 11, renderY + 16, 10, 6);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 11, renderY + 20, 10, 3);
    }

    // 3. Body / Torso / Outfit
    ctx.fillStyle = customization.outfitColor || '#3b82f6';
    ctx.fillRect(x + 10, renderY + 10, 12, 9);

    // Suit lapel / shirt collar
    if (direction !== 'up') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 14, renderY + 10, 4, 5);

      // Tie or badge accessory
      if (customization.accessory === 'tie') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 15, renderY + 12, 2, 6);
      } else if (customization.accessory === 'badge') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 18, renderY + 12, 3, 3);
      }
    }

    // Arms
    ctx.fillStyle = customization.outfitColor || '#3b82f6';
    if (isWorking) {
      // Hands forward typing on keyboard
      ctx.fillRect(x + 8, renderY + 12, 4, 4);
      ctx.fillRect(x + 20, renderY + 12, 4, 4);
      // Skin hands
      ctx.fillStyle = customization.skinColor || '#fcd34d';
      const typeWiggle = Math.sin(time * 0.02) * 2;
      ctx.fillRect(x + 7, renderY + 14 + typeWiggle, 3, 3);
      ctx.fillRect(x + 22, renderY + 14 - typeWiggle, 3, 3);
      // Keystroke pixel sparks
      if (time % 400 < 200) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 10 + (time % 12), renderY + 12 - (time % 4), 2, 2);
      }
    } else if (direction === 'left') {
      ctx.fillRect(x + 9, renderY + 11, 4, 7);
      ctx.fillStyle = customization.skinColor;
      ctx.fillRect(x + 9, renderY + 17, 3, 3);
    } else if (direction === 'right') {
      ctx.fillRect(x + 19, renderY + 11, 4, 7);
      ctx.fillStyle = customization.skinColor;
      ctx.fillRect(x + 20, renderY + 17, 3, 3);
    } else {
      ctx.fillRect(x + 7, renderY + 11, 3, 7);
      ctx.fillRect(x + 22, renderY + 11, 3, 7);
      ctx.fillStyle = customization.skinColor;
      ctx.fillRect(x + 7, renderY + 17, 3, 3);
      ctx.fillRect(x + 22, renderY + 17, 3, 3);
    }

    // 4. Head & Face
    const headY = renderY - 4;
    ctx.fillStyle = customization.skinColor || '#fcd34d';
    ctx.fillRect(x + 10, headY + 4, 12, 10);

    // Eyes (with occasional blink)
    const isBlinking = (Math.floor(time / 2500) % 10 === 0) && (time % 250 < 120);

    if (direction === 'down') {
      if (animationState === 'happy') {
        // Happy arch eyes (^ ^)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 12, headY + 7, 3, 1);
        ctx.fillRect(x + 11, headY + 8, 1, 2);
        ctx.fillRect(x + 17, headY + 7, 3, 1);
        ctx.fillRect(x + 20, headY + 8, 1, 2);
        // Rosy cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.55)';
        ctx.fillRect(x + 10, headY + 9, 2, 2);
        ctx.fillRect(x + 20, headY + 9, 2, 2);
        // Cheerful open smile
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 14, headY + 11, 4, 1);
        ctx.fillRect(x + 15, headY + 12, 2, 1);
      } else if (animationState === 'think') {
        // Thinking eyes tilted up-right
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 13, headY + 6, 2, 3);
        ctx.fillRect(x + 19, headY + 6, 2, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 14, headY + 6, 1, 1);
        ctx.fillRect(x + 20, headY + 6, 1, 1);
        // Thoughtful mouth line
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 15, headY + 12, 2, 1);
        // Hand to chin gesture
        ctx.fillStyle = customization.skinColor || '#fcd34d';
        ctx.fillRect(x + 17, headY + 11, 3, 3);
      } else if (!isBlinking && animationState !== 'sleep') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 12, headY + 7, 2, 3);
        ctx.fillRect(x + 18, headY + 7, 2, 3);
        // Eye shines
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 12, headY + 7, 1, 1);
        ctx.fillRect(x + 18, headY + 7, 1, 1);

        // Animated talking mouth
        if (animationState === 'talk') {
          const talkCycle = Math.floor(time / 150) % 2 === 0;
          if (talkCycle) {
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(x + 14, headY + 11, 4, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 15, headY + 11, 2, 1);
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x + 15, headY + 12, 2, 1);
          }
        }
      } else {
        // Closed / sleepy eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 12, headY + 8, 3, 1);
        ctx.fillRect(x + 17, headY + 8, 3, 1);
      }
    } else if (direction === 'left') {
      if (!isBlinking && animationState !== 'sleep') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 11, headY + 7, 2, 3);
      }
    } else if (direction === 'right') {
      if (!isBlinking && animationState !== 'sleep') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 19, headY + 7, 2, 3);
      }
    }

    // Glasses accessory
    if (customization.accessory === 'glasses' && direction !== 'up') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 11, headY + 6, 4, 4);
      ctx.strokeRect(x + 17, headY + 6, 4, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 15, headY + 7, 2, 1);
    } else if (customization.accessory === 'visor' && direction !== 'up') {
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(x + 11, headY + 6, 10, 4);
      ctx.fillStyle = '#a5f3fc';
      ctx.fillRect(x + 12, headY + 7, 8, 1);
    }

    // 5. Hair
    ctx.fillStyle = customization.hairColor || '#78350f';
    const hairStyle = customization.hairStyle || 'short';

    if (hairStyle === 'short') {
      ctx.fillRect(x + 9, headY + 1, 14, 5);
      ctx.fillRect(x + 8, headY + 3, 3, 5);
      ctx.fillRect(x + 21, headY + 3, 3, 5);
    } else if (hairStyle === 'spiky') {
      ctx.fillRect(x + 9, headY + 1, 14, 4);
      ctx.fillRect(x + 11, headY - 2, 3, 4);
      ctx.fillRect(x + 16, headY - 3, 3, 5);
      ctx.fillRect(x + 20, headY - 1, 3, 4);
    } else if (hairStyle === 'bob') {
      ctx.fillRect(x + 8, headY + 1, 16, 5);
      ctx.fillRect(x + 7, headY + 3, 4, 10);
      ctx.fillRect(x + 21, headY + 3, 4, 10);
    } else if (hairStyle === 'ponytail') {
      ctx.fillRect(x + 9, headY + 1, 14, 5);
      ctx.fillRect(x + 8, headY + 3, 3, 6);
      ctx.fillRect(x + 21, headY + 3, 3, 6);
      // Ponytail on side/back
      ctx.fillRect(x + 6, headY + 3, 3, 8);
    } else if (hairStyle === 'curly') {
      ctx.fillRect(x + 8, headY - 1, 16, 7);
      ctx.fillRect(x + 7, headY + 3, 3, 7);
      ctx.fillRect(x + 22, headY + 3, 3, 7);
    }

    // Headphones accessory
    if (customization.accessory === 'headphones') {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 7, headY + 5, 3, 6);
      ctx.fillRect(x + 22, headY + 5, 3, 6);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 8, headY + 1, 16, 2);
    }

    // 6. Overhead Status / Emote Bubbles / Personality Mood Bubbles
    const overheadY = headY - 18;

    // Determine personality mood bubble if no active transient emote
    let activeEmoteType = char.emote && char.emote.expiresAt > Date.now() ? char.emote.type : undefined;
    if (!activeEmoteType) {
      if (animationState === 'think') {
        activeEmoteType = 'idea';
      } else if (animationState === 'talk') {
        activeEmoteType = 'speech';
      } else if (animationState === 'alert') {
        activeEmoteType = 'alert';
      } else if (animationState === 'sleep') {
        activeEmoteType = 'sleep';
      } else if (!isPlayer) {
        // Personality-based ambient mood bubble
        const agent = char as AIAgent;
        if (agent.id === 'agent_nova') {
          activeEmoteType = 'idea'; // Nova: Analytical Strategy lightbulb
        } else if (agent.id === 'agent_pixel') {
          activeEmoteType = 'sparkles'; // Pixel: Creative energetic sparkles
        } else if (agent.id === 'agent_closer') {
          activeEmoteType = 'fire'; // Closer: Proactive sales fire
        } else if (agent.id === 'agent_orbit') {
          activeEmoteType = 'gear'; // Orbit: Organised operations gear
        } else if (agent.id === 'agent_coach') {
          activeEmoteType = 'leaf'; // Coach: Supportive mindfulness leaf/heart
        } else {
          activeEmoteType = 'heart';
        }
      }
    }

    if (activeEmoteType) {
      this.drawEmoteBubble(ctx, x + 16, overheadY, activeEmoteType, time);
    }

    // Name tag & role tag overhead
    const tagY = headY - 26;
    ctx.textAlign = 'center';

    if (isPlayer) {
      // Player name tag
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(x - 6, tagY, 44, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(char.name || 'You', x + 16, tagY + 9);
    } else {
      // AI Agent Tag
      const agent = char as AIAgent;
      const hasTask = isWorking || !!activeTask;

      if (hasTask) {
        const progress = activeTask?.progress ?? 50;
        // Mini Overhead Task Progress Bar
        const barW = 44;
        const barH = 5;
        const barX = x + 16 - barW / 2;
        const barY = tagY - 9;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(barX, barY, barW, barH);
        // Glowing cyan progress fill
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(barX + 1, barY + 1, Math.max(1, ((barW - 2) * progress) / 100), barH - 2);

        // Work Status Chip
        const chipW = 54;
        const chipH = 9;
        const chipX = x + 16 - chipW / 2;
        const chipY = barY - 10;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(chipX, chipY, chipW, chipH);
        ctx.fillStyle = '#f59e0b'; // Amber bolt
        ctx.font = 'bold 7px monospace';
        const blink = Math.sin(time * 0.008) > 0;
        ctx.fillText(`${blink ? '⚡' : '•'} ${progress}% WORK`, x + 16, chipY + 7);
      }

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(x - 14, tagY, 60, 12);
      ctx.fillStyle = hasTask ? '#38bdf8' : '#a78bfa';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`${hasTask ? '⚙ ' : ''}${agent.name.split(' ')[0]}`, x + 16, tagY + 9);
    }
  }

  private static drawEmoteBubble(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    type: string,
    time: number = 0
  ) {
    // Gentle floating bob
    const floatOffset = Math.sin(time * 0.006) * 2;
    const bubbleY = by + floatOffset;

    // White pixel bubble with pointer
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 9, bubbleY - 6, 18, 14);
    ctx.fillStyle = '#0f172a';
    ctx.strokeRect(bx - 9, bubbleY - 6, 18, 14);

    // Pointer
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 2, bubbleY + 8, 4, 3);

    ctx.textAlign = 'center';
    ctx.font = '10px sans-serif';
    if (type === 'speech') {
      ctx.fillStyle = '#2563eb';
      ctx.fillText('💬', bx, bubbleY + 5);
    } else if (type === 'idea') {
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('💡', bx, bubbleY + 5);
    } else if (type === 'sparkles') {
      ctx.fillStyle = '#ec4899';
      ctx.fillText('✨', bx, bubbleY + 5);
    } else if (type === 'fire') {
      ctx.fillStyle = '#f97316';
      ctx.fillText('🔥', bx, bubbleY + 5);
    } else if (type === 'gear') {
      ctx.fillStyle = '#059669';
      ctx.fillText('⚙️', bx, bubbleY + 5);
    } else if (type === 'leaf') {
      ctx.fillStyle = '#10b981';
      ctx.fillText('🌱', bx, bubbleY + 5);
    } else if (type === 'alert') {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('!', bx, bubbleY + 5);
    } else if (type === 'sleep') {
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('zzz', bx, bubbleY + 5);
    } else if (type === 'heart') {
      ctx.fillStyle = '#ec4899';
      ctx.fillText('❤️', bx, bubbleY + 5);
    } else if (type === 'wave') {
      ctx.fillText('👋', bx, bubbleY + 5);
    } else if (type === 'happy') {
      ctx.fillText('😄', bx, bubbleY + 5);
    } else if (type === 'confused') {
      ctx.fillText('❓', bx, bubbleY + 5);
    } else if (type === 'laugh') {
      ctx.fillText('😂', bx, bubbleY + 5);
    } else if (type === 'sad') {
      ctx.fillText('😢', bx, bubbleY + 5);
    } else if (type === 'angry') {
      ctx.fillText('😠', bx, bubbleY + 5);
    } else if (type === 'thumb_up') {
      ctx.fillText('👍', bx, bubbleY + 5);
    } else {
      ctx.fillText('💬', bx, bubbleY + 5);
    }
  }
}
