# Design — Video Hosting for Training Modules

**Date:** 2026-04-17
**App:** cashman-ai-training (Next.js 16 Busibox app)
**Status:** Approved for implementation planning

---

## 1. Overview

Training modules and lessons currently have an empty `videoUrl` field. This design adds video hosting so that:

- Each of the 8 modules can have a module-level video (instructor intro, overview).
- Each lesson within a module can optionally have its own video.
- Admins upload and manage videos through an in-app UI, without code deploys.
- Admins can either **upload a file** (stored on Busibox MinIO via the data-api) or **paste a link** to an external host (YouTube, Vimeo, or any other URL).
- Any authenticated user can watch videos.
- Users resume watching where they left off, across sessions and devices.

## 2. Goals

- Admins manage the full video lifecycle (CRUD + reorder) through `/admin/videos`.
- Uploaded videos live in MinIO via the existing `uploadChatAttachment` / `getChatAttachmentUrl` / `deleteChatAttachment` helpers from `@jazzmind/busibox-app` — no new infra service required.
- External-hosted videos (YouTube, Vimeo, other) render consistently with uploaded ones.
- Resume-playback works for uploaded, YouTube, and Vimeo sources.
- Support file sizes up to 2 GB, documented ops tuning, with a clear migration path to presigned-URL direct uploads (Phase 2).

## 3. Non-goals (v1)

- Resumable/chunked uploads (Phase 2, blocked on data-api presigned-URL endpoints).
- Captioning, transcription, transcoding, or adaptive bitrate streaming.
- Per-video or per-user ACLs — visibility is binary (all authenticated users can watch, admins can manage).
- Link-rot detection for external videos.
- End-to-end browser automation tests.

## 4. Architecture

Single Next.js app owns the UX end-to-end; no new service.

- **Bytes**: MinIO, accessed only through data-api via `@jazzmind/busibox-app` helpers. The app never talks to MinIO directly.
- **Metadata**: new `training-videos` data-api document, `visibility: 'authenticated'`.
- **Resume state**: new `training-video-progress` data-api document, `visibility: 'personal'`.
- **Module/lesson linkage**: foreign keys (`moduleId`, optional `lessonId`) to the hard-coded `MODULES` / `Lesson` structures in `lib/module-data.ts`. Content stays in code; video lookup happens at runtime.
- **Admin uploads**: routed through our Next.js API routes (server-side token exchange → data-api), not direct from the browser.
- **Playback**: uploaded videos get a short-lived presigned MinIO URL via `getChatAttachmentUrl` (1 hr). External videos use their host's embed (`youtube-nocookie.com/embed/...`, `player.vimeo.com/video/...`, or raw iframe).

## 5. Data Model

### 5.1 `training-videos` document

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | ✓ | generated |
| `moduleId` | string | ✓ | FK to `MODULES[].id` |
| `lessonId` | string | — | FK to `Lesson.id`; omitted = module-level video |
| `title` | string | ✓ | admin-editable |
| `description` | string | — | optional caption shown under the player |
| `source` | `'uploaded' \| 'external'` | ✓ | discriminator |
| `fileId` | string | if `source='uploaded'` | from `uploadChatAttachment` |
| `mimeType` | string | if `source='uploaded'` | e.g. `video/mp4` |
| `sizeBytes` | number | if `source='uploaded'` | admin display |
| `externalUrl` | string | if `source='external'` | canonical URL |
| `externalProvider` | `'youtube' \| 'vimeo' \| 'other'` | if `source='external'` | derived on save from URL host |
| `posterUrl` | string | — | uploaded: presigned URL for thumbnail; external: usually empty |
| `durationSeconds` | number | — | best-effort |
| `order` | number | ✓ | ordering within module/lesson (default: append) |
| `uploadedBy` | string | ✓ | user id from JWT |
| `uploadedAt` | string | ✓ | ISO, readonly |

Visibility: `authenticated`. Admin-role check gates writes at the route layer.

### 5.2 `training-video-progress` document

| Field | Type | Notes |
|---|---|---|
| `id` | string | generated |
| `visitorId` | string | hidden, required — matches existing progress pattern |
| `videoId` | string | FK to `training-videos` |
| `moduleId` | string | denormalized for query-by-module |
| `lessonId` | string | — |
| `positionSeconds` | number | where to resume |
| `durationSeconds` | number | snapshot at write time |
| `completed` | boolean | true once `position ≥ duration × 0.95` |
| `updatedAt` | string | ISO |

