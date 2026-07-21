import { CloseIcon } from './icons.tsx';

interface Props {
  title: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  maxWidth?: number;
  children: React.ReactNode;
}

/** Shared premium modal shell used by Crop, Export & Recorder dialogs — consistent chrome, one visual language. */
export default function Modal({ title, icon, onClose, maxWidth = 440, children }: Props) {
  return (
    <div
      className="fixed inset-0 z-[300] grid place-items-center bg-rp-ink/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-xl)] ring-1 ring-black/[0.04]"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rp-line px-5 py-4">
          <h3 className="flex items-center gap-[9px] text-base font-bold text-rp-ink">
            {icon && (
              <span className="grid h-7 w-7 flex-none place-items-center rounded-[8px] bg-rp-blue-soft text-rp-blue">
                {icon}
              </span>
            )}
            {title}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="grid h-7 w-7 flex-none cursor-pointer place-items-center rounded-md text-rp-mute hover:bg-rp-bg hover:text-rp-ink"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
