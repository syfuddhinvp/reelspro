import { useEffect, useRef, useState } from 'react';
import type { Asset, AssetType, AudioClip, TextProps } from '../types.ts';
import { ASSET_COLOR, ASSET_ICON } from '../types.ts';
import { ASSET_TYPES } from '../assetTypes.ts';
import { useEditor } from '../store.ts';
import { newId, useTemplates } from '../templateStore.ts';
import { useApp } from '../appStore.ts';
import RecorderModal from './RecorderModal.tsx';
import TrimBar from './TrimBar.tsx';
import { boxForFile, uploadSizeError, type UploadKind } from '../upload.ts';
import {
  GroupIcon,
  ImageIcon,
  LockIcon,
  MusicIcon,
  PlusIcon,
  RecordDotIcon,
  StarIcon,
  TextIcon,
  TrashIcon,
  VideoIcon,
} from './icons.tsx';

type FileKind = UploadKind | 'audio' | 'bg-audio';

function assetName(a: Asset): string {
  if (a.type === 'text') return ((a.props as TextProps).text || 'Text').slice(0, 18);
  return ASSET_TYPES[a.type].label;
}

export default function LeftPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingKind = useRef<FileKind>('image');
  const [recMode, setRecMode] = useState<'audio' | 'video' | null>(null);

  const scenes = useEditor((s) => s.scenes);
  const selScene = useEditor((s) => s.selScene);
  const selAssetId = useEditor((s) => s.selAssetId);
  const addAsset = useEditor((s) => s.addAsset);
  const addAudioAsset = useEditor((s) => s.addAudioAsset);
  const addGlobalAsset = useEditor((s) => s.addGlobalAsset);
  const setBgAudio = useEditor((s) => s.setBgAudio);
  const bgAudio = useEditor((s) => s.bgAudio);
  const globalAssets = useEditor((s) => s.globalAssets);
  const selectAsset = useEditor((s) => s.selectAsset);
  const delAsset = useEditor((s) => s.delAsset);
  const selectScene = useEditor((s) => s.selectScene);
  const addScene = useEditor((s) => s.addScene);
  const delScene = useEditor((s) => s.delScene);
  const insertGroup = useEditor((s) => s.insertGroup);

  const groups = useTemplates((s) => s.groups);
  const saveGroup = useTemplates((s) => s.saveGroup);
  const deleteGroup = useTemplates((s) => s.deleteGroup);
  const toast = useApp((s) => s.toast);

  const scene = scenes[selScene];
  const assets = scene.assets;

  const pickFile = (kind: FileKind) => {
    pendingKind.current = kind;
    const input = fileRef.current!;
    input.accept = kind === 'audio' || kind === 'bg-audio' ? 'audio/*' : kind === 'video' ? 'video/*' : 'image/*';
    input.value = '';
    input.click();
  };

  const onRecorded = async (mode: 'audio' | 'video', url: string, name: string) => {
    if (mode === 'video') addAsset('video', { src: url }, await boxForFile('video', url));
    else addAudioAsset(url, name);
    toast(`Added ${name.toLowerCase()}`, 'success');
  };

  // group-building state
  const [grouping, setGrouping] = useState(false);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [groupName, setGroupName] = useState('');

  const togglePick = (id: number) =>
    setPicked((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const resetGrouping = () => {
    setGrouping(false);
    setPicked(new Set());
    setGroupName('');
  };

  const commitGroup = () => {
    const chosen = assets.filter((a) => picked.has(a.id));
    if (!chosen.length) return toast('Pick at least one asset', 'warning');
    saveGroup({
      id: newId(),
      name: groupName.trim() || `Group ${groups.length + 1}`,
      assets: chosen.map((a) => ({ ...a, props: { ...a.props } })),
    });
    toast(`Saved group "${groupName.trim() || `Group ${groups.length + 1}`}"`, 'success');
    resetGrouping();
  };

  const onAdd = (type: AssetType) => {
    if (type === 'text') {
      addAsset('text');
      return;
    }
    if (type === 'audio') return pickFile('audio');
    pickFile(type as FileKind);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const kind = pendingKind.current;

    if (kind !== 'audio' && kind !== 'bg-audio') {
      const err = uploadSizeError(kind, f);
      if (err) return toast(err, 'warning');
    }

    const url = URL.createObjectURL(f);
    if (kind === 'audio') addAudioAsset(url, f.name);
    else if (kind === 'bg-audio') {
      setBgAudio({ src: url, name: f.name });
      toast('Background track set for all slides', 'success');
    } else if (kind === 'global-logo') {
      addGlobalAsset('logo', { src: url }, await boxForFile(kind, url));
      toast('Logo added to all slides', 'success');
    } else addAsset(kind as AssetType, { src: url }, await boxForFile(kind, url));
  };

  return (
    <div className="col left overflow-y-auto border-r border-rp-line bg-white p-4">
      <SectionTitle>Add to scene</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <AddBtn icon={<TextIcon size={14} />} onClick={() => onAdd('text')}>
          Text
        </AddBtn>
        <AddBtn icon={<ImageIcon size={14} />} onClick={() => onAdd('image')}>
          Image
        </AddBtn>
        <AddBtn icon={<StarIcon size={14} />} onClick={() => onAdd('logo')}>
          Logo
        </AddBtn>
        <AddBtn icon={<VideoIcon size={14} />} onClick={() => onAdd('video')}>
          Video
        </AddBtn>
        <AddBtn icon={<MusicIcon size={14} />} onClick={() => onAdd('audio')}>
          Audio
        </AddBtn>
      </div>
      <div className="mb-[18px] mt-2 grid grid-cols-2 gap-2">
        <GhostMini icon={<RecordDotIcon size={9} className="text-rp-red" />} onClick={() => setRecMode('audio')}>
          Rec audio
        </GhostMini>
        <GhostMini icon={<RecordDotIcon size={9} className="text-rp-red" />} onClick={() => setRecMode('video')}>
          Rec video
        </GhostMini>
      </div>

      <div className="mb-[10px] flex items-center justify-between">
        <SectionTitle className="mb-0">Assets · {assets.length}</SectionTitle>
        {assets.length > 0 &&
          (grouping ? (
            <button onClick={resetGrouping} className="text-[11px] font-semibold text-rp-mute hover:text-rp-blue">
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setGrouping(true)}
              className="flex items-center gap-[4px] text-[11px] font-semibold text-rp-blue"
            >
              <GroupIcon size={12} />
              Group
            </button>
          ))}
      </div>

      <div>
        {assets.length ? (
          assets.map((a) => {
            const Icon = ASSET_ICON[a.type];
            return grouping ? (
              <label
                key={a.id}
                className={`mb-[7px] flex cursor-pointer items-center gap-[10px] rounded-[10px] border p-[9px] transition-shadow ${
                  picked.has(a.id) ? 'border-rp-blue bg-rp-blue-soft shadow-[var(--shadow-xs)]' : 'border-rp-line hover:border-[#c7d2e0]'
                }`}
              >
                <input type="checkbox" checked={picked.has(a.id)} onChange={() => togglePick(a.id)} />
                <div
                  className="grid h-7 w-7 flex-none place-items-center rounded-[7px] text-white shadow-[var(--shadow-xs)]"
                  style={{ background: ASSET_COLOR[a.type] }}
                >
                  <Icon size={14} />
                </div>
                <b className="truncate text-[13px]">{assetName(a)}</b>
              </label>
            ) : (
              <Row
                key={a.id}
                selected={a.id === selAssetId}
                dotColor={ASSET_COLOR[a.type]}
                icon={<Icon size={14} />}
                title={assetName(a)}
                sub={
                  <>
                    {ASSET_TYPES[a.type].label} · {a.dur}s
                    {!a.editable && <LockIcon size={9} className="ml-1 inline-block align-middle text-rp-mute" />}
                  </>
                }
                onClick={() => selectAsset(a.id)}
                onDelete={() => {
                  selectAsset(a.id);
                  delAsset();
                }}
              />
            );
          })
        ) : (
          <p className="text-xs text-rp-mute">No assets yet — use the buttons above.</p>
        )}
      </div>

      {grouping && (
        <div className="mb-2 flex gap-2">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="min-w-0 flex-1 rounded-[9px] border border-rp-line bg-rp-bg px-[10px] py-2 text-[13px] focus:border-rp-blue focus:bg-white focus:outline-none"
          />
          <button
            onClick={commitGroup}
            className="rounded-[9px] bg-rp-blue px-3 text-[13px] font-semibold text-white hover:bg-rp-blue-dk"
          >
            Save ({picked.size})
          </button>
        </div>
      )}

      <SectionTitle className="mt-[18px]">Groups · {groups.length}</SectionTitle>
      {groups.length ? (
        groups.map((g) => (
          <div
            key={g.id}
            className="mb-[7px] flex items-center gap-[10px] rounded-[10px] border border-rp-line p-[9px] hover:border-[#c7d2e0]"
          >
            <div className="grid h-7 w-7 flex-none place-items-center rounded-[7px] bg-rp-purple text-white shadow-[var(--shadow-xs)]">
              <GroupIcon size={14} />
            </div>
            <div className="min-w-0">
              <b className="block truncate text-[13px]">{g.name}</b>
              <span className="text-[11px] text-rp-mute">{g.assets.length} asset(s)</span>
            </div>
            <button
              onClick={() => {
                insertGroup(g);
                toast(`Inserted "${g.name}"`, 'success');
              }}
              title="Insert into scene"
              className="ml-auto grid h-6 w-6 flex-none cursor-pointer place-items-center rounded-md text-rp-blue hover:bg-rp-blue-soft"
            >
              <PlusIcon size={13} />
            </button>
            <button
              onClick={() => deleteGroup(g.id)}
              title="Delete group"
              className="grid h-6 w-6 flex-none cursor-pointer place-items-center rounded-md text-rp-mute hover:bg-rp-red-soft hover:text-rp-red"
            >
              <TrashIcon size={13} />
            </button>
          </div>
        ))
      ) : (
        <p className="text-xs text-rp-mute">Select assets, then tap Group above to bundle them for reuse.</p>
      )}

      <SectionTitle className="mt-[18px]">All slides</SectionTitle>
      <div className="mb-2 grid grid-cols-2 gap-2">
        <GhostMini icon={<StarIcon size={13} />} onClick={() => pickFile('global-logo')}>
          Logo on all
        </GhostMini>
        <GhostMini icon={<MusicIcon size={13} />} onClick={() => pickFile('bg-audio')}>
          BG music
        </GhostMini>
      </div>
      {bgAudio && (
        <BgAudioControls
          clip={bgAudio}
          onChange={(patch) => setBgAudio({ ...bgAudio, ...patch })}
          onRemove={() => setBgAudio(null)}
        />
      )}
      {globalAssets.map((a) => {
        const Icon = ASSET_ICON[a.type];
        return (
          <Row
            key={a.id}
            selected={a.id === selAssetId}
            dotColor={ASSET_COLOR[a.type]}
            icon={<Icon size={14} />}
            title={assetName(a)}
            sub={`${ASSET_TYPES[a.type].label} · on all slides`}
            onClick={() => selectAsset(a.id)}
            onDelete={() => {
              selectAsset(a.id);
              delAsset();
            }}
          />
        );
      })}
      {!bgAudio && globalAssets.length === 0 && (
        <p className="mb-1 text-xs text-rp-mute">Add a logo or music that appears on every scene.</p>
      )}

      <SectionTitle className="mt-[18px]">Scenes</SectionTitle>
      <div>
        {scenes.map((s, i) => (
          <Row
            key={s.id}
            selected={i === selScene}
            dotColor={s.color}
            icon={<span className="text-[11px] font-bold">{i + 1}</span>}
            title={s.name}
            sub={`${s.assets.length} asset(s) · ${s.dur}s`}
            onClick={() => selectScene(i)}
            onDelete={() => delScene(i)}
          />
        ))}
      </div>
      <button
        className="flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[10px] border-[1.5px] border-dashed border-[#c7d2e0] p-[10px] text-[13px] font-semibold text-rp-mute hover:border-rp-blue hover:text-rp-blue"
        onClick={addScene}
      >
        <PlusIcon size={13} />
        Add scene
      </button>

      <input ref={fileRef} type="file" hidden onChange={onFile} />

      {recMode && (
        <RecorderModal
          mode={recMode}
          onComplete={(url, name) => onRecorded(recMode, url, name)}
          onClose={() => setRecMode(null)}
        />
      )}
    </div>
  );
}

