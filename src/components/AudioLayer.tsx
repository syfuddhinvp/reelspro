import { useEffect, useRef } from 'react';
import type { AudioProps } from '../types.ts';
import { useEditor } from '../store.ts';

/**
 * Invisible audio engine. During timeline Play it runs:
 *  - the global background track (looped across the whole video)
 *  - the current scene's audio (restarted each time a scene appears)
 *  - audio-type assets, within their [start, end] window
 */
export default function AudioLayer() {
  const playing = useEditor((s) => s.playing);
  const playSeq = useEditor((s) => s.playSeq);
  const bgAudio = useEditor((s) => s.bgAudio);
  const scene = useEditor((s) => s.scenes[s.selScene]);

  const bgRef = useRef<HTMLAudioElement>(null);
  const sceneRef = useRef<HTMLAudioElement>(null);
  const assetRefs = useRef<Map<number, HTMLAudioElement>>(new Map());

  const audioAssets = scene.assets.filter((a) => a.type === 'audio');

  // background track: start when playback begins, stop when it ends
  useEffect(() => {
    const el = bgRef.current;
    if (!el || !bgAudio) return;
    const start = bgAudio.trimStart ?? 0;
    el.volume = bgAudio.volume ?? 1;
    el.muted = bgAudio.muted ?? false;
    if (playing) {
      el.currentTime = start;
      void el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = start;
    }
  }, [playing, bgAudio]);

  // scene audio + audio assets: (re)trigger whenever a scene appears during play
  useEffect(() => {
    const refs = assetRefs.current;
    if (!playing) {
      sceneRef.current?.pause();
      refs.forEach((el) => el.pause());
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    const sa = sceneRef.current;
    if (sa && scene.audio) {
      sa.currentTime = 0;
      void sa.play().catch(() => {});
    }

    audioAssets.forEach((a) => {
      const el = refs.get(a.id);
      if (!el) return;
      const p = a.props as AudioProps;
      const startPlay = () => {
        el.currentTime = p.trimStart;
        el.volume = p.volume;
        el.muted = p.muted;
        void el.play().catch(() => {});
      };
      if (a.start <= 0.01) startPlay();
      else timers.push(setTimeout(startPlay, a.start * 1000));
      timers.push(setTimeout(() => el.pause(), a.end * 1000));
    });

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playSeq, playing]);

  return (
    <>
      {bgAudio && (
        <audio
          ref={bgRef}
          src={bgAudio.src}
          onTimeUpdate={(e) => {
            // loop the selected [trimStart, trimEnd] window across the whole video
            const el = e.currentTarget;
            const start = bgAudio.trimStart ?? 0;
            const end = bgAudio.trimEnd || el.duration || 0;
            if (end > start && el.currentTime >= end) el.currentTime = start;
          }}
          onEnded={(e) => {
            // fallback for when the source ends before trimEnd is reached (e.g. no trimEnd set)
            const el = e.currentTarget;
            el.currentTime = bgAudio.trimStart ?? 0;
            void el.play().catch(() => {});
          }}
        />
      )}
      {scene.audio && <audio key={scene.audio.src} ref={sceneRef} src={scene.audio.src} />}
      {audioAssets.map((a) => (
        <audio
          key={a.id}
          src={(a.props as AudioProps).src}
          ref={(el) => {
            if (el) assetRefs.current.set(a.id, el);
            else assetRefs.current.delete(a.id);
          }}
          onTimeUpdate={(e) => {
            // loop the selected [trimStart, trimEnd] window while it's on screen
            const p = a.props as AudioProps;
            const el = e.currentTarget;
            if (p.trimEnd > p.trimStart && el.currentTime >= p.trimEnd) {
              el.currentTime = p.trimStart;
            }
          }}
        />
      ))}
    </>
  );
}