Visibility: `personal`.

### 5.3 Helpers in `lib/data-api-client.ts`

- `ensureDataDocuments` gains `trainingVideos` and `trainingVideoProgress` keys.
- Video: `listVideosForModule`, `listVideosForLesson`, `getVideoById`, `insertVideo`, `updateVideo`, `deleteVideo` (also calls `deleteChatAttachment` for uploaded sources).
- Progress: `getVideoProgress(visitorId, videoId)`, `upsertVideoProgress(...)`.

### 5.4 Derivation rules on write

- `source='external'`: parse URL host → set `externalProvider`. `youtube.com` / `youtu.be` → `youtube`; `vimeo.com` → `vimeo`; anything else valid `http(s)://` → `other`; invalid → reject.
- `source='uploaded'`: reject if `fileId` missing; populate `mimeType`/`sizeBytes` from upload response.

## 6. API Routes

### 6.1 Admin (role-gated)

| Method | Path | Body | Behavior |
|---|---|---|---|
| `POST` | `/api/admin/training-videos` | multipart **or** JSON | Multipart = upload path; JSON = external-link path. Content-type discriminates. |
| `GET` | `/api/admin/training-videos` | — | List; optional `?moduleId=` / `?lessonId=` filters. Raw records (no playback URLs). |
| `PATCH` | `/api/admin/training-videos/[id]` | JSON | Editable: `title`, `description`, `moduleId`, `lessonId`, `order`. `source` / `fileId` / `externalUrl` are immutable (delete + re-create). |
| `DELETE` | `/api/admin/training-videos/[id]` | — | Deletes record; also `deleteChatAttachment(fileId)` if uploaded. |

### 6.2 Read (any authenticated user)

| Method | Path | Behavior |
|---|---|---|
| `GET` | `/api/training-videos?moduleId=X&lessonId=Y` | Returns videos with playback info resolved inline. |
| `GET` | `/api/training-videos/[id]/progress` | Current resume state for the calling user. |
| `PUT` | `/api/training-videos/[id]/progress` | Upsert `{ positionSeconds, durationSeconds }`. |
| `GET` | `/api/training-videos/[id]/refresh-url` | Returns a fresh presigned URL for uploaded sources (for expiry recovery). |

### 6.3 Read response shape

```ts
{
  id, moduleId, lessonId?, title, description, order,
  source: 'uploaded' | 'external',
  playback:
    | { kind: 'uploaded', url: string, mimeType: string, expiresAt: string }
    | { kind: 'external', provider: 'youtube' | 'vimeo' | 'other', url: string }
}
```

### 6.4 Conventions

- All routes: `requireAuthWithTokenExchange(request, 'data-api')`.
- Admin routes: `requireAdmin` on top.
- Zod validation for all JSON bodies; consistent `ApiError` shape on failure.
- Multipart upload route: `runtime = 'nodejs'`, `maxDuration = 600`.

## 7. Admin UI

One new route: **`/admin/videos`** under the existing `(authenticated)/admin/` group. Single-page experience with modals for add/edit.

- **Layout**: heading + "Add video" button; Module / Lesson filter row; grouped list with rows per video (thumbnail, title, source badge, size/duration, lesson association, reorder arrows, Edit, Delete).
- **Add modal**: source toggle (Upload file / Paste link) at top; upload branch includes file picker with 2 GB client-side cap and live progress via `XMLHttpRequest`; external branch shows real-time provider detection under the URL input.
- **Edit modal**: same form minus source-specific fields; `source` is immutable.
- **Delete**: confirm dialog; calls `DELETE`.
- **Reorder**: `↑ ↓` buttons issue `PATCH` with swapped `order` values. Good enough for 8 modules; no drag library.

Components:
- `app/(authenticated)/admin/videos/page.tsx`
- `components/admin/VideoListByModule.tsx`
- `components/admin/VideoFormModal.tsx`
- `components/admin/VideoUploadField.tsx`

## 8. Playback UI

Module page and lesson page both render the same `<VideoPlayer video={video} />` component (server component fetches list; player is client).

Player dispatches on `playback.kind`:

