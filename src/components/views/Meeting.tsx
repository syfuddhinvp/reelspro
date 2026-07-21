import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../appStore.ts';
import { InviteIcon, MicIcon, PhoneIcon, ScreenIcon, VideoIcon } from '../icons.tsx';

export default function Meeting() {
  const go = useApp((s) => s.go);
  const toast = useApp((s) => s.toast);

  const [secs, setSecs] = useState(0);
  const [micOff, setMicOff] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [invite, setInvite] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  const toggleMic = () => {
    setMicOff((v) => {
      toast(!v ? '🔇 Mic off' : '🎙️ Mic on');
      return !v;
    });
  };
  const toggleCam = () => {
    setCamOff((v) => {
      toast(!v ? '📷 Camera off' : '📹 Camera on');
      return !v;
    });
  };
  const copyInvite = () => {
    linkRef.current?.select();
    try {
      document.execCommand('copy');
    } catch {
      /* ignore */
    }
    toast('Invite link copied', 'success');
  };

  return (
    <div className="relative flex h-full flex-col gap-[14px] bg-[#0b1220] p-[18px]">
      <div className="flex items-center justify-between text-white">
        <div>
          <b className="text-base">Listing review — 123 Maple Ave</b>
          <div className="text-[13px] text-[#8da3c4]">
            2 participants · {mm}:{ss}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[rgba(239,68,68,0.15)] px-3 py-[6px] text-[13px] font-semibold text-[#fca5a5]">
          <span className="rp-pulse h-[9px] w-[9px] rounded-full bg-rp-red" /> Recording
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-[14px]">
        <Tile bg="linear-gradient(135deg,#1e3a8a,#312e81)">
          <Avatar bg="linear-gradient(135deg,#60a5fa,#2563eb)">JA</Avatar>
          <Name>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5}>
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
            </svg>
            Jordan Avery (Client)
          </Name>
        </Tile>

        <div className="flex flex-col gap-[14px]">
          <Tile bg="linear-gradient(135deg,#0f172a,#334155)" className="flex-1">
            <Avatar bg="linear-gradient(135deg,#93c5fd,#2563eb)">SB</Avatar>
            <Name>Sam (You)</Name>
            {micOff && (
              <div className="absolute right-3 top-3 grid h-[30px] w-[30px] place-items-center rounded-lg bg-black/50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth={2}>
                  <path d="M1 1l22 22" />
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                </svg>
              </div>
            )}
          </Tile>
          <Tile
            bg="linear-gradient(135deg,#312e81,#7c3aed)"
            className="flex-1 cursor-pointer"
            onClick={() => toast('Sharing your Just Listed video…', 'info')}
          >
            <div className="text-center text-white">
              <div className="text-[26px]">📺</div>
              <b className="mt-[6px] block text-[13px]">Share your video</b>
            </div>
          </Tile>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Ctrl off={micOff} onClick={toggleMic} title="Mic">
          <MicIcon />
        </Ctrl>
        <Ctrl off={camOff} onClick={toggleCam} title="Camera">
          <VideoIcon size={20} />
        </Ctrl>
        <Ctrl onClick={() => toast('Screen share started', 'info')} title="Share screen">
          <ScreenIcon />
        </Ctrl>
        <Ctrl onClick={() => setInvite((v) => !v)} title="Invite">
          <InviteIcon />
        </Ctrl>
        <Ctrl onClick={() => go('consent')} title="Get consent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </Ctrl>
        <button
          onClick={() => {
            go('dashboard');
            toast('Call ended', 'info');
          }}
          title="Leave"
          className="grid h-[52px] w-16 place-items-center rounded-[30px] bg-rp-red text-white transition-colors hover:bg-[#dc2626]"
        >
          <PhoneIcon />
        </button>
      </div>

      {invite && (
        <div className="absolute bottom-[90px] right-[18px] w-[280px] rounded-[14px] bg-white p-[18px] shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
          <b className="text-[14.5px]">Invite to meeting</b>
          <p className="mt-1 text-[13px] text-rp-mute">Share this link with your client.</p>
          <div className="mt-[10px] flex gap-2">
            <input
              ref={linkRef}
              readOnly
              defaultValue="reelspro.app/r/maple-ave-7Kx"
              className="flex-1 rounded-[9px] border border-rp-line bg-rp-bg p-[9px] text-[13px]"
            />
            <button
              onClick={copyInvite}
              className="rounded-[11px] bg-rp-blue px-[13px] py-[7px] text-[13px] font-semibold text-white hover:bg-rp-blue-dk"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({
  bg,
  className = '',
  onClick,
  children,
}: {
  bg: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{ background: bg }}
      className={`relative grid place-items-center overflow-hidden rounded-2xl text-white ${className}`}
    >
      {children}
    </div>
  );
}

function Avatar({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <div
      style={{ background: bg }}
      className="grid h-[90px] w-[90px] place-items-center rounded-full text-[32px] font-extrabold text-white"
    >
      {children}
    </div>
  );
}

function Name({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-[7px] rounded-lg bg-black/55 px-[11px] py-[5px] text-[13px] font-semibold">
      {children}
    </div>
  );
}

function Ctrl({
  off,
  onClick,
  title,
  children,
}: {
  off?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`grid h-[52px] w-[52px] place-items-center rounded-full text-white transition-colors ${
        off ? 'bg-rp-red' : 'bg-[#1e293b] hover:bg-[#334155]'
      }`}
    >
      {children}
    </button>
  );
}
