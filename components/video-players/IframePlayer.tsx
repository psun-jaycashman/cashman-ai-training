'use client';
import { forwardRef, useImperativeHandle } from 'react';
import { ExternalLink, PlayCircle } from 'lucide-react';
import type { VideoPlayerHandle } from './UploadedPlayer';

interface Props { url: string }

function prettyDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'external site';
  }
}

/**
 * Fallback renderer for `source: external` videos that aren't YouTube or Vimeo.
 *
 * Many external hosts (Descript, Loom shares, corporate SharePoint, etc.) send
 * `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`,
 * which means a browser will refuse to render them in an iframe regardless of
 * our own CSP. Rather than serve a silently-blank iframe, we show a clear card
 * that opens the video in a new tab — the one action that reliably works.
 */
const IframePlayer = forwardRef<VideoPlayerHandle, Props>(function IframePlayer({ url }, ref) {
  useImperativeHandle(ref, () => ({ seekTo: () => {}, getDuration: () => 0 }), []);
  const domain = prettyDomain(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group relative flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-900 to-gray-800 text-white transition-opacity hover:opacity-95"
    >
      <PlayCircle className="h-16 w-16 text-white/80 transition-transform group-hover:scale-110" />
      <div className="flex flex-col items-center gap-1 px-6 text-center">
        <span className="text-sm text-gray-300">Hosted externally</span>
        <span className="inline-flex items-center gap-1.5 text-base font-semibold">
          Watch on {domain}
          <ExternalLink className="h-4 w-4" />
        </span>
        <span className="mt-1 max-w-md text-xs text-gray-400">
          This host doesn&apos;t allow embedding, so the video opens in a new tab.
        </span>
      </div>
    </a>
  );
});

export default IframePlayer;
