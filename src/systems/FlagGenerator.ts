// ============================================================
// Countries Marble Race — Procedural Flag Texture Generator
// ============================================================

import Phaser from "phaser";
import { COUNTRIES } from "@/config/CountryData";

const TEXTURE_SIZE = 32;
const HALF_SIZE = TEXTURE_SIZE / 2;

/**
 * Generates flag textures procedurally for all countries.
 *
 * Each texture is 32×32 and contains:
 *   1. Shaded 3D circle base (dark edge, lit center)
 *   2. Flag pattern overlay (tricolor, bicolor, cross, star, stripe, circle)
 *   3. White highlight spot (gloss/shine)
 *
 * Call FlagGenerator.generateFlags(scene) once in BootScene.
 */
export class FlagGenerator {
  /**
   * Generate flag textures for all defined countries.
   * Skips already-existing textures.
   */
  static generateFlags(scene: Phaser.Scene): void {
    for (const country of COUNTRIES) {
      const key = `flag_${country.id}`;

      // Skip if already generated
      if (scene.textures.exists(key)) continue;

      const rt = scene.make.renderTexture(
        { x: 0, y: 0, width: TEXTURE_SIZE, height: TEXTURE_SIZE },
        false,
      );

      this.drawFlagOnTexture(scene, rt, country);

      rt.saveTexture(key);
      rt.destroy();
    }
  }

  // ============================================================
  // Master draw — layers
  // ============================================================

  private static drawFlagOnTexture(
    scene: Phaser.Scene,
    rt: Phaser.GameObjects.RenderTexture,
    country: typeof COUNTRIES[number],
  ): void {
    const colors = country.flagColors;

    // Layer 1: Shaded 3D circle base with primary background
    const baseGfx = scene.make.graphics({ x: 0, y: 0 }, false);
    this.drawSphereBase(baseGfx, colors[0] ?? '#888888');
    rt.draw(baseGfx);
    baseGfx.destroy();

    // Layer 2: Flag pattern overlay
    const flagGfx = scene.make.graphics({ x: 0, y: 0 }, false);
    this.drawFlagPattern(flagGfx, country);
    rt.draw(flagGfx);
    flagGfx.destroy();

    // Layer 3: Edge shading (vignette) for 3D sphere effect
    const shadeGfx = scene.make.graphics({ x: 0, y: 0 }, false);
    this.drawEdgeShading(shadeGfx);
    rt.draw(shadeGfx);
    shadeGfx.destroy();

    // Layer 4: Specular highlight
    const hlGfx = scene.make.graphics({ x: 0, y: 0 }, false);
    this.drawHighlight(hlGfx);
    rt.draw(hlGfx);
    hlGfx.destroy();
  }

  // ============================================================
  // Pattern dispatch
  // ============================================================

  private static drawFlagPattern(
    gfx: Phaser.GameObjects.Graphics,
    country: typeof COUNTRIES[number],
  ): void {
    const colors = country.flagColors;

    switch (country.flagPattern) {
      case 'tricolor':
        this.drawTricolor(gfx, colors, country.stripes ?? 'vertical');
        break;
      case 'bicolor':
        this.drawBicolor(gfx, colors, country.stripes ?? 'vertical');
        break;
      case 'cross':
        this.drawCross(gfx, colors);
        break;
      case 'star':
        this.drawStarPattern(gfx, colors, country.starCount ?? 1);
        break;
      case 'stripe':
        this.drawStripePattern(gfx, colors);
        break;
      case 'circle':
        this.drawCirclePattern(gfx, colors);
        break;
      default:
        // Fallback: solid first color
        gfx.fillStyle(this.hexToNum(colors[0] ?? '#888888'));
        gfx.fillCircle(HALF_SIZE, HALF_SIZE, HALF_SIZE);
        break;
    }
  }

  // ============================================================
  // Pattern implementations
  // ============================================================

