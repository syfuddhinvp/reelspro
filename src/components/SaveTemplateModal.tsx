import { useState } from 'react';
import type { VideoTemplate } from '../types.ts';
import { useEditor } from '../store.ts';
import { newId, useTemplates } from '../templateStore.ts';
import { useApp } from '../appStore.ts';
import { CATEGORIES, SCENE_BG_PRESETS } from '../data.ts';

interface Props {
  /** when set, the modal edits this template instead of creating a new one */
  editing?: VideoTemplate | null;
  onClose: () => void;
}

const badgeForRatio = (r: string) => (r === '9/16' ? '9:16' : r === '1/1' ? '1:1' : '16:9');

export default function SaveTemplateModal({ editing, onClose }: Props) {
  const ratio = useEditor((s) => s.ratio);
  const scenes = useEditor((s) => s.scenes);
  const globalAssets = useEditor((s) => s.globalAssets);
  const bgAudio = useEditor((s) => s.bgAudio);
  const saveTemplate = useTemplates((s) => s.saveTemplate);
  const toast = useApp((s) => s.toast);

  const [name, setName] = useState(editing?.name ?? 'My template');
  const [description, setDescription] = useState(editing?.description ?? 'Custom template');
  const [category, setCategory] = useState(editing?.category ?? 'Real Estate');
  const [gradient, setGradient] = useState(editing?.gradient ?? SCENE_BG_PRESETS[0]);
  const [big, setBig] = useState(editing?.big ?? scenesHeadline(scenes) ?? name);
  const [small, setSmall] = useState(editing?.small ?? '');

  const save = () => {
    if (!name.trim()) return toast('Give the template a name', 'warning');
    const tpl: VideoTemplate = {
      id: editing?.id ?? newId(),
      name: name.trim(),
      description: description.trim(),
      category,
      badge: badgeForRatio(ratio),
      ratio,
      gradient,
      big: big.trim() || name.trim(),
      small: small.trim(),
      // detached deep snapshot of the current editor content
      scenes: JSON.parse(JSON.stringify(scenes)),
      globalAssets: JSON.parse(JSON.stringify(globalAssets)),
      bgAudio: bgAudio ?? undefined,
    };
    saveTemplate(tpl);
    toast(editing ? `Updated "${tpl.name}"` : `Saved template "${tpl.name}"`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rp-line px-5 py-4">
          <h3 className="text-base font-bold">{editing ? 'Edit template' : 'Save as template'}</h3>
          <button onClick={onClose} className="text-rp-mute hover:text-rp-ink">
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <Field label="Template name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Description">
            <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Aspect (from editor)">
              <input value={badgeForRatio(ratio)} readOnly className={`${inputCls} text-rp-mute`} />
            </Field>
          </div>

          <Field label="Card headline">
            <input value={big} onChange={(e) => setBig(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Card subtext">
            <input value={small} onChange={(e) => setSmall(e.target.value)} className={inputCls} />
          </Field>

          <div className="mb-[5px] text-xs font-bold text-[#475569]">Card thumbnail</div>
          <div className="grid grid-cols-4 gap-2">
            {SCENE_BG_PRESETS.map((g) => (
              <button
                key={g}
                onClick={() => setGradient(g)}
                style={{ background: g }}
                className={`aspect-square rounded-lg border-2 ${gradient === g ? 'border-rp-ink' : 'border-rp-line'}`}
              />
            ))}
          </div>

          <p className="mt-3 text-[11px] text-rp-mute">
            Snapshotting {scenes.length} scene(s) and{' '}
            {scenes.reduce((n, s) => n + s.assets.length, 0)} asset(s) from the editor.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-rp-line px-5 py-4">
          <button onClick={onClose} className="rounded-[11px] border border-rp-line bg-white px-4 py-2 text-sm font-semibold hover:border-rp-blue hover:text-rp-blue">
            Cancel
          </button>
          <button onClick={save} className="rounded-[11px] bg-rp-blue px-4 py-2 text-sm font-semibold text-white hover:bg-rp-blue-dk">
            {editing ? 'Update template' : 'Save template'}
          </button>
        </div>
      </div>
    </div>
  );
}

function scenesHeadline(scenes: { assets: { type: string; props: unknown }[] }[]): string | null {
  for (const sc of scenes) {
    const t = sc.assets.find((a) => a.type === 'text');
    if (t) return (t.props as { text?: string }).text ?? null;
  }
  return null;
}

const inputCls = 'w-full rounded-[9px] border border-rp-line bg-rp-bg px-[10px] py-2 text-[13px]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[13px]">
      <label className="mb-[5px] block text-xs font-bold text-[#475569]">{label}</label>
      {children}
    </div>
  );
}
