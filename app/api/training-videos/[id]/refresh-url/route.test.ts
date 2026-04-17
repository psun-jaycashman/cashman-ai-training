import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/auth-middleware', () => ({ requireAuthWithTokenExchange: vi.fn() }));
vi.mock('@/lib/data-api-client', () => ({ ensureDataDocuments: vi.fn() }));
vi.mock('@/lib/video-data-api', () => ({ getVideoById: vi.fn() }));
vi.mock('@jazzmind/busibox-app', () => ({ getChatAttachmentUrl: vi.fn() }));

import { GET } from './route';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { getVideoById } from '@/lib/video-data-api';
import { getChatAttachmentUrl } from '@jazzmind/busibox-app';

const auth = { ssoToken: null, apiToken: 't', userId: 'u1', roles: [], isTestUser: false };
const params = Promise.resolve({ id: 'v1' });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuthWithTokenExchange).mockResolvedValue(auth);
  vi.mocked(ensureDataDocuments).mockResolvedValue({
    progress: 'p', quizScores: 'q', badges: 'b', activityResponses: 'a',
    trainingVideos: 'tv', trainingVideoProgress: 'tvp',
  });
});

describe('GET refresh-url', () => {
  it('returns fresh presigned url for uploaded video', async () => {
    vi.mocked(getVideoById).mockResolvedValue({ id: 'v1', source: 'uploaded', fileId: 'f1', mimeType: 'video/mp4' } as never);
    vi.mocked(getChatAttachmentUrl).mockResolvedValue('https://minio/fresh');
    const res = await GET(new NextRequest('http://localhost'), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('https://minio/fresh');
  });

  it('400 for external videos', async () => {
    vi.mocked(getVideoById).mockResolvedValue({ id: 'v1', source: 'external', externalUrl: 'x' } as never);
    const res = await GET(new NextRequest('http://localhost'), { params });
    expect(res.status).toBe(400);
  });

  it('404 when missing', async () => {
    vi.mocked(getVideoById).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://localhost'), { params });
    expect(res.status).toBe(404);
  });
});
