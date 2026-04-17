# Video Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add module- and lesson-level video hosting to the Cashman AI training app, with admin upload/manage UI, external-link support (YouTube/Vimeo/other), and cross-session resume playback.

**Architecture:** All video bytes live in Busibox MinIO via the data-api's `uploadChatAttachment`/`getChatAttachmentUrl` helpers. Two new data-api documents hold metadata (`training-videos`) and per-user resume state (`training-video-progress`). A `<VideoPlayer>` dispatcher picks the right renderer per source: native `<video>` for uploaded, YouTube IFrame API, Vimeo Player SDK, or plain iframe. Admin CRUD lives at `/admin/videos`.

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript, Tailwind, Vitest, `@jazzmind/busibox-app` data-api client, `@vimeo/player`, YouTube IFrame API (script tag), Zod.

**Spec:** [`docs/superpowers/specs/2026-04-17-video-hosting-design.md`](../specs/2026-04-17-video-hosting-design.md)

---

## File Structure

**New files (17):**
- `lib/video-embed.ts` — URL → embed-URL parsers (pure)
- `lib/video-data-api.ts` — data-api CRUD helpers for videos + progress (separate file to keep `data-api-client.ts` focused on existing concerns)
- `lib/video-admin-role.ts` — `requireAdmin` helper
- `app/api/admin/training-videos/route.ts` — POST (multipart+JSON), GET
- `app/api/admin/training-videos/[id]/route.ts` — PATCH, DELETE
- `app/api/training-videos/route.ts` — GET with playback resolution
- `app/api/training-videos/[id]/progress/route.ts` — GET, PUT
- `app/api/training-videos/[id]/refresh-url/route.ts` — GET
- `app/(authenticated)/admin/videos/page.tsx` — list + modals (client)
- `components/admin/VideoListByModule.tsx`
- `components/admin/VideoFormModal.tsx`
- `components/admin/VideoUploadField.tsx`
- `components/VideoPlayer.tsx` — dispatcher
- `components/video-players/UploadedPlayer.tsx`
- `components/video-players/YouTubePlayer.tsx`
- `components/video-players/VimeoPlayer.tsx`
- `components/video-players/IframePlayer.tsx`
- Test files mirroring each (same paths, `.test.ts[x]`)

**Modified files:**
- `lib/types.ts` — add `TrainingVideo`, `VideoProgress`, `PlaybackInfo`
- `lib/data-api-client.ts` — extend `ensureDataDocuments` with two new keys + schemas
- `app/(authenticated)/modules/[moduleId]/page.tsx` — render `<VideoPlayer>` at top
- `app/(authenticated)/modules/[moduleId]/lessons/[lessonId]/page.tsx` — same
- `app/(authenticated)/admin/page.tsx` — add "Videos" nav link (or existing nav component)
- `README.md` — ops notes (nginx `client_max_body_size`, admin role)
- `package.json` — add `@vimeo/player`
- `next.config.ts` — iframe CSP allowlist for `youtube-nocookie.com` and `player.vimeo.com`

---

## Task 1: Install `@vimeo/player` and add types

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Install dependency**

Run: `npm install @vimeo/player`
Expected: installs `@vimeo/player` and its types (ships with `.d.ts`).

- [ ] **Step 2: Update Next.js config to allow video iframe embeds**

Find the existing `next.config.ts`, add (or merge into) a `headers` async function:

```ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com",
          ].join('; '),
        },
      ],
    },
  ];
}
```

If an existing CSP header is already defined, merge the `frame-src` directive rather than overwrite.

- [ ] **Step 3: Verify the app still runs**

Run: `npm run dev` and hit `http://localhost:3002`.
Expected: home page loads without CSP errors in the console.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "chore: add @vimeo/player and allow video iframe embeds"
```

---

## Task 2: Add types for videos, progress, and playback info

**Files:**
- Modify: `lib/types.ts` (append after existing sections, before utility types)

- [ ] **Step 1: Add the new interfaces**

Append this section to `lib/types.ts` right before the "Utility Types" section:

```ts
// ==========================================================================
// Training Video Types
// ==========================================================================

export type VideoSource = 'uploaded' | 'external';
export type ExternalVideoProvider = 'youtube' | 'vimeo' | 'other';

export interface TrainingVideo {
  id: string;
  moduleId: string;
  lessonId?: string;
  title: string;
  description?: string;
  source: VideoSource;
  // Present when source === 'uploaded'
  fileId?: string;
  mimeType?: string;
  sizeBytes?: number;
  // Present when source === 'external'
  externalUrl?: string;
  externalProvider?: ExternalVideoProvider;
  posterUrl?: string;
  durationSeconds?: number;
  order: number;
  uploadedBy: string;
  uploadedAt: string;
}

export type PlaybackInfo =
  | { kind: 'uploaded'; url: string; mimeType: string; expiresAt: string }
  | { kind: 'external'; provider: ExternalVideoProvider; url: string };

export interface TrainingVideoWithPlayback extends TrainingVideo {
  playback: PlaybackInfo;
}

