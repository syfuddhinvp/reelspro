import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Asset, CropSettings, MediaProps, VideoProps } from '../types.ts';
import { DEFAULT_CROP } from '../types.ts';
import { useEditor } from '../store.ts';

interface Props {
  asset: Asset;
  onClose: () => void;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const MIN_SIZE = 0.05;

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** Resize `crop` from one of 8 handles, keeping the opposite edge(s) anchored. */
function resizeFrom(orig: CropSettings, handle: Handle, dx: number, dy: number): CropSettings {
  let { x, y, w, h } = orig;
  const right = x + w;
  const bottom = y + h;

  if (handle.includes('e')) w = clamp(w + dx, MIN_SIZE, 1 - x);
  if (handle.includes('w')) {
    const nx = clamp(x + dx, 0, right - MIN_SIZE);
    w = right - nx;
    x = nx;
  }
  if (handle.includes('s')) h = clamp(h + dy, MIN_SIZE, 1 - y);
  if (handle.includes('n')) {
    const ny = clamp(y + dy, 0, bottom - MIN_SIZE);
    h = bottom - ny;
    y = ny;
  }
  return { x, y, w, h };
}

/** Crop-frame editor (draggable/resizable rectangle + exact W/H) for images & videos, plus in/out trim for video. */
export default function CropModal({ asset, onClose }: Props) {
  const updateAssetProps = useEditor((s) => s.updateAssetProps);
  const isVideo = asset.type === 'video';
  const p = asset.props as MediaProps | VideoProps;
  const crop = p.crop ?? DEFAULT_CROP;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  const setCrop = (patch: Partial<CropSettings>) =>
    updateAssetProps(asset.id, { crop: { ...crop, ...patch } });

  // once the source video's real length is known, default trimEnd to "full clip"
  useEffect(() => {
    if (isVideo && duration > 0 && (asset.props as VideoProps).trimEnd === 0) {
      updateAssetProps(asset.id, { trimEnd: +duration.toFixed(2) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  // the preview shows the FULL source, letterboxed to fit a fixed box, so the
  // crop rectangle can be dragged/resized freely to any width & height
  const boxW = 340;
  const boxH = 340;
  let dispW = boxW;
  let dispH = boxH;
  if (natural) {
    const srcAspect = natural.w / natural.h;
    const boxAspect = boxW / boxH;
    if (srcAspect > boxAspect) {
      dispW = boxW;
      dispH = boxW / srcAspect;
    } else {
      dispH = boxH;
      dispW = boxH * srcAspect;
    }
  }
  const offX = (boxW - dispW) / 2;
  const offY = (boxH - dispH) / 2;

  const rectStyle: CSSProperties = {
    left: offX + crop.x * dispW,
    top: offY + crop.y * dispH,
    width: crop.w * dispW,
    height: crop.h * dispH,
  };

  const onMoveStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const { x: ox, y: oy, w, h } = crop;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / dispW;
      const dy = (ev.clientY - startY) / dispH;
      setCrop({ x: clamp(ox + dx, 0, 1 - w), y: clamp(oy + dy, 0, 1 - h) });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onResizeStart = (handle: Handle) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const orig = crop;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / dispW;
      const dy = (ev.clientY - startY) / dispH;
      setCrop(resizeFrom(orig, handle, dx, dy));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const setPct = (patch: Partial<{ x: number; y: number; w: number; h: number }>) => {
    const next = { ...crop, ...patch };
    next.w = clamp(next.w, MIN_SIZE, 1);
    next.h = clamp(next.h, MIN_SIZE, 1);
    next.x = clamp(next.x, 0, 1 - next.w);
    next.y = clamp(next.y, 0, 1 - next.h);
    setCrop(next);
  };

  const pct = (v: number) => Math.round(v * 100);

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rp-line px-5 py-4">
          <h3 className="text-base font-bold">{isVideo ? 'Crop & trim video' : 'Crop image'}</h3>
          <button onClick={onClose} className="text-rp-mute hover:text-rp-ink">
            ✕
          </button>
        </div>

        <div className="p-5">
          <div
            className="relative mx-auto mb-4 select-none overflow-hidden rounded-xl bg-[#0b1220]"
            style={{ width: boxW, height: boxH }}
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={(p as VideoProps).src}
                muted
                playsInline
                preload="metadata"
                className="pointer-events-none absolute block"
                style={{ left: offX, top: offY, width: dispW, height: dispH }}
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  setDuration(v.duration);
                  setNatural({ w: v.videoWidth, h: v.videoHeight });
                  v.currentTime = (asset.props as VideoProps).trimStart;
                }}
              />
            ) : (
              <img
                src={p.src}
                alt=""
                className="pointer-events-none absolute block"
                style={{ left: offX, top: offY, width: dispW, height: dispH }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setNatural({ w: img.naturalWidth, h: img.naturalHeight });
                }}
              />
            )}

            {/* crop frame: draggable body + 8 resize handles, darkened outside via box-shadow */}
            <div
              onPointerDown={onMoveStart}
              className="absolute cursor-move border-2 border-white"
              style={{ ...rectStyle, boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}
            >
              {(['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'] as Handle[]).map((h) => (
                <div
                  key={h}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onResizeStart(h)(e);
                  }}
                  className={`absolute h-3 w-3 rounded-[3px] border-2 border-rp-blue bg-white ${handlePos(h)} ${handleCursor(h)}`}
                />
              ))}
            </div>
          </div>

