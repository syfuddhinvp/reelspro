import { useRef, useState } from 'react';
import { useApp } from '../../appStore.ts';

export default function Consent() {
  const toast = useApp((s) => s.toast);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [checks, setChecks] = useState([false, false, false]);
  const [submitted, setSubmitted] = useState(false);
  const [stamp, setStamp] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [showHint, setShowHint] = useState(true);

  const ctx = () => {
    const cv = canvasRef.current!;
    if (cv.width !== cv.clientWidth) {
      cv.width = cv.clientWidth;
      cv.height = cv.clientHeight;
    }
    const c = cv.getContext('2d')!;
    c.strokeStyle = '#0f172a';
    c.lineWidth = 2.4;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    return c;
  };

  const pos = (e: React.PointerEvent) => {
    const b = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    hasInk.current = true;
    setShowHint(false);
    const c = ctx();
    const p = pos(e);
    c.beginPath();
    c.moveTo(p.x, p.y);
    canvasRef.current!.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const c = ctx();
    const p = pos(e);
    c.lineTo(p.x, p.y);
    c.stroke();
  };
  const end = () => {
    drawing.current = false;
  };

  const clearSig = () => {
    const cv = canvasRef.current;
    if (cv) cv.getContext('2d')!.clearRect(0, 0, cv.width, cv.height);
    hasInk.current = false;
    setShowHint(true);
  };

  const submit = () => {
    if (!name.trim()) return toast('Please enter the client name', 'warning');
    if (!checks.every(Boolean)) return toast('Please check all three boxes', 'warning');
    if (!hasInk.current) return toast('Please add a signature', 'warning');
    setStamp(
      `Signed ${new Date().toLocaleString()} · Ref #RP-${Math.floor(Math.random() * 900000 + 100000)}`,
    );
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setChecks([false, false, false]);
    clearSig();
  };

  return (
    <div className="mx-auto max-w-[680px]">
      <div className="overflow-hidden rounded-2xl border border-rp-line bg-white shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
        <div className="bg-[linear-gradient(120deg,#2563eb,#4f46e5)] px-[30px] py-7 text-white">
          <h2 className="mb-[6px] text-[22px] font-bold">📋 Client marketing consent</h2>
          <p className="text-[14.5px] opacity-90">
            For: <b>123 Maple Avenue</b> · Requested by Sam Brooks
          </p>
        </div>

        {submitted ? (
          <div className="px-[30px] py-[50px] text-center">
            <div className="mx-auto mb-5 grid h-[84px] w-[84px] place-items-center rounded-full bg-[#dcfce7]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={3}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="mb-2 text-[22px] font-bold">Consent recorded ✓</h2>
            <p className="mx-auto mb-2 max-w-[380px] text-rp-slate">
              {name} signed and timestamped. A copy was emailed and stored in your audit trail.
            </p>
            <p className="text-[13px] text-rp-mute">{stamp}</p>
            <button
              onClick={reset}
              className="mt-[22px] rounded-[11px] bg-rp-blue px-[18px] py-[10px] text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:bg-rp-blue-dk"
            >
              Capture another
            </button>
          </div>
        ) : (
          <div className="p-[30px]">
            <Field label="Client full name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Avery" className={inputCls} />
            </Field>
            <Field label="Client email">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@email.com" className={inputCls} />
            </Field>

            <div className="mb-5 max-h-[180px] overflow-y-auto rounded-xl border border-rp-line bg-rp-bg p-[18px] text-sm leading-[1.6] text-rp-slate">
              <b>Consent to use likeness & property in marketing</b>
              <br />
              <br />
              I authorize Sam Brooks and ReelsPro Realty to use photos, video, and/or my testimonial
              of the above property in marketing materials, including social media (Instagram,
              TikTok, YouTube, Facebook), email, and websites. I understand I can withdraw consent in
              writing at any time, after which no <i>new</i> materials will use this content.
            </div>

            {[
              'I have read and agree to the consent terms above.',
              'I confirm I own or have the right to share the property photos/video provided.',
              'I consent to being contacted about this content.',
            ].map((label, i) => (
              <label key={i} className="mb-[14px] flex cursor-pointer items-start gap-[11px]">
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={(e) =>
                    setChecks((c) => c.map((v, idx) => (idx === i ? e.target.checked : v)))
                  }
                  className="mt-[3px] h-[18px] w-[18px] flex-none accent-rp-blue"
                />
                <span className="text-[14.5px] text-rp-ink">{label}</span>
              </label>
            ))}

            <div className="mt-[18px]">
              <label className="mb-[6px] block text-[12.5px] font-bold text-rp-slate">
                Signature (draw below)
              </label>
              <div className="relative h-[140px] cursor-crosshair rounded-xl border-[1.5px] border-dashed border-[#c7d2e0] bg-rp-bg [touch-action:none]">
                <canvas
                  ref={canvasRef}
                  className="h-full w-full rounded-xl"
                  onPointerDown={start}
                  onPointerMove={move}
                  onPointerUp={end}
                />
                {showHint && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-[#94a3b8]">
                    ✍️ Sign here with your mouse or finger
                  </div>
                )}
              </div>
              <button
                onClick={clearSig}
                className="mt-2 rounded-[11px] border border-rp-line bg-white px-[13px] py-[7px] text-[13px] font-semibold hover:border-rp-blue hover:text-rp-blue"
              >
                Clear signature
              </button>
            </div>

            <div className="mt-[22px] flex gap-[10px]">
              <button
                onClick={submit}
                className="flex-1 justify-center rounded-[11px] bg-rp-blue px-[18px] py-[10px] text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:bg-rp-blue-dk"
              >
                ✓ Submit consent
              </button>
              <button
                onClick={() => toast('Share link copied — send to your client', 'success')}
                className="rounded-[11px] border border-rp-line bg-white px-[18px] py-[10px] text-sm font-semibold hover:border-rp-blue hover:text-rp-blue"
              >
                Copy share link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-[10px] border border-rp-line bg-rp-bg px-3 py-[10px] text-sm outline-none focus:border-rp-blue focus:bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-[6px] block text-[12.5px] font-bold text-rp-slate">{label}</label>
      {children}
    </div>
  );
}
