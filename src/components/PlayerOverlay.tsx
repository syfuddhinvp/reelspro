import { useEffect, useRef, useState } from 'react';
import { useApp } from '../appStore.ts';
import { useEditor } from '../store.ts';
import PlayerCanvas from './PlayerCanvas.tsx';
import LandingPage from './LandingPage.tsx';

export default function PlayerOverlay() {
  const closePlayer = useApp((s) => s.closePlayer);
  const publish = useEditor((s) => s.publish);
  const scenes = useEditor((s) => s.scenes);
  const selectScene = useEditor((s) => s.selectScene);
  const startPlayback = useEditor((s) => s.startPlayback);
  const stopPlayback = useEditor((s) => s.stopPlayback);
  const triggerPlay = useEditor((s) => s.play);

  const [phase, setPhase] = useState<'playing' | 'landing'>('playing');
  const rafRef = useRef(0);

  const run = () => {
    setPhase('playing');
    const offsets: number[] = [];
    let acc = 0;
    for (const s of scenes) {
      offsets.push(acc);
      acc += s.dur;
    }
    const total = acc;
    startPlayback();
    const t0 = performance.now();
    let cur = -1;
    cancelAnimationFrame(rafRef.current);
    const step = (now: number) => {
      const t = (now - t0) / 1000;
      let idx = scenes.findIndex((s, i) => t >= offsets[i] && t < offsets[i] + s.dur);
      if (idx === -1) idx = scenes.length - 1;
      if (idx !== cur) {
        cur = idx;
        selectScene(idx);
        triggerPlay();
      }
      if (t < total) rafRef.current = requestAnimationFrame(step);
      else {
        stopPlayback();
        setPhase('landing');
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    run();
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    cancelAnimationFrame(rafRef.current);
    stopPlayback();
    closePlayer();
  };

  const skip = () => {
    cancelAnimationFrame(rafRef.current);
    stopPlayback();
    setPhase('landing');
  };

  return (
    <div className="fixed inset-0 z-[400] flex flex-col items-center justify-center bg-black/95">
      <button
        onClick={close}
        className="absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
      >
        ✕ Close
      </button>

      {phase === 'playing' ? (
        <>
          <PlayerCanvas />
          <button
            onClick={skip}
            className="mt-5 rounded-full border border-white/30 px-4 py-2 text-[13px] font-semibold text-white/80 hover:border-white hover:text-white"
          >
            Skip to landing ⏭
          </button>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center overflow-y-auto py-10">
          <LandingPage config={publish} onReplay={run} />
        </div>
      )}
    </div>
  );
}