| Kind | Renderer |
|---|---|
| `uploaded` | `<video controls preload="metadata" src={playback.url} />` with caption `<track>` slot for future use |
| `external` + `youtube` | `<iframe>` to `youtube-nocookie.com/embed/{id}` (ID parsed from URL — handles `youtu.be/X`, `watch?v=X`, `shorts/X`) |
| `external` + `vimeo` | `<iframe>` to `player.vimeo.com/video/{id}` |
| `external` + `other` | `<iframe src={externalUrl}>` with "Open in new tab" link beneath |

Layout: 16:9 responsive container above the lesson/module markdown; title, description, source badge beneath.

Selection rule when both levels present: lesson page shows the lesson-level video; module-level reserved for the module landing page.

### 8.1 Resume playback

Per-source adapters behind a common `{ onTimeUpdate, seekTo, getDuration }` interface:

| Source | Mechanism |
|---|---|
| uploaded | `<video>` element's `currentTime` / `seeked` / `timeupdate` |
| youtube | YouTube IFrame Player API |
| vimeo | `@vimeo/player` SDK |
| other | not supported; resume silently skipped |

Write cadence: debounced — every 5 s of play, on `pause`, `seeked`, `visibilitychange`, `beforeunload`. One `PUT /progress` per event cluster. `completed` flips at 95%.

Resume on load: progress fetched in parallel with video list. If `0 < position < duration` and not `completed`, show "Resume from 2:34 · Start over" overlay.

### 8.2 Presigned URL expiry

URL lives 1 hr. On `<video>` `error`, the player:
1. Calls `GET /api/training-videos/[id]/refresh-url`.
2. Updates `<video>.src` to the fresh URL.
3. Seeks back to last saved `positionSeconds` and resumes.

User sees ~1 s pause, no error UI. YouTube/Vimeo embeds don't have this issue.

## 9. Authorization

Two tiers:

**Viewing (any authenticated user)**: gated by `requireAuthWithTokenExchange(request, 'data-api')`. Data-api RLS enforces document visibility.

**Managing (admin only)**: new `requireAdmin(request)` helper in `lib/auth-middleware.ts`, wrapping `requireAuthWithTokenExchange` and additionally verifying the `cashman-ai-training:admin` role claim. Returns 403 on miss. Same check runs in the `/admin/*` server-side layout guard (defense-in-depth).

**Implementation note**: on first pass, read `app/(authenticated)/admin/page.tsx` to see if the existing `/admin` route already has a role gate. If yes, reuse it. If no, introduce the check here and document the role in README.

Explicitly out of scope:
- Per-video ACLs.
- Per-author edit restrictions. Any admin can edit/delete any video.
- `uploadedBy` is recorded for audit, not authz.

## 10. Error Handling and Limits

### 10.1 Upload path (Phase 1)

**Client-side pre-flight**: reject `size > 2 GB`; reject non-`video/*` mime types; friendly messages.

**Server-side**: stream multipart body to `uploadChatAttachment` (no full-file buffering); `runtime = 'nodejs'`, `maxDuration = 600`; surface data-api status codes upstream. On failure *after* MinIO write but *before* metadata insert, best-effort `deleteChatAttachment(fileId)` to avoid orphans.

**Infra**: document `client_max_body_size 2100m;` and `proxy_read_timeout 600s;` in the app deploy config / README. Missing these is the most common cause of silent upload failures.

### 10.2 Failure matrix

| Failure | UX |
|---|---|
| Client cancel | Modal stays open; progress resets |
| Network drop mid-upload | Inline "Upload failed at 43%. Retry?" — restart (no resumable uploads in v1) |
| 413 from nginx/server | Inline "File too large for current configuration. Contact admin." |
| Data-api 5xx | Inline "Storage service unavailable. Try again in a moment." |
| Presigned URL expired mid-playback | Silent refresh + seek to saved position |
| File deleted behind metadata | Overlay: "This video is no longer available." Admin UI can purge. |
| External URL dead | Provider's error page renders inside iframe (not detectable) |
| User offline | Native `<video>` error + page-level banner via `navigator.onLine` |

### 10.3 Logging

- Upload: `{ videoId, sizeBytes, durationMs, success }`.
- Presigned URL refresh failures: logged for ops.
- No PII — `visitorId` only.

### 10.4 Phase 2 migration (presigned direct-to-MinIO uploads)

Prerequisite: data-api exposes presigned-URL endpoints (not confirmed; needs Busibox infra coordination).

