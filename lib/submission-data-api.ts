/**
 * Submission Files Data API Client.
 *
 * Stores user-submitted exercise files (Word, Excel, PowerPoint, PDF) into
 * a shared data-api library so any authenticated user can browse and
 * download peer submissions on the /submissions tab.
 *
 * Mirrors the training-videos pattern: file binary goes to a shared
 * library via /upload, metadata row sits in an 'authenticated' document
 * with `recordVisibility: 'inherit'` so cross-user reads work.
 */

import {
  dataFetch,
  generateId,
  getNow,
  insertRecords,
  queryRecords,
} from '@jazzmind/busibox-app';

export interface SubmissionFile {
  id: string;
  moduleId: string;
  lessonId: string;
  exerciseId: string;
  lessonTitle?: string;
  fileName: string;
  fileId: string;
  mimeType?: string;
  sizeBytes?: number;
  responseExcerpt?: string;
  uploaderUserId: string;
  uploaderEmail?: string;
  uploadedAt: string;
}

/**
 * Push a binary file into a shared data-api library so it gets a fileId
 * that any user with a role bound to the library can resolve to a
 * presigned URL. Same call shape as `uploadVideoToLibrary`.
 */
export async function uploadSubmissionToLibrary(
  file: File,
  libraryId: string,
  options: { accessToken: string; userId: string; timeout?: number },
): Promise<{ fileId: string; mimeType: string; sizeBytes: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('libraryId', libraryId);
  const res = await dataFetch('Upload exercise submission to library', '/upload', {
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

export async function insertSubmission(
  token: string,
  documentId: string,
  input: Omit<SubmissionFile, 'id' | 'uploadedAt'>,
): Promise<SubmissionFile> {
  const submission: SubmissionFile = {
    id: generateId(),
    uploadedAt: getNow(),
    ...input,
  };
  // Records default to creator-personal even on an 'authenticated' doc.
  // Force inherit so peers see each other's submissions.
  await insertRecords(token, documentId, [submission], { recordVisibility: 'inherit' });
  return submission;
}

export async function listSubmissions(
  token: string,
  documentId: string,
  filters?: { moduleId?: string; lessonId?: string },
): Promise<SubmissionFile[]> {
  const and: { field: string; op: 'eq'; value: string }[] = [];
  if (filters?.moduleId) and.push({ field: 'moduleId', op: 'eq', value: filters.moduleId });
  if (filters?.lessonId) and.push({ field: 'lessonId', op: 'eq', value: filters.lessonId });
  const where = and.length === 0 ? undefined : and.length === 1 ? and[0] : { and };
  const result = await queryRecords<SubmissionFile>(token, documentId, {
    ...(where ? { where } : {}),
    orderBy: [{ field: 'uploadedAt', direction: 'desc' }],
  });
  return result.records;
}
