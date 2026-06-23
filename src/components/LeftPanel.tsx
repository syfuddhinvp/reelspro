import { useRef, useState } from 'react';
import type { Asset, AssetType, TextProps } from '../types.ts';
import { ASSET_COLOR, ASSET_ICON } from '../types.ts';
import { ASSET_TYPES } from '../assetTypes.ts';
import { useEditor } from '../store.ts';
import { newId, useTemplates } from '../templateStore.ts';
import { useApp } from '../appStore.ts';
import RecorderModal from './RecorderModal.tsx';

type FileKind = 'image' | 'logo' | 'video' | 'audio' | 'global-logo' | 'bg-audio';

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

  const onRecorded = (mode: 'audio' | 'video', url: string, name: string) => {
    if (mode === 'video') addAsset('video', { src: url });
    else addAudioAsset(url, name);
    toast(`✓ Added ${name.toLowerCase()}`);
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
    if (!chosen.length) return toast('⚠ Pick at least one asset');
    saveGroup({
      id: newId(),
      name: groupName.trim() || `Group ${groups.length + 1}`,
      assets: chosen.map((a) => ({ ...a, props: { ...a.props } })),
    });
    toast(`⊞ Saved group "${groupName.trim() || `Group ${groups.length + 1}`}"`);
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

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const kind = pendingKind.current;
    if (kind === 'audio') addAudioAsset(url, f.name);
    else if (kind === 'bg-audio') {
      setBgAudio({ src: url, name: f.name });
      toast('🎵 Background track set for all slides');
    } else if (kind === 'global-logo') {
      addGlobalAsset('logo', { src: url });
      toast('★ Logo added to all slides');
    } else addAsset(kind as AssetType, { src: url });
  };

  return (
    <div className="col left overflow-y-auto border-r border-rp-line bg-white p-4">
      <SectionTitle>Add to scene</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <AddBtn onClick={() => onAdd('text')}>＋ Text</AddBtn>
        <AddBtn onClick={() => onAdd('image')}>＋ Image</AddBtn>
        <AddBtn onClick={() => onAdd('logo')}>＋ Logo</AddBtn>
        <AddBtn onClick={() => onAdd('video')}>＋ Video</AddBtn>
        <AddBtn onClick={() => onAdd('audio')}>＋ Audio</AddBtn>
      </div>
      <div className="mb-[18px] mt-2 grid grid-cols-2 gap-2">
        <GhostMini onClick={() => setRecMode('audio')}>⏺ Rec audio</GhostMini>
        <GhostMini onClick={() => setRecMode('video')}>⏺ Rec video</GhostMini>
      </div>

      <div className="mb-[10px] flex items-center justify-between">
        <SectionTitle className="mb-0">Assets · {assets.length}</SectionTitle>
        {assets.length > 0 &&
          (grouping ? (
            <button onClick={resetGrouping} className="text-[11px] font-semibold text-rp-mute hover:text-rp-blue">
              Cancel
            </button>
          ) : (
            <button onClick={() => setGrouping(true)} className="text-[11px] font-semibold text-rp-blue">
              ⊞ Group
            </button>
          ))}
      </div>

      <div>
        {assets.length ? (
          assets.map((a) =>
            grouping ? (
              <label
                key={a.id}
                className={`mb-[7px] flex cursor-pointer items-center gap-[10px] rounded-[10px] border p-[9px] ${
                  picked.has(a.id) ? 'border-rp-blue bg-[#eff4ff]' : 'border-rp-line'
                }`}
              >
                <input type="checkbox" checked={picked.has(a.id)} onChange={() => togglePick(a.id)} />
                <div
                  className="grid h-7 w-7 flex-none place-items-center rounded-[7px] text-xs font-bold text-white"
                  style={{ background: ASSET_COLOR[a.type] }}
                >
                  {ASSET_ICON[a.type]}
                </div>
                <b className="truncate text-[13px]">{assetName(a)}</b>
              </label>
            ) : (
              <Row
                key={a.id}
                selected={a.id === selAssetId}
                dotColor={ASSET_COLOR[a.type]}
                dotLabel={ASSET_ICON[a.type]}
                title={assetName(a)}
                sub={`${ASSET_TYPES[a.type].label} · ${a.dur}s${a.editable ? '' : ' · 🔒'}`}
                onClick={() => selectAsset(a.id)}
                onDelete={() => {
                  selectAsset(a.id);
                  delAsset();
                }}
              />
            ),
          )
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
            className="min-w-0 flex-1 rounded-[9px] border border-rp-line bg-rp-bg px-[10px] py-2 text-[13px]"
          />
          <button
            onClick={commitGroup}
            className="rounded-[9px] bg-rp-blue px-3 text-[13px] font-semibold text-white"
          >
            Save ({picked.size})
          </button>
        </div>
      )}

      <SectionTitle className="mt-[18px]">Groups · {groups.length}</SectionTitle>
      {groups.length ? (
        groups.map((g) => (
          <div key={g.id} className="mb-[7px] flex items-center gap-[10px] rounded-[10px] border border-rp-line p-[9px]">
            <div className="grid h-7 w-7 flex-none place-items-center rounded-[7px] bg-rp-purple text-xs font-bold text-white">⊞</div>
            <div className="min-w-0">
              <b className="block truncate text-[13px]">{g.name}</b>
              <span className="text-[11px] text-rp-mute">{g.assets.length} asset(s)</span>
            </div>
            <button
              onClick={() => {
                insertGroup(g);
                toast(`⊞ Inserted "${g.name}"`);
              }}
              title="Insert into scene"
              className="ml-auto cursor-pointer text-[15px] text-rp-blue"
            >
              ＋
            </button>
            <button onClick={() => deleteGroup(g.id)} title="Delete group" className="cursor-pointer text-[13px] text-[#ef4444]">
              ✕
            </button>
          </div>
        ))
      ) : (
        <p className="text-xs text-rp-mute">Use ⊞ Group above to bundle assets for reuse.</p>
      )}

      <SectionTitle className="mt-[18px]">All slides</SectionTitle>
      <div className="mb-2 grid grid-cols-2 gap-2">
        <GhostMini onClick={() => pickFile('global-logo')}>★ Logo on all</GhostMini>
        <GhostMini onClick={() => pickFile('bg-audio')}>🎵 BG music</GhostMini>
      </div>
      {bgAudio && (
        <div className="mb-2 flex items-center gap-2 rounded-[10px] border border-rp-line p-[9px]">
          <div className="grid h-7 w-7 flex-none place-items-center rounded-[7px] bg-rp-purple text-xs font-bold text-white">♪</div>
          <div className="min-w-0">
            <b className="block truncate text-[13px]">{bgAudio.name}</b>
            <span className="text-[11px] text-rp-mute">Background · all slides</span>
          </div>
          <button onClick={() => setBgAudio(null)} className="ml-auto cursor-pointer text-[13px] text-[#ef4444]">
            ✕
          </button>
        </div>
      )}
      {globalAssets.map((a) => (
        <Row
          key={a.id}
          selected={a.id === selAssetId}
          dotColor={ASSET_COLOR[a.type]}
          dotLabel={ASSET_ICON[a.type]}
          title={assetName(a)}
          sub={`${ASSET_TYPES[a.type].label} · on all slides`}
          onClick={() => selectAsset(a.id)}
          onDelete={() => {
            selectAsset(a.id);
            delAsset();
          }}
        />
      ))}
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
            dotLabel={String(i + 1)}
            title={s.name}
            sub={`${s.assets.length} asset(s) · ${s.dur}s`}
            onClick={() => selectScene(i)}
            onDelete={() => delScene(i)}
          />
        ))}
      </div>
      <div
        className="cursor-pointer rounded-[10px] border-[1.5px] border-dashed border-[#c7d2e0] p-[10px] text-center text-[13px] font-semibold text-rp-mute"
        onClick={addScene}
      >
        ＋ Add scene
      </div>

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

