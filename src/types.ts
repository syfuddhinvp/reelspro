import type { ReactElement } from 'react';
import { ImageIcon, MusicIcon, StarIcon, TextIcon, VideoIcon } from './components/icons.tsx';

export type AssetType = 'text' | 'image' | 'logo' | 'video' | 'audio';

/** A simple audio source used for scene / background tracks. */
export interface AudioClip {
  src: string;
  name: string;
  /** seconds into the source clip to start playback; defaults to 0 */
  trimStart?: number;
  /** seconds; 0/undefined means "play through to the end of the source clip" */
  trimEnd?: number;
  /** defaults to 1 */
  volume?: number;
  /** defaults to false */
  muted?: boolean;
}

export interface TextProps {
  text: string;
  size: number;
  color: string;
  font: string;
}

/**
 * A crop rectangle selected on the source image/video, in fractions (0..1) of
 * its natural width/height. `{ x: 0, y: 0, w: 1, h: 1 }` selects the full frame.
 */
export interface CropSettings {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const DEFAULT_CROP: CropSettings = { x: 0, y: 0, w: 1, h: 1 };

/** Frame / border styling applied around an image or video box. */
export interface FrameProps {
  /** corner radius in px; values >= half the shorter side render as a full pill/circle */
  radius: number;
  borderWidth: number;
  borderColor: string;
}

export const DEFAULT_FRAME: FrameProps = { radius: 8, borderWidth: 0, borderColor: '#ffffff' };
/** radius used by the "Circle / pill" preset — clamps to an oval on any box size */
export const FRAME_CIRCLE_RADIUS = 999;

export interface MediaProps {
  src: string;
  crop: CropSettings;
  frame: FrameProps;
}

export interface VideoProps {
  src: string;
  trimStart: number;
  /** seconds; 0 means "play through to the end of the source clip" */
  trimEnd: number;
  muted: boolean;
  crop: CropSettings;
  frame: FrameProps;
}

export interface AudioProps {
  src: string;
  name: string;
  trimStart: number;
  /** seconds; 0 means "play through to the end of the source clip" */
  trimEnd: number;
  volume: number;
  muted: boolean;
}

export type AssetProps = TextProps | MediaProps | VideoProps | AudioProps;

export interface Asset {
  id: number;
  type: AssetType;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  /** seconds; kept in sync as (end - start) */
  dur: number;
  start: number;
  end: number;
  opacity: number;
  minW: number;
  minH: number;
  lockRatio: boolean;
  /** if false, the asset is locked (can't be dragged/resized) when using a template */
  editable: boolean;
  /** entrance / exit animation ids (see animations.ts); 'none' = no effect */
  animIn: string;
  animOut: string;
  props: AssetProps;
}

export interface Scene {
  id: number;
  name: string;
  color: string;
  /** optional full CSS background (e.g. a gradient); overrides the color-derived fill */
  bg?: string;
  /** optional audio that plays while this scene is on screen */
  audio?: AudioClip;
  dur: number;
  assets: Asset[];
}

export type Ratio = '9/16' | '1/1' | '16/9';

/** A reusable bundle of assets that can be dropped into any scene. */
export interface AssetGroup {
  id: string;
  name: string;
  assets: Asset[];
}

/** A full, functional template: metadata for its card + a snapshot of scenes. */
export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  /** aspect badge shown on the card, e.g. '9:16' */
  badge: string;
  ratio: Ratio;
  /** CSS background used for the card thumbnail */
  gradient: string;
  /** headline + subtext shown on the card thumbnail */
  big: string;
  small: string;
  scenes: Scene[];
  /** optional assets shown on every scene (e.g. a logo) */
  globalAssets?: Asset[];
  /** optional background music track */
  bgAudio?: AudioClip;
  builtin?: boolean;
}

export const RATIO_FOR_BADGE: Record<string, Ratio> = {
  '9:16': '9/16',
  '1:1': '1/1',
  '16:9': '16/9',
};

export type CtaAction = 'url' | 'email' | 'phone';

