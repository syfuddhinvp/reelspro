/**
 * Samples the same Web Animations API keyframes used live (animations.ts) at an
 * arbitrary progress 0..1, so the canvas exporter can draw the in-between state
 * of an entrance/exit effect instead of only its start/end.
 */
export interface SampledTransform {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  rotateDeg: number;
  blurPx: number;
}

export const IDENTITY_TRANSFORM: SampledTransform = {
  opacity: 1,
  translateX: 0,
  translateY: 0,
  scale: 1,
  rotateDeg: 0,
  blurPx: 0,
};

function parseTransform(t: unknown): { translateX: number; translateY: number; scale: number; rotateDeg: number } {
  const out = { translateX: 0, translateY: 0, scale: 1, rotateDeg: 0 };
  if (typeof t !== 'string') return out;
  const mX = /translateX\(([-\d.]+)px\)/.exec(t);
  if (mX) out.translateX = +mX[1];
  const mY = /translateY\(([-\d.]+)px\)/.exec(t);
  if (mY) out.translateY = +mY[1];
  const mS = /scale\(([-\d.]+)\)/.exec(t);
  if (mS) out.scale = +mS[1];
  const mR = /rotate\(([-\d.]+)deg\)/.exec(t);
  if (mR) out.rotateDeg = +mR[1];
  return out;
}

function parseBlur(f: unknown): number {
  const m = typeof f === 'string' ? /blur\(([-\d.]+)px\)/.exec(f) : null;
  return m ? +m[1] : 0;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Sample `frames` (as used by animations.ts) at `progress` in [0, 1]. `null`/empty frames = identity. */
export function sampleFrames(frames: Keyframe[] | null | undefined, progress: number): SampledTransform {
  if (!frames || frames.length === 0) return IDENTITY_TRANSFORM;
  const n = frames.length;
  const offsets = frames.map((f, i) => (typeof f.offset === 'number' ? f.offset : n > 1 ? i / (n - 1) : 0));
  const p = Math.min(1, Math.max(0, progress));

  let i = 0;
  while (i < n - 2 && p > offsets[i + 1]) i++;
  const t0 = offsets[i];
  const t1 = offsets[i + 1] ?? 1;
  const localT = t1 > t0 ? (p - t0) / (t1 - t0) : 1;

  const a = frames[i];
  const b = frames[i + 1] ?? frames[i];
  const opA = typeof a.opacity === 'number' ? a.opacity : 1;
  const opB = typeof b.opacity === 'number' ? b.opacity : 1;
  const trA = parseTransform(a.transform);
  const trB = parseTransform(b.transform);
  const blA = parseBlur(a.filter);
  const blB = parseBlur(b.filter);

  return {
    opacity: lerp(opA, opB, localT),
    translateX: lerp(trA.translateX, trB.translateX, localT),
    translateY: lerp(trA.translateY, trB.translateY, localT),
    scale: lerp(trA.scale, trB.scale, localT),
    rotateDeg: lerp(trA.rotateDeg, trB.rotateDeg, localT),
    blurPx: lerp(blA, blB, localT),
  };
}
