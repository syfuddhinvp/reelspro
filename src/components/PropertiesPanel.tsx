import { useEffect, useRef, useState } from 'react';
import type { Asset, AudioProps, FrameProps, MediaProps, TextProps, VideoProps } from '../types.ts';
import { FONTS, FRAME_CIRCLE_RADIUS, SWATCHES } from '../types.ts';
import { ASSET_TYPES } from '../assetTypes.ts';
import { useEditor } from '../store.ts';
import type { AlignHow } from '../store.ts';
import { canvasSize } from '../util.ts';
import { IN_ANIMS, OUT_ANIMS } from '../animations.ts';
import { SCENE_BG_PRESETS } from '../data.ts';
import CropModal from './CropModal.tsx';

type Tab = 'scene' | 'layout' | 'style' | 'animate';

export default function PropertiesPanel() {
  const scene = useEditor((s) => s.scenes[s.selScene]);
  const selAssetId = useEditor((s) => s.selAssetId);
  const asset = scene.assets.find((a) => a.id === selAssetId) ?? null;

  const [tab, setTab] = useState<Tab>('scene');

  // jump to Layout when an asset gets selected; back to Scene when cleared
  useEffect(() => {
    if (selAssetId == null) setTab('scene');
    else setTab((t) => (t === 'scene' ? 'layout' : t));
  }, [selAssetId]);

  const tabs: { id: Tab; label: string; needsAsset: boolean }[] = [
    { id: 'scene', label: 'Scene', needsAsset: false },
    { id: 'layout', label: 'Layout', needsAsset: true },
    { id: 'style', label: 'Style', needsAsset: true },
    { id: 'animate', label: 'Animate', needsAsset: true },
  ];

  return (
    <div className="col right flex flex-col overflow-hidden border-l border-rp-line bg-white">
      <div className="flex gap-1 border-b border-rp-line p-2">
        {tabs.map((t) => {
          const disabled = t.needsAsset && !asset;
          return (
            <button
              key={t.id}
              disabled={disabled}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg py-[7px] text-[12.5px] font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-rp-blue-soft text-rp-blue'
                  : 'text-rp-slate hover:text-rp-blue'
              } ${disabled ? 'cursor-not-allowed opacity-40 hover:text-rp-slate' : ''}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'scene' && <SceneTab />}
        {tab === 'layout' && (asset ? <LayoutTab asset={asset} sceneDur={scene.dur} /> : <Empty />)}
        {tab === 'style' && (asset ? <StyleTab asset={asset} /> : <Empty />)}
        {tab === 'animate' && (asset ? <AnimationFields asset={asset} /> : <Empty />)}
      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-xs text-rp-mute">Select an asset to edit it.</p>;
}

/* ---------- Scene tab ---------- */

function SceneTab() {
  const scene = useEditor((s) => s.scenes[s.selScene]);
  const updateScene = useEditor((s) => s.updateScene);
  const setSceneAudio = useEditor((s) => s.setSceneAudio);
  const applyBgToAll = useEditor((s) => s.applyBgToAll);
  const audioRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <SectionTitle>Scene</SectionTitle>
      <Field label="Scene name">
        <input value={scene.name} onChange={(e) => updateScene({ name: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Scene duration (s)">
        <input
          type="number"
          min={0.5}
          step={0.5}
          value={scene.dur}
          onChange={(e) => updateScene({ dur: Number(e.target.value) })}
          className={inputCls}
        />
      </Field>

      <SubLabel>Background color</SubLabel>
      <div className="mb-[13px] flex items-center gap-2">
        <input
          type="color"
          value={normalizeHex(scene.color)}
          onChange={(e) => updateScene({ color: e.target.value, bg: undefined })}
          className="h-9 w-10 cursor-pointer rounded-[8px] border border-rp-line bg-white p-[2px]"
        />
        <input
          value={scene.color}
          onChange={(e) => updateScene({ color: e.target.value, bg: undefined })}
          spellCheck={false}
          className={`${inputCls} flex-1 uppercase`}
        />
      </div>

      <SubLabel>Gradient presets</SubLabel>
      <div className="grid grid-cols-4 gap-2">
        {SCENE_BG_PRESETS.map((g) => (
          <button
            key={g}
            onClick={() => updateScene({ bg: g })}
            style={{ background: g }}
            className={`aspect-square rounded-lg border-2 ${
              scene.bg === g ? 'border-rp-ink' : 'border-rp-line'
            }`}
          />
        ))}
      </div>
      {scene.bg && (
        <button
          onClick={() => updateScene({ bg: undefined })}
          className="mt-2 w-full rounded-lg border border-rp-line bg-white py-[7px] text-[13px] font-semibold hover:border-rp-blue hover:text-rp-blue"
        >
          Use solid color
        </button>
      )}
      <button
        onClick={applyBgToAll}
        className="mt-2 w-full rounded-lg border border-rp-line bg-white py-[7px] text-[13px] font-semibold hover:border-rp-blue hover:text-rp-blue"
      >
        Apply background to all scenes
      </button>

      <SubLabel>Scene audio</SubLabel>
      {scene.audio ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-rp-line p-[9px]">
          <div className="grid h-7 w-7 flex-none place-items-center rounded-[7px] bg-rp-purple text-xs font-bold text-white">♪</div>
          <b className="min-w-0 truncate text-[13px]">{scene.audio.name}</b>
          <button onClick={() => setSceneAudio(null)} className="ml-auto cursor-pointer text-[13px] text-[#ef4444]">
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => audioRef.current?.click()}
          className="w-full rounded-lg border border-rp-line bg-white py-[7px] text-[13px] font-semibold hover:border-rp-blue hover:text-rp-blue"
        >
          ＋ Add scene audio
        </button>
      )}
      <input
        ref={audioRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setSceneAudio({ src: URL.createObjectURL(f), name: f.name });
          e.target.value = '';
        }}
      />
    </>
  );
}

/* ---------- Layout tab ---------- */

function LayoutTab({ asset, sceneDur }: { asset: Asset; sceneDur: number }) {
  const updateAsset = useEditor((s) => s.updateAsset);
  const align = useEditor((s) => s.align);
  const duplicateAsset = useEditor((s) => s.duplicateAsset);
  const layer = useEditor((s) => s.layer);
  const delAsset = useEditor((s) => s.delAsset);
  const ratio = useEditor((s) => s.ratio);
  const toggleGlobal = useEditor((s) => s.toggleGlobal);
  const isGlobal = useEditor((s) => s.globalAssets.some((a) => a.id === asset.id));

  const set = (patch: Partial<Asset>) => updateAsset(asset.id, patch);
  const doAlign = (how: AlignHow) => {
    const { width, height } = canvasSize(ratio);
    align(how, width, height);
  };

  const allSlidesToggle = (
    <label className="mb-3 flex items-center gap-2 text-[13px]">
      <input type="checkbox" checked={isGlobal} onChange={() => toggleGlobal(asset.id)} />
      Show on all slides
    </label>
  );

  // audio assets only need timing
  if (asset.type === 'audio') {
    return (
      <>
        <SectionTitle>Audio · timing</SectionTitle>
        <SubLabel>Plays within {sceneDur}s scene</SubLabel>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start s">
            <input type="number" min={0} max={sceneDur} step={0.5} value={asset.start} onChange={(e) => set({ start: Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="End s">
            <input type="number" min={0} max={sceneDur} step={0.5} value={asset.end} onChange={(e) => set({ end: Number(e.target.value) })} className={inputCls} />
          </Field>
        </div>
        <button
          onClick={delAsset}
          className="mt-2 block w-full cursor-pointer rounded-[9px] border border-rp-line bg-white px-[14px] py-2 text-[13px] font-semibold text-rp-ink hover:border-rp-red hover:text-rp-red"
        >
          Delete audio
        </button>
      </>
    );
  }

  return (
    <>
      <SectionTitle>{ASSET_TYPES[asset.type].label} · layout</SectionTitle>

      {allSlidesToggle}

      <div className="grid grid-cols-3 gap-2">
        <Field label="X">
          <input type="number" value={Math.round(asset.x)} onChange={(e) => set({ x: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Y">
          <input type="number" value={Math.round(asset.y)} onChange={(e) => set({ y: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Rot°">
          <input type="number" value={asset.rot} onChange={(e) => set({ rot: Number(e.target.value) })} className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="W">
          <input type="number" value={Math.round(asset.w)} onChange={(e) => set({ w: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="H">
          <input type="number" value={Math.round(asset.h)} onChange={(e) => set({ h: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Opacity %">
          <input
            type="number"
            min={0}
            max={100}
            value={Math.round(asset.opacity * 100)}
            onChange={(e) => set({ opacity: Math.max(0, Math.min(100, Number(e.target.value))) / 100 })}
            className={inputCls}
          />
        </Field>
      </div>

      <SubLabel>Timing · within {sceneDur}s scene</SubLabel>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Start s">
          <input type="number" min={0} max={sceneDur} step={0.5} value={asset.start} onChange={(e) => set({ start: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="End s">
          <input type="number" min={0} max={sceneDur} step={0.5} value={asset.end} onChange={(e) => set({ end: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="" className="self-end">
          <label className="m-0 flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={asset.lockRatio} onChange={(e) => set({ lockRatio: e.target.checked })} />
            Lock
          </label>
        </Field>
      </div>
      <label className="mb-3 flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          checked={asset.editable}
          onChange={(e) => set({ editable: e.target.checked })}
        />
        Editable by user (uncheck to lock in templates)
      </label>
      <div className="mb-3 h-[6px] w-full overflow-hidden rounded-full bg-rp-bg">
        <div
          className="h-full rounded-full bg-rp-blue/70"
          style={{ marginLeft: `${(asset.start / sceneDur) * 100}%`, width: `${(asset.dur / sceneDur) * 100}%` }}
        />
      </div>

      <SubLabel>Align in canvas</SubLabel>
      <OptBtns>
        <OptBtn title="Left edge" onClick={() => doAlign('left')}>⇤</OptBtn>
        <OptBtn title="Center horizontally" onClick={() => doAlign('cx')}>⇆</OptBtn>
        <OptBtn title="Right edge" onClick={() => doAlign('right')}>⇥</OptBtn>
        <OptBtn title="Top edge" onClick={() => doAlign('top')}>⇡</OptBtn>
        <OptBtn title="Center vertically" onClick={() => doAlign('cy')}>⇕</OptBtn>
        <OptBtn title="Bottom edge" onClick={() => doAlign('bottom')}>⇣</OptBtn>
      </OptBtns>

      <SubLabel>Arrange</SubLabel>
      <OptBtns>
        <OptBtn onClick={duplicateAsset}>⧉ Duplicate</OptBtn>
        <OptBtn onClick={() => layer(1)}>↑ Forward</OptBtn>
        <OptBtn onClick={() => layer(-1)}>↓ Back</OptBtn>
      </OptBtns>

      <button
        onClick={delAsset}
        className="mt-2 block w-full cursor-pointer rounded-[9px] border border-rp-line bg-white px-[14px] py-2 text-[13px] font-semibold text-rp-ink hover:border-rp-red hover:text-rp-red"
      >
        Delete asset
      </button>
    </>
  );
}

/* ---------- Style tab ---------- */

function StyleTab({ asset }: { asset: Asset }) {
  const [cropOpen, setCropOpen] = useState(false);
  const isMedia = asset.type === 'image' || asset.type === 'logo' || asset.type === 'video';

  return (
    <>
      <SectionTitle>{ASSET_TYPES[asset.type].label} · style</SectionTitle>
      {asset.type === 'text' && <TextFields asset={asset} />}
      {asset.type === 'video' && <VideoFields asset={asset} onCrop={() => setCropOpen(true)} />}
      {asset.type === 'audio' && <AudioFields asset={asset} />}
      {(asset.type === 'image' || asset.type === 'logo') && (
        <button
          onClick={() => setCropOpen(true)}
          className="mb-4 w-full rounded-lg border border-rp-line bg-white py-[7px] text-[13px] font-semibold text-rp-ink hover:border-rp-blue hover:text-rp-blue"
        >
          ✂ Crop image
        </button>
      )}
      {isMedia && <FrameFields asset={asset} />}
      {isMedia && cropOpen && <CropModal asset={asset} onClose={() => setCropOpen(false)} />}
    </>
  );
}

function TextFields({ asset }: { asset: Asset }) {
  const p = asset.props as TextProps;
  const updateAssetProps = useEditor((s) => s.updateAssetProps);
  const setColor = (color: string) => updateAssetProps(asset.id, { color });

  return (
    <>
      <Field label="Text">
        <textarea
          value={p.text}
          onChange={(e) => updateAssetProps(asset.id, { text: e.target.value })}
          className={`${inputCls} min-h-[50px] resize-y`}
        />
      </Field>
      <Field label="Font">
        <select
          value={p.font}
          onChange={(e) => updateAssetProps(asset.id, { font: e.target.value })}
          className={inputCls}
          style={{ fontFamily: p.font }}
        >
          {FONTS.map((f) => (
            <option key={f.label} value={f.stack} style={{ fontFamily: f.stack }}>
              {f.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label={`Size (${p.size}px)`}>
        <input
          type="range"
          min={10}
          max={72}
          value={p.size}
          onChange={(e) => updateAssetProps(asset.id, { size: Number(e.target.value) })}
          className="w-full"
        />
      </Field>
      <Field label="Color">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={normalizeHex(p.color)}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-10 cursor-pointer rounded-[8px] border border-rp-line bg-white p-[2px]"
          />
          <input value={p.color} onChange={(e) => setColor(e.target.value)} spellCheck={false} className={`${inputCls} flex-1 uppercase`} />
        </div>
        <div className="mt-2 flex flex-wrap gap-[6px]">
          {SWATCHES.map((c) => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={`h-6 w-6 cursor-pointer rounded-[6px] border-2 ${
                c.toLowerCase() === p.color.toLowerCase() ? 'border-rp-ink' : 'border-rp-line'
              }`}
            />
          ))}
        </div>
      </Field>
    </>
  );
}

function VideoFields({ asset, onCrop }: { asset: Asset; onCrop: () => void }) {
  const p = asset.props as VideoProps;
  const updateAssetProps = useEditor((s) => s.updateAssetProps);
  return (
    <>
      <button
        onClick={onCrop}
        className="mb-3 w-full rounded-lg border border-rp-line bg-white py-[7px] text-[13px] font-semibold text-rp-ink hover:border-rp-blue hover:text-rp-blue"
      >
        ✂ Crop &amp; trim clip
      </button>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Trim start (s)">
          <input
            type="number"
            min={0}
            step={0.5}
            value={p.trimStart}
            onChange={(e) => updateAssetProps(asset.id, { trimStart: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
        <Field label="Trim end (s)">
          <input
            type="number"
            min={0}
            step={0.5}
            placeholder="Full length"
            value={p.trimEnd || ''}
            onChange={(e) => updateAssetProps(asset.id, { trimEnd: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
      </div>
      <label className="mt-1 flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={p.muted} onChange={(e) => updateAssetProps(asset.id, { muted: e.target.checked })} />
        Mute clip audio
      </label>
    </>
  );
}

/** Frame presets: [label, radius]. Circle/pill uses a radius far past any box's half-width. */
const FRAME_PRESETS: { label: string; radius: number }[] = [
  { label: 'Square', radius: 0 },
  { label: 'Rounded', radius: 16 },
  { label: 'Circle', radius: FRAME_CIRCLE_RADIUS },
];

/** Corner-radius + border controls shared by image, logo, and video assets. */
function FrameFields({ asset }: { asset: Asset }) {
  const p = asset.props as MediaProps | VideoProps;
  const frame = p.frame;
  const updateAssetProps = useEditor((s) => s.updateAssetProps);
  const setFrame = (patch: Partial<FrameProps>) =>
    updateAssetProps(asset.id, { frame: { ...frame, ...patch } });

  const isPreset = (r: number) => (r >= FRAME_CIRCLE_RADIUS ? frame.radius >= FRAME_CIRCLE_RADIUS : frame.radius === r);

  return (
    <>
      <SubLabel>Frame shape</SubLabel>
      <OptBtns>
        {FRAME_PRESETS.map((preset) => (
          <OptBtn
            key={preset.label}
            onClick={() => setFrame({ radius: preset.radius })}
            className={isPreset(preset.radius) ? 'border-rp-blue bg-rp-blue-soft text-rp-blue' : ''}
          >
            {preset.label}
          </OptBtn>
        ))}
      </OptBtns>

      <Field label={`Corner radius (${Math.min(frame.radius, 100)}px)`}>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.min(frame.radius, 100)}
          onChange={(e) => setFrame({ radius: Number(e.target.value) })}
          className="w-full"
        />
      </Field>

      <Field label={`Border width (${frame.borderWidth}px)`}>
        <input
          type="range"
          min={0}
          max={20}
          value={frame.borderWidth}
          onChange={(e) => setFrame({ borderWidth: Number(e.target.value) })}
          className="w-full"
        />
      </Field>

      {frame.borderWidth > 0 && (
        <Field label="Border color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={normalizeHex(frame.borderColor)}
              onChange={(e) => setFrame({ borderColor: e.target.value })}
              className="h-9 w-10 cursor-pointer rounded-[8px] border border-rp-line bg-white p-[2px]"
            />
            <input
              value={frame.borderColor}
              onChange={(e) => setFrame({ borderColor: e.target.value })}
              spellCheck={false}
              className={`${inputCls} flex-1 uppercase`}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-[6px]">
            {SWATCHES.map((c) => (
              <div
                key={c}
                onClick={() => setFrame({ borderColor: c })}
                style={{ background: c }}
                className={`h-6 w-6 cursor-pointer rounded-[6px] border-2 ${
                  c.toLowerCase() === frame.borderColor.toLowerCase() ? 'border-rp-ink' : 'border-rp-line'
                }`}
              />
            ))}
          </div>
        </Field>
      )}
    </>
  );
}

function AudioFields({ asset }: { asset: Asset }) {
  const p = asset.props as AudioProps;
  const updateAssetProps = useEditor((s) => s.updateAssetProps);
  return (
    <>
      <Field label="Track">
        <div className="truncate rounded-[9px] border border-rp-line bg-rp-bg px-[10px] py-2 text-[13px] text-rp-mute">
          {p.name || 'Audio clip'}
        </div>
      </Field>
      <Field label="Trim start (s)">
        <input
          type="number"
          min={0}
          step={0.5}
          value={p.trimStart}
          onChange={(e) => updateAssetProps(asset.id, { trimStart: Number(e.target.value) })}
          className={inputCls}
        />
      </Field>
      <Field label={`Volume (${Math.round(p.volume * 100)}%)`}>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(p.volume * 100)}
          onChange={(e) => updateAssetProps(asset.id, { volume: Number(e.target.value) / 100 })}
          className="w-full"
        />
      </Field>
      <label className="mt-1 flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={p.muted} onChange={(e) => updateAssetProps(asset.id, { muted: e.target.checked })} />
        Mute
      </label>
    </>
  );
}

/** `<input type=color>` only accepts #rrggbb — coerce anything else to a safe value. */
function normalizeHex(c: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#ffffff';
}

/* ---------- Animate tab ---------- */

function AnimationFields({ asset }: { asset: Asset }) {
  const updateAsset = useEditor((s) => s.updateAsset);
  const previewAsset = useEditor((s) => s.previewAsset);

  return (
    <>
      <SectionTitle>{ASSET_TYPES[asset.type].label} · animation</SectionTitle>

      <SubLabel>Entrance</SubLabel>
      <EffectGrid
        anims={IN_ANIMS}
        value={asset.animIn}
        onPick={(id) => {
          updateAsset(asset.id, { animIn: id });
          if (id !== 'none') previewAsset(asset.id, 'in');
        }}
      />
      <button
        onClick={() => previewAsset(asset.id, 'in')}
        disabled={asset.animIn === 'none'}
        className="mb-4 w-full rounded-lg border border-rp-line bg-white py-[7px] text-[13px] font-semibold text-rp-ink hover:border-rp-blue hover:text-rp-blue disabled:opacity-40"
      >
        ▶ Preview entrance
      </button>

      <SubLabel>Exit</SubLabel>
      <EffectGrid
        anims={OUT_ANIMS}
        value={asset.animOut}
        onPick={(id) => {
          updateAsset(asset.id, { animOut: id });
          if (id !== 'none') previewAsset(asset.id, 'out');
        }}
      />
      <button
        onClick={() => previewAsset(asset.id, 'out')}
        disabled={asset.animOut === 'none'}
        className="w-full rounded-lg border border-rp-line bg-white py-[7px] text-[13px] font-semibold text-rp-ink hover:border-rp-blue hover:text-rp-blue disabled:opacity-40"
      >
        ▶ Preview exit
      </button>

      <p className="mt-3 text-[11px] leading-relaxed text-rp-mute">
        Tip: hit ▶ Play on the timeline to see entrances fire at each asset's start and exits near
        its end.
      </p>
    </>
  );
}

function EffectGrid({
  anims,
  value,
  onPick,
}: {
  anims: { id: string; label: string }[];
  value: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="mb-[10px] grid grid-cols-3 gap-[6px]">
      {anims.map((a) => (
        <button
          key={a.id}
          onClick={() => onPick(a.id)}
          className={`rounded-lg border px-1 py-[7px] text-[12px] font-semibold transition-colors ${
            a.id === value
              ? 'border-rp-blue bg-rp-blue-soft text-rp-blue'
              : 'border-rp-line bg-white text-rp-ink hover:border-rp-blue hover:text-rp-blue'
          }`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- small presentational helpers ---------- */

const inputCls =
  'w-full rounded-[9px] border border-rp-line bg-rp-bg px-[10px] py-2 text-[13px] font-[inherit]';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[10px] text-[11px] font-bold uppercase tracking-[0.6px] text-rp-mute">
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-[13px] ${className}`}>
      {label && <label className="mb-[5px] block text-xs font-bold text-[#475569]">{label}</label>}
      {children}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <div className="mt-[2px] mb-[5px] text-xs font-bold text-[#475569]">{children}</div>;
}

function OptBtns({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 flex flex-wrap gap-[6px]">{children}</div>;
}

function OptBtn({
  children,
  onClick,
  title,
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`min-w-[42px] flex-1 cursor-pointer rounded-lg border border-rp-line bg-white p-[7px] text-[13px] font-semibold text-rp-ink hover:border-rp-blue hover:text-rp-blue ${className}`}
    >
      {children}
    </button>
  );
}
