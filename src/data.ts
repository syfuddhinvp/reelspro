export const GRADS: Record<string, string> = {
  blue: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
  green: 'linear-gradient(135deg,#15803d,#22c55e)',
  purple: 'linear-gradient(135deg,#6d28d9,#a78bfa)',
  sunset: 'linear-gradient(135deg,#b45309,#f59e0b)',
  teal: 'linear-gradient(135deg,#0e7490,#06b6d4)',
  rose: 'linear-gradient(135deg,#9f1239,#fb7185)',
};

export type StatusClass = 's-pub' | 's-draft' | 's-rev';

export interface RecentProject {
  t: string;
  cat: string;
  g: keyof typeof GRADS;
  dur: string;
  st: StatusClass;
  stt: string;
  views: string;
}

export const RECENT: RecentProject[] = [
  { t: 'Maple Ave — Just Listed', cat: 'JUST LISTED', g: 'blue', dur: '0:14', st: 's-pub', stt: 'Published', views: '4.1K views' },
  { t: 'Rate Drop — 5.9% APR', cat: 'RATE DROP', g: 'green', dur: '0:12', st: 's-rev', stt: 'In review', views: 'Draft' },
  { t: 'Oak St Open House', cat: 'OPEN HOUSE', g: 'purple', dur: '0:18', st: 's-draft', stt: 'Draft', views: 'Not posted' },
  { t: 'Client win — The Patels', cat: 'TESTIMONIAL', g: 'rose', dur: '0:22', st: 's-pub', stt: 'Published', views: '8.6K views' },
  { t: 'Just Sold — 88 Birch', cat: 'JUST SOLD', g: 'sunset', dur: '0:15', st: 's-pub', stt: 'Published', views: '2.3K views' },
  { t: 'First-time buyer tips', cat: 'EDUCATION', g: 'teal', dur: '0:30', st: 's-draft', stt: 'Draft', views: 'Not posted' },
];

export interface Template {
  t: string;
  d: string;
  cat: string;
  g: keyof typeof GRADS;
  badge: string;
  big: string;
  small: string;
}

export const TEMPLATES: Template[] = [
  { t: 'Just Listed', d: 'Showcase a new property', cat: 'Real Estate', g: 'blue', badge: '9:16', big: 'JUST LISTED', small: '123 Maple Avenue' },
  { t: 'Just Sold', d: 'Celebrate a closing', cat: 'Real Estate', g: 'sunset', badge: '9:16', big: 'JUST SOLD', small: 'Another happy family 🎉' },
  { t: 'Rate Drop Alert', d: 'Announce a better rate', cat: 'Mortgage', g: 'green', badge: '9:16', big: 'RATES JUST DROPPED', small: '5.9% APR · Lock it in' },
  { t: 'Open House', d: 'Drive weekend foot traffic', cat: 'Real Estate', g: 'purple', badge: '1:1', big: 'OPEN HOUSE', small: 'Sat & Sun · 1–4 PM' },
  { t: 'Client Testimonial', d: 'Let clients sell for you', cat: 'Social', g: 'rose', badge: '9:16', big: '"Best decision ever."', small: '— The Patel Family' },
  { t: 'Pre-Approval Tips', d: 'Educate future buyers', cat: 'Mortgage', g: 'teal', badge: '16:9', big: 'GET PRE-APPROVED', small: 'In 3 simple steps' },
  { t: 'Price Improved', d: 'Re-energize a listing', cat: 'Real Estate', g: 'sunset', badge: '9:16', big: 'PRICE IMPROVED', small: 'Now $499,000' },
  { t: 'Market Update', d: 'Position yourself as expert', cat: 'Social', g: 'blue', badge: '16:9', big: 'JUNE MARKET UPDATE', small: 'What buyers should know' },
  { t: 'Meet Your Agent', d: 'Introduce yourself', cat: 'Social', g: 'purple', badge: '9:16', big: 'HI, I AM SAM 👋', small: 'Your local lending expert' },
];

export const CATEGORIES = ['All', 'Real Estate', 'Mortgage', 'Social'];

import type { Asset, AudioClip, Ratio, Scene, VideoTemplate } from './types.ts';
import { DEFAULT_FONT } from './types.ts';
import { createAsset } from './assetTypes.ts';
import { canvasSize } from './util.ts';

/* ---------------- demo asset library (files in /public/assets) ---------------- */

