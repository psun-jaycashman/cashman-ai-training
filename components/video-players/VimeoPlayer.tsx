'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Player from '@vimeo/player';
import type { VideoPlayerHandle } from './UploadedPlayer';
import { extractVimeoId } from '@/lib/video-embed';

interface Props {
  url: string;
  onTimeUpdate: (position: number, duration: number) => void;
}

const VimeoPlayer = forwardRef<VideoPlayerHandle, Props>(function VimeoPlayer(
  { url, onTimeUpdate }, ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (s) => { playerRef.current?.setCurrentTime(s).catch(() => {}); },
    getDuration: () => 0, // async in Vimeo; use onTimeUpdate duration instead
  }), []);

  useEffect(() => {
    const id = extractVimeoId(url);
    if (!id || !containerRef.current) return;
    const player = new Player(containerRef.current, { id: Number(id), responsive: true });
    playerRef.current = player;

    const interval = setInterval(async () => {
      try {
        const [time, duration] = await Promise.all([player.getCurrentTime(), player.getDuration()]);
        onTimeUpdate(time, duration);
      } catch { /* player not ready */ }
    }, 5000);

    return () => { clearInterval(interval); player.destroy().catch(() => {}); };
  }, [url, onTimeUpdate]);

  return <div ref={containerRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />;
});

export default VimeoPlayer;
