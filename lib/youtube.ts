/**
 * Extract a YouTube video ID from any common URL shape:
 *   https://www.youtube.com/watch?v=ID            (with or without extra params)
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/v/ID
 *
 * Returns null when the URL isn't a recognizable YouTube link.
 */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url, 'https://placeholder.invalid');
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const id = parsed.pathname.replace(/^\/+/, '').split('/')[0];
    return isValidId(id) ? id : null;
  }
  if (host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'youtube-nocookie.com') {
    return null;
  }
  const v = parsed.searchParams.get('v');
  if (v && isValidId(v)) return v;
  const path = parsed.pathname.split('/').filter(Boolean);
  if (path.length >= 2 && (path[0] === 'embed' || path[0] === 'shorts' || path[0] === 'v')) {
    return isValidId(path[1]) ? path[1] : null;
  }
  return null;
}

function isValidId(id: string | undefined | null): id is string {
  return !!id && /^[A-Za-z0-9_-]{6,20}$/.test(id);
}

/**
 * Standard YouTube thumbnail URL. `hqdefault.jpg` is available for every
 * public video and loads from the Google CDN — no API key needed.
 */
export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Privacy-enhanced embed URL. Sets autoplay + rel=0 (no related videos)
 * and uses youtube-nocookie.com so we don't drop tracking cookies on the
 * lesson page until the user explicitly opens the player.
 */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}