  /**
   * Tricolor: 3 vertical or horizontal stripes.
   */
  private static drawTricolor(
    gfx: Phaser.GameObjects.Graphics,
    colors: string[],
    stripes: 'vertical' | 'horizontal',
  ): void {
    const c0 = this.hexToNum(colors[0] ?? '#000000');
    const c1 = this.hexToNum(colors[1] ?? '#ffffff');
    const c2 = this.hexToNum(colors[2] ?? '#888888');

    if (stripes === 'vertical') {
      gfx.fillStyle(c0);
      gfx.fillRect(0, 0, HALF_SIZE * (2 / 3), TEXTURE_SIZE);
      gfx.fillStyle(c1);
      gfx.fillRect(HALF_SIZE * (2 / 3), 0, HALF_SIZE * (2 / 3), TEXTURE_SIZE);
      gfx.fillStyle(c2);
      gfx.fillRect(HALF_SIZE * (4 / 3), 0, HALF_SIZE * (2 / 3), TEXTURE_SIZE);
    } else {
      const third = TEXTURE_SIZE / 3;
      gfx.fillStyle(c0);
      gfx.fillRect(0, 0, TEXTURE_SIZE, third);
      gfx.fillStyle(c1);
      gfx.fillRect(0, third, TEXTURE_SIZE, third);
      gfx.fillStyle(c2);
      gfx.fillRect(0, third * 2, TEXTURE_SIZE, third);
    }
  }

  /**
   * Bicolor: 2 vertical or horizontal stripes.
   */
  private static drawBicolor(
    gfx: Phaser.GameObjects.Graphics,
    colors: string[],
    stripes: 'vertical' | 'horizontal',
  ): void {
    const c0 = this.hexToNum(colors[0] ?? '#000000');
    const c1 = this.hexToNum(colors[1] ?? '#ffffff');

    if (stripes === 'vertical') {
      gfx.fillStyle(c0);
      gfx.fillRect(0, 0, HALF_SIZE, TEXTURE_SIZE);
      gfx.fillStyle(c1);
      gfx.fillRect(HALF_SIZE, 0, HALF_SIZE, TEXTURE_SIZE);
    } else {
      gfx.fillStyle(c0);
      gfx.fillRect(0, 0, TEXTURE_SIZE, HALF_SIZE);
      gfx.fillStyle(c1);
      gfx.fillRect(0, HALF_SIZE, TEXTURE_SIZE, HALF_SIZE);
    }
  }

  /**
   * Scandinavian cross: background color + cross with offset horizontal bar.
   */
  private static drawCross(
    gfx: Phaser.GameObjects.Graphics,
    colors: string[],
  ): void {
    const bg = this.hexToNum(colors[0] ?? '#ffffff');
    const cross = this.hexToNum(colors[1] ?? '#000000');

    // Background
    gfx.fillStyle(bg);
    gfx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

    // Cross bars
    gfx.fillStyle(cross);

    // Vertical bar (slightly offset left for Scandinavian crosses)
    // Center at 10px (out of 32)
    const vBarX = 10;
    const barW = 5;
    gfx.fillRect(vBarX - barW / 2, 0, barW, TEXTURE_SIZE);

    // Horizontal bar (centered vertically)
    const barH = 5;
    gfx.fillRect(0, HALF_SIZE - barH / 2, TEXTURE_SIZE, barH);

    // If there's a third color, draw an inner cross (e.g., Norway)
    if (colors.length >= 3) {
      const inner = this.hexToNum(colors[2]!);
      gfx.fillStyle(inner);
      gfx.fillRect(vBarX - barW / 2 + 1, 0, barW - 2, TEXTURE_SIZE);
      gfx.fillRect(0, HALF_SIZE - barH / 2 + 1, TEXTURE_SIZE, barH - 2);
    }
  }

