import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssetGroup, VideoTemplate } from './types.ts';

interface TemplateState {
  /** user-created templates (built-ins live in data.ts) */
  templates: VideoTemplate[];
  groups: AssetGroup[];
  saveTemplate: (t: VideoTemplate) => void;
  deleteTemplate: (id: string) => void;
  saveGroup: (g: AssetGroup) => void;
  deleteGroup: (id: string) => void;
}

export const useTemplates = create<TemplateState>()(
  persist(
    (set) => ({
      templates: [],
      groups: [],
      saveTemplate: (t) =>
        set((s) => {
          const exists = s.templates.some((x) => x.id === t.id);
          return {
            templates: exists ? s.templates.map((x) => (x.id === t.id ? t : x)) : [...s.templates, t],
          };
        }),
      deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
      saveGroup: (g) =>
        set((s) => ({ groups: [...s.groups.filter((x) => x.id !== g.id), g] })),
      deleteGroup: (id) => set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),
    }),
    { name: 'reelspro-templates' },
  ),
);

/** Stable id generator for templates / groups. */
export const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
