import { useRef, useState } from 'react';
import type { CtaAction, PublishConfig } from '../../types.ts';
import { CTA_COLORS, SWATCHES } from '../../types.ts';
import { useEditor } from '../../store.ts';
import { useApp } from '../../appStore.ts';
import LandingPage from '../LandingPage.tsx';

type Tab = 'agent' | 'style' | 'overlays' | 'cta';

export default function Publish() {
  const c = useEditor((s) => s.publish);
  const update = useEditor((s) => s.updatePublish);
  const openPlayer = useApp((s) => s.openPlayer);
  const [tab, setTab] = useState<Tab>('cta');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'agent', label: 'Agent', icon: '👤' },
    { id: 'style', label: 'Style', icon: '🎨' },
    { id: 'overlays', label: 'Overlays', icon: '▣' },
    { id: 'cta', label: 'CTA', icon: '🔗' },
  ];

  return (
    <div className="flex flex-wrap gap-7">
      {/* config panel */}
      <div className="w-full max-w-[360px] flex-none rounded-2xl border border-rp-line bg-white shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
        <div className="flex border-b border-rp-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-[6px] border-b-2 py-3 text-[13px] font-semibold transition-colors ${
                tab === t.id ? 'border-rp-blue text-rp-blue' : 'border-transparent text-rp-slate hover:text-rp-blue'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'agent' && <AgentTab c={c} update={update} />}
          {tab === 'style' && <StyleTab c={c} update={update} />}
          {tab === 'overlays' && <OverlaysTab c={c} update={update} />}
          {tab === 'cta' && <CtaTab c={c} update={update} />}
        </div>
      </div>

      {/* live preview */}
      <div className="flex-1">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={openPlayer}
            className="rounded-xl bg-rp-blue px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.32)] hover:bg-rp-blue-dk"
          >
            ▶ Preview fullscreen
          </button>
          <span className="text-[13px] text-rp-mute">Plays your video, then shows this page.</span>
        </div>
        <div className="rounded-2xl bg-rp-bg py-8">
          <LandingPage config={c} compact />
        </div>
      </div>
    </div>
  );
}

interface TabProps {
  c: PublishConfig;
  update: (patch: Partial<PublishConfig>) => void;
}