Change surface:
- `POST /api/admin/training-videos` multipart branch splits into `POST .../uploads/init` → `POST .../uploads/commit`.
- `VideoUploadField.tsx` uploads to the presigned URL instead of our route.
- Everything else unchanged: schema, playback, resume, admin UI shell.

## 11. Testing

### 11.1 Unit tests

- `lib/video-embed.test.ts` — URL → embed-URL parsers for YouTube (`watch?v=`, `youtu.be/`, `shorts/`, `embed/`), Vimeo (`/12345`, `player.vimeo.com/video/12345`), malformed URLs, `other` pass-through.
- `lib/data-api-client.test.ts` — extend with new helpers; assert `deleteVideo` calls `deleteChatAttachment` only for `source='uploaded'`.

### 11.2 API route tests

One file per route; mock `requireAuthWithTokenExchange` and data-api client.

Per route:
- Happy path
- Unauthenticated → 401
- Admin routes + non-admin → 403
- Invalid body → 400 with field-level errors
- `POST` external branch: valid / invalid URLs, correct `externalProvider` derivation
- `POST` multipart branch: happy path with mocked `uploadChatAttachment`
- `DELETE`: asserts cleanup call for uploaded, no cleanup for external
- `PATCH`: rejects `source` / `fileId` / `externalUrl` mutations

### 11.3 Component tests

- `VideoPlayer.test.tsx` — dispatch on `playback.kind`; resume prompt shows/hides based on progress record; "Start over" and "Resume" actions; debounced writer emits one PUT per 5 s burst of `timeupdate` events (fake timers).
- `VideoFormModal.test.tsx` — source toggle swaps fields; submit shape matches request content-type; client-side 2 GB reject.

### 11.4 Out of scope

- Live MinIO/data-api calls.
- Real iframe playback.
- E2E / Playwright (not set up in repo).
- Upload-resume tests (feature deferred to Phase 2).
- Cross-browser matrices.

### 11.5 Manual verification checklist (pre-merge)

- [ ] Upload ~1.5 GB MP4; play; resume works; delete removes MinIO object.
- [ ] Add YouTube and Vimeo links; both embed and resume.
- [ ] Partial watch → close tab → reopen → resume prompt shows correct time.
- [ ] Let presigned URL expire 1 hr+; seek past — silent refresh.
- [ ] Non-admin → `/admin/videos` → 403 (no 500, no redirect loop).
- [ ] Module page with no videos renders clean (no empty player frame).

## 12. File Inventory

**New:**
- `app/api/admin/training-videos/route.ts`
- `app/api/admin/training-videos/[id]/route.ts`
- `app/api/training-videos/route.ts`
- `app/api/training-videos/[id]/progress/route.ts`
- `app/api/training-videos/[id]/refresh-url/route.ts`
- `app/(authenticated)/admin/videos/page.tsx`
- `components/VideoPlayer.tsx`
- `components/video-players/UploadedPlayer.tsx`
- `components/video-players/YouTubePlayer.tsx`
- `components/video-players/VimeoPlayer.tsx`
- `components/video-players/IframePlayer.tsx`
- `components/admin/VideoListByModule.tsx`
- `components/admin/VideoFormModal.tsx`
- `components/admin/VideoUploadField.tsx`
- `lib/video-embed.ts`
- Test files mirroring the above.

**Modified:**
- `lib/data-api-client.ts` — add schemas, `ensureDataDocuments` keys, CRUD helpers.
- `lib/auth-middleware.ts` — add `requireAdmin`.
- `lib/types.ts` — add `TrainingVideo`, `VideoProgress`, `PlaybackInfo` types.
- `app/(authenticated)/modules/[moduleId]/page.tsx` and the lesson page — render `<VideoPlayer>` when a video exists.
- `app/(authenticated)/admin/` nav — add "Videos" link.
- `README.md` — document admin role setup and nginx `client_max_body_size` / timeout tuning.

## 13. Open Questions / Future Work

- **Presigned direct-to-MinIO uploads** (Phase 2) — blocked on data-api exposing the right endpoints. Coordinate with Busibox infra team.
- **Link-rot detection** for external videos — out of scope; revisit if external sources prove fragile.
- **Captions / transcripts** — caption `<track>` slot is scaffolded in `UploadedPlayer`; upload/auth of caption files is a separate feature.
- **Analytics on watch time** — `training-video-progress` data is rich enough to support this later without schema changes.
