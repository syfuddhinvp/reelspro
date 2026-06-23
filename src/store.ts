import { create } from 'zustand';
import type {
  Asset,
  AssetGroup,
  AssetType,
  AudioClip,
  AudioProps,
  PublishConfig,
  Ratio,
  Scene,
  TextProps,
  VideoProps,
  VideoTemplate,
} from './types.ts';
import { COLORS, DEFAULT_PUBLISH } from './types.ts';
import { cloneAssets, createAsset } from './assetTypes.ts';

export type AlignHow = 'left' | 'right' | 'cx' | 'top' | 'bottom' | 'cy';

interface EditorState {
  scenes: Scene[];
  selScene: number;
  selAssetId: number | null;
  ratio: Ratio;

  /** assets shown on every scene (e.g. a logo) at the same position */
  globalAssets: Asset[];
  /** background audio track that plays across the whole video */
  bgAudio: AudioClip | null;
  /** branded landing-page + CTA shown after the video */
  publish: PublishConfig;

  // animation preview / playback signals
  preview: { id: number; kind: 'in' | 'out'; seq: number } | null;
  playSeq: number;
  playing: boolean;

  // scenes
  selectScene: (i: number) => void;
  addScene: () => void;
  delScene: (i: number) => void;
  updateScene: (patch: Partial<Pick<Scene, 'name' | 'dur' | 'color' | 'bg' | 'audio'>>) => void;
  /** resize any scene's duration (used by the timeline drag handle) */
  setSceneDur: (i: number, dur: number) => void;
  setSceneAudio: (clip: AudioClip | null) => void;
  applyBgToAll: () => void;

  // assets
  selectAsset: (id: number | null) => void;
  addAsset: (type: AssetType, props?: Partial<Asset['props']>) => void;
  addAudioAsset: (src: string, name: string) => void;
  addGlobalAsset: (type: AssetType, props?: Partial<Asset['props']>) => void;
  toggleGlobal: (id: number) => void;
  delAsset: () => void;
  duplicateAsset: () => void;
  layer: (dir: 1 | -1) => void;
  align: (how: AlignHow, boxW: number, boxH: number) => void;
  updateAsset: (id: number, patch: Partial<Asset>) => void;
  updateAssetProps: (id: number, patch: Partial<TextProps & VideoProps & AudioProps>) => void;

  // audio
  setBgAudio: (clip: AudioClip | null) => void;

  // publish / landing page
  updatePublish: (patch: Partial<PublishConfig>) => void;

  // animation
  previewAsset: (id: number, kind: 'in' | 'out') => void;
  play: () => void;
  startPlayback: () => void;
  stopPlayback: () => void;

  // templates / groups
  loadTemplate: (tpl: VideoTemplate) => void;
  insertGroup: (group: AssetGroup) => void;

  // stage
  setRatio: (ratio: Ratio) => void;
}

/** Clamp an asset's start/end into [0, sceneDur] and keep dur = end - start. */
function normalizeTiming(a: Asset, sceneDur: number): Asset {
  const start = Math.max(0, Math.min(a.start, sceneDur - 0.5));
  const end = Math.max(start + 0.5, Math.min(a.end, sceneDur));
  return { ...a, start, end, dur: +(end - start).toFixed(2) };
}

