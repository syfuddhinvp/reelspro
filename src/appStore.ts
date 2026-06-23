import { create } from 'zustand';

export type View =
  | 'dashboard'
  | 'templates'
  | 'editor'
  | 'builder'
  | 'publish'
  | 'consent'
  | 'meeting';

export const VIEW_META: Record<View, { title: string; sub: string }> = {
  dashboard: {
    title: 'Dashboard',
    sub: "Welcome back, Sam — here's your marketing at a glance.",
  },
  templates: {
    title: 'Templates',
    sub: "Pick a starting point — you'll be 90% done.",
  },
  editor: {
    title: 'Video Editor',
    sub: 'Drag scenes to reorder. Everything updates live.',
  },
  builder: {
    title: 'Template Builder',
    sub: 'Design reusable templates — group assets, lock fields, then save.',
  },
  publish: {
    title: 'Publish & Share',
    sub: 'Add a call-to-action and branded landing page shown after your video.',
  },
  consent: {
    title: 'Consent Capture',
    sub: 'Collect clear, signed client consent in seconds.',
  },
  meeting: {
    title: 'Meeting Room',
    sub: 'Walk your client through the video and get consent live.',
  },
};

interface AppState {
  view: View;
  toastMsg: string | null;
  toastSeq: number;
  /** fullscreen preview player open? */
  player: boolean;
  go: (view: View) => void;
  toast: (msg: string) => void;
  openPlayer: () => void;
  closePlayer: () => void;
}

export const useApp = create<AppState>((set) => ({
  view: 'dashboard',
  toastMsg: null,
  toastSeq: 0,
  player: false,
  go: (view) => set({ view }),
  toast: (msg) => set((s) => ({ toastMsg: msg, toastSeq: s.toastSeq + 1 })),
  openPlayer: () => set({ player: true }),
  closePlayer: () => set({ player: false }),
}));
