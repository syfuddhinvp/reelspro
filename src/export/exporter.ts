import type {
  Asset,
  AudioClip,
  AudioProps,
  MediaProps,
  Ratio,
  Scene,
  TextProps,
  VideoProps,
} from '../types.ts';
import { canvasSize } from '../util.ts';
import { ANIM_DUR, framesFor } from '../animations.ts';
import { drawMedia, drawSceneBackground, drawText, withAssetTransform } from './canvasDraw.ts';
import { IDENTITY_TRANSFORM, sampleFrames, type SampledTransform } from './keyframes.ts';

export interface ExportSnapshot {
  scenes: Scene[];
  globalAssets: Asset[];
  ratio: Ratio;
  bgAudio: AudioClip | null;
}

export interface ExportHandle {
  /** Resolves with the recorded file once rendering finishes; rejects on failure or cancel(). */
  result: Promise<{ blob: Blob; mimeType: string; extension: string }>;
  cancel: () => void;
}

/** Thrown (and left to reject `result`) when `cancel()` is called mid-export. */
export class ExportCancelledError extends Error {
  constructor() {
    super('Export cancelled');
    this.name = 'ExportCancelledError';
  }
}

// Only webm here — MediaRecorder's `video/mp4` support is unreliable across
// browsers when chunked via a timeslice (isTypeSupported can report `true` while
// producing a truncated/invalid file), whereas webm's cluster-based container is
// designed to be assembled from independently-emitted chunks.
const MIME_CANDIDATES = [
  { mimeType: 'video/webm;codecs=vp9,opus', extension: 'webm' },
  { mimeType: 'video/webm;codecs=vp8,opus', extension: 'webm' },
  { mimeType: 'video/webm', extension: 'webm' },
];

function pickMimeType(): { mimeType: string; extension: string } {
  for (const c of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(c.mimeType)) return c;
  }
  return { mimeType: '', extension: 'webm' };
}

const isMediaType = (a: Asset) => a.type === 'image' || a.type === 'logo' || a.type === 'video';

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  // `decode()` (not just `onload`) guarantees the image is fully rasterized before
  // the first drawImage — otherwise an SVG's first canvas draw can freeze in an
  // incompletely-laid-out state (e.g. embedded text not yet font-shaped) and every
  // later frame reuses that same bad rasterization.
  await img.decode();
  return img;
}

function loadVideo(src: string, muted: boolean): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    v.preload = 'auto';
    v.muted = muted;
    v.playsInline = true;
    v.onloadeddata = () => resolve(v);
    v.onerror = () => reject(new Error(`failed to load video: ${src}`));
    v.src = src;
  });
}

function loadAudio(src: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const a = new Audio();
    a.preload = 'auto';
    a.onloadedmetadata = () => resolve(a);
    a.onerror = () => reject(new Error(`failed to load audio: ${src}`));
    a.src = src;
  });
}

/** Idempotent per-frame play/pause + [trimStart,trimEnd] loop for a media element driven by explicit "should be active now" checks. */
class TrackedMedia {
  active = false;
  constructor(
    public el: HTMLMediaElement,
    public trimStart: number,
    public trimEnd: number,
  ) {}

  setActive(active: boolean) {
    if (active && !this.active) {
      this.el.currentTime = this.trimStart;
      void this.el.play().catch(() => {});
    } else if (!active && this.active) {
      this.el.pause();
    }
    this.active = active;
  }

  loopTick() {
    if (!this.active) return;
    if (this.trimEnd > this.trimStart && this.el.currentTime >= this.trimEnd) {
      this.el.currentTime = this.trimStart;
    }
  }
}

/** Where an asset falls in [start, end): hidden, or visible with a sampled entrance/exit transform. */
function computeVisual(asset: Asset, localT: number, isGlobal: boolean): { hidden: boolean; anim: SampledTransform } {
  if (isGlobal) return { hidden: false, anim: IDENTITY_TRANSFORM };
  const EPS = 0.01;
  if (localT < asset.start - EPS || localT >= asset.end - EPS) {
    return { hidden: true, anim: IDENTITY_TRANSFORM };
  }
  const inFrames = framesFor(asset.animIn, 'in');
  const outFrames = framesFor(asset.animOut, 'out');
  const outStart = Math.max(asset.start, asset.end - ANIM_DUR);

  if (localT < asset.start + ANIM_DUR && inFrames) {
    return { hidden: false, anim: sampleFrames(inFrames, (localT - asset.start) / ANIM_DUR) };
  }
  if (localT >= outStart && outFrames) {
    return { hidden: false, anim: sampleFrames(outFrames, (localT - outStart) / ANIM_DUR) };
  }
  return { hidden: false, anim: IDENTITY_TRANSFORM };
}

/**
 * Renders the full scene timeline onto an offscreen canvas in real time (1x speed,
 * matching how the source video/audio elements themselves play back) and captures
 * it with MediaRecorder. Mirrors AssetView/AudioLayer/Timeline's playback model.
 */
