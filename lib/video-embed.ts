import type { ExternalVideoProvider } from './types';

function requireUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Invalid URL: ${raw}`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Unsupported protocol: ${url.protocol}`);
  }
  return url;
}

export function detectProvider(raw: string): ExternalVideoProvider {
  const url = requireUrl(raw);
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    return 'youtube';
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    return 'vimeo';
  }
  return 'other';
}

export function extractYouTubeId(raw: string): string | null {
  try {
    const url = requireUrl(raw);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1);
      return id || null;
    }
    // watch?v= form
    const v = url.searchParams.get('v');
    if (v) return v;
    // /shorts/ID or /embed/ID
    const match = url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function extractVimeoId(raw: string): string | null {
  try {
    const url = requireUrl(raw);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'vimeo.com') {
      const match = url.pathname.match(/^\/(\d+)/);
      return match ? match[1] : null;
    }
    if (host === 'player.vimeo.com') {
      const match = url.pathname.match(/^\/video\/(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function toEmbedUrl(raw: string): string {
  const provider = detectProvider(raw);
  if (provider === 'youtube') {
    const id = extractYouTubeId(raw);
    if (!id) throw new Error('Could not extract YouTube video id');
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (provider === 'vimeo') {
    const id = extractVimeoId(raw);
    if (!id) throw new Error('Could not extract Vimeo video id');
    return `https://player.vimeo.com/video/${id}`;
  }
  return raw;
}
