import { useApp, VIEW_META } from '../appStore.ts';

export default function Topbar() {
  const view = useApp((s) => s.view);
  const go = useApp((s) => s.go);
  const openPlayer = useApp((s) => s.openPlayer);
  const meta = VIEW_META[view];
  const showPreview = view === 'editor' || view === 'builder' || view === 'publish';

  return (
    <div className="flex h-16 flex-none items-center justify-between border-b border-rp-line bg-white px-[26px]">
      <div>
        <h1 className="text-xl font-extrabold tracking-[-0.4px]">{meta.title}</h1>
        <div className="text-[13px] font-medium text-rp-mute">{meta.sub}</div>
      </div>
      <div className="flex items-center gap-[10px]">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rp-mute"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
          <input
            placeholder="Search projects…"
            className="w-60 rounded-[10px] border border-rp-line bg-rp-bg py-[9px] pl-9 pr-[14px] text-sm outline-none focus:border-rp-blue"
          />
        </div>
        {showPreview && (
          <button
            onClick={openPlayer}
            className="rounded-[11px] border border-rp-line bg-white px-[16px] py-[10px] text-sm font-semibold text-rp-ink hover:border-rp-blue hover:text-rp-blue"
          >
            ▶ Preview
          </button>
        )}
        <button
          onClick={() => go('templates')}
          className="rounded-[11px] bg-rp-blue px-[18px] py-[10px] text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:bg-rp-blue-dk"
        >
          + New video
        </button>
      </div>
    </div>
  );
}
