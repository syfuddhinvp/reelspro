import type { PublishConfig } from '../types.ts';

interface Props {
  config: PublishConfig;
  onReplay?: () => void;
  /** smaller scale for the in-page preview */
  compact?: boolean;
}

function ctaHref(c: PublishConfig): string {
  if (c.ctaAction === 'email') return `mailto:${c.agentEmail}`;
  if (c.ctaAction === 'phone') return `tel:${c.agentPhone}`;
  return c.ctaUrl || '#';
}

export default function LandingPage({ config: c, onReplay, compact }: Props) {
  const initials = c.agentName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="mx-auto w-full max-w-[420px] px-5">
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        {/* brand band */}
        <div className="flex items-center justify-center py-5" style={{ background: c.brandColor }}>
          {c.showEndLogo && c.overlayLogo ? (
            <img src={c.overlayLogo} alt="" className="h-9" />
          ) : (
            <span className="text-lg font-extrabold text-white">{c.agentName}</span>
          )}
        </div>

        <div className="px-6 pt-6 pb-5 text-center">
          {/* headshot */}
          <div className="mx-auto -mt-12 mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-rp-bg shadow-lg">
            {c.agentHeadshot ? (
              <img src={c.agentHeadshot} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-rp-blue text-xl font-extrabold text-white">
                {initials}
              </div>
            )}
          </div>

          <h2 className="text-lg font-extrabold">{c.agentName}</h2>
          <p className="mb-4 text-[13px] text-rp-mute">{c.agentTitle}</p>

          {/* CTA */}
          <a
            href={ctaHref(c)}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-xl py-[14px] text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-[1px]"
            style={{ background: c.ctaColor }}
          >
            {c.ctaLabel || 'Get in touch'}
          </a>

          {/* property address */}
          {c.showPropertyAddress && c.propertyAddress && (
            <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-rp-slate">
              <span>📍</span>
              {c.propertyAddress}
            </div>
          )}

          {/* agent contact */}
          {c.showAgentContact && (
            <div className="mt-3 flex flex-col items-center gap-1 text-[13px] text-rp-slate">
              {c.agentPhone && (
                <a href={`tel:${c.agentPhone}`} className="hover:text-rp-blue">
                  📞 {c.agentPhone}
                </a>
              )}
              {c.agentEmail && (
                <a href={`mailto:${c.agentEmail}`} className="hover:text-rp-blue">
                  ✉️ {c.agentEmail}
                </a>
              )}
            </div>
          )}

          {/* socials */}
          {c.showSocials && (c.instagram || c.facebook || c.linkedin) && (
            <div className="mt-4 flex justify-center gap-3 text-[13px] font-semibold text-rp-blue">
              {c.instagram && <a href={c.instagram} target="_blank" rel="noreferrer">Instagram</a>}
              {c.facebook && <a href={c.facebook} target="_blank" rel="noreferrer">Facebook</a>}
              {c.linkedin && <a href={c.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            </div>
          )}

          {onReplay && (
            <button
              onClick={onReplay}
              className="mt-5 rounded-full border border-rp-line px-4 py-2 text-[13px] font-semibold text-rp-slate hover:border-rp-blue hover:text-rp-blue"
            >
              ↻ Replay video
            </button>
          )}
        </div>

        {/* mortgage disclosure footer */}
        {c.showDisclosure && c.disclosureText && (
          <div className="border-t border-rp-line bg-rp-bg px-6 py-3 text-center text-[11px] leading-relaxed text-rp-mute">
            {c.disclosureText}
          </div>
        )}
      </div>
      {compact && <p className="mt-3 text-center text-[11px] text-rp-mute">Preview · shown after the video</p>}
    </div>
  );
}
