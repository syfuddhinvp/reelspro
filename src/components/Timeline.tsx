import { useEffect, useRef } from 'react';
import { PX_PER_SEC } from '../types.ts';
import { useEditor } from '../store.ts';

export default function Timeline() {
  const scenes = useEditor((s) => s.scenes);
  const selScene = useEditor((s) => s.selScene);
  const selectScene = useEditor((s) => s.selectScene);
  const addScene = useEditor((s) => s.addScene);
  const setSceneDur = useEditor((s) => s.setSceneDur);
  const triggerPlay = useEditor((s) => s.play);
  const startPlayback = useEditor((s) => s.startPlayback);
  const stopPlayback = useEditor((s) => s.stopPlayback);
  const playing = useEditor((s) => s.playing);

  const playheadRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const total = scenes.reduce((sum, s) => sum + s.dur, 0);

  // stop any running animation on unmount
  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      stopPlayback();
    },
    [stopPlayback],
  );

  // drag the right edge of a scene block to change its duration
  const startResize = (e: React.PointerEvent, i: number, origDur: number) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const move = (ev: PointerEvent) => {
      const delta = (ev.clientX - startX) / PX_PER_SEC;
      setSceneDur(i, Math.max(0.5, Math.round((origDur + delta) * 2) / 2));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const play = () => {
    const ph = playheadRef.current;
    if (!ph) return;

    // cumulative start time of each scene
    const offsets: number[] = [];
    let acc = 0;
    for (const s of scenes) {
      offsets.push(acc);
      acc += s.dur;
    }

    ph.style.display = 'block';
    ph.style.left = '0px';
    cancelAnimationFrame(rafRef.current);
    startPlayback();

    const t0 = performance.now();
    let curScene = -1;
    const step = (now: number) => {
      const t = (now - t0) / 1000;
      ph.style.left = `${Math.min(t, total) * PX_PER_SEC}px`;

      // which scene is the playhead inside right now?
      let idx = scenes.findIndex((s, i) => t >= offsets[i] && t < offsets[i] + s.dur);
      if (idx === -1) idx = scenes.length - 1;

      // entering a new scene: show it on the canvas + (re)fire its asset animations
      if (idx !== curScene) {
        curScene = idx;
        selectScene(idx);
        triggerPlay();
      }

      if (t < total) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        ph.style.display = 'none';
        stopPlayback();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    const ph = playheadRef.current;
    if (ph) {
      ph.style.display = 'none';
      ph.style.left = '0px';
    }
    stopPlayback();
  };

  // running x offset for laying out scene blocks
  let x = 0;

  return (
    <div className="col-span-3 overflow-auto border-t border-rp-line bg-white px-[18px] py-[14px]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.6px] text-rp-mute">
          Timeline · total {total}s
        </div>
        <button
          onClick={playing ? stop : play}
          className={`cursor-pointer rounded-[9px] border px-[14px] py-[6px] text-xs font-semibold ${
            playing
              ? 'border-rp-red bg-rp-red text-white'
              : 'border-rp-line bg-white text-rp-ink hover:border-rp-blue hover:text-rp-blue'
          }`}
        >
          {playing ? '■ Stop' : '▶ Play'}
        </button>
      </div>

      <div className="mb-[3px] flex text-[10px] text-rp-mute">
        {Array.from({ length: Math.ceil(total) + 1 }, (_, n) => (
          <span key={n} className="flex-none border-l border-rp-line pl-[3px]" style={{ width: PX_PER_SEC }}>
            {n}s
          </span>
        ))}
      </div>

      <div className="flex items-stretch gap-2">
        <div className="relative h-[42px] flex-none rounded-lg bg-[#f1f5f9]" style={{ width: total * PX_PER_SEC }}>
          <div ref={playheadRef} className="pointer-events-none absolute inset-y-0 z-[5] hidden w-[2px] bg-[#ef4444]" />
          {scenes.map((s, i) => {
            const left = x * PX_PER_SEC;
            const width = s.dur * PX_PER_SEC;
            x += s.dur;
            return (
              <div
                key={s.id}
                onClick={() => selectScene(i)}
                className={`absolute inset-y-[4px] flex cursor-pointer items-center overflow-hidden whitespace-nowrap rounded-md px-2 text-[11px] font-bold text-white ${
                  i === selScene ? 'ring-2 ring-rp-ink/30' : ''
                }`}
                style={{ left, width, background: s.bg ?? s.color, opacity: i === selScene ? 1 : 0.55 }}
              >
                {s.name} · {s.dur}s
                {/* right-edge drag handle to resize the scene */}
                <div
                  onPointerDown={(e) => startResize(e, i, s.dur)}
                  onClick={(e) => e.stopPropagation()}
                  title="Drag to resize scene"
                  className="absolute inset-y-0 right-0 z-10 w-[7px] cursor-ew-resize bg-black/20 hover:bg-black/40"
                />
              </div>
            );
          })}
        </div>

        {/* add a scene right from the timeline */}
        <button
          onClick={addScene}
          title="Add scene"
          className="grid h-[42px] w-[52px] flex-none place-items-center rounded-lg border-[1.5px] border-dashed border-[#c7d2e0] text-[22px] leading-none text-rp-mute hover:border-rp-blue hover:text-rp-blue"
        >
          ＋
        </button>
      </div>
    </div>
  );
}
