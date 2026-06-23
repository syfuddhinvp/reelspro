import { useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Asset, TextProps } from './types.ts';
import { useEditor } from './store.ts';

/**
 * The single place that handles drag / resize / rotate for every asset type.
 * Returns a `pointerdown` handler to spread onto the asset element.
 */
export function useTransform(asset: Asset) {
  return useCallback(
    (e: ReactPointerEvent) => {
      const { selectAsset, updateAsset, updateAssetProps } = useEditor.getState();
      selectAsset(asset.id);

      // locked asset: allow selection but no drag / resize / rotate
      if (!asset.editable) return;

      const role = (e.target as HTMLElement).dataset.role;
      const startX = e.clientX;
      const startY = e.clientY;

      // Snapshot of the asset at drag start.
      const { x: ox, y: oy, w: ow, h: oh } = asset;
      const ratio = ow / oh;

      let move: (ev: PointerEvent) => void;

      if (role === 'resize') {
        e.preventDefault();
        e.stopPropagation();
        move = (ev) => {
          const w = Math.max(asset.minW, ow + (ev.clientX - startX));
          const h = asset.lockRatio
            ? Math.round(w / ratio)
            : Math.max(asset.minH, oh + (ev.clientY - startY));
          updateAsset(asset.id, { w, h });
          if (asset.type === 'text') {
            const scale = w / ow;
            const size = Math.max(10, Math.round((asset.props as TextProps).size * scale));
            updateAssetProps(asset.id, { size });
          }
        };
      } else if (role === 'rot') {
        e.preventDefault();
        e.stopPropagation();
        const el = e.currentTarget as HTMLElement;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        move = (ev) => {
          const rot = Math.round(
            (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90,
          );
          updateAsset(asset.id, { rot });
        };
      } else {
        e.preventDefault();
        move = (ev) => {
          updateAsset(asset.id, {
            x: ox + (ev.clientX - startX),
            y: oy + (ev.clientY - startY),
          });
        };
      }

      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [asset],
  );
}