const LOGO = {
  realty: '/assets/logos/rp-realty.svg',
  mark: '/assets/logos/reelspro.svg',
  sb: '/assets/logos/monogram-sb.svg',
  rate: '/assets/logos/rate-badge.svg',
};
const IMG = {
  house: '/assets/images/house.svg',
  interior: '/assets/images/interior.svg',
  skyline: '/assets/images/skyline.svg',
  sold: '/assets/images/sold.svg',
  keys: '/assets/images/keys.svg',
};
const AUDIO: Record<string, AudioClip> = {
  corporate: { src: '/assets/audio/corporate.wav', name: 'Corporate (loop)' },
  upbeat: { src: '/assets/audio/upbeat.wav', name: 'Upbeat (loop)' },
  calm: { src: '/assets/audio/calm.wav', name: 'Calm (loop)' },
};
const bgImage = (src: string) => `url('${src}') center / cover no-repeat`;
const FONT_DISPLAY = "'Poppins', sans-serif";

let _sid = 5000;
const sceneId = () => (_sid += 1) + Math.random();

/** Per-ratio helpers that position assets relative to the canvas. */
function maker(ratio: Ratio, dur: number) {
  const { width: W, height: H } = canvasSize(ratio);
  const text = (
    t: string,
    yFrac: number,
    o: {
      size?: number; color?: string; font?: string; start?: number; end?: number;
      in?: string; out?: string; h?: number;
    } = {},
  ): Asset =>
    createAsset('text', {
      x: 24,
      y: Math.round(H * yFrac),
      w: W - 48,
      h: o.h ?? 90,
      start: o.start ?? 0,
      end: o.end ?? dur,
      animIn: o.in ?? 'slide-up',
      animOut: o.out ?? 'fade',
      props: { text: t, size: o.size ?? 30, color: o.color ?? '#ffffff', font: o.font ?? DEFAULT_FONT },
    });
  const image = (
    src: string,
    o: { w?: number; h?: number; x?: number; y?: number; start?: number; end?: number; in?: string } = {},
  ): Asset => {
    const w = o.w ?? Math.round(W * 0.66);
    const h = o.h ?? w;
    return createAsset('image', {
      x: o.x ?? Math.round((W - w) / 2),
      y: o.y ?? Math.round(H * 0.16),
      w,
      h,
      start: o.start ?? 0,
      end: o.end ?? dur,
      animIn: o.in ?? 'zoom',
      animOut: 'fade',
      lockRatio: true,
      props: { src },
    });
  };
  return { W, H, text, image };
}

function scene(ratio: Ratio, name: string, bg: string, dur: number, build: (m: ReturnType<typeof maker>) => Asset[]): Scene {
  const m = maker(ratio, dur);
  return { id: sceneId(), name, color: '#1e3a8a', bg, dur, assets: build(m) };
}

/** A small logo pinned to every scene (global, locked). */
function globalLogo(src: string, ratio: Ratio): Asset {
  const { width: W } = canvasSize(ratio);
  return createAsset('logo', {
    x: Math.round((W - 132) / 2),
    y: 18,
    w: 132,
    h: 40,
    editable: false,
    animIn: 'fade',
    animOut: 'none',
    props: { src },
  });
}

const G = {
  blue: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
  green: 'linear-gradient(135deg,#15803d,#22c55e)',
  gold: 'linear-gradient(135deg,#b45309,#f59e0b)',
  purple: 'linear-gradient(135deg,#6d28d9,#a78bfa)',
  rose: 'linear-gradient(135deg,#9f1239,#fb7185)',
  teal: 'linear-gradient(135deg,#0e7490,#06b6d4)',
  ink: 'linear-gradient(135deg,#0f172a,#334155)',
};

