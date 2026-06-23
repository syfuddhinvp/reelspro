import { RATIOS } from '../types.ts';
import { useEditor } from '../store.ts';
import { canvasSize, shade } from '../util.ts';
import AssetView from './AssetView.tsx';

export default function Stage() {
  const scene = useEditor((s) => s.scenes[s.selScene]);
  const globalAssets = useEditor((s) => s.globalAssets);
  const selAssetId = useEditor((s) => s.selAssetId);
  const ratio = useEditor((s) => s.ratio);
  const setRatio = useEditor((s) => s.setRatio);
  const selectAsset = useEditor((s) => s.selectAsset);

  const { width } = canvasSize(ratio);
  // audio assets have no canvas visual — they're played by AudioLayer
  const visualAssets = scene.assets.filter((a) => a.type !== 'audio');

  return (
    <div className="stage flex flex-col items-center justify-center gap-[14px] overflow-auto bg-rp-bg p-5">
      <div
        className="relative overflow-hidden rounded-[14px] shadow-[0_20px_50px_rgba(15,23,42,0.22)] transition-[width] duration-200 select-none [touch-action:none]"
        style={{
          width,
          aspectRatio: ratio.replace('/', ' / '),
          background: scene.bg ?? `linear-gradient(135deg, ${shade(scene.color, -25)}, ${scene.color})`,
        }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) selectAsset(null);
        }}
      >
        {visualAssets.map((a) => (
          <AssetView key={a.id} asset={a} selected={a.id === selAssetId} />
        ))}
        {/* global assets render on top of every scene at the same position */}
        {globalAssets
          .filter((a) => a.type !== 'audio')
          .map((a) => (
            <AssetView key={`g-${a.id}`} asset={a} selected={a.id === selAssetId} global />
          ))}
      </div>

      <div className="flex gap-[6px] rounded-[10px] border border-rp-line bg-white p-1">
        {RATIOS.map((r) => (
          <button
            key={r.ratio}
            onClick={() => setRatio(r.ratio)}
            className={`cursor-pointer rounded-[7px] px-3 py-[6px] text-xs font-semibold ${
              r.ratio === ratio ? 'bg-rp-blue text-white' : 'bg-transparent text-rp-mute'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
