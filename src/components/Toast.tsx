import { useEffect, useState } from 'react';
import { useApp } from '../appStore.ts';

export default function Toast() {
  const msg = useApp((s) => s.toastMsg);
  const seq = useApp((s) => s.toastSeq);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (seq === 0) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(t);
  }, [seq]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-xl bg-rp-ink px-[22px] py-[13px] text-sm font-semibold text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)] transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      {msg}
    </div>
  );
}
