import { useEffect, useRef, useState } from 'react';

interface Props {
  mode: 'audio' | 'video';
  onComplete: (url: string, name: string) => void;
  onClose: () => void;
}

export default function RecorderModal({ mode, onComplete, onClose }: Props) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia(
          mode === 'video' ? { video: true, audio: true } : { audio: true },
        );
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (mode === 'video' && previewRef.current) {
          previewRef.current.srcObject = stream;
          previewRef.current.muted = true;
          void previewRef.current.play().catch(() => {});
        }
      } catch {
        setError(`Could not access your ${mode === 'video' ? 'camera' : 'microphone'}. Check permissions.`);
      }
    })();
    return () => {
      active = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  const start = () => {
    const stream = streamRef.current;
    if (!stream) return;
    chunks.current = [];
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: mode === 'video' ? 'video/webm' : 'audio/webm' });
      setUrl(URL.createObjectURL(blob));
    };
    rec.start();
    recRef.current = rec;
    setRecording(true);
  };

  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const accept = () => {
    if (url) {
      onComplete(url, mode === 'video' ? 'Recorded video' : 'Recorded audio');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rp-line px-5 py-4">
          <h3 className="text-base font-bold">{mode === 'video' ? 'Record video' : 'Record audio'}</h3>
          <button onClick={onClose} className="text-rp-mute hover:text-rp-ink">
            ✕
          </button>
        </div>

        <div className="p-5">
          {error ? (
            <p className="text-sm text-[#ef4444]">{error}</p>
          ) : (
            <>
              <div className="mb-4 grid aspect-video place-items-center overflow-hidden rounded-xl bg-[#0b1220] text-white">
                {url && mode === 'video' ? (
                  <video src={url} controls className="h-full w-full" />
                ) : mode === 'video' ? (
                  <video ref={previewRef} className="h-full w-full object-cover" />
                ) : url ? (
                  <audio src={url} controls className="w-[90%]" />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`h-3 w-3 rounded-full ${recording ? 'rp-pulse bg-rp-red' : 'bg-white/40'}`} />
                    {recording ? 'Recording…' : 'Microphone ready'}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                {!url ? (
                  recording ? (
                    <button onClick={stop} className="rounded-[11px] bg-rp-red px-4 py-2 text-sm font-semibold text-white">
                      ■ Stop
                    </button>
                  ) : (
                    <button onClick={start} className="rounded-[11px] bg-rp-blue px-4 py-2 text-sm font-semibold text-white hover:bg-rp-blue-dk">
                      ⏺ Start recording
                    </button>
                  )
                ) : (
                  <>
                    <button
                      onClick={() => setUrl(null)}
                      className="rounded-[11px] border border-rp-line bg-white px-4 py-2 text-sm font-semibold hover:border-rp-blue hover:text-rp-blue"
                    >
                      Re-record
                    </button>
                    <button onClick={accept} className="rounded-[11px] bg-rp-blue px-4 py-2 text-sm font-semibold text-white hover:bg-rp-blue-dk">
                      Use this {mode === 'video' ? 'clip' : 'audio'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
