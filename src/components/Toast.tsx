import { useEffect, useState } from 'react';
import { useApp } from '../appStore.ts';
import { CheckCircleIcon, WarningIcon } from './icons.tsx';

const KIND_STYLE = {
  success: { bg: 'bg-rp-ink', icon: <CheckCircleIcon size={16} className="text-rp-green" /> },
  warning: { bg: 'bg-rp-ink', icon: <WarningIcon size={16} className="text-rp-gold" /> },
  info: { bg: 'bg-rp-ink', icon: <CheckCircleIcon size={16} className="text-rp-sky" /> },
} as const;

export default function Toast() {
  const msg = useApp((s) => s.toastMsg);
  const kind = useApp((s) => s.toastKind);
  const seq = useApp((s) => s.toastSeq);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (seq === 0) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(t);
  }, [seq]);

  const style = KIND_STYLE[kind];

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-[10px] rounded-xl ${style.bg} py-[13px] pl-[16px] pr-[20px] text-sm font-semibold text-white shadow-[var(--shadow-xl)] ring-1 ring-white/10 transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <span className="flex-none">{style.icon}</span>
      {msg}
    </div>
  );
}
