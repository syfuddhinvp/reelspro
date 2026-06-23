import { useEffect, useRef, useState } from 'react';
import type { Asset, MediaProps, TextProps, VideoProps } from '../types.ts';
import { useEditor } from '../store.ts';
import { useTransform } from '../useTransform.ts';
import { ANIM_DUR, framesFor } from '../animations.ts';

interface Props {
  asset: Asset;
  selected: boolean;
  /** global (all-slides) assets stay visible the whole video */
  global?: boolean;
}

export default function AssetView({ asset, selected, global = false }: Props) {
  const onPointerDown = useTransform(asset);

  const preview = useEditor((s) => s.preview);
  const playSeq = useEditor((s) => s.playSeq);
  const playing = useEditor((s) => s.playing);

  const wrapRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement>(null);
  // hidden during playback while outside the asset's [start, end] window
  const [hidden, setHidden] = useState(false);

  const trimStart = asset.type === 'video' ? (asset.props as VideoProps).trimStart : 0;
  const playClip = () => {
    const v = mediaRef.current;
    if (!v) return;
    v.currentTime = trimStart;
    void v.play().catch(() => {});
  };
  const stopClip = (reset: boolean) => {
    const v = mediaRef.current;
    if (!v) return;
    v.pause();
    if (reset) v.currentTime = trimStart + 0.1;
  };

  /** Play an effect on the wrapper element via the Web Animations API. */
  const run = (frames: Keyframe[] | null): Animation | null => {
    const el = wrapRef.current;
    if (!el || !frames) return null;
    el.getAnimations().forEach((a) => a.cancel());
    return el.animate(frames, { duration: ANIM_DUR * 1000, easing: 'ease', fill: 'none' });
  };

  // instant preview when an effect is picked for this asset (edit mode)
  useEffect(() => {
    if (!preview || preview.id !== asset.id) return;
    run(framesFor(preview.kind === 'in' ? asset.animIn : asset.animOut, preview.kind));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview?.seq]);

  // when not playing, the asset is always shown (so it can be edited)
  useEffect(() => {
    if (!playing) {
      setHidden(false);
      stopClip(true); // pause video clips and return to their poster frame
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // timeline Play: show at `start` (with entrance), exit near `end`, hide after `end`
  useEffect(() => {
    if (!playing || playSeq === 0 || global) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const inFrames = framesFor(asset.animIn, 'in');
    const outFrames = framesFor(asset.animOut, 'out');
    const startMs = asset.start * 1000;
    const endMs = asset.end * 1000;

    // visibility at the moment this scene appears
    setHidden(asset.start > 0.01);

    if (asset.start <= 0.01) {
      if (inFrames) run(inFrames);
      playClip();
    } else {
      timers.push(
        setTimeout(() => {
          setHidden(false);
          if (inFrames) run(inFrames);
          playClip();
        }, startMs),
      );
    }

    if (outFrames) {
      timers.push(
        setTimeout(
          () => {
            const a = run(outFrames);
            if (a) a.onfinish = () => setHidden(true);
            else setHidden(true);
          },
          Math.max(startMs, endMs - ANIM_DUR * 1000),
        ),
      );
    } else {
      // no exit effect: simply disappear at the end
      timers.push(setTimeout(() => setHidden(true), endMs));
    }
    // pause the clip when the asset's window ends
    timers.push(setTimeout(() => stopClip(false), endMs));

    return () => {
      timers.forEach(clearTimeout);
      stopClip(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playSeq, playing, global]);

  const style: React.CSSProperties = {
    left: asset.x,
    top: asset.y,
    width: asset.w,
    height: asset.h,
    transform: `rotate(${asset.rot}deg)`,
    opacity: hidden ? 0 : asset.opacity,
    visibility: hidden ? 'hidden' : 'visible',
  };

  return (
    <div
      className={`absolute cursor-move${selected ? ' outline-[1.5px] outline-rp-sky' : ''}`}
      style={style}
      onPointerDown={onPointerDown}
    >
      {/* animation wrapper — effects run on this element (content never remounts) */}
      <div ref={wrapRef} className="h-full w-full">
        <Inner asset={asset} selected={selected} mediaRef={mediaRef} />
      </div>

      {/* rotate + resize handles, shown only when selected */}
      <div
        data-role="rot"
        className={`rp-rot-handle absolute left-1/2 -top-7 h-[13px] w-[13px] -translate-x-1/2 cursor-grab rounded-full border-2 border-rp-blue bg-rp-blue${selected && asset.editable ? '' : ' hidden'}`}
      />
      <div
        data-role="resize"
        className={`absolute -right-[7px] -bottom-[7px] h-[13px] w-[13px] cursor-nwse-resize rounded-[3px] border-2 border-rp-blue bg-white${selected && asset.editable ? '' : ' hidden'}`}
      />

      {/* locked indicator (asset can't be moved/resized) */}
      {!asset.editable && (
        <div className="absolute -top-[9px] -right-[9px] grid h-[18px] w-[18px] place-items-center rounded-full bg-rp-ink text-[10px] text-white shadow">
          🔒
        </div>
      )}
    </div>
  );
}

function Inner({
  asset,
  selected,
  mediaRef,
}: {
  asset: Asset;
  selected: boolean;
  mediaRef: React.RefObject<HTMLVideoElement | null>;
}) {
  if (asset.type === 'text') return <TextAsset asset={asset} selected={selected} />;

  if (asset.type === 'video') {
    const p = asset.props as VideoProps;
    return (
      <video
        src={p.src}
        muted={p.muted}
        playsInline
        preload="metadata"
        className="pointer-events-none block h-full w-full rounded-md object-cover"
        ref={(el) => {
          mediaRef.current = el;
          if (el) el.currentTime = p.trimStart + 0.1;
        }}
      />
    );
  }

  // image / logo
  const p = asset.props as MediaProps;
  return (
    <img src={p.src} alt="" className="pointer-events-none block h-full w-full object-contain" />
  );
}

/**
 * Editable text drawn on the canvas. Kept uncontrolled so typing doesn't reset
 * the caret — we only push text back into the DOM when it changed externally
 * (e.g. via the properties panel) and the field isn't focused.
 */
function TextAsset({ asset, selected }: { asset: Asset; selected: boolean }) {
  const p = asset.props as TextProps;
  const ref = useRef<HTMLDivElement>(null);
  const updateAssetProps = useEditor((s) => s.updateAssetProps);

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== p.text) {
      el.textContent = p.text;
    }
  }, [p.text]);

  // NOTE: render the editable element with NO React children. If we put
  // {p.text} here, React rewrites the text node on every keystroke and resets
  // the caret to the start (typing "makehub" would come out "buhekam"). Content
  // is set imperatively by the effect above instead.
  return (
    <div
      ref={ref}
      className="rp-text-asset w-full text-center font-extrabold leading-[1.15] [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]"
      style={{ fontSize: p.size, color: p.color, fontFamily: p.font }}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onPointerDown={(e) => {
        // typing should not start a drag once the asset is already selected
        if (selected) e.stopPropagation();
      }}
      onInput={(e) => updateAssetProps(asset.id, { text: e.currentTarget.textContent ?? '' })}
    />
  );
}