/** Branded landing-page + CTA shown after the video plays. */
export interface PublishConfig {
  // CTA button
  ctaLabel: string;
  ctaAction: CtaAction;
  ctaUrl: string;
  ctaColor: string;
  // agent
  agentName: string;
  agentTitle: string;
  agentPhone: string;
  agentEmail: string;
  agentHeadshot: string;
  // landing sections
  showAgentContact: boolean;
  showPropertyAddress: boolean;
  propertyAddress: string;
  showSocials: boolean;
  instagram: string;
  facebook: string;
  linkedin: string;
  // overlays / style
  brandColor: string;
  overlayLogo: string;
  showEndLogo: boolean;
  // mortgage disclosure
  showDisclosure: boolean;
  disclosureText: string;
}

export const CTA_COLORS = ['#0b2545', '#f59e0b', '#16a34a', '#2563eb', '#7c3aed'];

export const DEFAULT_PUBLISH: PublishConfig = {
  ctaLabel: 'Schedule a Free Consultation',
  ctaAction: 'url',
  ctaUrl: 'https://calendly.com/sarah-chen/30min',
  ctaColor: '#0b2545',
  agentName: 'Sam Brooks',
  agentTitle: 'Loan Officer · RP Realty',
  agentPhone: '(415) 555-0182',
  agentEmail: 'sam@rprealty.com',
  agentHeadshot: '/assets/logos/monogram-sb.svg',
  showAgentContact: true,
  showPropertyAddress: true,
  propertyAddress: '123 Maple Avenue, San Mateo, CA',
  showSocials: false,
  instagram: '',
  facebook: '',
  linkedin: '',
  brandColor: '#2563eb',
  overlayLogo: '/assets/logos/rp-realty.svg',
  showEndLogo: true,
  showDisclosure: true,
  disclosureText: 'Pacific Realty | DRE #01234567 | Equal Housing Opportunity',
};

export interface RatioOption {
  ratio: Ratio;
  /** stage width in px for this aspect ratio */
  width: number;
  label: string;
}

export const RATIOS: RatioOption[] = [
  { ratio: '9/16', width: 300, label: '9:16' },
  { ratio: '1/1', width: 360, label: '1:1' },
  { ratio: '16/9', width: 460, label: '16:9' },
];

export const COLORS = ['#2563eb', '#7c3aed', '#0ea5e9', '#16a34a', '#f59e0b', '#ec4899'];
export const SWATCHES = ['#ffffff', '#fde047', '#38bdf8', '#f87171', '#0f172a'];

/** Curated fonts loaded from Google Fonts (see index.html). */
export const FONTS: { label: string; stack: string }[] = [
  { label: 'Inter', stack: "'Inter', sans-serif" },
  { label: 'Poppins', stack: "'Poppins', sans-serif" },
  { label: 'Montserrat', stack: "'Montserrat', sans-serif" },
  { label: 'Oswald', stack: "'Oswald', sans-serif" },
  { label: 'Bebas Neue', stack: "'Bebas Neue', sans-serif" },
  { label: 'Playfair Display', stack: "'Playfair Display', serif" },
  { label: 'Lobster', stack: "'Lobster', cursive" },
  { label: 'Pacifico', stack: "'Pacifico', cursive" },
  { label: 'Roboto Mono', stack: "'Roboto Mono', monospace" },
];
export const DEFAULT_FONT = FONTS[0].stack;

/** Pixels per second on the timeline. */
export const PX_PER_SEC = 56;

export const ASSET_ICON: Record<AssetType, (props: { size?: number; className?: string }) => ReactElement> = {
  text: TextIcon,
  image: ImageIcon,
  logo: StarIcon,
  video: VideoIcon,
  audio: MusicIcon,
};

/** Accent colour per asset type — used by the sidebar asset list. */
export const ASSET_COLOR: Record<AssetType, string> = {
  text: '#1d4ed8',
  image: '#0e7490',
  logo: '#9333ea',
  video: '#b45309',
  audio: '#0d9488',
};