/** Trim range, volume & mute controls for the background music track (plays across every scene). */
function BgAudioControls({
  clip,
  onChange,
  onRemove,
}: {
  clip: AudioClip;
  onChange: (patch: Partial<AudioClip>) => void;
  onRemove: () => void;
}) {
  const [duration, setDuration] = useState(0);
  const trimStart = clip.trimStart ?? 0;
  const trimEnd = clip.trimEnd ?? 0;
  const volume = clip.volume ?? 1;
  const muted = clip.muted ?? false;

  // once the source clip's real length is known, default trimEnd to "full clip"
  useEffect(() => {
    if (duration > 0 && !trimEnd) onChange({ trimEnd: +duration.toFixed(2) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <div className="mb-2 rounded-[10px] border border-rp-line p-[9px]">
      <div className="mb-2 flex items-center gap-2">
        <div className="grid h-7 w-7 flex-none place-items-center rounded-[7px] bg-rp-purple text-white shadow-[var(--shadow-xs)]">
          <MusicIcon size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <b className="block truncate text-[13px]">{clip.name}</b>
          <span className="text-[11px] text-rp-mute">Background · all slides</span>
        </div>
        <button
          onClick={onRemove}
          className="grid h-6 w-6 flex-none cursor-pointer place-items-center rounded-md text-rp-mute hover:bg-rp-red-soft hover:text-rp-red"
        >
          <TrashIcon size={13} />
        </button>
      </div>

      <audio src={clip.src} preload="metadata" hidden onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />

      <div className="mb-[5px] text-xs font-bold text-[#475569]">
        Clip range · {duration ? duration.toFixed(1) : '…'}s total
      </div>
      <TrimBar
        duration={duration}
        start={trimStart}
        end={trimEnd || duration}
        onChange={(start, end) => onChange({ trimStart: start, trimEnd: end })}
      />
      <div className="mt-1 mb-2 flex justify-between text-[11px] text-rp-mute">
        <span>Start {trimStart.toFixed(1)}s</span>
        <span>End {(trimEnd || duration).toFixed(1)}s</span>
      </div>

      <div className="mb-[5px] text-xs font-bold text-[#475569]">Volume ({Math.round(volume * 100)}%)</div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        onChange={(e) => onChange({ volume: Number(e.target.value) / 100 })}
        className="mb-2 w-full"
      />

      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={muted} onChange={(e) => onChange({ muted: e.target.checked })} />
        Mute
      </label>
    </div>
  );
}

function GhostMini({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center gap-[6px] rounded-[9px] border border-rp-line bg-white px-[10px] py-[6px] text-xs font-semibold text-rp-ink hover:border-rp-blue hover:text-rp-blue"
    >
      {icon}
      {children}
    </button>
  );
}

function SectionTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-[10px] text-[11px] font-bold uppercase tracking-[0.6px] text-rp-mute ${className}`}
    >
      {children}
    </div>
  );
}

function AddBtn({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center gap-[6px] rounded-[9px] bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-[10px] py-[7px] text-xs font-semibold text-white shadow-[var(--shadow-xs)] hover:bg-[linear-gradient(135deg,#1e40af,#2563eb)]"
    >
      {icon}
      {children}
    </button>
  );
}

interface RowProps {
  selected: boolean;
  dotColor: string;
  icon: React.ReactNode;
  title: string;
  sub: React.ReactNode;
  onClick: () => void;
  onDelete: () => void;
}

function Row({ selected, dotColor, icon, title, sub, onClick, onDelete }: RowProps) {
  return (
    <div
      onClick={onClick}
      className={`group mb-[7px] flex cursor-pointer items-center gap-[10px] rounded-[10px] border p-[9px] transition-shadow ${
        selected ? 'border-rp-blue bg-rp-blue-soft shadow-[var(--shadow-xs)]' : 'border-rp-line hover:border-[#c7d2e0]'
      }`}
    >
      <div
        className="grid h-7 w-7 flex-none place-items-center rounded-[7px] text-white shadow-[var(--shadow-xs)]"
        style={{ background: dotColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <b className="block truncate text-[13px]">{title}</b>
        <span className="text-[11px] text-rp-mute">{sub}</span>
      </div>
      <button
        className="ml-auto grid h-6 w-6 flex-none cursor-pointer place-items-center rounded-md text-rp-mute opacity-0 group-hover:opacity-100 hover:bg-rp-red-soft hover:text-rp-red"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <TrashIcon size={13} />
      </button>
    </div>
  );
}
