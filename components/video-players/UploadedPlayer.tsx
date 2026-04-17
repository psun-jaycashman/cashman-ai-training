'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  getDuration: () => number;
}

interface Props {
  src: string;
  mimeType: string;
  videoId: string;
  onTimeUpdate: (position: number, duration: number) => void;
  onRefreshUrl: () => Promise<string>;
}

const UploadedPlayer = forwardRef<VideoPlayerHandle, Props>(function UploadedPlayer(
  { src, mimeType, videoId, onTimeUpdate, onRefreshUrl }, ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const refreshingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      const v = videoRef.current;
      if (v) v.currentTime = seconds;
    },
    getDuration: () => videoRef.current?.duration ?? 0,
  }), []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const handleTimeUpdate = () => onTimeUpdate(el.currentTime, el.duration || 0);
    const handleError = async () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      try {
        const lastTime = el.currentTime;
        const freshUrl = await onRefreshUrl();
        el.src = freshUrl;
        el.currentTime = lastTime;
        await el.play().catch(() => {});
      } catch (err) {
        console.error('[video] refresh failed', err);
      } finally {
        refreshingRef.current = false;
      }
    };
    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('error', handleError);
    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, onRefreshUrl]);

  return (
    <video
      ref={videoRef}
      controls
      preload="metadata"
      className="w-full h-full"
      data-video-id={videoId}
    >
      <source src={src} type={mimeType} />
    </video>
  );
});

export default UploadedPlayer;
