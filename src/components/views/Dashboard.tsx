import { useApp } from '../../appStore.ts';
import { GRADS, RECENT, STATUS_CHIP } from '../../data.ts';
import {
  StatCheckIcon,
  StatMeetIcon,
  StatPlayIcon,
  StatVideoIcon,
} from '../icons.tsx';

const STATS = [
  { ic: <StatVideoIcon />, bg: 'linear-gradient(135deg,#2563eb,#60a5fa)', val: '38', lbl: 'Videos created', delta: '▲ 12 this month' },
  { ic: <StatPlayIcon />, bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', val: '142K', lbl: 'Total views', delta: '▲ 31% vs last mo.' },
  { ic: <StatCheckIcon />, bg: 'linear-gradient(135deg,#16a34a,#4ade80)', val: '27', lbl: 'Consents signed', delta: '▲ 9 pending sent' },
  { ic: <StatMeetIcon />, bg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', val: '14', lbl: 'Client meetings', delta: '▲ 3 this week' },
];

export default function Dashboard() {
  const go = useApp((s) => s.go);

  return (
    <div>
      <div className="mb-[26px] grid grid-cols-2 gap-[18px] xl:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.lbl}
            className="rounded-2xl border border-rp-line bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.07)]"
          >
            <div
              className="mb-[14px] grid h-[42px] w-[42px] place-items-center rounded-[11px] text-white"
              style={{ background: s.bg }}
            >
              {s.ic}
            </div>
            <div className="text-[30px] font-extrabold tracking-[-1px]">{s.val}</div>
            <div className="text-[13.5px] font-medium text-rp-mute">{s.lbl}</div>
            <div className="mt-[6px] text-[12.5px] font-bold text-rp-green">{s.delta}</div>
          </div>
        ))}
      </div>

      <Panel title="Recent projects" action={<GhostBtn onClick={() => go('templates')}>View all</GhostBtn>}>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
          {RECENT.map((v) => (
            <VideoCard key={v.t} project={v} onClick={() => go('editor')} />
          ))}
        </div>
      </Panel>

      <Panel title="Quick start">
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
          <QuickCard emoji="🏠" tag="Promote a listing" title="Just Listed video" meta="2 min · easy" chip="Template" chipCls="bg-[#dbeafe] text-[#1d4ed8]" bg={GRADS.blue} onClick={() => go('templates')} />
          <QuickCard emoji="📉" tag="Announce a rate drop" title="Rate Drop Alert" meta="2 min · easy" chip="Template" chipCls="bg-[#dbeafe] text-[#1d4ed8]" bg="linear-gradient(135deg,#15803d,#22c55e)" onClick={() => go('templates')} />
          <QuickCard emoji="✍️" tag="Collect a consent" title="Send consent form" meta="30 sec" chip="Client tool" chipCls="bg-[#dcfce7] text-[#15803d]" bg={GRADS.purple} onClick={() => go('consent')} />
        </div>
      </Panel>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[22px] rounded-2xl border border-rp-line bg-white shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between border-b border-rp-line px-[22px] py-[18px]">
        <h3 className="text-[16.5px] font-bold">{title}</h3>
        {action}
      </div>
      <div className="p-[22px]">{children}</div>
    </div>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[11px] border border-rp-line bg-white px-[13px] py-[7px] text-[13px] font-semibold hover:border-rp-blue hover:text-rp-blue"
    >
      {children}
    </button>
  );
}

function VideoCard({
  project,
  onClick,
}: {
  project: (typeof RECENT)[number];
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-[14px] border border-rp-line bg-white transition-all hover:-translate-y-[3px] hover:border-[#c7d7fb] hover:shadow-[0_20px_50px_rgba(15,23,42,0.16)]"
    >
      <div className="relative grid aspect-[16/10] place-items-center text-white" style={{ background: GRADS[project.g] }}>
        <span className="absolute left-[10px] top-[10px] rounded-[7px] bg-black/45 px-[9px] py-1 text-[11px] font-bold backdrop-blur-[4px]">
          {project.cat}
        </span>
        <div className="grid h-[46px] w-[46px] place-items-center rounded-full bg-white/90 shadow-[0_6px_18px_rgba(0,0,0,0.3)]">
          <div className="ml-1 h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-rp-blue" />
        </div>
        <span className="absolute bottom-[10px] right-[10px] rounded-md bg-black/60 px-[7px] py-[3px] text-[11px] font-semibold">
          {project.dur}
        </span>
      </div>
      <div className="px-[15px] py-[13px]">
        <b className="mb-[3px] block text-[14.5px]">{project.t}</b>
        <div className="flex items-center justify-between text-[12.5px] text-rp-mute">
          <span>{project.views}</span>
          <span className={`rounded-full px-[9px] py-[3px] text-[11px] font-bold ${STATUS_CHIP[project.st]}`}>
            {project.stt}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuickCard({
  emoji,
  tag,
  title,
  meta,
  chip,
  chipCls,
  bg,
  onClick,
}: {
  emoji: string;
  tag: string;
  title: string;
  meta: string;
  chip: string;
  chipCls: string;
  bg: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-[14px] border border-rp-line bg-white transition-all hover:-translate-y-[3px] hover:border-[#c7d7fb] hover:shadow-[0_20px_50px_rgba(15,23,42,0.16)]"
    >
      <div className="grid aspect-[16/10] place-items-center text-center text-white" style={{ background: bg }}>
        <div>
          <div className="text-[30px]">{emoji}</div>
          <b className="mt-2 block">{tag}</b>
        </div>
      </div>
      <div className="px-[15px] py-[13px]">
        <b className="mb-[3px] block text-[14.5px]">{title}</b>
        <div className="flex items-center justify-between text-[12.5px] text-rp-mute">
          <span>{meta}</span>
          <span className={`rounded-full px-[9px] py-[3px] text-[11px] font-bold ${chipCls}`}>{chip}</span>
        </div>
      </div>
    </div>
  );
}
