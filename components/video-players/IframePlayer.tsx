'use client';
import { forwardRef, useImperativeHandle } from 'react';
import type { VideoPlayerHandle } from './UploadedPlayer';

interface Props { url: string }

const IframePlayer = forwardRef<VideoPlayerHandle, Props>(function IframePlayer({ url }, ref) {
  useImperativeHandle(ref, () => ({ seekTo: () => {}, getDuration: () => 0 }), []);
  return (
    <div className="relative w-full h-full">
      <iframe src={url} className="w-full h-full" allow="autoplay; fullscreen" />
      <a
        href={url} target="_blank" rel="noreferrer"
        className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded"
      >
        Open in new tab
      </a>
    </div>
  );
});

export default IframePlayer;
