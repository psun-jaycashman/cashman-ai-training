/**
 * Video Data API Client for Cashman AI Training
 *
 * Provides typed CRUD operations for training videos and per-user video
 * progress, stored via the Busibox data-api service. Also handles cleanup
 * of uploaded video files in MinIO when video records are deleted.
 */

import {
  queryRecords, insertRecords, updateRecords, deleteRecords,
  generateId, getNow, deleteChatAttachment, dataFetch,
} from '@jazzmind/busibox-app';
import type { TrainingVideo, VideoProgress } from './types';

const COMPLETION_THRESHOLD = 0.95;

/**
 * Upload a video file to data-api, scoping access via a shared library so
 * any user with a role bound to that library can fetch the file's presigned
 * URL. This bypasses the user-scoped chat-attachment path used by
 * uploadChatAttachment(), which is why admin uploads weren't visible to
 * other users.
 */
export async function uploadVideoToLibrary(
  file: File,
  libraryId: string,
  options: { accessToken: string; userId: string; timeout?: number },
): Promise<{ fileId: string; mimeType: string; sizeBytes: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('libraryId', libraryId);
  const res = await dataFetch('Upload training video to library', '/upload', {
    method: 'POST',
    body: formData,
    accessToken: options.accessToken,
    userId: options.userId,
    timeout: options.timeout,
  });
  const data = await res.json();
  return {
    fileId: data.fileId,
    mimeType: data.mimeType ?? file.type,
    sizeBytes: data.sizeBytes ?? file.size,
  };
}

export async function listVideosForModule(
  token: string,
  documentId: string,
  moduleId: string,
): Promise<TrainingVideo[]> {
  const result = await queryRecords<TrainingVideo>(token, documentId, {
    where: { field: 'moduleId', op: 'eq', value: moduleId },
    orderBy: [{ field: 'order', direction: 'asc' }],
  });
  return result.records;
}

export async function listVideosForLesson(
  token: string,
  documentId: string,
  moduleId: string,
  lessonId: string,
): Promise<TrainingVideo[]> {
  const result = await queryRecords<TrainingVideo>(token, documentId, {
    where: {
      and: [
        { field: 'moduleId', op: 'eq', value: moduleId },
        { field: 'lessonId', op: 'eq', value: lessonId },
      ],
    },
    orderBy: [{ field: 'order', direction: 'asc' }],
  });
  return result.records;
}

export async function getVideoById(
  token: string,
  documentId: string,
  videoId: string,
): Promise<TrainingVideo | null> {
  const result = await queryRecords<TrainingVideo>(token, documentId, {
    where: { field: 'id', op: 'eq', value: videoId },
    limit: 1,
  });
  return result.records[0] ?? null;
}

export async function listAllVideos(
  token: string,
  documentId: string,
  filters?: { moduleId?: string; lessonId?: string },
): Promise<TrainingVideo[]> {
  const and: { field: string; op: 'eq'; value: string }[] = [];
  if (filters?.moduleId) and.push({ field: 'moduleId', op: 'eq', value: filters.moduleId });
  if (filters?.lessonId) and.push({ field: 'lessonId', op: 'eq', value: filters.lessonId });
  const where = and.length === 0 ? undefined : and.length === 1 ? and[0] : { and };
  const result = await queryRecords<TrainingVideo>(token, documentId, {
    ...(where ? { where } : {}),
    orderBy: [
      { field: 'moduleId', direction: 'asc' },
      { field: 'order', direction: 'asc' },
    ],
  });
  return result.records;
}

export async function insertVideo(
  token: string,
  documentId: string,
  input: Omit<TrainingVideo, 'id' | 'uploadedAt'>,
): Promise<TrainingVideo> {
  const video: TrainingVideo = {
    id: generateId(),
    uploadedAt: getNow(),
    ...input,
  };
  await insertRecords(token, documentId, [video]);
  return video;
}

export async function updateVideo(
  token: string,
  documentId: string,
  videoId: string,
  updates: Partial<Pick<TrainingVideo,
    'title' | 'description' | 'moduleId' | 'lessonId' | 'order' | 'posterUrl' | 'durationSeconds'
  >>,
): Promise<void> {
  await updateRecords(token, documentId, updates, { field: 'id', op: 'eq', value: videoId });
}

export async function deleteVideo(
  token: string,
  documentId: string,
  videoId: string,
): Promise<void> {
  const existing = await getVideoById(token, documentId, videoId);
  if (!existing) return;
  if (existing.source === 'uploaded' && existing.fileId) {
    try {
      await deleteChatAttachment(existing.fileId, { accessToken: token });
    } catch (err) {
      console.error('[video] failed to delete MinIO file; continuing', err);
    }
  }
  await deleteRecords(token, documentId, { field: 'id', op: 'eq', value: videoId });
}

export async function getVideoProgress(
  token: string,
  documentId: string,
  visitorId: string,
  videoId: string,
): Promise<VideoProgress | null> {
  const result = await queryRecords<VideoProgress>(token, documentId, {
    where: {
      and: [
        { field: 'visitorId', op: 'eq', value: visitorId },
        { field: 'videoId', op: 'eq', value: videoId },
      ],
    },
    limit: 1,
  });
  return result.records[0] ?? null;
}

export async function upsertVideoProgress(
  token: string,
  documentId: string,
  input: {
    visitorId: string;
    videoId: string;
    moduleId: string;
    lessonId?: string;
    positionSeconds: number;
    durationSeconds: number;
  },
): Promise<VideoProgress> {
  const existing = await getVideoProgress(token, documentId, input.visitorId, input.videoId);
  const completed =
    input.durationSeconds > 0 &&
    input.positionSeconds / input.durationSeconds >= COMPLETION_THRESHOLD;
  const now = getNow();
  if (existing) {
    const updates = {
      positionSeconds: input.positionSeconds,
      durationSeconds: input.durationSeconds,
      completed: existing.completed || completed,
      updatedAt: now,
    };
    await updateRecords(
      token,
      documentId,
      updates,
      { field: 'id', op: 'eq', value: existing.id },
    );
    return { ...existing, ...updates };
  }
  const record: VideoProgress = {
    id: generateId(),
    visitorId: input.visitorId,
    videoId: input.videoId,
    moduleId: input.moduleId,
    lessonId: input.lessonId,
    positionSeconds: input.positionSeconds,
    durationSeconds: input.durationSeconds,
    completed,
    updatedAt: now,
  };
  await insertRecords(token, documentId, [record]);
  return record;
}
