import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/video-admin-role', () => ({ requireAdmin: vi.fn() }));
vi.mock('@/lib/data-api-client', () => ({ ensureDataDocuments: vi.fn() }));
vi.mock('@/lib/video-data-api', () => ({
  updateVideo: vi.fn(),
  deleteVideo: vi.fn(),
  getVideoById: vi.fn(),
}));

import { PATCH, DELETE } from './route';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { updateVideo, deleteVideo, getVideoById } from '@/lib/video-data-api';

const auth = { ssoToken: null, apiToken: 't', userId: 'u1', roles: ['admin'], isTestUser: false };
const params = Promise.resolve({ id: 'v1' });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAdmin).mockResolvedValue(auth);
  vi.mocked(ensureDataDocuments).mockResolvedValue({
    progress: 'p', quizScores: 'q', badges: 'b', activityResponses: 'a',
    trainingVideos: 'tv', trainingVideoProgress: 'tvp',
  });
});

describe('PATCH', () => {
  const req = (body: unknown) => new NextRequest('http://localhost/api/admin/training-videos/v1', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  it('updates editable fields', async () => {
    vi.mocked(getVideoById).mockResolvedValue({ id: 'v1' } as never);
    const res = await PATCH(req({ title: 'New' }), { params });
    expect(res.status).toBe(200);
    expect(updateVideo).toHaveBeenCalledWith('t', 'tv', 'v1', { title: 'New' });
  });

  it('rejects immutable fields', async () => {
    const res = await PATCH(req({ source: 'external' }), { params });
    expect(res.status).toBe(400);
    expect(updateVideo).not.toHaveBeenCalled();
  });

  it('returns 404 when video not found', async () => {
    vi.mocked(getVideoById).mockResolvedValue(null);
    const res = await PATCH(req({ title: 'N' }), { params });
    expect(res.status).toBe(404);
  });
});

describe('DELETE', () => {
  it('deletes video', async () => {
    vi.mocked(getVideoById).mockResolvedValue({ id: 'v1' } as never);
    const res = await DELETE(new NextRequest('http://localhost/api/admin/training-videos/v1', { method: 'DELETE' }), { params });
    expect(res.status).toBe(204);
    expect(deleteVideo).toHaveBeenCalledWith('t', 'tv', 'v1');
  });

  it('returns 404 when missing', async () => {
    vi.mocked(getVideoById).mockResolvedValue(null);
    const res = await DELETE(new NextRequest('http://localhost/api/admin/training-videos/v1', { method: 'DELETE' }), { params });
    expect(res.status).toBe(404);
  });
});