/* ---------- CTA ---------- */
function CtaTab({ c, update }: TabProps) {
  return (
    <>
      <Heading>Call-to-action button</Heading>
      <Field label="Button Label">
        <input value={c.ctaLabel} onChange={(e) => update({ ctaLabel: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Button Action">
        <select
          value={c.ctaAction}
          onChange={(e) => update({ ctaAction: e.target.value as CtaAction })}
          className={inputCls}
        >
          <option value="url">Custom URL</option>
          <option value="email">Email me</option>
          <option value="phone">Call me</option>
        </select>
      </Field>
      {c.ctaAction === 'url' && (
        <Field label="Destination URL">
          <input value={c.ctaUrl} onChange={(e) => update({ ctaUrl: e.target.value })} className={inputCls} />
        </Field>
      )}

      <div
        className="mb-4 grid place-items-center rounded-xl py-3 text-[14px] font-bold text-white"
        style={{ background: c.ctaColor }}
      >
        📅 {c.ctaLabel || 'Your button'}
      </div>

      <SubLabel>CTA button style</SubLabel>
      <div className="mb-5 flex gap-[10px]">
        {CTA_COLORS.map((col) => (
          <button
            key={col}
            onClick={() => update({ ctaColor: col })}
            style={{ background: col }}
            className={`h-9 w-9 rounded-lg border-2 ${c.ctaColor === col ? 'border-rp-ink' : 'border-rp-line'}`}
          />
        ))}
      </div>

      <SubLabel>Landing page sections</SubLabel>
      <ToggleRow
        title="Agent Contact Info"
        sub="Phone, email, headshot below video"
        on={c.showAgentContact}
        onChange={(v) => update({ showAgentContact: v })}
      />
      <ToggleRow
        title="Property Address"
        sub="Show listing address if applicable"
        on={c.showPropertyAddress}
        onChange={(v) => update({ showPropertyAddress: v })}
      />
      {c.showPropertyAddress && (
        <input
          value={c.propertyAddress}
          onChange={(e) => update({ propertyAddress: e.target.value })}
          placeholder="123 Maple Avenue…"
          className={`${inputCls} mb-2`}
        />
      )}
      <ToggleRow
        title="Social Links"
        sub="Instagram, Facebook, LinkedIn icons"
        on={c.showSocials}
        onChange={(v) => update({ showSocials: v })}
      />
      {c.showSocials && (
        <div className="mb-2 grid gap-2">
          <input value={c.instagram} onChange={(e) => update({ instagram: e.target.value })} placeholder="Instagram URL" className={inputCls} />
          <input value={c.facebook} onChange={(e) => update({ facebook: e.target.value })} placeholder="Facebook URL" className={inputCls} />
          <input value={c.linkedin} onChange={(e) => update({ linkedin: e.target.value })} placeholder="LinkedIn URL" className={inputCls} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <SubLabel>Mortgage disclosure</SubLabel>
        <span className="rounded-full bg-[#fef3c7] px-2 py-[2px] text-[10px] font-bold text-[#b45309]">REQUIRED FOR LOS</span>
      </div>
      <div className="mb-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 text-[12px] leading-relaxed text-[#b45309]">
        ⚠️ <b>Disclosure footer required</b> for mortgage advertising. This will auto-appear on your branded page.
      </div>
      <ToggleRow
        title="Show Disclosure Footer"
        sub="NMLS, Equal Housing, license number"
        on={c.showDisclosure}
        onChange={(v) => update({ showDisclosure: v })}
      />
      <Field label="Custom Disclosure Text (optional)">
        <textarea
          value={c.disclosureText}
          onChange={(e) => update({ disclosureText: e.target.value })}
          className={`${inputCls} min-h-[60px] resize-y`}
        />
      </Field>
    </>
  );
}

/* ---------- Agent ---------- */
function AgentTab({ c, update }: TabProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <Heading>Agent details</Heading>
      <Field label="Full name">
        <input value={c.agentName} onChange={(e) => update({ agentName: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Title / company">
        <input value={c.agentTitle} onChange={(e) => update({ agentTitle: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Phone">
        <input value={c.agentPhone} onChange={(e) => update({ agentPhone: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Email">
        <input value={c.agentEmail} onChange={(e) => update({ agentEmail: e.target.value })} className={inputCls} />
      </Field>
      <SubLabel>Headshot</SubLabel>
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-full border border-rp-line bg-rp-bg">
          {c.agentHeadshot && <img src={c.agentHeadshot} alt="" className="h-full w-full object-cover" />}
        </div>
        <button onClick={() => ref.current?.click()} className="rounded-lg border border-rp-line px-3 py-2 text-[13px] font-semibold hover:border-rp-blue hover:text-rp-blue">
          Upload headshot
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) update({ agentHeadshot: URL.createObjectURL(f) });
            e.target.value = '';
          }}
        />
      </div>
    </>
  );
}

/* ---------- Style ---------- */
function StyleTab({ c, update }: TabProps) {
  return (
    <>
      <Heading>Brand style</Heading>
      <SubLabel>Brand color (page header)</SubLabel>
      <div className="mb-4 flex items-center gap-2">
        <input type="color" value={c.brandColor} onChange={(e) => update({ brandColor: e.target.value })} className="h-9 w-10 cursor-pointer rounded-[8px] border border-rp-line bg-white p-[2px]" />
        <input value={c.brandColor} onChange={(e) => update({ brandColor: e.target.value })} className={`${inputCls} flex-1 uppercase`} />
      </div>
      <SubLabel>Quick brand swatches</SubLabel>
      <div className="flex gap-2">
        {[...CTA_COLORS, ...SWATCHES].slice(0, 8).map((col) => (
          <button key={col} onClick={() => update({ brandColor: col })} style={{ background: col }} className="h-8 w-8 rounded-lg border-2 border-rp-line" />
        ))}
      </div>
    </>
  );
}

/* ---------- Overlays ---------- */
function OverlaysTab({ c, update }: TabProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <Heading>Overlays & end card</Heading>
      <ToggleRow
        title="Show logo on landing page"
        sub="Appears in the page header after the video"
        on={c.showEndLogo}
        onChange={(v) => update({ showEndLogo: v })}
      />
      <SubLabel>Landing logo</SubLabel>
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-24 place-items-center overflow-hidden rounded-lg border border-rp-line bg-rp-navy">
          {c.overlayLogo && <img src={c.overlayLogo} alt="" className="h-8" />}
        </div>
        <button onClick={() => ref.current?.click()} className="rounded-lg border border-rp-line px-3 py-2 text-[13px] font-semibold hover:border-rp-blue hover:text-rp-blue">
          Upload logo
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) update({ overlayLogo: URL.createObjectURL(f) });
            e.target.value = '';
          }}
        />
      </div>
    </>
  );
}

/* ---------- helpers ---------- */
const inputCls = 'w-full rounded-[9px] border border-rp-line bg-rp-bg px-[10px] py-2 text-[13px]';

function Heading({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.6px] text-rp-mute">{children}</div>;
}
function SubLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-[6px] text-[12px] font-bold text-rp-slate">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[13px]">
      <label className="mb-[5px] block text-xs font-bold text-rp-slate">{label}</label>
      {children}
    </div>
  );
}
function ToggleRow({
  title,
  sub,
  on,
  onChange,
}: {
  title: string;
  sub: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-xl bg-rp-bg px-3 py-[10px]">
      <div className="min-w-0">
        <b className="block text-[13px]">{title}</b>
        <span className="text-[11px] text-rp-mute">{sub}</span>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`relative h-[22px] w-[40px] flex-none rounded-full transition-colors ${on ? 'bg-rp-blue' : 'bg-[#cbd5e1]'}`}
      >
        <span className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white transition-all ${on ? 'left-[20px]' : 'left-[2px]'}`} />
      </button>
    </div>
  );
}
