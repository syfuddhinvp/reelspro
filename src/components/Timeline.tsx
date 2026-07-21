import { useEffect, useRef } from 'react';
import { PX_PER_SEC } from '../types.ts';
import { useEditor } from '../store.ts';
import { PlayIcon, PlusIcon, StopIcon } from './icons.tsx';

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
  const timeLabelRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  /** current playhead position in seconds — source of truth outside React state, updated imperatively for perf */
  const posRef = useRef(0);

  const total = scenes.reduce((sum, s) => sum + s.dur, 0);

  const fmt = (t: number) => `${t.toFixed(1)}s`;

  const sceneIndexAtTime = (t: number) => {
    let acc = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (t < acc + scenes[i].dur - 1e-6) return i;
      acc += scenes[i].dur;
    }
    return Math.max(0, scenes.length - 1);
  };

  const renderPlayhead = (t: number) => {
    posRef.current = t;
    if (playheadRef.current) playheadRef.current.style.left = `${t * PX_PER_SEC}px`;
    if (timeLabelRef.current) timeLabelRef.current.textContent = fmt(t);
  };

  // keep the playhead in range if scene durations change while paused
  useEffect(() => {
    if (!playing) renderPlayhead(Math.min(posRef.current, total));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, playing]);

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

  // drag the playhead (or click anywhere on the track) to scrub to an exact time
  const timeFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return posRef.current;
    return Math.min(total, Math.max(0, (clientX - rect.left) / PX_PER_SEC));
  };

  const scrubTo = (t: number) => {
    renderPlayhead(t);
    selectScene(sceneIndexAtTime(t));
  };

  const startScrub = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (playing) {
      cancelAnimationFrame(rafRef.current);
      stopPlayback();
    }
    scrubTo(timeFromClientX(e.clientX));
    const move = (ev: PointerEvent) => scrubTo(timeFromClientX(ev.clientX));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const play = () => {
    // cumulative start time of each scene
    const offsets: number[] = [];
    let acc = 0;
    for (const s of scenes) {
      offsets.push(acc);
      acc += s.dur;
    }

    cancelAnimationFrame(rafRef.current);
    startPlayback();

    const t0 = performance.now();
    let curScene = -1;
    const step = (now: number) => {
      const t = Math.min((now - t0) / 1000, total);
      renderPlayhead(t);

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
        stopPlayback();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    stopPlayback();
    renderPlayhead(0);
  };

  // running x offset for laying out scene blocks
  let x = 0;

  return (
    <div className="col-span-3 overflow-auto border-t border-rp-line bg-white px-[18px] py-[14px]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.6px] text-rp-mute">
          Timeline · total {total}s · at <span ref={timeLabelRef}>0.0s</span>
        </div>
        <button
          onClick={playing ? stop : play}
          className={`flex cursor-pointer items-center gap-[7px] rounded-[9px] border px-[14px] py-[6px] text-xs font-semibold ${
            playing
              ? 'border-rp-red bg-rp-red text-white shadow-[var(--shadow-glow-red)]'
              : 'border-rp-line bg-white text-rp-ink hover:border-rp-blue hover:text-rp-blue'
          }`}
        >
          {playing ? <StopIcon size={11} /> : <PlayIcon size={11} />}
          {playing ? 'Stop' : 'Play'}
        </button>
      </div>

      <div
        onPointerDown={startScrub}
        className="mb-[3px] flex cursor-pointer text-[10px] text-rp-mute"
      >
        {Array.from({ length: Math.ceil(total) + 1 }, (_, n) => (
          <span key={n} className="flex-none border-l border-rp-line pl-[3px]" style={{ width: PX_PER_SEC }}>
            {n}s
          </span>
        ))}
      </div>

      <div className="flex items-stretch gap-2">
        <div
          ref={trackRef}
          onPointerDown={startScrub}
          className="relative h-[42px] flex-none cursor-pointer rounded-lg bg-[#f1f5f9]"
          style={{ width: total * PX_PER_SEC }}
        >
          {/* draggable playhead — always visible; shows the exact scrub/playback position */}
          <div
            ref={playheadRef}
            className="pointer-events-none absolute inset-y-0 z-[5] w-[2px] bg-rp-red"
            style={{ left: 0 }}
          >
            <div
              onPointerDown={startScrub}
              title="Drag to scrub"
              className="pointer-events-auto absolute -top-[13px] left-1/2 h-[13px] w-[13px] -translate-x-1/2 cursor-ew-resize rounded-full border-2 border-white bg-rp-red shadow-[var(--shadow-sm)]"
            />
          </div>
          {scenes.map((s, i) => {
            const left = x * PX_PER_SEC;
            const width = s.dur * PX_PER_SEC;
            x += s.dur;
            return (
              <div
                key={s.id}
                onClick={() => selectScene(i)}
                className={`absolute inset-y-[4px] flex cursor-pointer items-center overflow-hidden whitespace-nowrap rounded-md px-2 text-[11px] font-bold text-white ${
                  i === selScene ? 'shadow-[var(--shadow-sm)] ring-2 ring-rp-ink/30' : ''
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
          className="grid h-[42px] w-[52px] flex-none cursor-pointer place-items-center rounded-lg border-[1.5px] border-dashed border-[#c7d2e0] text-rp-mute hover:border-rp-blue hover:bg-rp-blue-soft hover:text-rp-blue"
        >
          <PlusIcon size={16} />
        </button>
      </div>
    </div>
  );
}
