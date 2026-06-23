import type { View } from '../appStore.ts';
import { useApp } from '../appStore.ts';
import { ConsentIcon, DashboardIcon, InviteIcon, TemplatesIcon, VideoIcon } from './icons.tsx';

interface NavDef {
  view: View;
  label: string;
  icon: React.ReactNode;
}

const MAIN_NAV: NavDef[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { view: 'templates', label: 'Templates', icon: <TemplatesIcon /> },
  { view: 'editor', label: 'Video Editor', icon: <VideoIcon /> },
  { view: 'builder', label: 'Template Builder', icon: <TemplatesIcon /> },
  { view: 'publish', label: 'Publish & Share', icon: <InviteIcon size={19} /> },
];

const CLIENT_NAV: NavDef[] = [
  { view: 'consent', label: 'Consent Capture', icon: <ConsentIcon /> },
  { view: 'meeting', label: 'Meeting Room', icon: <VideoIcon /> },
];

export default function Sidebar() {
  const view = useApp((s) => s.view);
  const go = useApp((s) => s.go);
  const toast = useApp((s) => s.toast);

  return (
    <aside className="flex flex-col bg-rp-navy px-[14px] py-[18px] text-white">
      <div className="flex items-center gap-[10px] px-[10px] pt-2 pb-5 text-[19px] font-extrabold">
        <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[linear-gradient(135deg,#2563eb,#60a5fa)]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M8 5v14l11-7z" fill="white" />
          </svg>
        </span>
        ReelsPro
      </div>

      {MAIN_NAV.map((n) => (
        <NavItem key={n.view} def={n} active={view === n.view} onClick={() => go(n.view)} />
      ))}

      <div className="px-[13px] pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.7px] text-[#5e7193]">
        Client tools
      </div>
      {CLIENT_NAV.map((n) => (
        <NavItem key={n.view} def={n} active={view === n.view} onClick={() => go(n.view)} />
      ))}

      <div className="flex-1" />

      <div className="rounded-[14px] bg-[linear-gradient(135deg,#2563eb,#7c3aed)] p-4 text-[13px]">
        <b className="mb-1 block text-[14.5px]">You're on Pro ✦</b>
        <p className="mb-3 leading-[1.4] text-[#dbe4ff]">Unlimited videos, consent & meetings.</p>
        <button
          onClick={() => toast('Billing is mocked in this demo 🙂')}
          className="w-full rounded-[9px] bg-white p-[9px] text-[13px] font-bold text-rp-blue-dk"
        >
          Manage plan
        </button>
      </div>

      <div className="mt-2 flex items-center gap-[10px] border-t border-white/10 px-2 pt-3 pb-1">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#93c5fd,#2563eb)] text-sm font-bold">
          SB
        </div>
        <div>
          <b className="block text-[13.5px]">Sam Brooks</b>
          <span className="text-xs text-[#8da3c4]">Loan Officer</span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  def,
  active,
  onClick,
}: {
  def: NavDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`mb-[3px] flex cursor-pointer items-center gap-3 rounded-[11px] px-[13px] py-[11px] text-[14.5px] font-medium transition-colors ${
        active
          ? 'bg-rp-blue text-white shadow-[0_6px_16px_rgba(37,99,235,0.4)]'
          : 'text-[#b9c6dc] hover:bg-white/[0.07] hover:text-white'
      }`}
    >
      <span className="flex-none">{def.icon}</span>
      {def.label}
    </div>
  );
}
