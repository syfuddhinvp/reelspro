import { fitBox, loadImageSize, loadVideoSize } from './util.ts';

/** Media asset kinds that carry an upload size cap and get boxed to their source aspect ratio. */
export type UploadKind = 'image' | 'logo' | 'global-logo' | 'video';

/** Max upload size per kind — image/logo assets share the "image" cap. */
export const MAX_UPLOAD_MB: Record<UploadKind, number> = {
  image: 20,
  logo: 20,
  'global-logo': 20,
  video: 200,
};

/** `null` if the file is within its kind's cap, otherwise a user-facing message. */
export function uploadSizeError(kind: UploadKind, file: File): string | null {
  const cap = MAX_UPLOAD_MB[kind];
  if (file.size > cap * 1024 * 1024) {
    return `${file.name} is over the ${cap}MB limit for ${kind === 'video' ? 'video' : 'image'} uploads`;
  }
  return null;
}

/** Box the freshly-picked file's aspect ratio into a sane on-canvas size, no crop. */
export async function boxForFile(kind: UploadKind, url: string): Promise<{ w: number; h: number } | undefined> {
  try {
    if (kind === 'video') {
      const { w, h } = await loadVideoSize(url);
      return fitBox(w, h, 240, 320);
    }
    const { w, h } = await loadImageSize(url);
    const cap = kind === 'image' ? 220 : 120;
    return fitBox(w, h, cap, cap);
  } catch {
    return undefined;
  }
}
