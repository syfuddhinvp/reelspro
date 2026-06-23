export interface AnimDef {
  id: string;
  label: string;
  /** Web Animations API keyframes, or null for 'none'. */
  frames: Keyframe[] | null;
}

/** Default duration (seconds) for entrance / exit animations. */
export const ANIM_DUR = 0.6;

export const IN_ANIMS: AnimDef[] = [
  { id: 'none', label: 'None', frames: null },
  { id: 'fade', label: 'Fade', frames: [{ opacity: 0 }, { opacity: 1 }] },
  { id: 'slide-up', label: 'Slide up', frames: [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'translateY(0)' }] },
  { id: 'slide-down', label: 'Slide down', frames: [{ opacity: 0, transform: 'translateY(-40px)' }, { opacity: 1, transform: 'translateY(0)' }] },
  { id: 'slide-left', label: 'Slide left', frames: [{ opacity: 0, transform: 'translateX(50px)' }, { opacity: 1, transform: 'translateX(0)' }] },
  { id: 'slide-right', label: 'Slide right', frames: [{ opacity: 0, transform: 'translateX(-50px)' }, { opacity: 1, transform: 'translateX(0)' }] },
  { id: 'zoom', label: 'Zoom', frames: [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1)' }] },
  { id: 'pop', label: 'Pop', frames: [
    { opacity: 0, transform: 'scale(0.3)', offset: 0 },
    { opacity: 1, transform: 'scale(1.12)', offset: 0.7 },
    { opacity: 1, transform: 'scale(1)', offset: 1 },
  ] },
  { id: 'rotate', label: 'Rotate', frames: [{ opacity: 0, transform: 'rotate(-25deg) scale(0.7)' }, { opacity: 1, transform: 'rotate(0) scale(1)' }] },
  { id: 'blur', label: 'Blur', frames: [{ opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0)' }] },
];

export const OUT_ANIMS: AnimDef[] = [
  { id: 'none', label: 'None', frames: null },
  { id: 'fade', label: 'Fade', frames: [{ opacity: 1 }, { opacity: 0 }] },
  { id: 'slide-up', label: 'Slide up', frames: [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-40px)' }] },
  { id: 'slide-down', label: 'Slide down', frames: [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(40px)' }] },
  { id: 'slide-left', label: 'Slide left', frames: [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-50px)' }] },
  { id: 'slide-right', label: 'Slide right', frames: [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(50px)' }] },
  { id: 'zoom', label: 'Zoom', frames: [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.6)' }] },
  { id: 'pop', label: 'Pop', frames: [
    { opacity: 1, transform: 'scale(1)', offset: 0 },
    { opacity: 1, transform: 'scale(1.12)', offset: 0.3 },
    { opacity: 0, transform: 'scale(0.3)', offset: 1 },
  ] },
  { id: 'rotate', label: 'Rotate', frames: [{ opacity: 1, transform: 'rotate(0) scale(1)' }, { opacity: 0, transform: 'rotate(25deg) scale(0.7)' }] },
  { id: 'blur', label: 'Blur', frames: [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(10px)' }] },
];

export function framesFor(id: string, kind: 'in' | 'out'): Keyframe[] | null {
  const list = kind === 'in' ? IN_ANIMS : OUT_ANIMS;
  return list.find((a) => a.id === id)?.frames ?? null;
}