export const BUILTIN_TEMPLATES: VideoTemplate[] = [
  {
    id: 'builtin-just-listed',
    name: 'Just Listed',
    description: 'Reveal a new property in 3 scenes',
    category: 'Real Estate',
    badge: '9:16',
    ratio: '9/16',
    gradient: G.blue,
    big: 'JUST LISTED',
    small: '123 Maple Avenue',
    bgAudio: AUDIO.corporate,
    globalAssets: [globalLogo(LOGO.realty, '9/16')],
    scenes: [
      scene('9/16', 'Reveal', bgImage(IMG.house), 3.5, (m) => [
        m.text('JUST LISTED', 0.62, { size: 40, font: FONT_DISPLAY, in: 'pop', start: 0.3 }),
        m.text('123 Maple Avenue', 0.74, { size: 20, start: 0.8 }),
      ]),
      scene('9/16', 'Details', bgImage(IMG.interior), 4, (m) => [
        m.text('4 Bed · 3 Bath', 0.2, { size: 30, font: FONT_DISPLAY, in: 'slide-left' }),
        m.text('2,400 sq ft · 2-car garage', 0.32, { size: 17, start: 0.4 }),
        m.text('$725,000', 0.78, { size: 38, font: FONT_DISPLAY, color: '#fde047', in: 'zoom', start: 0.8 }),
      ]),
      scene('9/16', 'Contact', G.blue, 3.5, (m) => [
        m.text('Book a private tour', 0.4, { size: 30, font: FONT_DISPLAY, in: 'slide-up' }),
        m.text('Sam Brooks · (415) 555-0182', 0.54, { size: 16, start: 0.6 }),
      ]),
    ],
  },
  {
    id: 'builtin-just-sold',
    name: 'Just Sold',
    description: 'Celebrate a closing',
    category: 'Real Estate',
    badge: '9:16',
    ratio: '9/16',
    gradient: G.gold,
    big: 'JUST SOLD',
    small: 'Another happy family 🎉',
    bgAudio: AUDIO.upbeat,
    globalAssets: [globalLogo(LOGO.realty, '9/16')],
    scenes: [
      scene('9/16', 'Sold', bgImage(IMG.sold), 3, (m) => [
        m.text('ANOTHER ONE SOLD', 0.68, { size: 30, font: FONT_DISPLAY, in: 'pop', start: 0.2 }),
      ]),
      scene('9/16', 'Result', G.gold, 4, (m) => [
        m.text('Sold in 6 days', 0.28, { size: 34, font: FONT_DISPLAY, in: 'slide-down' }),
        m.text('3% over asking', 0.42, { size: 22, start: 0.5 }),
        m.text('Thinking of selling?', 0.7, { size: 24, font: FONT_DISPLAY, start: 1.2, in: 'fade' }),
        m.text('Let’s talk — Sam Brooks', 0.8, { size: 16, start: 1.6 }),
      ]),
    ],
  },
  {
    id: 'builtin-rate-drop',
    name: 'Rate Drop Alert',
    description: 'Announce a better rate',
    category: 'Mortgage',
    badge: '9:16',
    ratio: '9/16',
    gradient: G.green,
    big: 'RATES JUST DROPPED',
    small: '5.9% APR · Lock it in',
    bgAudio: AUDIO.upbeat,
    globalAssets: [globalLogo(LOGO.realty, '9/16')],
    scenes: [
      scene('9/16', 'Alert', G.green, 3, (m) => [
        m.text('🔔 RATE DROP', 0.3, { size: 30, font: FONT_DISPLAY, in: 'slide-down' }),
        m.image(LOGO.rate, { w: 150, h: 150, y: Math.round(m.H * 0.42), start: 0.4, in: 'pop' }),
      ]),
      scene('9/16', 'Offer', G.green, 4, (m) => [
        m.text('Now as low as', 0.26, { size: 20, start: 0.2 }),
        m.text('5.9% APR', 0.4, { size: 46, font: FONT_DISPLAY, color: '#fde047', in: 'zoom', start: 0.5 }),
        m.text('30-yr fixed · est. payment $2,140/mo', 0.62, { size: 15, start: 1 }),
        m.text('Get pre-approved today', 0.78, { size: 22, font: FONT_DISPLAY, start: 1.4 }),
      ]),
    ],
  },
  {
    id: 'builtin-open-house',
    name: 'Open House',
    description: 'Drive weekend foot traffic',
    category: 'Real Estate',
    badge: '1:1',
    ratio: '1/1',
    gradient: G.purple,
    big: 'OPEN HOUSE',
    small: 'Sat & Sun · 1–4 PM',
    bgAudio: AUDIO.corporate,
    globalAssets: [globalLogo(LOGO.realty, '1/1')],
    scenes: [
      scene('1/1', 'Invite', bgImage(IMG.house), 3.5, (m) => [
        m.text('OPEN HOUSE', 0.58, { size: 38, font: FONT_DISPLAY, in: 'pop', start: 0.2 }),
        m.text('Saturday & Sunday · 1–4 PM', 0.72, { size: 18, start: 0.7 }),
      ]),
      scene('1/1', 'Where', G.purple, 3.5, (m) => [
        m.text('88 Birch Street', 0.35, { size: 30, font: FONT_DISPLAY, in: 'slide-left' }),
        m.text('Refreshments & tours all weekend', 0.5, { size: 16, start: 0.5 }),
      ]),
    ],
  },
  {
    id: 'builtin-testimonial',
    name: 'Client Testimonial',
    description: 'Let clients sell for you',
    category: 'Social',
    badge: '9:16',
    ratio: '9/16',
    gradient: G.rose,
    big: '“Best decision ever.”',
    small: '— The Patel Family',
    bgAudio: AUDIO.calm,
    globalAssets: [globalLogo(LOGO.realty, '9/16')],
    scenes: [
      scene('9/16', 'Quote', bgImage(IMG.interior), 4.5, (m) => [
        m.text('“Sam made our first home feel easy and fun.”', 0.4, { size: 26, font: FONT_DISPLAY, in: 'fade', start: 0.3, h: 160 }),
        m.text('— The Patel Family', 0.66, { size: 17, start: 1.2 }),
      ]),
      scene('9/16', 'CTA', G.rose, 3, (m) => [
        m.text('Your story could be next', 0.42, { size: 26, font: FONT_DISPLAY }),
        m.text('Sam Brooks · RP Realty', 0.56, { size: 16, start: 0.5 }),
      ]),
    ],
  },
  {
    id: 'builtin-meet-agent',
    name: 'Meet Your Agent',
    description: 'Introduce yourself',
    category: 'Social',
    badge: '9:16',
    ratio: '9/16',
    gradient: G.blue,
    big: "HI, I'M SAM 👋",
    small: 'Your local lending expert',
    bgAudio: AUDIO.calm,
    scenes: [
      scene('9/16', 'Intro', G.ink, 3.5, (m) => [
        m.image(LOGO.sb, { w: 150, h: 150, y: Math.round(m.H * 0.22), in: 'pop', start: 0.2 }),
        m.text("HI, I'M SAM 👋", 0.6, { size: 32, font: FONT_DISPLAY, start: 0.6 }),
        m.text('Your local lending expert', 0.72, { size: 17, start: 1 }),
      ]),
      scene('9/16', 'Promise', G.blue, 4, (m) => [
        m.text('120+ families helped home', 0.3, { size: 26, font: FONT_DISPLAY, in: 'slide-left' }),
        m.text('Pre-approval in 24 hours', 0.44, { size: 18, start: 0.5 }),
        m.text('Let’s find yours →', 0.74, { size: 24, font: FONT_DISPLAY, start: 1.2 }),
      ]),
    ],
  },
  {
    id: 'builtin-market-update',
    name: 'Market Update',
    description: 'Position yourself as the expert',
    category: 'Social',
    badge: '16:9',
    ratio: '16/9',
    gradient: G.teal,
    big: 'JUNE MARKET UPDATE',
    small: 'What buyers should know',
    bgAudio: AUDIO.corporate,
    globalAssets: [globalLogo(LOGO.realty, '16/9')],
    scenes: [
      scene('16/9', 'Title', bgImage(IMG.skyline), 3, (m) => [
        m.text('JUNE MARKET UPDATE', 0.42, { size: 30, font: FONT_DISPLAY, in: 'slide-up', start: 0.2 }),
      ]),
      scene('16/9', 'Stats', G.teal, 4, (m) => [
        m.text('Median price ▲ 2.1%', 0.32, { size: 22, font: FONT_DISPLAY, in: 'slide-left' }),
        m.text('Inventory ▲ 8% · Days on market ▼', 0.5, { size: 16, start: 0.5 }),
        m.text('A great window for buyers', 0.7, { size: 20, font: FONT_DISPLAY, start: 1 }),
      ]),
    ],
  },
  {
    id: 'builtin-price-improved',
    name: 'Price Improved',
    description: 'Re-energize a listing',
    category: 'Real Estate',
    badge: '9:16',
    ratio: '9/16',
    gradient: G.gold,
    big: 'PRICE IMPROVED',
    small: 'Now $499,000',
    bgAudio: AUDIO.upbeat,
    globalAssets: [globalLogo(LOGO.realty, '9/16')],
    scenes: [
      scene('9/16', 'News', bgImage(IMG.keys), 3, (m) => [
        m.text('PRICE IMPROVED', 0.64, { size: 34, font: FONT_DISPLAY, in: 'pop', start: 0.2 }),
      ]),
      scene('9/16', 'Price', G.gold, 3.5, (m) => [
        m.text('Was $529,000', 0.34, { size: 22, color: '#fee2e2', start: 0.2, in: 'fade' }),
        m.text('Now $499,000', 0.5, { size: 42, font: FONT_DISPLAY, color: '#fff', in: 'zoom', start: 0.7 }),
        m.text('Won’t last — tour today', 0.74, { size: 18, start: 1.3 }),
      ]),
    ],
  },
];

/** Preset scene-background gradients shown in the Scene tab. */
export const SCENE_BG_PRESETS: string[] = [
  'linear-gradient(135deg,#1e3a8a,#2563eb)',
  'linear-gradient(135deg,#6d28d9,#a78bfa)',
  'linear-gradient(135deg,#15803d,#22c55e)',
  'linear-gradient(135deg,#b45309,#f59e0b)',
  'linear-gradient(135deg,#0e7490,#06b6d4)',
  'linear-gradient(135deg,#9f1239,#fb7185)',
  'linear-gradient(135deg,#0f172a,#334155)',
  'linear-gradient(135deg,#111827,#000000)',
];

export const STATUS_CHIP: Record<StatusClass, string> = {
  's-pub': 'bg-[#dcfce7] text-[#15803d]',
  's-draft': 'bg-[#fef3c7] text-[#b45309]',
  's-rev': 'bg-[#dbeafe] text-[#1d4ed8]',
};
