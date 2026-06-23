import { useState } from 'react';
import type { VideoTemplate } from '../../types.ts';
import { useApp } from '../../appStore.ts';
import { useEditor } from '../../store.ts';
import { useTemplates } from '../../templateStore.ts';
import { BUILTIN_TEMPLATES, CATEGORIES } from '../../data.ts';
import SaveTemplateModal from '../SaveTemplateModal.tsx';

export default function Templates() {
  const [cat, setCat] = useState('All');
  const [editing, setEditing] = useState<VideoTemplate | null>(null);

  const go = useApp((s) => s.go);
  const toast = useApp((s) => s.toast);
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const custom = useTemplates((s) => s.templates);
  const deleteTemplate = useTemplates((s) => s.deleteTemplate);

  const all: VideoTemplate[] = [...custom, ...BUILTIN_TEMPLATES];
  const list = all.filter((t) => cat === 'All' || t.category === cat);

  const use = (t: VideoTemplate) => {
    loadTemplate(t);
    go('editor');
    toast(`✨ "${t.name}" loaded into the editor`);
  };

  const edit = (t: VideoTemplate) => {
    loadTemplate(t); // load its content so the snapshot/edit reflects it
    setEditing(t);
  };

  return (
    <div>
      <div className="mb-[22px] flex flex-wrap items-center gap-[9px]">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors ${
              c === cat
                ? 'border-rp-blue bg-rp-blue text-white'
                : 'border-rp-line bg-white text-rp-slate hover:border-rp-blue hover:bg-rp-blue hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => go('builder')}
          className="ml-auto rounded-full border border-dashed border-rp-blue px-4 py-2 text-[13.5px] font-semibold text-rp-blue"
        >
          ＋ Build a template
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.map((t) => (
          <div
            key={t.id}
            className="group overflow-hidden rounded-xl border border-rp-line bg-white transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
          >
            <div
              className="relative grid aspect-[4/5] place-items-center p-3 text-center text-white"
              style={{ background: t.gradient }}
            >
              <span className="absolute right-2 top-2 rounded-[6px] bg-white/90 px-[7px] py-[2px] text-[10px] font-extrabold text-rp-ink">
                {t.badge}
              </span>
              {!t.builtin && (
                <span className="absolute left-2 top-2 rounded-[6px] bg-black/45 px-[7px] py-[2px] text-[10px] font-bold backdrop-blur-[4px]">
                  Custom
                </span>
              )}
              <div>
                <div className="text-[17px] font-black leading-[1.1] [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">
                  {t.big}
                </div>
                {t.small && <div className="mt-1 text-[11px] font-semibold opacity-90">{t.small}</div>}
              </div>
            </div>
            <div className="p-3">
              <b className="block truncate text-[13px]">{t.name}</b>
              <span className="block truncate text-[11px] text-rp-mute">{t.description}</span>
              <div className="mt-2 flex items-center gap-[6px]">
                <button
                  onClick={() => use(t)}
                  className="flex-1 rounded-lg bg-rp-blue px-2 py-[6px] text-[12px] font-semibold text-white hover:bg-rp-blue-dk"
                >
                  Use →
                </button>
                {!t.builtin && (
                  <>
                    <button
                      onClick={() => edit(t)}
                      title="Edit template"
                      className="rounded-lg border border-rp-line px-2 py-[6px] text-[12px] font-semibold hover:border-rp-blue hover:text-rp-blue"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => {
                        deleteTemplate(t.id);
                        toast(`Deleted "${t.name}"`);
                      }}
                      title="Delete template"
                      className="rounded-lg border border-rp-line px-2 py-[6px] text-[12px] font-semibold text-[#ef4444] hover:border-[#ef4444]"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && <SaveTemplateModal editing={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