          <p className="mb-3 text-[11px] text-rp-mute">
            Drag the frame to move it, or its edges/corners to resize the crop.
          </p>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <Field label="Width %">
              <input
                type="number"
                min={5}
                max={100}
                value={pct(crop.w)}
                onChange={(e) => setPct({ w: Number(e.target.value) / 100 })}
                className={inputCls}
              />
            </Field>
            <Field label="Height %">
              <input
                type="number"
                min={5}
                max={100}
                value={pct(crop.h)}
                onChange={(e) => setPct({ h: Number(e.target.value) / 100 })}
                className={inputCls}
              />
            </Field>
            <Field label="X %">
              <input
                type="number"
                min={0}
                max={100}
                value={pct(crop.x)}
                onChange={(e) => setPct({ x: Number(e.target.value) / 100 })}
                className={inputCls}
              />
            </Field>
            <Field label="Y %">
              <input
                type="number"
                min={0}
                max={100}
                value={pct(crop.y)}
                onChange={(e) => setPct({ y: Number(e.target.value) / 100 })}
                className={inputCls}
              />
            </Field>
          </div>

          {isVideo && (
            <>
              <Field label={`Clip range · ${duration ? duration.toFixed(1) : '…'}s total`}>
                <TrimBar
                  duration={duration}
                  start={(p as VideoProps).trimStart}
                  end={(p as VideoProps).trimEnd || duration}
                  onChange={(start, end) => {
                    updateAssetProps(asset.id, { trimStart: start, trimEnd: end });
                    if (videoRef.current) videoRef.current.currentTime = start;
                  }}
                />
              </Field>
              <div className="mb-3 flex justify-between text-[12px] text-rp-mute">
                <span>Start {(p as VideoProps).trimStart.toFixed(1)}s</span>
                <span>End {((p as VideoProps).trimEnd || duration).toFixed(1)}s</span>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCrop(DEFAULT_CROP)}
              className="rounded-[11px] border border-rp-line bg-white px-4 py-2 text-sm font-semibold hover:border-rp-blue hover:text-rp-blue"
            >
              Reset crop
            </button>
            <button
              onClick={onClose}
              className="rounded-[11px] bg-rp-blue px-4 py-2 text-sm font-semibold text-white hover:bg-rp-blue-dk"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tailwind position classes for each of the 8 crop-frame handles. */
function handlePos(h: Handle): string {
  const map: Record<Handle, string> = {
    nw: '-left-[7px] -top-[7px]',
    n: 'left-1/2 -top-[7px] -translate-x-1/2',
    ne: '-right-[7px] -top-[7px]',
    w: '-left-[7px] top-1/2 -translate-y-1/2',
    e: '-right-[7px] top-1/2 -translate-y-1/2',
    sw: '-left-[7px] -bottom-[7px]',
    s: 'left-1/2 -bottom-[7px] -translate-x-1/2',
    se: '-right-[7px] -bottom-[7px]',
  };
  return map[h];
}

function handleCursor(h: Handle): string {
  const map: Record<Handle, string> = {
    nw: 'cursor-nwse-resize',
    se: 'cursor-nwse-resize',
    ne: 'cursor-nesw-resize',
    sw: 'cursor-nesw-resize',
    n: 'cursor-ns-resize',
    s: 'cursor-ns-resize',
    e: 'cursor-ew-resize',
    w: 'cursor-ew-resize',
  };
  return map[h];
}

/** Dual-handle range bar for picking a [start, end] window within a clip's duration. */
function TrimBar({
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
    <div ref={barRef} className="relative h-8 w-full touch-none select-none rounded-lg bg-rp-bg">
      <div
        className="absolute inset-y-0 rounded-lg bg-rp-blue/25"
        style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
      />
      <div
        onPointerDown={startDrag('start')}
        title="Drag to set clip start"
        className="absolute top-0 h-full w-[10px] -translate-x-1/2 cursor-ew-resize rounded bg-rp-blue"
        style={{ left: `${leftPct}%` }}
      />
      <div
        onPointerDown={startDrag('end')}
        title="Drag to set clip end"
        className="absolute top-0 h-full w-[10px] -translate-x-1/2 cursor-ew-resize rounded bg-rp-blue"
        style={{ left: `${rightPct}%` }}
      />
    </div>
  );
}

const inputCls =
  'w-full rounded-[9px] border border-rp-line bg-rp-bg px-[10px] py-2 text-[13px] font-[inherit]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[13px]">
      <label className="mb-[5px] block text-xs font-bold text-[#475569]">{label}</label>
      {children}
    </div>
  );
}
