/** Inline SVG icons ported from the original app, sized via the `size` prop. */
type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
});

export const DashboardIcon = ({ size = 19, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const TemplatesIcon = ({ size = 19, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const VideoIcon = ({ size = 19, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M16 10l6-3v10l-6-3" />
  </svg>
);

export const ConsentIcon = ({ size = 19, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

export const MicIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <path d="M12 19v4" />
  </svg>
);

export const ScreenIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

export const InviteIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M22 11h-6" />
  </svg>
);

export const PhoneIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path
      d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.13.94.36 1.87.7 2.81a2 2 0 01-.45 2.11L8.09 11"
      transform="rotate(135 12 12)"
    />
  </svg>
);

export const StatVideoIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M16 10l6-3v10l-6-3" />
  </svg>
);

export const StatPlayIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

export const StatCheckIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

export const StatMeetIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

/* ---------- Editor icon set ---------- */

export const PlusIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.25} className={className}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

export const SearchIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" strokeLinecap="round" />
  </svg>
);

export const CloseIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.25} className={className}>
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
);

export const CheckCircleIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.2l2.4 2.4L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WarningIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} strokeLinejoin="round" className={className}>
    <path d="M10.3 4.2L2.9 17a2 2 0 001.7 3h14.8a2 2 0 001.7-3L13.7 4.2a2 2 0 00-3.4 0z" />
    <path d="M12 9.5v4.2" strokeLinecap="round" />
    <path d="M12 17h.01" strokeLinecap="round" />
  </svg>
);

export const PlayIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
  </svg>
);

export const StopIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor" />
  </svg>
);

export const DownloadIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M4 19.5h16" />
  </svg>
);

export const StarIcon = ({ size = 16, className, filled = false }: IconProps & { filled?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2.8l2.87 5.9 6.4.94-4.64 4.6 1.1 6.46L12 17.7l-5.73 3 1.1-6.46-4.64-4.6 6.4-.94z" />
  </svg>
);

export const MusicIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </svg>
);

export const TextIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" className={className}>
    <path d="M5 6.5h14" />
    <path d="M12 6.5V18" />
    <path d="M9 18h6" />
  </svg>
);

export const ImageIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="8.5" cy="9.5" r="1.75" />
    <path d="M21 16l-5.5-5.5a2 2 0 00-2.8 0L3 20" strokeLinecap="round" />
  </svg>
);

export const GroupIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="8" height="8" rx="1.75" />
    <rect x="13" y="3" width="8" height="8" rx="1.75" />
    <rect x="3" y="13" width="8" height="8" rx="1.75" />
    <rect x="13" y="13" width="8" height="8" rx="1.75" />
  </svg>
);

export const DuplicateIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
    <path d="M15.5 8.5V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8.5a2 2 0 002 2h2.5" />
  </svg>
);

export const ArrowUpIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 19V5" />
    <path d="M6 11l6-6 6 6" />
  </svg>
);

export const ArrowDownIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5v14" />
    <path d="M18 13l-6 6-6-6" />
  </svg>
);

export const AlignLeftIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" className={className}>
    <path d="M4 3v18" />
    <path d="M8 8h11" />
    <path d="M8 16h7" />
  </svg>
);

export const AlignCenterHIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" className={className}>
    <path d="M12 3v18" />
    <path d="M5.5 8h13" />
    <path d="M7.5 16h9" />
  </svg>
);

export const AlignRightIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" className={className}>
    <path d="M20 3v18" />
    <path d="M5 8h11" />
    <path d="M9 16h7" />
  </svg>
);

export const AlignTopIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" className={className}>
    <path d="M3 4h18" />
    <path d="M8 8v11" />
    <path d="M16 8v7" />
  </svg>
);

export const AlignCenterVIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" className={className}>
    <path d="M3 12h18" />
    <path d="M8 5.5v13" />
    <path d="M16 7.5v9" />
  </svg>
);

export const AlignBottomIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" className={className}>
    <path d="M3 20h18" />
    <path d="M8 16V5" />
    <path d="M16 16V9" />
  </svg>
);

export const ScissorsIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="6" cy="6.5" r="2.5" />
    <circle cx="6" cy="17.5" r="2.5" />
    <path d="M8.5 8.2L20 19" />
    <path d="M20 5L8.5 15.8" />
  </svg>
);

export const SwapIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 7h13l-3-3" />
    <path d="M20 17H7l3 3" />
  </svg>
);

export const LockIcon = ({ size = 11, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2.5" />
    <path
      d="M8 11V8a4 4 0 118 0v3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </svg>
);

export const RecordDotIcon = ({ size = 10, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="9" fill="currentColor" />
  </svg>
);

export const SparkleIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.5l1.8 5.4 5.4 1.8-5.4 1.8L12 17 10.2 11.5 4.8 9.7l5.4-1.8z" />
  </svg>
);

export const TrashIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 7h16" />
    <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
    <path d="M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
