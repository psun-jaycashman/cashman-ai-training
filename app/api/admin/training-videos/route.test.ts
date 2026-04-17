import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/video-admin-role', () => ({ requireAdmin: vi.fn() }));
vi.mock('@/lib/data-api-client', () => ({ ensureDataDocuments: vi.fn() }));
vi.mock('@/lib/video-data-api', () => ({
  insertVideo: vi.fn(),
  listAllVideos: vi.fn(),
}));
vi.mock('@jazzmind/busibox-app', () => ({
  uploadChatAttachment: vi.fn(),
  deleteChatAttachment: vi.fn(),
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

import { uploadChatAttachment, deleteChatAttachment } from '@jazzmind/busibox-app';

const multipartReq = (file: File, fields: Record<string, string>) => {
  const fd = new FormData();
  fd.set('file', file);
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return new NextRequest('http://localhost/api/admin/training-videos', {
    method: 'POST',
    body: fd,
  });
};

describe('POST (upload branch)', () => {
  it('returns 400 when file is missing', async () => {
    const fd = new FormData();
    fd.set('moduleId', 'mod-1');
    fd.set('title', 't');
    const req = new NextRequest('http://localhost/api/admin/training-videos', { method: 'POST', body: fd });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('uploads to MinIO and inserts record', async () => {
    vi.mocked(uploadChatAttachment).mockResolvedValue({
      fileId: 'f-minio', filename: 'intro.mp4', mimeType: 'video/mp4',
      sizeBytes: 12345, url: 'ignored',
    });
    vi.mocked(insertVideo).mockImplementation(async (_t, _d, input) =>
      ({ id: 'v-new', uploadedAt: '2026-04-17T00:00:00Z', ...input }) as never
    );
    const file = new File([new Uint8Array(100)], 'intro.mp4', { type: 'video/mp4' });
    const res = await POST(multipartReq(file, { moduleId: 'mod-1', title: 'Intro' }));
    expect(res.status).toBe(201);
    expect(vi.mocked(uploadChatAttachment)).toHaveBeenCalled();
    expect(vi.mocked(insertVideo).mock.calls[0][2]).toMatchObject({
      source: 'uploaded', fileId: 'f-minio', mimeType: 'video/mp4', sizeBytes: 12345,
    });
  });

  it('cleans up MinIO when insert fails', async () => {
    vi.mocked(uploadChatAttachment).mockResolvedValue({
      fileId: 'f-leak', filename: 'x.mp4', mimeType: 'video/mp4', sizeBytes: 1, url: '',
    });
    vi.mocked(insertVideo).mockRejectedValue(new Error('data-api down'));
    const file = new File([new Uint8Array(10)], 'x.mp4', { type: 'video/mp4' });
    const res = await POST(multipartReq(file, { moduleId: 'mod-1', title: 'X' }));
    expect(res.status).toBe(500);
    expect(deleteChatAttachment).toHaveBeenCalledWith('f-leak', expect.anything());
  });
});