  /**
   * Star pattern: background color + star(s) in second color.
   */
  private static drawStarPattern(
    gfx: Phaser.GameObjects.Graphics,
    colors: string[],
    starCount: number,
  ): void {
    const bg = this.hexToNum(colors[0] ?? '#000000');
    const starColor = this.hexToNum(colors[1] ?? '#ffffff');

    // Background
    gfx.fillStyle(bg);
    gfx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

    gfx.fillStyle(starColor);

    if (starCount === 1) {
      // Single large star in center (Vietnam, Turkey)
      this.drawStar(gfx, HALF_SIZE, HALF_SIZE, 5, 10, 4, -Math.PI / 2);
    } else if (starCount <= 5) {
      // 5 stars (China): one large + four small
      this.drawStar(gfx, HALF_SIZE, HALF_SIZE - 2, 5, 8, 3, -Math.PI / 2);

      if (starCount >= 4) {
        // Small stars in an arc around the main star
        const positions = [
          { x: 20, y: 8 },
          { x: 24, y: 14 },
          { x: 24, y: 22 },
          { x: 20, y: 28 },
        ];
        for (const pos of positions) {
          this.drawStar(gfx, pos.x, pos.y, 5, 3, 1.2, -Math.PI / 2);
        }
      }
    } else if (starCount === 6) {
      // 6 stars (Australia): scattered
      const positions = [
        { x: 10, y: 8 },
        { x: 18, y: 6 },
        { x: 26, y: 8 },
        { x: 14, y: 16 },
        { x: 22, y: 14 },
        { x: 18, y: 24 },
      ];
      for (const pos of positions) {
        this.drawStar(gfx, pos.x, pos.y, 5, 2.5, 1, -Math.PI / 2);
      }
    } else {
      // 50 stars (US): draw simplified scattered stars in canton area
      // Just draw a few representative stars in the canton
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 6; col++) {
          const sx = 4 + col * 4;
          const sy = 3 + row * 5;
          this.drawStar(gfx, sx, sy, 5, 1.5, 0.6, 0);
          if (row * 6 + col + 1 >= starCount) break;
        }
      }
    }
  }

  /**
   * Stripe pattern: alternating horizontal stripes + optional canton.
   */
  private static drawStripePattern(
    gfx: Phaser.GameObjects.Graphics,
    colors: string[],
  ): void {
    // US-style: alternating stripes
    const c0 = this.hexToNum(colors[0] ?? '#b22234');
    const c1 = this.hexToNum(colors[1] ?? '#ffffff');

    const stripeH = TEXTURE_SIZE / 13;
    for (let i = 0; i < 13; i++) {
      gfx.fillStyle(i % 2 === 0 ? c0 : c1);
      gfx.fillRect(0, i * stripeH, TEXTURE_SIZE, stripeH + 1);
    }

    // Canton (third color) — top-left corner, e.g. US blue canton
    if (colors.length >= 3) {
      const canton = this.hexToNum(colors[2]!);
      gfx.fillStyle(canton);
      gfx.fillRect(0, 0, HALF_SIZE, HALF_SIZE * 0.7);
    }
  }

  /**
   * Circle pattern: background + circle (Japan) or more complex (Brazil, Korea).
   */
  private static drawCirclePattern(
    gfx: Phaser.GameObjects.Graphics,
    colors: string[],
  ): void {
    const bg = this.hexToNum(colors[0] ?? '#ffffff');
    const c1 = this.hexToNum(colors[1] ?? '#000000');

    // Background
    gfx.fillStyle(bg);
    gfx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

    if (colors.length >= 4 && colors[1] === '#fedd00') {
      // Brazil pattern: green bg, yellow diamond, blue circle
      const diamond = this.hexToNum(colors[1]!);
      const blue = this.hexToNum(colors[2]!);
      const white = this.hexToNum(colors[3]!);

      // Yellow diamond
      gfx.fillStyle(diamond);
      gfx.beginPath();
      gfx.moveTo(HALF_SIZE, 2);
      gfx.lineTo(TEXTURE_SIZE - 2, HALF_SIZE);
      gfx.lineTo(HALF_SIZE, TEXTURE_SIZE - 2);
      gfx.lineTo(2, HALF_SIZE);
      gfx.closePath();
      gfx.fillPath();

      // Blue circle
      gfx.fillStyle(blue);
      gfx.fillCircle(HALF_SIZE, HALF_SIZE, 8);

      // White band
      gfx.fillStyle(white);
      gfx.fillRect(HALF_SIZE - 6, HALF_SIZE - 1, 12, 2);
    } else if (colors[0] === '#ffffff' && colors.length >= 4) {
      // South Korea: white bg, red/blue symbol
      const blue = this.hexToNum(colors[1]!);
      const red = this.hexToNum(colors[2]!);

      // Simplified Taeguk
      // Red half-circle (top)
      gfx.fillStyle(red);
      gfx.beginPath();
      gfx.arc(HALF_SIZE, HALF_SIZE, 8, 0, Math.PI, false);
      gfx.closePath();
      gfx.fillPath();

      // Blue half-circle (bottom)
      gfx.fillStyle(blue);
      gfx.beginPath();
      gfx.arc(HALF_SIZE, HALF_SIZE, 8, 0, Math.PI, true);
      gfx.closePath();
      gfx.fillPath();

      // Small circles
      gfx.fillStyle(blue);
      gfx.fillCircle(HALF_SIZE, HALF_SIZE - 4, 3);
      gfx.fillStyle(red);
      gfx.fillCircle(HALF_SIZE, HALF_SIZE + 4, 3);
    } else {
      // Simple circle on background (Japan, etc.)
      gfx.fillStyle(c1);
      gfx.fillCircle(HALF_SIZE, HALF_SIZE, 9);
    }
  }

  // ============================================================
  // Shading & effects
  // ============================================================

  /**
   * Draw the base shaded sphere (3D appearance).
   */
  private static drawSphereBase(
    gfx: Phaser.GameObjects.Graphics,
    primaryColorHex: string,
  ): void {
    const baseColor = this.hexToNum(primaryColorHex);

    // Solid base circle
    gfx.fillStyle(baseColor);
    gfx.fillCircle(HALF_SIZE, HALF_SIZE, HALF_SIZE);

    // Bottom shading (darker crescent)
    const darkerColor = Phaser.Display.Color.ValueToColor(baseColor).darken(30).color;
    gfx.fillStyle(darkerColor, 0.3);
    gfx.fillCircle(HALF_SIZE, HALF_SIZE + 4, HALF_SIZE * 0.85);
  }

  /**
   * Draw edge vignette for 3D sphere effect.
   * Uses concentric circles from edge inward with decreasing opacity.
   */
  private static drawEdgeShading(gfx: Phaser.GameObjects.Graphics): void {
    const cx = HALF_SIZE;
    const cy = HALF_SIZE;

    // Draw concentric rings from outside inward
    for (let r = HALF_SIZE; r > HALF_SIZE * 0.4; r -= 2) {
      const t = (HALF_SIZE - r) / HALF_SIZE;
      const alpha = t * t * 0.35; // Quadratic falloff
      gfx.fillStyle(0x000000, alpha);
      gfx.fillCircle(cx, cy, r);
    }
  }

  /**
   * Draw specular highlight at top-left of the marble.
   */
  private static drawHighlight(gfx: Phaser.GameObjects.Graphics): void {
    gfx.fillStyle(0xffffff, 0.35);
    gfx.fillEllipse(
      HALF_SIZE * 0.65,
      HALF_SIZE * 0.6,
      HALF_SIZE * 0.4,
      HALF_SIZE * 0.2,
    );

    // Secondary smaller highlight
    gfx.fillStyle(0xffffff, 0.15);
    gfx.fillEllipse(
      HALF_SIZE * 0.65,
      HALF_SIZE * 0.55,
      HALF_SIZE * 0.2,
      HALF_SIZE * 0.1,
    );
  }

  // ============================================================
  // Helpers
  // ============================================================

  /**
   * Draw a regular polygon star.
   */
  private static drawStar(
    gfx: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    points: number,
    outerRadius: number,
    innerRadius: number,
    rotation: number = 0,
  ): void {
    const step = Math.PI / points;

    gfx.beginPath();

    for (let i = 0; i < 2 * points; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step + rotation;
      const x = cx + r * Math.sin(angle);
      const y = cy - r * Math.cos(angle);

      if (i === 0) {
        gfx.moveTo(x, y);
      } else {
        gfx.lineTo(x, y);
      }
    }

    gfx.closePath();
    gfx.fillPath();
  }

  /**
   * Convert hex string like "#da251d" to number 0xda251d.
   */
  private static hexToNum(hex: string): number {
    const cleaned = hex.replace('#', '');
    return parseInt(cleaned, 16);
  }
}
