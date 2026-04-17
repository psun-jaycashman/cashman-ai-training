import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VideoPlayer from './VideoPlayer';
import type { TrainingVideoWithPlayback } from '@/lib/types';

// Mock the player adapters so tests don't load real SDKs
vi.mock('./video-players/UploadedPlayer', () => ({
  default: () => <div data-testid="uploaded-player" />,
}));
vi.mock('./video-players/YouTubePlayer', () => ({
  default: () => <div data-testid="youtube-player" />,
}));
vi.mock('./video-players/VimeoPlayer', () => ({
  default: () => <div data-testid="vimeo-player" />,
}));
vi.mock('./video-players/IframePlayer', () => ({
  default: () => <div data-testid="iframe-player" />,
}));

const uploadedVideo: TrainingVideoWithPlayback = {
  id: 'v1', moduleId: 'mod-1', title: 'Intro', source: 'uploaded',
  fileId: 'f1', mimeType: 'video/mp4', order: 0,
  uploadedBy: 'u', uploadedAt: '2026-04-17T00:00:00Z',
  playback: { kind: 'uploaded', url: 'https://minio/x', mimeType: 'video/mp4', expiresAt: '2099' },
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ progress: null }) }) as never;
});
afterEach(() => { vi.restoreAllMocks(); });

describe('VideoPlayer', () => {
  it('renders UploadedPlayer for uploaded source', async () => {
    render(<VideoPlayer video={uploadedVideo} />);
    await waitFor(() => expect(screen.getByTestId('uploaded-player')).toBeTruthy());
  });

  it('renders YouTubePlayer for youtube external', async () => {
    const v: TrainingVideoWithPlayback = {
      ...uploadedVideo,
      source: 'external',
      externalUrl: 'https://youtu.be/abc', externalProvider: 'youtube',
      playback: { kind: 'external', provider: 'youtube', url: 'https://youtu.be/abc' },
    };
    render(<VideoPlayer video={v} />);
    await waitFor(() => expect(screen.getByTestId('youtube-player')).toBeTruthy());
  });

  it('shows resume prompt when progress has partial position', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true, json: async () => ({ progress: { positionSeconds: 154, durationSeconds: 600, completed: false } }),
    });
    render(<VideoPlayer video={uploadedVideo} />);
    await waitFor(() => expect(screen.getByText(/Resume from/)).toBeTruthy());
    expect(screen.getByText(/2:34/)).toBeTruthy();
  });

  it('does not show resume prompt when completed', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true, json: async () => ({ progress: { positionSeconds: 580, durationSeconds: 600, completed: true } }),
    });
    render(<VideoPlayer video={uploadedVideo} />);
    // Give the effect a tick, then assert prompt is absent
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText(/Resume from/)).toBeNull();
  });
});
