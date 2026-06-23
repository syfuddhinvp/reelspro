import { useEffect, useState } from 'react';
import { useEditor } from '../store.ts';
import { canvasSize, shade } from '../util.ts';
import AssetView from './AssetView.tsx';

/** Read-only, scaled rendering of the current scene — used by the fullscreen player. */
export default function PlayerCanvas() {
  const scene = useEditor((s) => s.scenes[s.selScene]);
  const globalAssets = useEditor((s) => s.globalAssets);
  const ratio = useEditor((s) => s.ratio);

  const { width: W, height: H } = canvasSize(ratio);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calc = () =>
      setScale(Math.min((window.innerHeight * 0.8) / H, (window.innerWidth * 0.92) / W));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [W, H]);

  const visual = scene.assets.filter((a) => a.type !== 'audio');
  const bg = scene.bg ?? `linear-gradient(135deg, ${shade(scene.color, -25)}, ${scene.color})`;

  return (
    <div style={{ width: W * scale, height: H * scale }}>
      <div
        className="relative overflow-hidden rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] [pointer-events:none]"
        style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', background: bg }}
      >
        {visual.map((a) => (
          <AssetView key={a.id} asset={a} selected={false} />
        ))}
        {globalAssets
          .filter((a) => a.type !== 'audio')
          .map((a) => (
            <AssetView key={`g-${a.id}`} asset={a} selected={false} global />
          ))}
      </div>
    </div>
  );
}
