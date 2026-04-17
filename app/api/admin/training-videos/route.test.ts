import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/video-admin-role', () => ({ requireAdmin: vi.fn() }));
vi.mock('@/lib/data-api-client', () => ({ ensureDataDocuments: vi.fn() }));
vi.mock('@/lib/video-data-api', () => ({
  insertVideo: vi.fn(),
  listAllVideos: vi.fn(),
}));

import { POST, GET } from './route';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { insertVideo, listAllVideos } from '@/lib/video-data-api';

const adminAuth = { ssoToken: null, apiToken: 't', userId: 'u1', roles: ['admin'], isTestUser: false };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAdmin).mockResolvedValue(adminAuth);
  vi.mocked(ensureDataDocuments).mockResolvedValue({
    progress: 'p', quizScores: 'q', badges: 'b', activityResponses: 'a',
    trainingVideos: 'tv', trainingVideoProgress: 'tvp',
  });
});

const jsonReq = (body: unknown) =>
  new NextRequest('http://localhost/api/admin/training-videos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST (external link branch)', () => {
  it('returns 403 for non-admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue(NextResponse.json({ error: 'x' }, { status: 403 }));
    const res = await POST(jsonReq({}));
    expect(res.status).toBe(403);
  });

  it('validates required fields', async () => {
    const res = await POST(jsonReq({ source: 'external' /* missing url, moduleId, title */ }));
    expect(res.status).toBe(400);
  });

  it('derives provider from youtube url', async () => {
    vi.mocked(insertVideo).mockResolvedValue({
      id: 'v1', moduleId: 'mod-1', title: 't', source: 'external',
      externalUrl: 'https://youtu.be/abc', externalProvider: 'youtube',
      order: 0, uploadedBy: 'u1', uploadedAt: '2026-04-17T00:00:00Z',
    });
    const res = await POST(jsonReq({
      source: 'external', externalUrl: 'https://youtu.be/abc', moduleId: 'mod-1', title: 'Intro',
    }));
    expect(res.status).toBe(201);
    expect(vi.mocked(insertVideo).mock.calls[0][2]).toMatchObject({
      externalProvider: 'youtube',
      externalUrl: 'https://youtu.be/abc',
    });
  });

  it('rejects ftp:// url', async () => {
    const res = await POST(jsonReq({
      source: 'external', externalUrl: 'ftp://bad/url', moduleId: 'mod-1', title: 't',
    }));
    expect(res.status).toBe(400);
  });
});

describe('GET', () => {
  it('returns 403 for non-admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue(NextResponse.json({ error: 'x' }, { status: 403 }));
    const res = await GET(new NextRequest('http://localhost/api/admin/training-videos'));
    expect(res.status).toBe(403);
  });

  it('returns videos with filters', async () => {
    vi.mocked(listAllVideos).mockResolvedValue([]);
    const res = await GET(new NextRequest('http://localhost/api/admin/training-videos?moduleId=mod-1'));
    expect(res.status).toBe(200);
    expect(vi.mocked(listAllVideos)).toHaveBeenCalledWith('t', 'tv', { moduleId: 'mod-1', lessonId: undefined });
  });
});
