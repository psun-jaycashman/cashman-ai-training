import { describe, it, expect } from 'vitest';
import { detectProvider, toEmbedUrl, extractYouTubeId, extractVimeoId } from './video-embed';

describe('detectProvider', () => {
  it('detects youtube.com', () => {
    expect(detectProvider('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
  });
  it('detects youtu.be', () => {
    expect(detectProvider('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
  });
  it('detects vimeo', () => {
    expect(detectProvider('https://vimeo.com/76979871')).toBe('vimeo');
  });
  it('detects vimeo player domain', () => {
    expect(detectProvider('https://player.vimeo.com/video/76979871')).toBe('vimeo');
  });
  it('returns other for arbitrary https urls', () => {
    expect(detectProvider('https://example.com/video.mp4')).toBe('other');
  });
  it('throws for non-http(s) urls', () => {
    expect(() => detectProvider('ftp://example.com/a.mp4')).toThrow();
    expect(() => detectProvider('not a url')).toThrow();
  });
});

describe('extractYouTubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s', 'dQw4w9WgXcQ'],
  ])('extracts id from %s', (url, id) => {
    expect(extractYouTubeId(url)).toBe(id);
  });
  it('returns null when no id present', () => {
    expect(extractYouTubeId('https://www.youtube.com/')).toBeNull();
  });
});

describe('extractVimeoId', () => {
  it('extracts from vimeo.com/NNN', () => {
    expect(extractVimeoId('https://vimeo.com/76979871')).toBe('76979871');
  });
  it('extracts from player.vimeo.com/video/NNN', () => {
    expect(extractVimeoId('https://player.vimeo.com/video/76979871')).toBe('76979871');
  });
  it('returns null when no id', () => {
    expect(extractVimeoId('https://vimeo.com/')).toBeNull();
  });
});

describe('toEmbedUrl', () => {
  it('returns youtube-nocookie embed for youtube', () => {
    expect(toEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe('https://www.youtube-nocookie.com/embed/abc123');
  });
  it('returns vimeo player embed for vimeo', () => {
    expect(toEmbedUrl('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871');
  });
  it('returns the original url for other', () => {
    expect(toEmbedUrl('https://example.com/video')).toBe('https://example.com/video');
  });
});
