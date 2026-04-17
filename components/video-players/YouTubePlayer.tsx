'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { VideoPlayerHandle } from './UploadedPlayer';
import { extractYouTubeId } from '@/lib/video-embed';

interface Props {
  url: string;
  onTimeUpdate: (position: number, duration: number) => void;
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}
interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
}

let ytApiLoaded: Promise<void> | null = null;
function loadYTApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiLoaded) return ytApiLoaded;
  ytApiLoaded = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return ytApiLoaded;
}

const YouTubePlayer = forwardRef<VideoPlayerHandle, Props>(function YouTubePlayer(
  { url, onTimeUpdate }, ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (s) => playerRef.current?.seekTo(s, true),
    getDuration: () => playerRef.current?.getDuration() ?? 0,
  }), []);

  useEffect(() => {
    const videoId = extractYouTubeId(url);
    if (!videoId || !containerRef.current) return;
    let interval: ReturnType<typeof setInterval> | null = null;

    loadYTApi().then(() => {
      if (!containerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { host: 'https://www.youtube-nocookie.com' },
        events: {
          onReady: () => {
            interval = setInterval(() => {
              const p = playerRef.current;
              if (!p) return;
              onTimeUpdate(p.getCurrentTime(), p.getDuration());
            }, 5000);
          },
        },
      });
    });

    return () => { if (interval) clearInterval(interval); };
  }, [url, onTimeUpdate]);

  return <div ref={containerRef} className="w-full h-full" />;
});

export default YouTubePlayer;
