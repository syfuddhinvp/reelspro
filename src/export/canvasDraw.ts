import type { Asset, CropSettings, FrameProps, Scene, TextProps } from '../types.ts';
import { shade } from '../util.ts';
import type { SampledTransform } from './keyframes.ts';

/** Trace a rounded-rect path centered at the origin (radius clamps to a pill/circle, like CSS border-radius). */
function roundedRectPath(ctx: CanvasRenderingContext2D, w: number, h: number, radius: number) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const x = -w / 2;
  const y = -h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Scene background — solid color, or one of the `linear-gradient(135deg,#a,#b)` presets (parsed to a canvas gradient). */
export function drawSceneBackground(ctx: CanvasRenderingContext2D, scene: Scene, w: number, h: number) {
  const stops = /linear-gradient\(\s*135deg\s*,\s*(#[0-9a-fA-F]{3,8})\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)/.exec(
    scene.bg ?? '',
  );
  const [c1, c2] = stops ? [stops[1], stops[2]] : [shade(scene.color, -25), scene.color];
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Apply an asset's static box transform (position/rotation) plus its sampled
 * entrance/exit animation transform, leaving the context translated to the
 * asset's own center with (0,0) as that center — draw calls that follow should
 * use box-local coordinates (i.e. `-w/2..w/2`, `-h/2..h/2`).
 */
export function withAssetTransform(
  ctx: CanvasRenderingContext2D,
  asset: Asset,
  anim: SampledTransform,
  draw: () => void,
) {
  ctx.save();
  try {
    ctx.translate(asset.x + asset.w / 2, asset.y + asset.h / 2);
    ctx.rotate((asset.rot * Math.PI) / 180);
    ctx.translate(anim.translateX, anim.translateY);
    ctx.rotate((anim.rotateDeg * Math.PI) / 180);
    ctx.scale(anim.scale, anim.scale);
    ctx.globalAlpha = Math.max(0, Math.min(1, asset.opacity * anim.opacity));
    ctx.filter = anim.blurPx > 0.01 ? `blur(${anim.blurPx}px)` : 'none';
    draw();
  } finally {
    // a throw inside `draw()` must not leave the clip/transform stack unbalanced —
    // that would corrupt every asset drawn after this one for the rest of the export
    ctx.restore();
  }
}

/** Draw an image/video source into an asset's box, cropped + framed (radius + border), no distortion beyond the crop rect itself. */
export function drawMedia(
  ctx: CanvasRenderingContext2D,
  asset: Asset,
  source: CanvasImageSource,
  natural: { w: number; h: number },
  crop: CropSettings,
  frame: FrameProps,
) {
  const w = asset.w;
  const h = asset.h;
  const sx = crop.x * natural.w;
  const sy = crop.y * natural.h;
  const sw = Math.max(1, crop.w * natural.w);
  const sh = Math.max(1, crop.h * natural.h);

  ctx.save();
  roundedRectPath(ctx, w, h, frame.radius);
  ctx.clip();
  ctx.drawImage(source, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
  ctx.restore();

  if (frame.borderWidth > 0) {
    ctx.save();
    ctx.lineWidth = frame.borderWidth;
    ctx.strokeStyle = frame.borderColor;
    roundedRectPath(ctx, w - frame.borderWidth, h - frame.borderWidth, frame.radius);
    ctx.stroke();
    ctx.restore();
  }
}

/** Word-wrap `text` (respecting explicit newlines) to fit within `maxWidth` using the context's current font. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${line} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
      } else {
        lines.push(line);
        line = words[i];
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Draw a text asset, matching the live `.rp-text-asset` styling (center-aligned, extrabold, drop shadow). */
export function drawText(ctx: CanvasRenderingContext2D, asset: Asset, p: TextProps) {
  const w = asset.w;
  ctx.font = `800 ${p.size}px ${p.font}`;
  ctx.fillStyle = p.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;

  const lines = wrapText(ctx, p.text || '', w);
  const lineHeight = p.size * 1.15;
  const totalH = lineHeight * lines.length;
  lines.forEach((line, i) => {
    const ly = -totalH / 2 + lineHeight * (i + 0.5);
    ctx.fillText(line, 0, ly);
  });
}
