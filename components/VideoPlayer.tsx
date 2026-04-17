'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import UploadedPlayer, { type VideoPlayerHandle } from './video-players/UploadedPlayer';
import YouTubePlayer from './video-players/YouTubePlayer';
import VimeoPlayer from './video-players/VimeoPlayer';
import IframePlayer from './video-players/IframePlayer';
import type { TrainingVideoWithPlayback, VideoProgress } from '@/lib/types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const WRITE_DEBOUNCE_MS = 5000;

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  video: TrainingVideoWithPlayback;
}

export default function VideoPlayer({ video }: Props) {
  const [, setResume] = useState<VideoProgress | null>(null);
  const [prompt, setPrompt] = useState<{ position: number } | null>(null);
  const playerRef = useRef<VideoPlayerHandle>(null);
  const pendingWrite = useRef<{ position: number; duration: number } | null>(null);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${basePath}/api/training-videos/${video.id}/progress`, { credentials: 'include' });
        if (!res.ok || cancelled) return;
        const { progress } = await res.json() as { progress: VideoProgress | null };
        if (!progress) return;
        setResume(progress);
        if (!progress.completed && progress.positionSeconds > 0 && progress.positionSeconds < progress.durationSeconds) {
          setPrompt({ position: progress.positionSeconds });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [video.id]);

  const flushWrite = useCallback(async () => {
    const pending = pendingWrite.current;
    if (!pending) return;
    pendingWrite.current = null;
    try {
      await fetch(`${basePath}/api/training-videos/${video.id}/progress`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(pending),
      });
    } catch { /* ignore */ }
  }, [video.id]);

  const handleTimeUpdate = useCallback((position: number, duration: number) => {
    if (!Number.isFinite(position) || !Number.isFinite(duration)) return;
    pendingWrite.current = { position, duration };
    if (writeTimer.current) return;
    writeTimer.current = setTimeout(async () => {
      writeTimer.current = null;
      await flushWrite();
    }, WRITE_DEBOUNCE_MS);
  }, [flushWrite]);

  const refreshUrl = useCallback(async (): Promise<string> => {
    const res = await fetch(`${basePath}/api/training-videos/${video.id}/refresh-url`, { credentials: 'include' });
    if (!res.ok) throw new Error('refresh failed');
    const { url } = await res.json() as { url: string };
    return url;
  }, [video.id]);

  useEffect(() => {
    const onHide = () => { void flushWrite(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onHide);
      void flushWrite();
    };
  }, [flushWrite]);

  const handleResume = () => {
    if (prompt && playerRef.current) playerRef.current.seekTo(prompt.position);
    setPrompt(null);
  };
  const handleStartOver = () => {
    if (playerRef.current) playerRef.current.seekTo(0);
    setPrompt(null);
  };

  const inner = (() => {
    if (video.playback.kind === 'uploaded') {
      return (
        <UploadedPlayer
          ref={playerRef}
          src={video.playback.url}
          mimeType={video.playback.mimeType}
          videoId={video.id}
          onTimeUpdate={handleTimeUpdate}
          onRefreshUrl={refreshUrl}
        />
      );
    }
    if (video.playback.provider === 'youtube') {
      return <YouTubePlayer ref={playerRef} url={video.playback.url} onTimeUpdate={handleTimeUpdate} />;
    }
    if (video.playback.provider === 'vimeo') {
      return <VimeoPlayer ref={playerRef} url={video.playback.url} onTimeUpdate={handleTimeUpdate} />;
    }
    return <IframePlayer ref={playerRef} url={video.playback.url} />;
  })();

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {inner}
        {prompt && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/80 text-white text-sm rounded px-3 py-2 flex items-center justify-between gap-3">
            <span>Resume from {formatTime(prompt.position)}?</span>
            <div className="flex gap-2">
              <button onClick={handleResume} className="px-2 py-1 bg-indigo-500 rounded">Resume</button>
              <button onClick={handleStartOver} className="px-2 py-1 bg-gray-600 rounded">Start over</button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{video.title}</h3>
        {video.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{video.description}</p>}
      </div>
    </div>
  );
}
