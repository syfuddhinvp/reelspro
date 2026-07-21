import type { Asset, AssetProps, AssetType } from './types.ts';
import { DEFAULT_CROP, DEFAULT_FONT, DEFAULT_FRAME } from './types.ts';

interface AssetDefinition {
  label: string;
  /** geometry + prop defaults layered on top of the base asset */
  defaults: () => Partial<Asset> & { props: AssetProps };
}

export const ASSET_TYPES: Record<AssetType, AssetDefinition> = {
  text: {
    label: 'Text',
    defaults: () => ({
      w: 200,
      h: 60,
      props: { text: 'Your text', size: 26, color: '#ffffff', font: DEFAULT_FONT },
    }),
  },
  image: {
    label: 'Image',
    defaults: () => ({
      w: 180,
      h: 180,
      lockRatio: true,
      props: { src: '', crop: { ...DEFAULT_CROP }, frame: { ...DEFAULT_FRAME } },
    }),
  },
  logo: {
    label: 'Logo',
    defaults: () => ({
      x: 210,
      y: 20,
      w: 80,
      h: 80,
      lockRatio: true,
      props: { src: '', crop: { ...DEFAULT_CROP }, frame: { ...DEFAULT_FRAME } },
    }),
  },
  video: {
    label: 'Video',
    defaults: () => ({
      w: 220,
      h: 300,
      props: {
        src: '',
        trimStart: 0,
        trimEnd: 0,
        muted: true,
        crop: { ...DEFAULT_CROP },
        frame: { ...DEFAULT_FRAME },
      },
    }),
  },
  audio: {
    label: 'Audio',
    defaults: () => ({
      w: 160,
      h: 40,
      animIn: 'none',
      animOut: 'none',
      props: { src: '', name: 'Audio', trimStart: 0, volume: 1, muted: false },
    }),
  },
};

let _id = 0;
export const nextId = () => ++_id;

/** Build an asset object from a type + overrides. */
export function createAsset(type: AssetType, opts: Partial<Asset> = {}): Asset {
  const def = ASSET_TYPES[type];
  const base: Asset = {
    id: nextId(),
    type,
    x: 60,
    y: 130,
    w: 160,
    h: 90,
    rot: 0,
    dur: 3,
    start: 0,
    end: 3,
    opacity: 1,
    minW: 40,
    minH: 30,
    lockRatio: false,
    editable: true,
    animIn: 'fade',
    animOut: 'none',
    props: {} as AssetProps,
  };
  const defaults = def.defaults();
  const merged: Asset = { ...base, ...defaults, ...opts };
  merged.props = { ...defaults.props, ...opts.props } as AssetProps;
  // keep end consistent with start + dur unless explicitly provided
  if (opts.end == null) merged.end = +(merged.start + merged.dur).toFixed(2);
  merged.dur = +(merged.end - merged.start).toFixed(2);
  return merged;
}

/** Deep-clone assets with fresh ids (for loading templates / inserting groups). */
export function cloneAssets(assets: Asset[], offset = 0): Asset[] {
  return assets.map((a) => ({
    ...a,
    id: nextId(),
    x: a.x + offset,
    y: a.y + offset,
    props: { ...a.props },
  }));
}