export const useEditor = create<EditorState>((set, get) => {
  /** Replace the currently selected scene with the result of `fn(scene)`. */
  const patchCurrentScene = (fn: (scene: Scene) => Scene) =>
    set((s) => ({
      scenes: s.scenes.map((sc, i) => (i === s.selScene ? fn(sc) : sc)),
    }));

  return {
    scenes: [
      { id: 1, name: 'Intro', color: '#2563eb', dur: 3, assets: [] },
      { id: 2, name: 'Property', color: '#7c3aed', dur: 5, assets: [] },
      { id: 3, name: 'Contact', color: '#16a34a', dur: 3, assets: [] },
    ],
    selScene: 0,
    selAssetId: null,
    ratio: '9/16',
    globalAssets: [],
    bgAudio: null,
    publish: DEFAULT_PUBLISH,
    preview: null,
    playSeq: 0,
    playing: false,

    selectScene: (i) => set({ selScene: i, selAssetId: null }),

    addScene: () =>
      set((s) => {
        const n = s.scenes.length;
        const scene: Scene = {
          id: Date.now(),
          name: 'New scene',
          color: COLORS[n % COLORS.length],
          dur: 3,
          assets: [],
        };
        return { scenes: [...s.scenes, scene], selScene: n, selAssetId: null };
      }),

    delScene: (i) =>
      set((s) => {
        if (s.scenes.length <= 1) return s;
        const scenes = s.scenes.filter((_, idx) => idx !== i);
        return {
          scenes,
          selScene: Math.min(s.selScene, scenes.length - 1),
          selAssetId: null,
        };
      }),

    updateScene: (patch) =>
      patchCurrentScene((sc) => {
        const next: Scene = { ...sc, ...patch };
        if (patch.dur != null) {
          const dur = Math.max(0.5, patch.dur);
          next.dur = dur;
          next.assets = sc.assets.map((a) => normalizeTiming(a, dur));
        }
        return next;
      }),

    setSceneDur: (i, dur) =>
      set((s) => ({
        scenes: s.scenes.map((sc, idx) => {
          if (idx !== i) return sc;
          const d = Math.max(0.5, +dur.toFixed(2));
          return { ...sc, dur: d, assets: sc.assets.map((a) => normalizeTiming(a, d)) };
        }),
      })),

    selectAsset: (id) => set({ selAssetId: id }),

    addAsset: (type, props) => {
      const scene = get().scenes[get().selScene];
      const created = createAsset(type, props ? { props: props as Asset['props'] } : {});
      const asset = normalizeTiming(created, scene.dur);
      patchCurrentScene((sc) => ({ ...sc, assets: [...sc.assets, asset] }));
      set({ selAssetId: asset.id });
    },

    addAudioAsset: (src, name) => {
      const scene = get().scenes[get().selScene];
      const created = createAsset('audio', { props: { src, name } as Asset['props'] });
      const asset = normalizeTiming(created, scene.dur);
      patchCurrentScene((sc) => ({ ...sc, assets: [...sc.assets, asset] }));
      set({ selAssetId: asset.id });
    },

    addGlobalAsset: (type, props) => {
      const created = createAsset(type, props ? { props: props as Asset['props'] } : {});
      set((s) => ({ globalAssets: [...s.globalAssets, created], selAssetId: created.id }));
    },

    // move an asset between the current scene and the global (all-slides) layer
    toggleGlobal: (id) =>
      set((s) => {
        const sc = s.scenes[s.selScene];
        const inScene = sc.assets.find((a) => a.id === id);
        if (inScene) {
          return {
            scenes: s.scenes.map((x, i) =>
              i === s.selScene ? { ...x, assets: x.assets.filter((a) => a.id !== id) } : x,
            ),
            globalAssets: [...s.globalAssets, inScene],
          };
        }
        const g = s.globalAssets.find((a) => a.id === id);
        if (g) {
          return {
            globalAssets: s.globalAssets.filter((a) => a.id !== id),
            scenes: s.scenes.map((x, i) =>
              i === s.selScene ? { ...x, assets: [...x.assets, normalizeTiming(g, x.dur)] } : x,
            ),
          };
        }
        return s;
      }),

    delAsset: () => {
      const id = get().selAssetId;
      if (id == null) return;
      set((s) => {
        if (s.globalAssets.some((a) => a.id === id)) {
          return { globalAssets: s.globalAssets.filter((a) => a.id !== id), selAssetId: null };
        }
        return {
          scenes: s.scenes.map((sc, i) =>
            i === s.selScene ? { ...sc, assets: sc.assets.filter((a) => a.id !== id) } : sc,
          ),
          selAssetId: null,
        };
      });
    },

    duplicateAsset: () => {
      const { selAssetId, scenes, selScene } = get();
      const orig = scenes[selScene].assets.find((a) => a.id === selAssetId);
      if (!orig) return;
      const copy = createAsset(orig.type, {
        x: orig.x + 20,
        y: orig.y + 20,
        w: orig.w,
        h: orig.h,
        rot: orig.rot,
        dur: orig.dur,
        start: orig.start,
        end: orig.end,
        opacity: orig.opacity,
        lockRatio: orig.lockRatio,
        editable: orig.editable,
        animIn: orig.animIn,
        animOut: orig.animOut,
        props: { ...orig.props },
      });
      patchCurrentScene((sc) => ({ ...sc, assets: [...sc.assets, copy] }));
      set({ selAssetId: copy.id });
    },

    // move asset within the scene array = its stacking order (later = on top)
    layer: (dir) => {
      const id = get().selAssetId;
      if (id == null) return;
      patchCurrentScene((sc) => {
        const arr = [...sc.assets];
        const i = arr.findIndex((a) => a.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return sc;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        return { ...sc, assets: arr };
      });
    },

    align: (how, boxW, boxH) => {
      const id = get().selAssetId;
      if (id == null) return;
      const aligned = (a: Asset): Asset => {
        const next = { ...a };
        if (how === 'left') next.x = 0;
        if (how === 'right') next.x = boxW - a.w;
        if (how === 'cx') next.x = Math.round((boxW - a.w) / 2);
        if (how === 'top') next.y = 0;
        if (how === 'bottom') next.y = boxH - a.h;
        if (how === 'cy') next.y = Math.round((boxH - a.h) / 2);
        return next;
      };
      set((s) => {
        if (s.globalAssets.some((a) => a.id === id)) {
          return { globalAssets: s.globalAssets.map((a) => (a.id === id ? aligned(a) : a)) };
        }
        return {
          scenes: s.scenes.map((sc, i) =>
            i === s.selScene
              ? { ...sc, assets: sc.assets.map((a) => (a.id === id ? aligned(a) : a)) }
              : sc,
          ),
        };
      });
    },

    updateAsset: (id, patch) =>
      set((s) => {
        if (s.globalAssets.some((a) => a.id === id)) {
          return { globalAssets: s.globalAssets.map((a) => (a.id === id ? { ...a, ...patch } : a)) };
        }
        return {
          scenes: s.scenes.map((sc, i) => {
            if (i !== s.selScene) return sc;
            return {
              ...sc,
              assets: sc.assets.map((a) => {
                if (a.id !== id) return a;
                const next = { ...a, ...patch };
                return 'start' in patch || 'end' in patch ? normalizeTiming(next, sc.dur) : next;
              }),
            };
          }),
        };
      }),

    updateAssetProps: (id, patch) =>
      set((s) => {
        const apply = (a: Asset): Asset =>
          a.id === id ? { ...a, props: { ...a.props, ...patch } as Asset['props'] } : a;
        if (s.globalAssets.some((a) => a.id === id)) {
          return { globalAssets: s.globalAssets.map(apply) };
        }
        return {
          scenes: s.scenes.map((sc, i) => (i === s.selScene ? { ...sc, assets: sc.assets.map(apply) } : sc)),
        };
      }),

    setBgAudio: (clip) => set({ bgAudio: clip }),
    updatePublish: (patch) => set((s) => ({ publish: { ...s.publish, ...patch } })),
    setSceneAudio: (clip) => patchCurrentScene((sc) => ({ ...sc, audio: clip ?? undefined })),
    applyBgToAll: () =>
      set((s) => {
        const cur = s.scenes[s.selScene];
        return { scenes: s.scenes.map((sc) => ({ ...sc, color: cur.color, bg: cur.bg })) };
      }),

    previewAsset: (id, kind) =>
      set((s) => ({ preview: { id, kind, seq: (s.preview?.seq ?? 0) + 1 } })),

    play: () => set((s) => ({ playSeq: s.playSeq + 1 })),
    startPlayback: () => set({ playing: true, selAssetId: null }),
    stopPlayback: () => set({ playing: false }),

    loadTemplate: (tpl) =>
      set({
        scenes: tpl.scenes.map((sc) => ({
          ...sc,
          id: Date.now() + Math.floor(Math.random() * 1e6),
          assets: cloneAssets(sc.assets),
        })),
        selScene: 0,
        selAssetId: null,
        ratio: tpl.ratio,
        playing: false,
        globalAssets: tpl.globalAssets ? cloneAssets(tpl.globalAssets) : [],
        bgAudio: tpl.bgAudio ?? null,
      }),

    insertGroup: (group) => {
      const scene = get().scenes[get().selScene];
      const clones = cloneAssets(group.assets, 12).map((a) => normalizeTiming(a, scene.dur));
      patchCurrentScene((sc) => ({ ...sc, assets: [...sc.assets, ...clones] }));
      set({ selAssetId: clones[clones.length - 1]?.id ?? null });
    },

    setRatio: (ratio) => set({ ratio }),
  };
});

/** Convenience selectors. */
export const useCurrentScene = () => useEditor((s) => s.scenes[s.selScene]);
export const useSelectedAsset = () =>
  useEditor(
    (s) =>
      s.scenes[s.selScene].assets.find((a) => a.id === s.selAssetId) ??
      s.globalAssets.find((a) => a.id === s.selAssetId) ??
      null,
  );
