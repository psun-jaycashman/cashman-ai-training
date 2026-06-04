import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the whole busibox data layer. We provide a superset of the primitives
// data-api-client may import so the module loads regardless of which ones it
// uses internally.
vi.mock('@jazzmind/busibox-app', () => ({
  generateId: vi.fn(() => 'generated-id'),
  getNow: vi.fn(() => '2026-06-04T00:00:00Z'),
  queryRecords: vi.fn(),
  insertRecords: vi.fn(),
  updateRecords: vi.fn(),
  deleteRecords: vi.fn(),
  ensureDocuments: vi.fn(),
  listDataDocuments: vi.fn(),
  createDataDocument: vi.fn(),
  ensureSchemaAndMetadata: vi.fn(),
}));

import * as busibox from '@jazzmind/busibox-app';
import { ensureDataDocuments, DOCUMENTS } from './data-api-client';

const TOKEN = 'data-api-token';

beforeEach(() => vi.clearAllMocks());

describe('ensureDataDocuments', () => {
  it('discovers existing documents via an unfiltered list (not filtered by sourceApp)', async () => {
    // The data-api token is already app-scoped, so an unfiltered list returns
    // exactly this app's documents — including ones whose stored `sourceApp`
    // metadata does not match the filter the library would otherwise apply.
    const existing = Object.values(DOCUMENTS).map((name) => ({ id: `id:${name}`, name }));
    vi.mocked(busibox.listDataDocuments).mockResolvedValue(existing as never);

    const ids = await ensureDataDocuments(TOKEN);

    // Must not try to (re)create documents that already exist.
    expect(busibox.createDataDocument).not.toHaveBeenCalled();

    // Discovery must not constrain by sourceApp (that filter hides the docs).
    expect(busibox.listDataDocuments).toHaveBeenCalled();
    const opts = vi.mocked(busibox.listDataDocuments).mock.calls[0]?.[1] as
      | { sourceApp?: string }
      | undefined;
    expect(opts?.sourceApp).toBeUndefined();

    expect(ids).toEqual({
      progress: `id:${DOCUMENTS.PROGRESS}`,
      quizScores: `id:${DOCUMENTS.QUIZ_SCORES}`,
      badges: `id:${DOCUMENTS.BADGES}`,
      activityResponses: `id:${DOCUMENTS.ACTIVITY_RESPONSES}`,
      trainingVideos: `id:${DOCUMENTS.TRAINING_VIDEOS}`,
      trainingVideoProgress: `id:${DOCUMENTS.TRAINING_VIDEO_PROGRESS}`,
      submissionFiles: `id:${DOCUMENTS.SUBMISSION_FILES}`,
      trainingUsers: `id:${DOCUMENTS.TRAINING_USERS}`,
      surveyResponses: `id:${DOCUMENTS.SURVEY_RESPONSES}`,
    });
  });

  it('recovers from a duplicate-key create error by re-listing and using the existing id', async () => {
    // Initial discovery sees nothing; after a duplicate-key collision on create,
    // a re-list surfaces the document that already existed.
    vi.mocked(busibox.listDataDocuments)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValue([
        { id: `id:${DOCUMENTS.PROGRESS}`, name: DOCUMENTS.PROGRESS },
      ] as never);

    vi.mocked(busibox.createDataDocument).mockImplementation(async (_t, name) => {
      if (name === DOCUMENTS.PROGRESS) {
        throw new Error(
          'duplicate key value violates unique constraint "idx_data_files_unique_app_doc"',
        );
      }
      return { id: `created:${name}` } as never;
    });

    const ids = await ensureDataDocuments(TOKEN);

    // The duplicate must be recovered, not thrown.
    expect(ids.progress).toBe(`id:${DOCUMENTS.PROGRESS}`);
  });
});