export function startExport(
  snapshot: ExportSnapshot,
  opts: { fps?: number; scale?: number; onProgress?: (t: number, total: number) => void } = {},
): ExportHandle {
  const fps = opts.fps ?? 30;
  const scale = opts.scale ?? 3;
  let cancelled = false;

  const result = (async () => {
    const { scenes, globalAssets, ratio, bgAudio } = snapshot;
    const { width, height } = canvasSize(ratio);
    const W = Math.round(width * scale);
    const H = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2D context unavailable');

    // preload every font used by a text asset, so canvas text doesn't silently fall back
    const fontStacks = new Set<string>();
    [...scenes.flatMap((s) => s.assets), ...globalAssets]
      .filter((a) => a.type === 'text')
      .forEach((a) => fontStacks.add((a.props as TextProps).font));
    await Promise.all([...fontStacks].map((f) => document.fonts.load(`800 32px ${f}`).catch(() => {})));
    await document.fonts.ready;

    // preload image/video sources
    const mediaEls = new Map<number, HTMLImageElement | HTMLVideoElement>();
    const allMediaAssets = [...scenes.flatMap((s) => s.assets), ...globalAssets].filter(isMediaType);
    await Promise.all(
      allMediaAssets.map(async (a) => {
        if (a.type === 'video') {
          const p = a.props as VideoProps;
          mediaEls.set(a.id, await loadVideo(p.src, p.muted));
        } else {
          const p = a.props as MediaProps;
          mediaEls.set(a.id, await loadImage(p.src));
        }
      }),
    );

    // audio graph: canvas video track + a mixed audio track from every playing element
    const audioCtx = new AudioContext();
    await audioCtx.resume();
    const dest = audioCtx.createMediaStreamDestination();

    // A MediaStreamAudioDestinationNode with nothing actively feeding it appears to
    // never produce samples in some browsers, which stalls MediaRecorder's muxer
    // entirely (it never emits ANY data, video included — verified empirically).
    // A silent oscillator keeps the audio graph actually running even when the
    // composition has no audio at all (e.g. no bg music / scene audio / assets).
    const keepAlive = audioCtx.createOscillator();
    const silence = audioCtx.createGain();
    silence.gain.value = 0;
    keepAlive.connect(silence).connect(dest);
    keepAlive.start();

    const connectAudio = (el: HTMLMediaElement, volume: number) => {
      const source = audioCtx.createMediaElementSource(el);
      const gain = audioCtx.createGain();
      gain.gain.value = volume;
      source.connect(gain).connect(dest);
      gain.connect(audioCtx.destination);
    };

    let bgTrack: TrackedMedia | null = null;
    if (bgAudio) {
      const el = await loadAudio(bgAudio.src);
      connectAudio(el, (bgAudio.muted ?? false) ? 0 : (bgAudio.volume ?? 1));
      bgTrack = new TrackedMedia(el, bgAudio.trimStart ?? 0, bgAudio.trimEnd ?? 0);
    }

    interface SceneRuntime {
      offset: number;
      sceneAudioEl: HTMLAudioElement | null;
      audioTracks: { asset: Asset; track: TrackedMedia }[];
    }
    const sceneRuntimes: SceneRuntime[] = [];
    let acc = 0;
    for (const scene of scenes) {
      let sceneAudioEl: HTMLAudioElement | null = null;
      if (scene.audio) {
        sceneAudioEl = await loadAudio(scene.audio.src);
        connectAudio(sceneAudioEl, 1);
      }
      const audioTracks: { asset: Asset; track: TrackedMedia }[] = [];
      for (const a of scene.assets.filter((a) => a.type === 'audio')) {
        const p = a.props as AudioProps;
        const el = await loadAudio(p.src);
        connectAudio(el, p.muted ? 0 : p.volume);
        audioTracks.push({ asset: a, track: new TrackedMedia(el, p.trimStart, p.trimEnd) });
      }
      // scene-scoped (non-global) video assets with audible sound also need capturing
      for (const a of scene.assets.filter((a) => a.type === 'video')) {
        const p = a.props as VideoProps;
        if (p.muted) continue;
        const el = mediaEls.get(a.id) as HTMLVideoElement;
        connectAudio(el, 1);
      }
      sceneRuntimes.push({ offset: acc, sceneAudioEl, audioTracks });
      acc += scene.dur;
    }
    const total = acc;

    // global (all-slides) video assets play continuously for the whole export,
    // same as background music — capture their audio if not muted
    const globalVideoTracks: { asset: Asset; track: TrackedMedia }[] = [];
    for (const a of globalAssets.filter((a) => a.type === 'video')) {
      const p = a.props as VideoProps;
      if (!p.muted) connectAudio(mediaEls.get(a.id) as HTMLVideoElement, 1);
      globalVideoTracks.push({ asset: a, track: new TrackedMedia(mediaEls.get(a.id) as HTMLVideoElement, p.trimStart, p.trimEnd) });
    }

    if (cancelled) {
      audioCtx.close();
      throw new ExportCancelledError();
    }

    const videoTracks = canvas.captureStream(fps).getVideoTracks();
    const combined = new MediaStream([...videoTracks, ...dest.stream.getAudioTracks()]);
    const picked = pickMimeType();
    const recorder = new MediaRecorder(combined, picked.mimeType ? { mimeType: picked.mimeType } : undefined);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const finished = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });
    recorder.start(1000);

    let rafId = 0;
    let prevSceneIdx = -1;
    // per-scene video assets need play/pause managed like audio (they draw whatever frame is currently decoded)
    const videoTracksByScene = new Map<number, { asset: Asset; track: TrackedMedia }[]>();
    scenes.forEach((scene, i) => {
      const list: { asset: Asset; track: TrackedMedia }[] = [];
      for (const a of scene.assets.filter((a) => a.type === 'video')) {
        const p = a.props as VideoProps;
        list.push({ asset: a, track: new TrackedMedia(mediaEls.get(a.id) as HTMLVideoElement, p.trimStart, p.trimEnd) });
      }
      videoTracksByScene.set(i, list);
    });

    await new Promise<void>((resolveLoop) => {
      const t0 = performance.now();

      const stopAllInScene = (idx: number) => {
        const rt = sceneRuntimes[idx];
        if (!rt) return;
        rt.sceneAudioEl?.pause();
        rt.audioTracks.forEach(({ track }) => track.setActive(false));
        videoTracksByScene.get(idx)?.forEach(({ track }) => track.setActive(false));
      };

      const step = (now: number) => {
        if (cancelled) {
          resolveLoop();
          return;
        }
        const t = Math.min((now - t0) / 1000, total);
        opts.onProgress?.(t, total);

        let sceneIdx = scenes.findIndex((s, i) => t >= sceneRuntimes[i].offset && t < sceneRuntimes[i].offset + s.dur);
        if (sceneIdx === -1) sceneIdx = scenes.length - 1;

        if (sceneIdx !== prevSceneIdx) {
          if (prevSceneIdx !== -1) stopAllInScene(prevSceneIdx);
          const rt = sceneRuntimes[sceneIdx];
          if (rt.sceneAudioEl) {
            rt.sceneAudioEl.currentTime = 0;
            void rt.sceneAudioEl.play().catch(() => {});
          }
          prevSceneIdx = sceneIdx;
        }

        // bg music: active for the whole export
        if (bgTrack) {
          bgTrack.setActive(true);
          bgTrack.loopTick();
        }
        // global video: also active for the whole export, looping within its own trim window
        for (const { track } of globalVideoTracks) {
          track.setActive(true);
          track.loopTick();
        }

        const scene = scenes[sceneIdx];
        const localT = t - sceneRuntimes[sceneIdx].offset;

        // audio-type assets: active only within their own [start,end) window
        for (const { asset, track } of sceneRuntimes[sceneIdx].audioTracks) {
          const active = localT >= asset.start && localT < asset.end;
          track.setActive(active);
          track.loopTick();
        }
        // scene-scoped video assets: same active window, feeds both the canvas frame and (if unmuted) the audio graph
        for (const { asset, track } of videoTracksByScene.get(sceneIdx) ?? []) {
          const active = localT >= asset.start && localT < asset.end;
          track.setActive(active);
          track.loopTick();
        }

        // --- draw ---
        ctx.save();
        ctx.clearRect(0, 0, W, H);
        ctx.scale(scale, scale);
        drawSceneBackground(ctx, scene, width, height);

        const drawOne = (asset: Asset, isGlobal: boolean) => {
          if (asset.type === 'audio') return;
          const { hidden, anim } = computeVisual(asset, localT, isGlobal);
          if (hidden) return;
          withAssetTransform(ctx, asset, anim, () => {
            if (asset.type === 'text') {
              drawText(ctx, asset, asset.props as TextProps);
              return;
            }
            const el = mediaEls.get(asset.id);
            if (!el) return;
            const natural =
              el instanceof HTMLVideoElement
                ? { w: el.videoWidth, h: el.videoHeight }
                : { w: el.naturalWidth, h: el.naturalHeight };
            const p = asset.props as MediaProps | VideoProps;
            drawMedia(ctx, asset, el, natural, p.crop, p.frame);
          });
        };

        // scene assets first, global assets (e.g. a persistent logo/video) drawn on top — matches Stage.tsx's z-order
        scene.assets.forEach((a) => drawOne(a, false));
        globalAssets.forEach((a) => drawOne(a, true));
        ctx.restore();

        if (t >= total || cancelled) {
          if (prevSceneIdx !== -1) stopAllInScene(prevSceneIdx);
          bgTrack?.setActive(false);
          globalVideoTracks.forEach(({ track }) => track.setActive(false));
          resolveLoop();
          return;
        }
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    });
    cancelAnimationFrame(rafId);

    recorder.stop();
    await finished;

    audioCtx.close();
    mediaEls.forEach((el) => {
      if (el instanceof HTMLVideoElement) el.pause();
    });

    if (cancelled) throw new ExportCancelledError();

    const finalMime = picked.mimeType || 'video/webm';
    return { blob: new Blob(chunks, { type: finalMime }), mimeType: finalMime, extension: picked.extension };
  })();

  return {
    result,
    cancel: () => {
      cancelled = true;
    },
  };
}
