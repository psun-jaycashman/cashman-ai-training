import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/auth-middleware', () => ({ requireAuthWithTokenExchange: vi.fn() }));
vi.mock('@/lib/data-api-client', () => ({ ensureDataDocuments: vi.fn() }));
vi.mock('@/lib/video-data-api', () => ({
  getVideoProgress: vi.fn(),
  upsertVideoProgress: vi.fn(),
  getVideoById: vi.fn(),
}));

import { GET, PUT } from './route';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { getVideoProgress, upsertVideoProgress, getVideoById } from '@/lib/video-data-api';

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

describe('GET progress', () => {
  it('returns progress record when present', async () => {
    vi.mocked(getVideoProgress).mockResolvedValue({ id: 'p1', positionSeconds: 42 } as never);
    const res = await GET(new NextRequest('http://localhost'), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.progress.positionSeconds).toBe(42);
  });

  it('returns null progress when none exists', async () => {
    vi.mocked(getVideoProgress).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://localhost'), { params });
    const body = await res.json();
    expect(body.progress).toBeNull();
  });
});

describe('PUT progress', () => {
  const req = (body: unknown) => new NextRequest('http://localhost', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  it('upserts with visitorId from auth', async () => {
    vi.mocked(getVideoById).mockResolvedValue({ id: 'v1', moduleId: 'mod-1', lessonId: 'les-1' } as never);
    vi.mocked(upsertVideoProgress).mockResolvedValue({ id: 'p1', positionSeconds: 30 } as never);
    const res = await PUT(req({ positionSeconds: 30, durationSeconds: 600 }), { params });
    expect(res.status).toBe(200);
    expect(upsertVideoProgress).toHaveBeenCalledWith('t', 'tvp', expect.objectContaining({
      visitorId: 'u1', videoId: 'v1', moduleId: 'mod-1', lessonId: 'les-1',
      positionSeconds: 30, durationSeconds: 600,
    }));
  });

  it('400 for invalid body', async () => {
    const res = await PUT(req({ positionSeconds: -1 }), { params });
    expect(res.status).toBe(400);
  });

  it('404 when video not found', async () => {
    vi.mocked(getVideoById).mockResolvedValue(null);
    const res = await PUT(req({ positionSeconds: 1, durationSeconds: 100 }), { params });
    expect(res.status).toBe(404);
  });
});
