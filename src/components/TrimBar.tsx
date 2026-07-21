import { useRef } from 'react';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Dual-handle range bar for picking a [start, end] window within a clip's duration. */
export default function TrimBar({
  duration,
  start,
  end,
  onChange,
}: {
  duration: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  const startDrag = (which: 'start' | 'end') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;
    const move = (ev: PointerEvent) => {
      const frac = clamp((ev.clientX - rect.left) / rect.width, 0, 1);
      const t = +(frac * duration).toFixed(2);
      if (which === 'start') onChange(Math.min(t, end - 0.2), end);
      else onChange(start, Math.max(t, start + 0.2));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const leftPct = duration ? (start / duration) * 100 : 0;
  const rightPct = duration ? (end / duration) * 100 : 100;

  return (
    <div ref={barRef} className="relative h-8 w-full touch-none select-none rounded-lg border border-rp-line bg-rp-bg">
      <div
        className="absolute inset-y-[3px] rounded-md bg-[linear-gradient(90deg,rgba(37,99,235,0.18),rgba(37,99,235,0.28))] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.15)]"
        style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
      />
      <div
        onPointerDown={startDrag('start')}
        title="Drag to set clip start"
        className="absolute top-[2px] bottom-[2px] w-[9px] -translate-x-1/2 cursor-ew-resize rounded-[5px] bg-rp-blue shadow-[var(--shadow-sm)] ring-2 ring-white hover:bg-rp-blue-dk"
        style={{ left: `${leftPct}%` }}
      />
      <div
        onPointerDown={startDrag('end')}
        title="Drag to set clip end"
        className="absolute top-[2px] bottom-[2px] w-[9px] -translate-x-1/2 cursor-ew-resize rounded-[5px] bg-rp-blue shadow-[var(--shadow-sm)] ring-2 ring-white hover:bg-rp-blue-dk"
        style={{ left: `${rightPct}%` }}
      />
    </div>
  );
}
