import type { CSSProperties } from 'react';
import type { CropSettings, FrameProps, Ratio } from './types.ts';
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

/**
 * Absolutely-positions an image/video so the chosen crop rectangle (in
 * fractions of its natural size) fills the given container size exactly,
 * like `object-fit: cover` but scoped to just that sub-region — no
 * distortion, any part of the rect that overflows the container aspect is
 * centered and clipped by the container's `overflow: hidden`.
 */
export function coverCropStyle(
  crop: CropSettings,
  natural: { w: number; h: number },
  contW: number,
  contH: number,
): CSSProperties {
  const subW = crop.w * natural.w;
  const subH = crop.h * natural.h;
  if (!subW || !subH || !contW || !contH) {
    return { position: 'absolute', inset: 0, width: '100%', height: '100%' };
  }
  const scale = Math.max(contW / subW, contH / subH);
  const renderedW = natural.w * scale;
  const renderedH = natural.h * scale;
  const extraW = subW * scale - contW;
  const extraH = subH * scale - contH;
  return {
    position: 'absolute',
    left: -(crop.x * natural.w * scale) - extraW / 2,
    top: -(crop.y * natural.h * scale) - extraH / 2,
    width: renderedW,
    height: renderedH,
    maxWidth: 'none',
    maxHeight: 'none',
  };
}

/** CSS for an image/video's frame — corner radius plus an optional solid border. */
export function frameStyle(f: FrameProps): CSSProperties {
  return {
    borderRadius: f.radius,
    border: f.borderWidth > 0 ? `${f.borderWidth}px solid ${f.borderColor}` : undefined,
  };
}

/** Natural pixel size of an uploaded image, read before it's placed on the canvas. */
export function loadImageSize(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error('image failed to load'));
    img.src = url;
  });
}

/** Natural pixel size of an uploaded video, read from its metadata before placement. */
export function loadVideoSize(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => resolve({ w: video.videoWidth, h: video.videoHeight });
    video.onerror = () => reject(new Error('video failed to load'));
    video.src = url;
  });
}

/**
 * Scale (natW × natH) to fit inside (maxW × maxH) keeping its own aspect ratio —
 * used to size a freshly-uploaded asset's box to its source instead of forcing
 * a fixed box (which would crop it via object-fit: cover).
 */
export function fitBox(natW: number, natH: number, maxW: number, maxH: number): { w: number; h: number } {
  if (!natW || !natH) return { w: maxW, h: maxH };
  const scale = Math.min(maxW / natW, maxH / natH);
  return { w: Math.round(natW * scale), h: Math.round(natH * scale) };
}
