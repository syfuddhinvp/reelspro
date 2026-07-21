import { useEffect, useRef, useState } from 'react';
import { useEditor } from '../store.ts';
import { ExportCancelledError, startExport, type ExportHandle } from '../export/exporter.ts';
import Modal from './Modal.tsx';
import { CheckCircleIcon, DownloadIcon, WarningIcon } from './icons.tsx';

type Phase = 'preparing' | 'rendering' | 'done' | 'error' | 'cancelled';

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('preparing');
  const [progress, setProgress] = useState({ t: 0, total: 0 });
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ url: string; extension: string } | null>(null);
  const handleRef = useRef<ExportHandle | null>(null);
  const downloadedRef = useRef(false);

  useEffect(() => {
    // guards against React StrictMode's dev-only double-invoke: the first run is
    // cancelled almost immediately, and its rejection must not clobber the second
    // (real) run's state once this effect has been superseded
    let stale = false;

    const snapshot = {
      scenes: useEditor.getState().scenes,
      globalAssets: useEditor.getState().globalAssets,
      ratio: useEditor.getState().ratio,
      bgAudio: useEditor.getState().bgAudio,
    };

    setPhase('rendering');
    const handle = startExport(snapshot, {
      onProgress: (t, total) => {
        if (!stale) setProgress({ t, total });
      },
    });
    handleRef.current = handle;

    handle.result
      .then(({ blob, extension }) => {
        if (stale) return;
        const url = URL.createObjectURL(blob);
        setResult({ url, extension });
        setPhase('done');
      })
      .catch((err) => {
        if (stale) return;
        if (err instanceof ExportCancelledError) {
          setPhase('cancelled');
        } else {
          setError(err instanceof Error ? err.message : 'Export failed');
          setPhase('error');
        }
      });

    return () => {
      stale = true;
      handle.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-download the moment it's ready
  useEffect(() => {
    if (phase === 'done' && result && !downloadedRef.current) {
      downloadedRef.current = true;
      const a = document.createElement('a');
      a.href = result.url;
      a.download = `reelspro-export.${result.extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }, [phase, result]);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const pct = progress.total > 0 ? Math.min(100, Math.round((progress.t / progress.total) * 100)) : 0;

  const canClose = phase !== 'rendering' && phase !== 'preparing';

  return (
    <Modal
      title="Export video"
      icon={<DownloadIcon size={14} />}
      onClose={canClose ? onClose : undefined}
      maxWidth={420}
    >
      {(phase === 'preparing' || phase === 'rendering') && (
        <>
          <p className="mb-3 text-[13px] text-rp-mute">
            {phase === 'preparing'
              ? 'Loading media and fonts…'
              : `Rendering ${progress.t.toFixed(1)}s / ${progress.total.toFixed(1)}s — this plays through in real time, so it takes about as long as the video itself.`}
          </p>
          <div className="mb-4 h-[8px] w-full overflow-hidden rounded-full bg-rp-bg">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#3b82f6)] transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            onClick={() => {
              handleRef.current?.cancel();
              onClose();
            }}
            className="w-full rounded-[11px] border border-rp-line bg-white py-2 text-sm font-semibold hover:border-rp-red hover:bg-rp-red-soft hover:text-rp-red"
          >
            Cancel
          </button>
        </>
      )}

      {phase === 'done' && result && (
        <>
          <p className="mb-4 flex items-center gap-[8px] text-[13px] text-rp-mute">
            <CheckCircleIcon size={16} className="flex-none text-rp-green" />
            Done — your download should have started automatically ({result.extension.toUpperCase()}).
          </p>
          <div className="flex gap-2">
            <a
              href={result.url}
              download={`reelspro-export.${result.extension}`}
              className="flex-1 rounded-[11px] border border-rp-line bg-white py-2 text-center text-sm font-semibold hover:border-rp-blue hover:text-rp-blue"
            >
              Download again
            </a>
            <button
              onClick={onClose}
              className="flex-1 rounded-[11px] bg-rp-blue py-2 text-sm font-semibold text-white hover:bg-rp-blue-dk"
            >
              Done
            </button>
          </div>
        </>
      )}

      {phase === 'error' && (
        <>
          <p className="mb-4 flex items-center gap-[8px] text-[13px] text-rp-red">
            <WarningIcon size={16} className="flex-none" />
            {error}
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-[11px] bg-rp-blue py-2 text-sm font-semibold text-white hover:bg-rp-blue-dk"
          >
            Close
          </button>
        </>
      )}

      {phase === 'cancelled' && (
        <>
          <p className="mb-4 text-[13px] text-rp-mute">Export cancelled.</p>
          <button
            onClick={onClose}
            className="w-full rounded-[11px] bg-rp-blue py-2 text-sm font-semibold text-white hover:bg-rp-blue-dk"
          >
            Close
          </button>
        </>
      )}
    </Modal>
  );
}
