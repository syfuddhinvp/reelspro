import type { Ratio } from './types.ts';
import { RATIOS } from './types.ts';

const clamp = (v: number) => Math.max(0, Math.min(255, v));

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb hex colour. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 255) + amt);
  const b = clamp((n & 255) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Pixel dimensions of the canvas for a given aspect ratio. */
export function canvasSize(ratio: Ratio): { width: number; height: number } {
  const opt = RATIOS.find((r) => r.ratio === ratio)!;
  const [rw, rh] = ratio.split('/').map(Number);
  return { width: opt.width, height: Math.round((opt.width * rh) / rw) };
}