function GhostMini({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[9px] border border-rp-line bg-white px-[10px] py-[6px] text-xs font-semibold text-rp-ink hover:border-rp-blue hover:text-rp-blue"
    >
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

function AddBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center gap-[5px] rounded-[9px] bg-rp-blue px-[10px] py-[6px] text-xs font-semibold text-white"
    >
      {children}
    </button>
  );
}

interface RowProps {
  selected: boolean;
  dotColor: string;
  dotLabel: string;
  title: string;
  sub: string;
  onClick: () => void;
  onDelete: () => void;
}

function Row({ selected, dotColor, dotLabel, title, sub, onClick, onDelete }: RowProps) {
  return (
    <div
      onClick={onClick}
      className={`mb-[7px] flex cursor-pointer items-center gap-[10px] rounded-[10px] border p-[9px] ${
        selected ? 'border-rp-blue bg-[#eff4ff]' : 'border-rp-line'
      }`}
    >
      <div
        className="grid h-7 w-7 flex-none place-items-center rounded-[7px] text-xs font-bold text-white"
        style={{ background: dotColor }}
      >
        {dotLabel}
      </div>
      <div className="min-w-0">
        <b className="block truncate text-[13px]">{title}</b>
        <span className="text-[11px] text-rp-mute">{sub}</span>
      </div>
      <button
        className="ml-auto cursor-pointer border-none bg-transparent text-[13px] text-[#ef4444]"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ✕
      </button>
    </div>
  );
}
