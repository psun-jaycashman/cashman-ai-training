'use client';
import { forwardRef, useImperativeHandle } from 'react';
import type { VideoPlayerHandle } from './UploadedPlayer';
import { toEmbedUrl } from '@/lib/video-embed';

interface Props { url: string }

/**
 * Renders a Descript share inside an iframe pointed at the embed URL form.
 *
 * Descript doesn't expose a postMessage timeupdate API, so progress tracking
 * is unavailable — the 95% completion threshold won't trip from here. Treat
 * Descript videos as supplementary, not as gating content for the
 * certificate.
 */
const DescriptPlayer = forwardRef<VideoPlayerHandle, Props>(function DescriptPlayer({ url }, ref) {
  useImperativeHandle(ref, () => ({ seekTo: () => {}, getDuration: () => 0 }), []);
  const src = toEmbedUrl(url);
  return (
    <iframe
      src={src}
      title="Descript video"
      className="h-full w-full"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
});

export default DescriptPlayer;