export interface VideoProgress {
  id: string;
  visitorId: string;
  videoId: string;
  moduleId: string;
  lessonId?: string;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: string;
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: no new errors (any pre-existing unrelated errors are fine).

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add training video and progress types"
```

---

## Task 3: Video embed URL parser (TDD)

**Files:**
- Create: `lib/video-embed.ts`
- Test: `lib/video-embed.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/video-embed.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { detectProvider, toEmbedUrl, extractYouTubeId, extractVimeoId } from './video-embed';

describe('detectProvider', () => {
  it('detects youtube.com', () => {
    expect(detectProvider('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
  });
  it('detects youtu.be', () => {
    expect(detectProvider('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
  });
  it('detects vimeo', () => {
    expect(detectProvider('https://vimeo.com/76979871')).toBe('vimeo');
  });
  it('detects vimeo player domain', () => {
    expect(detectProvider('https://player.vimeo.com/video/76979871')).toBe('vimeo');
  });
  it('returns other for arbitrary https urls', () => {
    expect(detectProvider('https://example.com/video.mp4')).toBe('other');
  });
  it('throws for non-http(s) urls', () => {
    expect(() => detectProvider('ftp://example.com/a.mp4')).toThrow();
    expect(() => detectProvider('not a url')).toThrow();
  });
});

describe('extractYouTubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s', 'dQw4w9WgXcQ'],
  ])('extracts id from %s', (url, id) => {
    expect(extractYouTubeId(url)).toBe(id);
  });
  it('returns null when no id present', () => {
    expect(extractYouTubeId('https://www.youtube.com/')).toBeNull();
  });
});

describe('extractVimeoId', () => {
  it('extracts from vimeo.com/NNN', () => {
    expect(extractVimeoId('https://vimeo.com/76979871')).toBe('76979871');
  });
  it('extracts from player.vimeo.com/video/NNN', () => {
    expect(extractVimeoId('https://player.vimeo.com/video/76979871')).toBe('76979871');
  });
  it('returns null when no id', () => {
    expect(extractVimeoId('https://vimeo.com/')).toBeNull();
  });
});

describe('toEmbedUrl', () => {
  it('returns youtube-nocookie embed for youtube', () => {
    expect(toEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe('https://www.youtube-nocookie.com/embed/abc123');
  });
  it('returns vimeo player embed for vimeo', () => {
    expect(toEmbedUrl('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871');
  });
  it('returns the original url for other', () => {
    expect(toEmbedUrl('https://example.com/video')).toBe('https://example.com/video');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `npx vitest run lib/video-embed.test.ts`
Expected: ALL tests fail with "Cannot find module './video-embed'".

- [ ] **Step 3: Implement `lib/video-embed.ts`**

Create the file:

```ts
import type { ExternalVideoProvider } from './types';

function requireUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Invalid URL: ${raw}`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Unsupported protocol: ${url.protocol}`);
  }
  return url;
}

export function detectProvider(raw: string): ExternalVideoProvider {
  const url = requireUrl(raw);
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    return 'youtube';
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    return 'vimeo';
  }
  return 'other';
}

export function extractYouTubeId(raw: string): string | null {
  try {
    const url = requireUrl(raw);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1);
      return id || null;
    }
    // watch?v= form
    const v = url.searchParams.get('v');
    if (v) return v;
    // /shorts/ID or /embed/ID
    const match = url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function extractVimeoId(raw: string): string | null {
  try {
    const url = requireUrl(raw);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'vimeo.com') {
      const match = url.pathname.match(/^\/(\d+)/);
      return match ? match[1] : null;
    }
    if (host === 'player.vimeo.com') {
      const match = url.pathname.match(/^\/video\/(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function toEmbedUrl(raw: string): string {
  const provider = detectProvider(raw);
  if (provider === 'youtube') {
    const id = extractYouTubeId(raw);
    if (!id) throw new Error('Could not extract YouTube video id');
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (provider === 'vimeo') {
    const id = extractVimeoId(raw);
    if (!id) throw new Error('Could not extract Vimeo video id');
    return `https://player.vimeo.com/video/${id}`;
  }
  return raw;
}
```

- [ ] **Step 4: Run tests — expect pass**

Run: `npx vitest run lib/video-embed.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/video-embed.ts lib/video-embed.test.ts
git commit -m "feat: add video embed URL parser (YouTube, Vimeo, other)"
```

---

## Task 4: Data-api schemas for videos + progress

**Files:**
- Modify: `lib/data-api-client.ts`

- [ ] **Step 1: Add schemas and document names**

In `lib/data-api-client.ts`, extend the `DOCUMENTS` const:

```ts
export const DOCUMENTS = {
  PROGRESS: 'ai-training-progress',
  QUIZ_SCORES: 'ai-training-quiz-scores',
  BADGES: 'ai-training-badges',
  ACTIVITY_RESPONSES: 'ai-training-activity-responses',
  TRAINING_VIDEOS: 'ai-training-videos',
  TRAINING_VIDEO_PROGRESS: 'ai-training-video-progress',
} as const;
```

Below the existing schemas, add two new ones:

```ts
export const trainingVideoSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    moduleId: { type: 'string', required: true, label: 'Module ID', order: 1 },
    lessonId: { type: 'string', label: 'Lesson ID', order: 2 },
    title: { type: 'string', required: true, label: 'Title', order: 3 },
    description: { type: 'string', label: 'Description', order: 4 },
    source: { type: 'string', required: true, label: 'Source', order: 5 },
    fileId: { type: 'string', label: 'File ID', order: 6 },
    mimeType: { type: 'string', label: 'MIME Type', order: 7 },
    sizeBytes: { type: 'number', label: 'Size (bytes)', order: 8 },
    externalUrl: { type: 'string', label: 'External URL', order: 9 },
    externalProvider: { type: 'string', label: 'Provider', order: 10 },
    posterUrl: { type: 'string', label: 'Poster URL', order: 11 },
    durationSeconds: { type: 'number', label: 'Duration (s)', order: 12 },
    order: { type: 'number', required: true, label: 'Order', order: 13 },
    uploadedBy: { type: 'string', required: true, label: 'Uploaded By', order: 14 },
    uploadedAt: { type: 'string', label: 'Uploaded At', readonly: true, order: 15 },
  },
  displayName: 'Training Videos',
  itemLabel: 'Training Video',
  sourceApp: 'cashman-ai-training',
  visibility: 'authenticated',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};

export const videoProgressSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    visitorId: { type: 'string', required: true, label: 'Visitor ID', hidden: true },
    videoId: { type: 'string', required: true, label: 'Video ID', order: 1 },
    moduleId: { type: 'string', required: true, label: 'Module ID', order: 2 },
    lessonId: { type: 'string', label: 'Lesson ID', order: 3 },
    positionSeconds: { type: 'number', required: true, label: 'Position (s)', order: 4 },
    durationSeconds: { type: 'number', required: true, label: 'Duration (s)', order: 5 },
    completed: { type: 'boolean', required: true, label: 'Completed', order: 6 },
    updatedAt: { type: 'string', label: 'Updated At', readonly: true, order: 7 },
  },
  displayName: 'Video Progress',
  itemLabel: 'Video Progress',
  sourceApp: 'cashman-ai-training',
  visibility: 'personal',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};
```

- [ ] **Step 2: Extend `ensureDataDocuments`**

Update the existing `ensureDataDocuments` return type and call:

```ts
export async function ensureDataDocuments(token: string): Promise<{
  progress: string;
  quizScores: string;
  badges: string;
  activityResponses: string;
  trainingVideos: string;
  trainingVideoProgress: string;
}> {
  const ids = await ensureDocuments(
    token,
    {
      progress: { name: DOCUMENTS.PROGRESS, schema: progressSchema, visibility: 'personal' },
      quizScores: { name: DOCUMENTS.QUIZ_SCORES, schema: quizScoreSchema, visibility: 'personal' },
      badges: { name: DOCUMENTS.BADGES, schema: badgeSchema, visibility: 'authenticated' },
      activityResponses: { name: DOCUMENTS.ACTIVITY_RESPONSES, schema: activityResponseSchema, visibility: 'personal' },
      trainingVideos: { name: DOCUMENTS.TRAINING_VIDEOS, schema: trainingVideoSchema, visibility: 'authenticated' },
      trainingVideoProgress: { name: DOCUMENTS.TRAINING_VIDEO_PROGRESS, schema: videoProgressSchema, visibility: 'personal' },
    },
    'cashman-ai-training'
  );
  return ids as {
    progress: string; quizScores: string; badges: string; activityResponses: string;
    trainingVideos: string; trainingVideoProgress: string;
  };
}
```

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/data-api-client.ts
git commit -m "feat: add data-api schemas for training videos and progress"
```

---

## Task 5: Video data-api helpers (TDD)

**Files:**
- Create: `lib/video-data-api.ts`
- Test: `lib/video-data-api.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/video-data-api.test.ts`:

```ts
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
    expect(busibox.insertRecords).toHaveBeenCalledWith(TOKEN, DOC, [expect.objectContaining({ id: 'vid-generated' })]);
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
```

- [ ] **Step 2: Run tests — expect failure**

Run: `npx vitest run lib/video-data-api.test.ts`
Expected: module not found.

- [ ] **Step 3: Implement `lib/video-data-api.ts`**

```ts
import {
  queryRecords, insertRecords, updateRecords, deleteRecords,
  generateId, getNow, deleteChatAttachment,
} from '@jazzmind/busibox-app';
import type { TrainingVideo, VideoProgress } from './types';

const COMPLETION_THRESHOLD = 0.95;

export async function listVideosForModule(token: string, documentId: string, moduleId: string): Promise<TrainingVideo[]> {
  const result = await queryRecords<TrainingVideo>(token, documentId, {
    where: { field: 'moduleId', op: 'eq', value: moduleId },
    orderBy: [{ field: 'order', direction: 'asc' }],
  });
  return result.records;
}

export async function listVideosForLesson(
  token: string, documentId: string, moduleId: string, lessonId: string
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

export async function getVideoById(token: string, documentId: string, videoId: string): Promise<TrainingVideo | null> {
  const result = await queryRecords<TrainingVideo>(token, documentId, {
    where: { field: 'id', op: 'eq', value: videoId },
    limit: 1,
  });
  return result.records[0] ?? null;
}

export async function listAllVideos(
  token: string, documentId: string, filters?: { moduleId?: string; lessonId?: string }
): Promise<TrainingVideo[]> {
  const and: { field: string; op: 'eq'; value: string }[] = [];
  if (filters?.moduleId) and.push({ field: 'moduleId', op: 'eq', value: filters.moduleId });
  if (filters?.lessonId) and.push({ field: 'lessonId', op: 'eq', value: filters.lessonId });
  const where = and.length === 0 ? undefined : and.length === 1 ? and[0] : { and };
  const result = await queryRecords<TrainingVideo>(token, documentId, {
    ...(where ? { where } : {}),
    orderBy: [{ field: 'moduleId', direction: 'asc' }, { field: 'order', direction: 'asc' }],
  });
  return result.records;
}

export async function insertVideo(
  token: string, documentId: string, input: Omit<TrainingVideo, 'id' | 'uploadedAt'>
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
  token: string, documentId: string, videoId: string,
  updates: Partial<Pick<TrainingVideo, 'title' | 'description' | 'moduleId' | 'lessonId' | 'order' | 'posterUrl' | 'durationSeconds'>>
): Promise<void> {
  await updateRecords(token, documentId, updates, { field: 'id', op: 'eq', value: videoId });
}

export async function deleteVideo(token: string, documentId: string, videoId: string): Promise<void> {
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
  token: string, documentId: string, visitorId: string, videoId: string
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
  token: string, documentId: string,
  input: { visitorId: string; videoId: string; moduleId: string; lessonId?: string; positionSeconds: number; durationSeconds: number }
): Promise<VideoProgress> {
  const existing = await getVideoProgress(token, documentId, input.visitorId, input.videoId);
  const completed = input.durationSeconds > 0 && input.positionSeconds / input.durationSeconds >= COMPLETION_THRESHOLD;
  const now = getNow();
  if (existing) {
    const updates = {
      positionSeconds: input.positionSeconds,
      durationSeconds: input.durationSeconds,
      completed: existing.completed || completed,
      updatedAt: now,
    };
    await updateRecords(token, documentId, updates, { field: 'id', op: 'eq', value: existing.id });
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
```

- [ ] **Step 4: Run tests — expect pass**

Run: `npx vitest run lib/video-data-api.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/video-data-api.ts lib/video-data-api.test.ts
git commit -m "feat: add data-api helpers for training videos and progress"
```

---

## Task 6: `requireAdmin` middleware

**Files:**
- Create: `lib/video-admin-role.ts`
- Test: `lib/video-admin-role.test.ts`

(Reason the role lives in a small file: it's reused by every admin route.)

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from './video-admin-role';

vi.mock('./auth-middleware', () => ({
  requireAuthWithTokenExchange: vi.fn(),
}));
import { requireAuthWithTokenExchange } from './auth-middleware';

const mockReq = () => new NextRequest('http://localhost/api/admin/training-videos');

describe('requireAdmin', () => {
  it('returns 401 response when auth middleware returns NextResponse', async () => {
    vi.mocked(requireAuthWithTokenExchange).mockResolvedValue(NextResponse.json({ error: 'x' }, { status: 401 }));
    const result = await requireAdmin(mockReq());
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 403 when user lacks admin role', async () => {
    vi.mocked(requireAuthWithTokenExchange).mockResolvedValue({
      ssoToken: null, apiToken: 't', userId: 'u', roles: ['user'],
    });
    const result = await requireAdmin(mockReq());
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it('returns auth info when user has admin role', async () => {
    vi.mocked(requireAuthWithTokenExchange).mockResolvedValue({
      ssoToken: null, apiToken: 't', userId: 'u', roles: ['user', 'admin'],
    });
    const result = await requireAdmin(mockReq());
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { userId: string }).userId).toBe('u');
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npx vitest run lib/video-admin-role.test.ts`
Expected: module not found.

- [ ] **Step 3: Implement**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthWithTokenExchange, type AuthenticatedRequest } from './auth-middleware';

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  if (!auth.roles.includes('admin')) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin role required.' },
      { status: 403 }
    );
  }
  return auth;
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npx vitest run lib/video-admin-role.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/video-admin-role.ts lib/video-admin-role.test.ts
git commit -m "feat: add requireAdmin middleware"
```

---

## Task 7: Admin POST route — external-link branch (TDD)

**Files:**
- Create: `app/api/admin/training-videos/route.ts`
- Test: `app/api/admin/training-videos/route.test.ts`

- [ ] **Step 1: Write the failing tests** (JSON / external branch only; multipart in next task)

```ts
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
```

- [ ] **Step 2: Run — expect failure**

Run: `npx vitest run app/api/admin/training-videos/route.test.ts`
Expected: module not found.

- [ ] **Step 3: Implement the route** (JSON branch + GET; leave multipart as NotImplemented for now)

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { insertVideo, listAllVideos } from '@/lib/video-data-api';
import { detectProvider } from '@/lib/video-embed';

export const runtime = 'nodejs';
export const maxDuration = 600;

const externalBodySchema = z.object({
  source: z.literal('external'),
  externalUrl: z.string().url(),
  moduleId: z.string().min(1),
  lessonId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.startsWith('multipart/form-data')) {
    // Implemented in Task 8
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
  }

  if (contentType.startsWith('application/json')) {
    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const parsed = externalBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    let provider: 'youtube' | 'vimeo' | 'other';
    try { provider = detectProvider(parsed.data.externalUrl); } catch (err) {
      return NextResponse.json({ error: 'Invalid external URL', message: String(err) }, { status: 400 });
    }

    const ids = await ensureDataDocuments(auth.apiToken);
    const video = await insertVideo(auth.apiToken, ids.trainingVideos, {
      moduleId: parsed.data.moduleId,
      lessonId: parsed.data.lessonId,
      title: parsed.data.title,
      description: parsed.data.description,
      source: 'external',
      externalUrl: parsed.data.externalUrl,
      externalProvider: provider,
      order: parsed.data.order ?? 0,
      uploadedBy: auth.userId,
    });
    return NextResponse.json(video, { status: 201 });
  }

  return NextResponse.json({ error: 'Unsupported content-type' }, { status: 415 });
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const ids = await ensureDataDocuments(auth.apiToken);
  const videos = await listAllVideos(auth.apiToken, ids.trainingVideos, {
    moduleId: searchParams.get('moduleId') ?? undefined,
    lessonId: searchParams.get('lessonId') ?? undefined,
  });
  return NextResponse.json({ videos });
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npx vitest run app/api/admin/training-videos/route.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/training-videos/route.ts app/api/admin/training-videos/route.test.ts
git commit -m "feat: admin training-videos POST (external) + GET"
```

---

## Task 8: Admin POST route — multipart upload branch (TDD)

**Files:**
- Modify: `app/api/admin/training-videos/route.ts`
- Modify: `app/api/admin/training-videos/route.test.ts`

- [ ] **Step 1: Add failing multipart tests**

Append to the test file:

```ts
vi.mock('@jazzmind/busibox-app', () => ({
  uploadChatAttachment: vi.fn(),
}));
import { uploadChatAttachment } from '@jazzmind/busibox-app';

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
    const { deleteChatAttachment } = await import('@jazzmind/busibox-app') as unknown as { deleteChatAttachment: ReturnType<typeof vi.fn> };
    // deleteChatAttachment mock is configured via module mock; assert shape later
    const file = new File([new Uint8Array(10)], 'x.mp4', { type: 'video/mp4' });
    const res = await POST(multipartReq(file, { moduleId: 'mod-1', title: 'X' }));
    expect(res.status).toBe(500);
    expect(deleteChatAttachment).toHaveBeenCalledWith('f-leak', expect.anything());
  });
});
```

Then update the top-level `vi.mock('@jazzmind/busibox-app', ...)` to include `deleteChatAttachment: vi.fn()` alongside `uploadChatAttachment`.

- [ ] **Step 2: Run — expect failure**

Run: `npx vitest run app/api/admin/training-videos/route.test.ts`
Expected: the three multipart tests fail (501 / call not made).

- [ ] **Step 3: Implement multipart branch**

Replace the `multipart/form-data` block inside `POST`:

```ts
if (contentType.startsWith('multipart/form-data')) {
  let formData: FormData;
  try { formData = await request.formData(); } catch {
    return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 });
  }

  const file = formData.get('file');
  const moduleId = formData.get('moduleId');
  const title = formData.get('title');
  if (!(file instanceof File) || typeof moduleId !== 'string' || !moduleId || typeof title !== 'string' || !title) {
    return NextResponse.json({ error: 'Missing required fields: file, moduleId, title' }, { status: 400 });
  }
  if (!file.type.startsWith('video/')) {
    return NextResponse.json({ error: 'File must be a video/*' }, { status: 400 });
  }

  const lessonId = formData.get('lessonId');
  const description = formData.get('description');
  const orderRaw = formData.get('order');
  const order = typeof orderRaw === 'string' && orderRaw !== '' ? Number(orderRaw) : 0;

  const { uploadChatAttachment, deleteChatAttachment } = await import('@jazzmind/busibox-app');

  const uploaded = await uploadChatAttachment(file, { accessToken: auth.apiToken, userId: auth.userId });
  let video;
  try {
    const ids = await ensureDataDocuments(auth.apiToken);
    video = await insertVideo(auth.apiToken, ids.trainingVideos, {
      moduleId,
      lessonId: typeof lessonId === 'string' && lessonId ? lessonId : undefined,
      title,
      description: typeof description === 'string' && description ? description : undefined,
      source: 'uploaded',
      fileId: uploaded.fileId,
      mimeType: uploaded.mimeType,
      sizeBytes: uploaded.sizeBytes,
      order,
      uploadedBy: auth.userId,
    });
  } catch (err) {
    // cleanup orphan MinIO object
    try { await deleteChatAttachment(uploaded.fileId, { accessToken: auth.apiToken }); }
    catch (cleanupErr) { console.error('[video] orphan cleanup failed', cleanupErr); }
    console.error('[video] insert failed after upload', err);
    return NextResponse.json({ error: 'Failed to record video metadata' }, { status: 500 });
  }
  return NextResponse.json(video, { status: 201 });
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npx vitest run app/api/admin/training-videos/route.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/training-videos/route.ts app/api/admin/training-videos/route.test.ts
git commit -m "feat: admin training-videos POST (multipart upload)"
```

---

## Task 9: Admin PATCH + DELETE routes (TDD)

**Files:**
- Create: `app/api/admin/training-videos/[id]/route.ts`
- Test: `app/api/admin/training-videos/[id]/route.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
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
```

- [ ] **Step 2: Run — expect failure**

Run: `npx vitest run app/api/admin/training-videos/\[id\]/route.test.ts`
Expected: module not found.

- [ ] **Step 3: Implement**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { updateVideo, deleteVideo, getVideoById } from '@/lib/video-data-api';

interface Ctx { params: Promise<{ id: string }> }

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  moduleId: z.string().min(1).optional(),
  lessonId: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  posterUrl: z.string().url().optional(),
  durationSeconds: z.number().nonnegative().optional(),
}).strict();

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const ids = await ensureDataDocuments(auth.apiToken);
  const existing = await getVideoById(auth.apiToken, ids.trainingVideos, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await updateVideo(auth.apiToken, ids.trainingVideos, id, parsed.data);
  return NextResponse.json({ ...existing, ...parsed.data });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const ids = await ensureDataDocuments(auth.apiToken);
  const existing = await getVideoById(auth.apiToken, ids.trainingVideos, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await deleteVideo(auth.apiToken, ids.trainingVideos, id);
  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npx vitest run app/api/admin/training-videos/\[id\]/route.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/training-videos/\[id\]/route.ts app/api/admin/training-videos/\[id\]/route.test.ts
git commit -m "feat: admin training-videos PATCH and DELETE"
```

---

## Task 10: Read route (list with playback resolution) + refresh-url (TDD)

**Files:**
- Create: `app/api/training-videos/route.ts`
- Create: `app/api/training-videos/[id]/refresh-url/route.ts`
- Test: `app/api/training-videos/route.test.ts`
- Test: `app/api/training-videos/[id]/refresh-url/route.test.ts`

- [ ] **Step 1: Failing tests for list route**

```ts
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
```

- [ ] **Step 2: Failing tests for refresh-url route**

```ts
// app/api/training-videos/[id]/refresh-url/route.test.ts
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
```

- [ ] **Step 3: Run tests — expect failures**

Run: `npx vitest run app/api/training-videos/`
Expected: module not found.

- [ ] **Step 4: Implement list route**

```ts
// app/api/training-videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { listVideosForModule, listVideosForLesson } from '@/lib/video-data-api';
import { getChatAttachmentUrl } from '@jazzmind/busibox-app';
import type { TrainingVideo, TrainingVideoWithPlayback } from '@/lib/types';

const PRESIGN_SECONDS = 3600;

export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get('moduleId');
  const lessonId = searchParams.get('lessonId');
  if (!moduleId) return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });

  const ids = await ensureDataDocuments(auth.apiToken);
  const videos: TrainingVideo[] = lessonId
    ? await listVideosForLesson(auth.apiToken, ids.trainingVideos, moduleId, lessonId)
    : await listVideosForModule(auth.apiToken, ids.trainingVideos, moduleId);

  const resolved: TrainingVideoWithPlayback[] = await Promise.all(videos.map(async (v) => {
    if (v.source === 'uploaded') {
      if (!v.fileId) throw new Error(`Uploaded video ${v.id} missing fileId`);
      const url = await getChatAttachmentUrl(v.fileId, { accessToken: auth.apiToken }, PRESIGN_SECONDS);
      return {
        ...v,
        playback: {
          kind: 'uploaded',
          url,
          mimeType: v.mimeType ?? 'video/mp4',
          expiresAt: new Date(Date.now() + PRESIGN_SECONDS * 1000).toISOString(),
        },
      };
    }
    return {
      ...v,
      playback: {
        kind: 'external',
        provider: v.externalProvider ?? 'other',
        url: v.externalUrl!,
      },
    };
  }));

  return NextResponse.json({ videos: resolved });
}
```

- [ ] **Step 5: Implement refresh-url route**

```ts
// app/api/training-videos/[id]/refresh-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { getVideoById } from '@/lib/video-data-api';
import { getChatAttachmentUrl } from '@jazzmind/busibox-app';

const PRESIGN_SECONDS = 3600;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const ids = await ensureDataDocuments(auth.apiToken);
  const video = await getVideoById(auth.apiToken, ids.trainingVideos, id);
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (video.source !== 'uploaded' || !video.fileId) {
    return NextResponse.json({ error: 'Not an uploaded video' }, { status: 400 });
  }

  const url = await getChatAttachmentUrl(video.fileId, { accessToken: auth.apiToken }, PRESIGN_SECONDS);
  return NextResponse.json({
    url,
    mimeType: video.mimeType ?? 'video/mp4',
    expiresAt: new Date(Date.now() + PRESIGN_SECONDS * 1000).toISOString(),
  });
}
```

- [ ] **Step 6: Run — expect pass**

Run: `npx vitest run app/api/training-videos/`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add app/api/training-videos
git commit -m "feat: training-videos read route with presigned playback + refresh-url"
```

---

## Task 11: Progress GET/PUT routes (TDD)

**Files:**
- Create: `app/api/training-videos/[id]/progress/route.ts`
- Test: `app/api/training-videos/[id]/progress/route.test.ts`

- [ ] **Step 1: Failing tests**

```ts
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
```

- [ ] **Step 2: Run — expect failure**

Run: `npx vitest run app/api/training-videos/\[id\]/progress/`
Expected: module not found.

- [ ] **Step 3: Implement**

```ts
// app/api/training-videos/[id]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { getVideoProgress, upsertVideoProgress, getVideoById } from '@/lib/video-data-api';

const putSchema = z.object({
  positionSeconds: z.number().min(0),
  durationSeconds: z.number().min(0),
});

interface Ctx { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const ids = await ensureDataDocuments(auth.apiToken);
  const progress = await getVideoProgress(auth.apiToken, ids.trainingVideoProgress, auth.userId, id);
  return NextResponse.json({ progress });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const ids = await ensureDataDocuments(auth.apiToken);
  const video = await getVideoById(auth.apiToken, ids.trainingVideos, id);
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  const progress = await upsertVideoProgress(auth.apiToken, ids.trainingVideoProgress, {
    visitorId: auth.userId,
    videoId: id,
    moduleId: video.moduleId,
    lessonId: video.lessonId,
    positionSeconds: parsed.data.positionSeconds,
    durationSeconds: parsed.data.durationSeconds,
  });
  return NextResponse.json({ progress });
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npx vitest run app/api/training-videos/\[id\]/progress/`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/training-videos/\[id\]/progress
git commit -m "feat: per-user video progress GET and PUT"
```

---

## Task 12: UploadedPlayer component

**Files:**
- Create: `components/video-players/UploadedPlayer.tsx`

(No tests for raw player bindings — they're glue code. The `VideoPlayer` dispatcher in Task 16 has the meaningful tests.)

- [ ] **Step 1: Implement the component**

```tsx
'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  getDuration: () => number;
}

interface Props {
  src: string;
  mimeType: string;
  videoId: string;
  onTimeUpdate: (position: number, duration: number) => void;
  onRefreshUrl: () => Promise<string>;
}

const UploadedPlayer = forwardRef<VideoPlayerHandle, Props>(function UploadedPlayer(
  { src, mimeType, videoId, onTimeUpdate, onRefreshUrl }, ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const refreshingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      const v = videoRef.current;
      if (v) v.currentTime = seconds;
    },
    getDuration: () => videoRef.current?.duration ?? 0,
  }), []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const handleTimeUpdate = () => onTimeUpdate(el.currentTime, el.duration || 0);
    const handleError = async () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      try {
        const lastTime = el.currentTime;
        const freshUrl = await onRefreshUrl();
        el.src = freshUrl;
        el.currentTime = lastTime;
        await el.play().catch(() => {});
      } catch (err) {
        console.error('[video] refresh failed', err);
      } finally {
        refreshingRef.current = false;
      }
    };
    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('error', handleError);
    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, onRefreshUrl]);

  return (
    <video
      ref={videoRef}
      controls
      preload="metadata"
      className="w-full h-full"
      data-video-id={videoId}
    >
      <source src={src} type={mimeType} />
    </video>
  );
});

export default UploadedPlayer;
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/video-players/UploadedPlayer.tsx
git commit -m "feat: UploadedPlayer component with auto URL refresh"
```

---

## Task 13: YouTubePlayer + VimeoPlayer + IframePlayer components

**Files:**
- Create: `components/video-players/YouTubePlayer.tsx`
- Create: `components/video-players/VimeoPlayer.tsx`
- Create: `components/video-players/IframePlayer.tsx`

- [ ] **Step 1: Implement YouTubePlayer**

```tsx
'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { VideoPlayerHandle } from './UploadedPlayer';
import { extractYouTubeId } from '@/lib/video-embed';

interface Props {
  url: string;
  onTimeUpdate: (position: number, duration: number) => void;
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}
interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
}

let ytApiLoaded: Promise<void> | null = null;
function loadYTApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiLoaded) return ytApiLoaded;
  ytApiLoaded = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return ytApiLoaded;
}

const YouTubePlayer = forwardRef<VideoPlayerHandle, Props>(function YouTubePlayer(
  { url, onTimeUpdate }, ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (s) => playerRef.current?.seekTo(s, true),
    getDuration: () => playerRef.current?.getDuration() ?? 0,
  }), []);

  useEffect(() => {
    const videoId = extractYouTubeId(url);
    if (!videoId || !containerRef.current) return;
    let interval: ReturnType<typeof setInterval> | null = null;

    loadYTApi().then(() => {
      if (!containerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { host: 'https://www.youtube-nocookie.com' },
        events: {
          onReady: () => {
            interval = setInterval(() => {
              const p = playerRef.current;
              if (!p) return;
              onTimeUpdate(p.getCurrentTime(), p.getDuration());
            }, 5000);
          },
        },
      });
    });

    return () => { if (interval) clearInterval(interval); };
  }, [url, onTimeUpdate]);

  return <div ref={containerRef} className="w-full h-full" />;
});

export default YouTubePlayer;
```

- [ ] **Step 2: Implement VimeoPlayer**

```tsx
'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Player from '@vimeo/player';
import type { VideoPlayerHandle } from './UploadedPlayer';
import { extractVimeoId } from '@/lib/video-embed';

interface Props {
  url: string;
  onTimeUpdate: (position: number, duration: number) => void;
}

const VimeoPlayer = forwardRef<VideoPlayerHandle, Props>(function VimeoPlayer(
  { url, onTimeUpdate }, ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (s) => { playerRef.current?.setCurrentTime(s).catch(() => {}); },
    getDuration: () => 0, // async in Vimeo; use onTimeUpdate duration instead
  }), []);

  useEffect(() => {
    const id = extractVimeoId(url);
    if (!id || !containerRef.current) return;
    const player = new Player(containerRef.current, { id: Number(id), responsive: true });
    playerRef.current = player;

    const interval = setInterval(async () => {
      try {
        const [time, duration] = await Promise.all([player.getCurrentTime(), player.getDuration()]);
        onTimeUpdate(time, duration);
      } catch { /* player not ready */ }
    }, 5000);

    return () => { clearInterval(interval); player.destroy().catch(() => {}); };
  }, [url, onTimeUpdate]);

  return <div ref={containerRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />;
});

export default VimeoPlayer;
```

- [ ] **Step 3: Implement IframePlayer**

```tsx
'use client';
import { forwardRef, useImperativeHandle } from 'react';
import type { VideoPlayerHandle } from './UploadedPlayer';

interface Props { url: string }

const IframePlayer = forwardRef<VideoPlayerHandle, Props>(function IframePlayer({ url }, ref) {
  useImperativeHandle(ref, () => ({ seekTo: () => {}, getDuration: () => 0 }), []);
  return (
    <div className="relative w-full h-full">
      <iframe src={url} className="w-full h-full" allow="autoplay; fullscreen" />
      <a
        href={url} target="_blank" rel="noreferrer"
        className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded"
      >
        Open in new tab
      </a>
    </div>
  );
});

export default IframePlayer;
```

- [ ] **Step 4: Type check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/video-players
git commit -m "feat: YouTube, Vimeo, and iframe video player adapters"
```

---

## Task 14: VideoPlayer dispatcher + resume + debounced writer (TDD)

**Files:**
- Create: `components/VideoPlayer.tsx`
- Test: `components/VideoPlayer.test.tsx`

- [ ] **Step 1: Failing tests**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VideoPlayer from './VideoPlayer';
import type { TrainingVideoWithPlayback } from '@/lib/types';

// Mock the player adapters to avoid loading real SDKs in tests
vi.mock('./video-players/UploadedPlayer', () => ({
  default: () => <div data-testid="uploaded-player" />,
}));
vi.mock('./video-players/YouTubePlayer', () => ({
  default: () => <div data-testid="youtube-player" />,
}));
vi.mock('./video-players/VimeoPlayer', () => ({
  default: () => <div data-testid="vimeo-player" />,
}));
vi.mock('./video-players/IframePlayer', () => ({
  default: () => <div data-testid="iframe-player" />,
}));

const uploadedVideo: TrainingVideoWithPlayback = {
  id: 'v1', moduleId: 'mod-1', title: 'Intro', source: 'uploaded',
  fileId: 'f1', mimeType: 'video/mp4', order: 0,
  uploadedBy: 'u', uploadedAt: '2026-04-17T00:00:00Z',
  playback: { kind: 'uploaded', url: 'https://minio/x', mimeType: 'video/mp4', expiresAt: '2099' },
};

beforeEach(() => {
  vi.useFakeTimers();
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ progress: null }) }) as never;
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('VideoPlayer', () => {
  it('renders UploadedPlayer for uploaded source', async () => {
    render(<VideoPlayer video={uploadedVideo} />);
    await waitFor(() => expect(screen.getByTestId('uploaded-player')).toBeTruthy());
  });

  it('renders YouTubePlayer for youtube external', async () => {
    const v: TrainingVideoWithPlayback = {
      ...uploadedVideo,
      source: 'external',
      externalUrl: 'https://youtu.be/abc', externalProvider: 'youtube',
      playback: { kind: 'external', provider: 'youtube', url: 'https://youtu.be/abc' },
    };
    render(<VideoPlayer video={v} />);
    await waitFor(() => expect(screen.getByTestId('youtube-player')).toBeTruthy());
  });

  it('shows resume prompt when progress has partial position', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true, json: async () => ({ progress: { positionSeconds: 154, durationSeconds: 600, completed: false } }),
    });
    render(<VideoPlayer video={uploadedVideo} />);
    await waitFor(() => expect(screen.getByText(/Resume from/)).toBeTruthy());
    expect(screen.getByText(/2:34/)).toBeTruthy();
  });

  it('does not show resume prompt when completed', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true, json: async () => ({ progress: { positionSeconds: 580, durationSeconds: 600, completed: true } }),
    });
    render(<VideoPlayer video={uploadedVideo} />);
    await waitFor(() => expect(screen.queryByText(/Resume from/)).toBeNull());
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npx vitest run components/VideoPlayer.test.tsx`
Expected: module not found.

- [ ] **Step 3: Implement**

```tsx
// components/VideoPlayer.tsx
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import UploadedPlayer, { type VideoPlayerHandle } from './video-players/UploadedPlayer';
import YouTubePlayer from './video-players/YouTubePlayer';
import VimeoPlayer from './video-players/VimeoPlayer';
import IframePlayer from './video-players/IframePlayer';
import type { TrainingVideoWithPlayback, VideoProgress } from '@/lib/types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const WRITE_DEBOUNCE_MS = 5000;

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  video: TrainingVideoWithPlayback;
}

export default function VideoPlayer({ video }: Props) {
  const [resume, setResume] = useState<VideoProgress | null>(null);
  const [prompt, setPrompt] = useState<{ position: number } | null>(null);
  const playerRef = useRef<VideoPlayerHandle>(null);
  const pendingWrite = useRef<{ position: number; duration: number } | null>(null);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch resume state on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${basePath}/api/training-videos/${video.id}/progress`, { credentials: 'include' });
        if (!res.ok || cancelled) return;
        const { progress } = await res.json() as { progress: VideoProgress | null };
        if (!progress) return;
        setResume(progress);
        if (!progress.completed && progress.positionSeconds > 0 && progress.positionSeconds < progress.durationSeconds) {
          setPrompt({ position: progress.positionSeconds });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [video.id]);

  const flushWrite = useCallback(async () => {
    const pending = pendingWrite.current;
    if (!pending) return;
    pendingWrite.current = null;
    try {
      await fetch(`${basePath}/api/training-videos/${video.id}/progress`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(pending),
      });
    } catch { /* ignore */ }
  }, [video.id]);

  const handleTimeUpdate = useCallback((position: number, duration: number) => {
    if (!Number.isFinite(position) || !Number.isFinite(duration)) return;
    pendingWrite.current = { position, duration };
    if (writeTimer.current) return;
    writeTimer.current = setTimeout(async () => {
      writeTimer.current = null;
      await flushWrite();
    }, WRITE_DEBOUNCE_MS);
  }, [flushWrite]);

  const refreshUrl = useCallback(async (): Promise<string> => {
    const res = await fetch(`${basePath}/api/training-videos/${video.id}/refresh-url`, { credentials: 'include' });
    if (!res.ok) throw new Error('refresh failed');
    const { url } = await res.json() as { url: string };
    return url;
  }, [video.id]);

  // Flush on unmount / tab hide
  useEffect(() => {
    const onHide = () => { void flushWrite(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onHide);
      void flushWrite();
    };
  }, [flushWrite]);

  const handleResume = () => {
    if (prompt && playerRef.current) playerRef.current.seekTo(prompt.position);
    setPrompt(null);
  };
  const handleStartOver = () => {
    if (playerRef.current) playerRef.current.seekTo(0);
    setPrompt(null);
  };

  const inner = (() => {
    if (video.playback.kind === 'uploaded') {
      return (
        <UploadedPlayer
          ref={playerRef}
          src={video.playback.url}
          mimeType={video.playback.mimeType}
          videoId={video.id}
          onTimeUpdate={handleTimeUpdate}
          onRefreshUrl={refreshUrl}
        />
      );
    }
    if (video.playback.provider === 'youtube') {
      return <YouTubePlayer ref={playerRef} url={video.playback.url} onTimeUpdate={handleTimeUpdate} />;
    }
    if (video.playback.provider === 'vimeo') {
      return <VimeoPlayer ref={playerRef} url={video.playback.url} onTimeUpdate={handleTimeUpdate} />;
    }
    return <IframePlayer ref={playerRef} url={video.playback.url} />;
  })();

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {inner}
        {prompt && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/80 text-white text-sm rounded px-3 py-2 flex items-center justify-between gap-3">
            <span>Resume from {formatTime(prompt.position)}?</span>
            <div className="flex gap-2">
              <button onClick={handleResume} className="px-2 py-1 bg-indigo-500 rounded">Resume</button>
              <button onClick={handleStartOver} className="px-2 py-1 bg-gray-600 rounded">Start over</button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{video.title}</h3>
        {video.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{video.description}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npx vitest run components/VideoPlayer.test.tsx`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add components/VideoPlayer.tsx components/VideoPlayer.test.tsx
git commit -m "feat: VideoPlayer dispatcher with resume prompt + debounced writer"
```

---

## Task 15: Integrate VideoPlayer into module + lesson pages

**Files:**
- Modify: module page (likely `app/(authenticated)/modules/[moduleId]/page.tsx`)
- Modify: lesson page (likely `app/(authenticated)/modules/[moduleId]/lessons/[lessonId]/page.tsx`)

- [ ] **Step 1: Locate the pages**

Run: `ls app/\(authenticated\)/modules` and `ls app/\(authenticated\)/modules/\[moduleId\]`
Record the paths. The lesson page may live at `app/(authenticated)/modules/[moduleId]/lessons/[lessonId]/page.tsx` or similar.

- [ ] **Step 2: Add a server helper that fetches videos**

Create `lib/video-fetch.ts`:

```ts
import 'server-only';
import { cookies } from 'next/headers';

export async function fetchVideos(moduleId: string, lessonId?: string) {
  const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const qs = new URLSearchParams({ moduleId });
  if (lessonId) qs.set('lessonId', lessonId);
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${host}${base}/api/training-videos?${qs}`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const { videos } = await res.json();
  return videos;
}
```

- [ ] **Step 3: Render in the module page**

At the top of the module page's main content, add:

```tsx
import VideoPlayer from '@/components/VideoPlayer';
import { fetchVideos } from '@/lib/video-fetch';

// inside the component (async server component):
const videos = await fetchVideos(moduleId);
const moduleLevel = videos.find((v: { lessonId?: string }) => !v.lessonId);
// ... in JSX, before lesson list:
{moduleLevel && (
  <div className="mb-8">
    <VideoPlayer video={moduleLevel} />
  </div>
)}
```

If the existing module page is a client component, convert the video fetch into a `useEffect` + state load, or extract a server wrapper component. Follow the pattern of whatever's already there.

- [ ] **Step 4: Render in the lesson page**

At the top of the lesson page's main content:

```tsx
const videos = await fetchVideos(moduleId, lessonId);
const lessonVideo = videos[0]; // lowest order
// ... in JSX:
{lessonVideo && (
  <div className="mb-6">
    <VideoPlayer video={lessonVideo} />
  </div>
)}
```

- [ ] **Step 5: Manual verify**

Run: `npm run dev`. Navigate to a module page and a lesson page. No videos exist yet, so no player should render (that's correct). No console errors.

- [ ] **Step 6: Commit**

```bash
git add app/\(authenticated\)/modules lib/video-fetch.ts
git commit -m "feat: render VideoPlayer on module and lesson pages"
```

---

## Task 16: VideoUploadField component (XHR upload with progress)

**Files:**
- Create: `components/admin/VideoUploadField.tsx`

- [ ] **Step 1: Implement**

```tsx
'use client';
import { useState } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

interface Props {
  moduleId: string;
  lessonId?: string;
  title: string;
  description?: string;
  order?: number;
  file: File;
  onDone: (videoId: string) => void;
  onError: (message: string) => void;
}

export default function VideoUploadField({
  moduleId, lessonId, title, description, order, file, onDone, onError,
}: Props) {
  const [percent, setPercent] = useState(0);
  const [xhr, setXhr] = useState<XMLHttpRequest | null>(null);

  const start = () => {
    if (file.size > MAX_BYTES) {
      onError(`File is ${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB. Max is 2 GB.`);
      return;
    }
    if (!file.type.startsWith('video/')) {
      onError('File must be a video.');
      return;
    }
    const fd = new FormData();
    fd.set('file', file);
    fd.set('moduleId', moduleId);
    fd.set('title', title);
    if (lessonId) fd.set('lessonId', lessonId);
    if (description) fd.set('description', description);
    if (order !== undefined) fd.set('order', String(order));

    const req = new XMLHttpRequest();
    req.open('POST', `${basePath}/api/admin/training-videos`);
    req.withCredentials = true;
    req.upload.onprogress = (e) => {
      if (e.lengthComputable) setPercent(Math.round((e.loaded / e.total) * 100));
    };
    req.onload = () => {
      if (req.status >= 200 && req.status < 300) {
        try {
          const body = JSON.parse(req.responseText);
          onDone(body.id);
        } catch { onError('Upload succeeded but response was malformed.'); }
      } else {
        let msg = `Upload failed (${req.status})`;
        try { msg = JSON.parse(req.responseText).error || msg; } catch {}
        onError(msg);
      }
    };
    req.onerror = () => onError('Network error during upload.');
    setXhr(req);
    req.send(fd);
  };

  const cancel = () => { xhr?.abort(); setXhr(null); setPercent(0); };

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
      </div>
      {xhr ? (
        <>
          <div className="h-2 bg-gray-200 rounded">
            <div className="h-2 bg-indigo-500 rounded transition-all" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <span>{percent}%</span>
            <button type="button" onClick={cancel} className="text-red-600">Cancel</button>
          </div>
        </>
      ) : (
        <button type="button" onClick={start} className="px-3 py-1.5 bg-indigo-500 text-white rounded text-sm">
          Start upload
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/VideoUploadField.tsx
git commit -m "feat: VideoUploadField with XHR progress"
```

---

## Task 17: VideoFormModal + VideoListByModule components

**Files:**
- Create: `components/admin/VideoFormModal.tsx`
- Create: `components/admin/VideoListByModule.tsx`

- [ ] **Step 1: Implement VideoFormModal**

```tsx
'use client';
import { useState, useEffect } from 'react';
import { MODULES } from '@/lib/module-data';
import type { TrainingVideo } from '@/lib/types';
import VideoUploadField from './VideoUploadField';
import { detectProvider } from '@/lib/video-embed';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface Props {
  existing?: TrainingVideo;
  onClose: () => void;
  onSaved: () => void;
}

export default function VideoFormModal({ existing, onClose, onSaved }: Props) {
  const isEdit = !!existing;
  const [sourceChoice, setSourceChoice] = useState<'uploaded' | 'external'>(existing?.source ?? 'uploaded');
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState(existing?.externalUrl ?? '');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [moduleId, setModuleId] = useState(existing?.moduleId ?? MODULES[0].id);
  const [lessonId, setLessonId] = useState(existing?.lessonId ?? '');
  const [order, setOrder] = useState(existing?.order ?? 0);
  const [error, setError] = useState<string | null>(null);

  const selectedModule = MODULES.find((m) => m.id === moduleId);
  const detectedProvider = !isEdit && sourceChoice === 'external' && externalUrl
    ? (() => { try { return detectProvider(externalUrl); } catch { return null; } })()
    : null;

  const submitExternal = async () => {
    const res = await fetch(`${basePath}/api/admin/training-videos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        source: 'external', externalUrl, moduleId, title,
        description: description || undefined,
        lessonId: lessonId || undefined,
        order,
      }),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed'); return; }
    onSaved();
  };

  const submitEdit = async () => {
    const res = await fetch(`${basePath}/api/admin/training-videos/${existing!.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, description: description || undefined, moduleId, lessonId: lessonId || undefined, order }),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed'); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit video' : 'Add video'}</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        {!isEdit && (
          <div className="mb-4">
            <label className="mr-4"><input type="radio" checked={sourceChoice === 'uploaded'} onChange={() => setSourceChoice('uploaded')} /> Upload file</label>
            <label><input type="radio" checked={sourceChoice === 'external'} onChange={() => setSourceChoice('external')} /> Paste link</label>
          </div>
        )}

        {!isEdit && sourceChoice === 'uploaded' && (
          <div className="mb-4">
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        )}
        {!isEdit && sourceChoice === 'external' && (
          <div className="mb-4">
            <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full border rounded px-2 py-1" />
            {detectedProvider && <div className="text-xs text-gray-500 mt-1">Detected: {detectedProvider}</div>}
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-3">
          <label className="block text-sm">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Module</label>
            <select value={moduleId} onChange={(e) => { setModuleId(e.target.value); setLessonId(''); }} className="w-full border rounded px-2 py-1">
              {MODULES.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm">Lesson</label>
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="">Module-level</option>
              {selectedModule?.lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-24 border rounded px-2 py-1" />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 border rounded">Cancel</button>
          {isEdit ? (
            <button onClick={submitEdit} className="px-3 py-1.5 bg-indigo-500 text-white rounded">Save</button>
          ) : sourceChoice === 'external' ? (
            <button onClick={submitExternal} className="px-3 py-1.5 bg-indigo-500 text-white rounded">Save</button>
          ) : file ? (
            <VideoUploadField
              file={file} moduleId={moduleId} title={title}
              description={description || undefined}
              lessonId={lessonId || undefined}
              order={order}
              onDone={() => onSaved()}
              onError={setError}
            />
          ) : (
            <button disabled className="px-3 py-1.5 bg-gray-300 rounded">Pick a file</button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement VideoListByModule**

```tsx
'use client';
import type { TrainingVideo } from '@/lib/types';
import { MODULES } from '@/lib/module-data';
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface Props {
  videos: TrainingVideo[];
  onEdit: (v: TrainingVideo) => void;
  onChanged: () => void;
}

export default function VideoListByModule({ videos, onEdit, onChanged }: Props) {
  const swap = async (a: TrainingVideo, b: TrainingVideo) => {
    await Promise.all([
      fetch(`${basePath}/api/admin/training-videos/${a.id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ order: b.order }),
      }),
      fetch(`${basePath}/api/admin/training-videos/${b.id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ order: a.order }),
      }),
    ]);
    onChanged();
  };

  const remove = async (v: TrainingVideo) => {
    if (!confirm(`Delete '${v.title}'? This also removes the file from storage.`)) return;
    const res = await fetch(`${basePath}/api/admin/training-videos/${v.id}`, {
      method: 'DELETE', credentials: 'include',
    });
    if (res.ok) onChanged();
  };

  return (
    <div className="space-y-4">
      {MODULES.map((mod) => {
        const modVideos = videos.filter((v) => v.moduleId === mod.id).sort((a, b) => a.order - b.order);
        if (modVideos.length === 0) return null;
        return (
          <div key={mod.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
            <h3 className="font-semibold mb-2">{mod.title}</h3>
            <ul className="divide-y">
              {modVideos.map((v, idx) => {
                const lesson = v.lessonId ? mod.lessons.find((l) => l.id === v.lessonId) : null;
                const badge = v.source === 'uploaded' ? 'Uploaded' : (v.externalProvider ?? 'External');
                return (
                  <li key={v.id} className="py-2 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{v.title}</div>
                      <div className="text-xs text-gray-500">
                        {badge} · {lesson ? `Lesson: ${lesson.title}` : 'Module-level'}
                        {v.sizeBytes ? ` · ${(v.sizeBytes / 1024 / 1024).toFixed(0)} MB` : ''}
                      </div>
                    </div>
                    <button disabled={idx === 0} onClick={() => swap(v, modVideos[idx - 1])} className="p-1 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                    <button disabled={idx === modVideos.length - 1} onClick={() => swap(v, modVideos[idx + 1])} className="p-1 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => onEdit(v)} className="p-1"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(v)} className="p-1 text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/admin/VideoFormModal.tsx components/admin/VideoListByModule.tsx
git commit -m "feat: admin video form modal and list-by-module components"
```

---

## Task 18: Admin videos page + nav link

**Files:**
- Create: `app/(authenticated)/admin/videos/page.tsx`
- Modify: `app/(authenticated)/admin/page.tsx` (add nav link)

- [ ] **Step 1: Implement `/admin/videos` page**

```tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@jazzmind/busibox-app/components/auth/SessionProvider';
import { useRouter } from 'next/navigation';
import { Shield, Plus } from 'lucide-react';
import type { TrainingVideo } from '@/lib/types';
import VideoListByModule from '@/components/admin/VideoListByModule';
import VideoFormModal from '@/components/admin/VideoFormModal';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function AdminVideosPage() {
  const { user } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TrainingVideo | null>(null);
  const isAdmin = user?.roles?.includes('admin') ?? false;

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${basePath}/api/admin/training-videos`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setVideos(data.videos ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin && user) { router.replace('/'); return; }
    if (isAdmin) void refresh();
  }, [isAdmin, user, router, refresh]);

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Training Videos</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded">
          <Plus className="w-4 h-4" /> Add video
        </button>
      </div>
      {loading ? (
        <div className="animate-pulse h-64 bg-gray-200 rounded" />
      ) : (
        <VideoListByModule
          videos={videos}
          onEdit={(v) => { setEditing(v); setShowForm(true); }}
          onChanged={refresh}
        />
      )}
      {showForm && (
        <VideoFormModal
          existing={editing ?? undefined}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); void refresh(); }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add nav link in existing admin page**

In `app/(authenticated)/admin/page.tsx`, near the top of the main content (after the heading or near other admin links), add:

```tsx
import Link from 'next/link';
import { Video } from 'lucide-react';

// inside the JSX, e.g. below the page title:
<div className="mb-6">
  <Link href="/admin/videos" className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border rounded text-sm hover:bg-gray-50">
    <Video className="w-4 h-4" /> Manage Training Videos
  </Link>
</div>
```

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`. Log in as an admin user (ensure JWT includes `admin` role, or set `TEST_SESSION_JWT` accordingly). Visit `/admin/videos`. Verify the page loads with "Add video" button.

- [ ] **Step 4: Commit**

```bash
git add app/\(authenticated\)/admin
git commit -m "feat: /admin/videos page and nav link"
```

---

## Task 19: README + deployment notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add Videos section to README**

Append this section after the existing "Customization" section:

````markdown
## Training Videos

Admins can upload videos or link to YouTube/Vimeo content from `/admin/videos`. See the full design at `docs/superpowers/specs/2026-04-17-video-hosting-design.md`.

### Admin role

Video management requires the `admin` role in the user's JWT. This uses the same check as the existing `/admin` dashboard — grant the role through Busibox Portal's authz self-service.

### Upload limits

Phase 1 uses single-request multipart uploads, capped at 2 GB. For uploads larger than ~500 MB to be reliable, the deployment needs:

**nginx** (in the `apps-lxc` container config):

```nginx
client_max_body_size 2100m;
proxy_read_timeout 600s;
proxy_send_timeout 600s;
```

**Next.js route config** is already set (`runtime = 'nodejs'`, `maxDuration = 600` on the upload route).

A future Phase 2 can swap to presigned direct-to-MinIO uploads — see the design doc's §10.4.

### Data documents

Two new data-api documents are created on first admin load:
- `ai-training-videos` (`visibility: authenticated`) — video metadata
- `ai-training-video-progress` (`visibility: personal`) — per-user resume state
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document training video feature and deploy tuning"
```

---

## Task 20: Full-suite smoke + manual checklist

**Files:** none — verification pass.

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 2: Run type check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Run through the manual checklist from the spec (§11.5)**

Perform each in order against a running dev server with an admin user:

- [ ] Upload ~1.5 GB MP4; play; resume works; delete removes MinIO object.
- [ ] Add a YouTube link (`youtu.be/...`); verify embed and resume.
- [ ] Add a Vimeo link (`vimeo.com/...`); verify embed and resume.
- [ ] Watch partway, close tab, reopen — resume prompt shows correct time.
- [ ] Non-admin user visits `/admin/videos` → redirected / access denied.
- [ ] Module page with no video renders cleanly.
- [ ] Lesson page with only a module-level video does NOT render the module video on the lesson page.

Record any bugs found as follow-up commits.

- [ ] **Step 4: No commit** — verification only, unless bugs are fixed along the way.

---

## Self-Review

**Spec coverage** (each spec section vs task that implements it):

| Spec § | Content | Tasks |
|---|---|---|
| §4 Architecture | single-app, MinIO via data-api | Task 4, 10 |
| §5.1 training-videos schema | schema fields | Task 4 |
| §5.2 training-video-progress schema | schema fields | Task 4 |
| §5.3 helpers | list/get/insert/update/delete + progress | Task 5 |
| §5.4 derivation rules | external provider detection | Task 7 (POST external) |
| §6.1 admin routes | POST, GET, PATCH, DELETE | Tasks 7, 8, 9 |
| §6.2 read routes | GET list, GET/PUT progress, refresh-url | Tasks 10, 11 |
| §7 Admin UI | /admin/videos, modals, list | Tasks 17, 18 |
| §8 Playback UI | VideoPlayer dispatcher + per-source players + resume | Tasks 12–14 |
| §8.2 presigned URL refresh | UploadedPlayer + refresh-url route | Tasks 10, 12 |
| §9 Authorization | requireAdmin + existing admin gate | Task 6, 18 |
| §10 Error handling + limits | size caps, cleanup, nginx notes | Tasks 8, 16, 19 |
| §11 Testing | route + component + unit tests | Tasks 3, 5, 6, 7, 8, 9, 10, 11, 14 |
| §12 File inventory | all files | Tasks 1–19 |
| §13 Open questions | Phase 2, captions, etc. | Not tasks — documented in README + spec |

No gaps.

**Placeholder scan:** No "TBD" / "implement later" / "similar to above" in any task. Every code block is complete.

**Type consistency:**
- `TrainingVideo` / `TrainingVideoWithPlayback` / `VideoProgress` defined in Task 2, used consistently in Tasks 5, 10, 11, 14.
- `VideoPlayerHandle` defined in Task 12, used in Tasks 13, 14.
- `requireAdmin` signature in Task 6 matches calls in Tasks 7, 8, 9.
- Document IDs key names (`trainingVideos`, `trainingVideoProgress`) match between Task 4 schema and all subsequent helper/route calls.
- `MODULES` import path `@/lib/module-data` matches existing code.

No inconsistencies.
