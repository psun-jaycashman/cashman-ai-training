'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, X } from 'lucide-react';
import { youtubeEmbedUrl, youtubeThumbnailUrl } from '@/lib/youtube';

interface HoverState {
  videoId: string;
  title: string;
  rect: DOMRect;
}

/**
 * Drop this component anywhere a markdown-rendered region exists. It walks
 * the given container for `<a data-yt-video-id="...">` anchors (added by
 * the markdown→html step) and attaches:
 *   - hover preview: a small card with the YouTube thumbnail + title
 *   - click → modal: an in-page iframe player so the user never leaves the page
 *
 * No external API calls — thumbnails come straight from i.ytimg.com.
 */
export default function YoutubeLinkEnhancer({
  containerRef,
  contentKey,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  // Bumping this re-runs the attach effect — pass the lesson id (or any
  // value that changes when the rendered HTML changes) so handlers get
  // wired up to the new DOM after a content swap.
  contentKey?: string | number;
}) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  // Wire up handlers on every YouTube anchor inside the container. Re-runs
  // whenever the container's HTML changes (e.g., a new lesson loaded).
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const anchors = root.querySelectorAll<HTMLAnchorElement>('a[data-yt-video-id]');
    const cleanups: Array<() => void> = [];

    anchors.forEach((a) => {
      const videoId = a.getAttribute('data-yt-video-id');
      if (!videoId) return;
      const title = a.getAttribute('data-yt-title') || a.textContent?.trim() || 'YouTube video';

      // Style the link so users know it's enhanced. Existing className stays;
      // we just add a tiny play-pill on the right via a sibling element.
      a.classList.add('yt-link');

      const onEnter = () => {
        if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
        const rect = a.getBoundingClientRect();
        setHover({ videoId, title, rect });
      };
      const onLeave = () => {
        // Small delay so the user can move the cursor onto the card if they
        // want to read more without it disappearing instantly.
        hoverTimeoutRef.current = window.setTimeout(() => setHover(null), 120);
      };
      const onClick = (e: MouseEvent) => {
        // Modifier-clicks → let the browser handle (open in new tab).
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        setHover(null);
        setOpenVideoId(videoId);
      };

      a.addEventListener('mouseenter', onEnter);
      a.addEventListener('mouseleave', onLeave);
      a.addEventListener('click', onClick);
      cleanups.push(() => {
        a.removeEventListener('mouseenter', onEnter);
        a.removeEventListener('mouseleave', onLeave);
        a.removeEventListener('click', onClick);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
      if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    };
  }, [containerRef, contentKey]);

  // Esc closes the modal.
  useEffect(() => {
    if (!openVideoId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenVideoId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openVideoId]);

  // Lock body scroll while modal is open.
  useEffect(() => {
    if (!openVideoId) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [openVideoId]);

  return (
    <>
      {hover && <HoverCard hover={hover} onMouseEnter={() => {
        if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
      }} onMouseLeave={() => setHover(null)} />}
      {openVideoId && (
        <PlayerModal videoId={openVideoId} onClose={() => setOpenVideoId(null)} />
      )}
    </>
  );
}

function HoverCard({
  hover,
  onMouseEnter,
  onMouseLeave,
}: {
  hover: HoverState;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const cardWidth = 320;
  const cardHeight = 220;
  const margin = 12;

  // Position above the anchor when there's room, else below. Clamp to viewport.
  let top = hover.rect.top - cardHeight - margin;
  if (top < 8) top = hover.rect.bottom + margin;

  let left = hover.rect.left + hover.rect.width / 2 - cardWidth / 2;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  left = Math.max(8, Math.min(left, vw - cardWidth - 8));

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      style={{ top, left, width: cardWidth }}
      className="fixed z-[60] rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden pointer-events-auto"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative aspect-video bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youtubeThumbnailUrl(hover.videoId)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white" />
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
          {hover.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Click to play in this page · YouTube
        </p>
      </div>
    </div>,
    document.body,
  );
}

function PlayerModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-10 right-0 inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white"
        >
          <X className="w-4 h-4" /> Close
        </button>
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl">
          <iframe
            src={youtubeEmbedUrl(videoId)}
            title="YouTube video player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
