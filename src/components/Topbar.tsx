import { useState } from 'react';
import { useApp, VIEW_META } from '../appStore.ts';
import ExportModal from './ExportModal.tsx';
import { DownloadIcon, PlayIcon, PlusIcon, SearchIcon } from './icons.tsx';

export default function Topbar() {
  const view = useApp((s) => s.view);
  const go = useApp((s) => s.go);
  const openPlayer = useApp((s) => s.openPlayer);
  const meta = VIEW_META[view];
  const showPreview = view === 'editor' || view === 'builder' || view === 'publish';
  const showExport = view === 'editor';
  const [exporting, setExporting] = useState(false);

  return (
    <div className="flex h-16 flex-none items-center justify-between border-b border-rp-line bg-white px-[26px]">
      <div>
        <h1 className="text-xl font-extrabold tracking-[-0.4px] text-rp-ink">{meta.title}</h1>
        <div className="text-[13px] font-medium text-rp-mute">{meta.sub}</div>
      </div>
      <div className="flex items-center gap-[10px]">
        <div className="relative">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rp-mute"
          />
          <input
            placeholder="Search projects…"
            className="w-60 rounded-[10px] border border-rp-line bg-rp-bg py-[9px] pl-9 pr-[14px] text-sm outline-none focus:border-rp-blue focus:bg-white focus:ring-[3px] focus:ring-rp-blue/10"
          />
        </div>
        {showPreview && (
          <button
            onClick={openPlayer}
            className="flex items-center gap-[7px] rounded-[11px] border border-rp-line bg-white px-[16px] py-[10px] text-sm font-semibold text-rp-ink shadow-[var(--shadow-xs)] hover:border-rp-blue hover:text-rp-blue"
          >
            <PlayIcon size={12} />
            Preview
          </button>
        )}
        {showExport && (
          <button
            onClick={() => setExporting(true)}
            className="flex items-center gap-[7px] rounded-[11px] border border-rp-line bg-white px-[16px] py-[10px] text-sm font-semibold text-rp-ink shadow-[var(--shadow-xs)] hover:border-rp-blue hover:text-rp-blue"
          >
            <DownloadIcon size={15} />
            Export video
          </button>
        )}
        <button
          onClick={() => go('templates')}
          className="flex items-center gap-[6px] rounded-[11px] bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-[18px] py-[10px] text-sm font-semibold text-white shadow-[var(--shadow-glow-blue)] hover:bg-[linear-gradient(135deg,#1e40af,#2563eb)]"
        >
          <PlusIcon size={14} />
          New video
        </button>
      </div>
      {exporting && <ExportModal onClose={() => setExporting(false)} />}
    </div>
  );
}
