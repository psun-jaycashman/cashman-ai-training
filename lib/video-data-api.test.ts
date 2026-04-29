import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TrainingVideo, VideoProgress } from './types';

vi.mock('@jazzmind/busibox-app', () => ({
  queryRecords: vi.fn(),
  insertRecords: vi.fn(),
  updateRecords: vi.fn(),
  deleteRecords: vi.fn(),
  generateId: vi.fn(() => 'vid-generated'),
  getNow: vi.fn(() => '2026-04-17T12:00:00Z'),
  deleteChatAttachment: vi.fn(),
}));

import * as busibox from '@jazzmind/busibox-app';
import {
  listVideosForModule, listVideosForLesson, getVideoById,
  insertVideo, updateVideo, deleteVideo,
  getVideoProgress, upsertVideoProgress,
} from './video-data-api';

const TOKEN = 'test-token';
const DOC = 'doc-id';

beforeEach(() => vi.clearAllMocks());

describe('listVideosForModule', () => {
  it('queries videos by moduleId sorted by order', async () => {
    const videos: TrainingVideo[] = [{
      id: 'v1', moduleId: 'mod-1', title: 't', source: 'uploaded',
      order: 0, uploadedBy: 'u', uploadedAt: '2026-04-17T00:00:00Z',
    }];
    vi.mocked(busibox.queryRecords).mockResolvedValue({ records: videos, total: 1 } as never);
    const result = await listVideosForModule(TOKEN, DOC, 'mod-1');
    expect(busibox.queryRecords).toHaveBeenCalledWith(
      TOKEN, DOC,
      expect.objectContaining({
        where: { field: 'moduleId', op: 'eq', value: 'mod-1' },
        orderBy: [{ field: 'order', direction: 'asc' }],
      })
    );
    expect(result).toEqual(videos);
  });
});

describe('insertVideo', () => {
  it('fills id/uploadedAt and stores', async () => {
    vi.mocked(busibox.insertRecords).mockResolvedValue(undefined as never);
    const v = await insertVideo(TOKEN, DOC, {
      moduleId: 'mod-1', title: 'Intro', source: 'uploaded',
      fileId: 'f1', mimeType: 'video/mp4', sizeBytes: 1000,
      order: 0, uploadedBy: 'u1',
    });
    expect(v.id).toBe('vid-generated');
    expect(v.uploadedAt).toBe('2026-04-17T12:00:00Z');
    expect(busibox.insertRecords).toHaveBeenCalledWith(
      TOKEN,
      DOC,
      [expect.objectContaining({ id: 'vid-generated' })],
      { recordVisibility: 'inherit' },
    );
  });
});

describe('deleteVideo', () => {
  it('deletes record AND MinIO file for uploaded source', async () => {
    vi.mocked(busibox.queryRecords).mockResolvedValue({
      records: [{ id: 'v1', source: 'uploaded', fileId: 'file-xyz' }],
      total: 1,
    } as never);
    vi.mocked(busibox.deleteRecords).mockResolvedValue(1 as never);
    vi.mocked(busibox.deleteChatAttachment).mockResolvedValue(undefined as never);

    await deleteVideo(TOKEN, DOC, 'v1');

    expect(busibox.deleteChatAttachment).toHaveBeenCalledWith('file-xyz', expect.objectContaining({ accessToken: TOKEN }));
    expect(busibox.deleteRecords).toHaveBeenCalled();
  });

  it('does NOT call deleteChatAttachment for external source', async () => {
    vi.mocked(busibox.queryRecords).mockResolvedValue({
      records: [{ id: 'v1', source: 'external', externalUrl: 'https://youtube.com/...' }],
      total: 1,
    } as never);
    vi.mocked(busibox.deleteRecords).mockResolvedValue(1 as never);

    await deleteVideo(TOKEN, DOC, 'v1');
    expect(busibox.deleteChatAttachment).not.toHaveBeenCalled();
  });
});

describe('upsertVideoProgress', () => {
  it('inserts when no existing record', async () => {
    vi.mocked(busibox.queryRecords).mockResolvedValue({ records: [], total: 0 } as never);
    vi.mocked(busibox.insertRecords).mockResolvedValue(undefined as never);
    const p = await upsertVideoProgress(TOKEN, DOC, {
      visitorId: 'u1', videoId: 'v1', moduleId: 'mod-1',
      positionSeconds: 30, durationSeconds: 600,
    });
    expect(p.completed).toBe(false);
    expect(busibox.insertRecords).toHaveBeenCalled();
  });

  it('flips completed at 95% threshold', async () => {
    vi.mocked(busibox.queryRecords).mockResolvedValue({ records: [], total: 0 } as never);
    const p = await upsertVideoProgress(TOKEN, DOC, {
      visitorId: 'u1', videoId: 'v1', moduleId: 'mod-1',
      positionSeconds: 580, durationSeconds: 600,
    });
    expect(p.completed).toBe(true);
  });

  it('updates when existing record found', async () => {
    vi.mocked(busibox.queryRecords).mockResolvedValue({
      records: [{ id: 'p1', visitorId: 'u1', videoId: 'v1' } as VideoProgress],
      total: 1,
    } as never);
    vi.mocked(busibox.updateRecords).mockResolvedValue(1 as never);
    await upsertVideoProgress(TOKEN, DOC, {
      visitorId: 'u1', videoId: 'v1', moduleId: 'mod-1',
      positionSeconds: 60, durationSeconds: 600,
    });
    expect(busibox.updateRecords).toHaveBeenCalledWith(
      TOKEN, DOC,
      expect.objectContaining({ positionSeconds: 60 }),
      { field: 'id', op: 'eq', value: 'p1' }
    );
  });
});
