import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/auth-middleware', () => ({ requireAuthWithTokenExchange: vi.fn() }));
vi.mock('@/lib/data-api-client', () => ({ ensureDataDocuments: vi.fn() }));
vi.mock('@/lib/video-data-api', () => ({
  listVideosForModule: vi.fn(),
  listVideosForLesson: vi.fn(),
}));
vi.mock('@jazzmind/busibox-app', () => ({ getChatAttachmentUrl: vi.fn() }));

import { GET } from './route';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { listVideosForModule, listVideosForLesson } from '@/lib/video-data-api';
import { getChatAttachmentUrl } from '@jazzmind/busibox-app';

const auth = { ssoToken: null, apiToken: 't', userId: 'u1', roles: [], isTestUser: false };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuthWithTokenExchange).mockResolvedValue(auth);
  vi.mocked(ensureDataDocuments).mockResolvedValue({
    progress: 'p', quizScores: 'q', badges: 'b', activityResponses: 'a',
    trainingVideos: 'tv', trainingVideoProgress: 'tvp',
  });
});

describe('GET /api/training-videos', () => {
  it('requires moduleId query', async () => {
    const res = await GET(new NextRequest('http://localhost/api/training-videos'));
    expect(res.status).toBe(400);
  });

  it('resolves playback URL for uploaded videos', async () => {
    vi.mocked(listVideosForModule).mockResolvedValue([{
      id: 'v1', moduleId: 'mod-1', title: 't', source: 'uploaded',
      fileId: 'f1', mimeType: 'video/mp4', order: 0,
      uploadedBy: 'u1', uploadedAt: '2026-04-17T00:00:00Z',
    } as never]);
    vi.mocked(getChatAttachmentUrl).mockResolvedValue('https://minio/presigned');
    const res = await GET(new NextRequest('http://localhost/api/training-videos?moduleId=mod-1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.videos[0].playback).toMatchObject({ kind: 'uploaded', url: 'https://minio/presigned' });
  });

  it('returns external URL for external videos (no presign call)', async () => {
    vi.mocked(listVideosForModule).mockResolvedValue([{
      id: 'v2', moduleId: 'mod-1', title: 't', source: 'external',
      externalUrl: 'https://youtu.be/xyz', externalProvider: 'youtube',
      order: 0, uploadedBy: 'u1', uploadedAt: '2026-04-17T00:00:00Z',
    } as never]);
    const res = await GET(new NextRequest('http://localhost/api/training-videos?moduleId=mod-1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.videos[0].playback).toMatchObject({ kind: 'external', provider: 'youtube', url: 'https://youtu.be/xyz' });
    expect(getChatAttachmentUrl).not.toHaveBeenCalled();
  });

  it('filters to lesson when lessonId provided', async () => {
    vi.mocked(listVideosForLesson).mockResolvedValue([]);
    await GET(new NextRequest('http://localhost/api/training-videos?moduleId=mod-1&lessonId=les-1'));
    expect(listVideosForLesson).toHaveBeenCalledWith('t', 'tv', 'mod-1', 'les-1');
  });
});
