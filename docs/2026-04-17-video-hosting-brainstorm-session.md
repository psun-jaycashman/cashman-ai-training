# Brainstorming Session — Video Hosting for Training Modules

**Date:** 2026-04-17
**Project:** cashman-ai-training
**Outcome:** Design approved. Full spec at `docs/superpowers/specs/2026-04-17-video-hosting-design.md`.

---

## Original Request

> make it possible to host videos on the busibox so user can access.
> (later) but also allow admin to bring in external video hosting services like youtube/vimeo as option as well.

## Clarifying Q&A (summary)

1. **Scope**: module-level videos + optional per-lesson videos + admin upload/manage UI.
2. **Storage**: Busibox MinIO via the data-api's generic `uploadChatAttachment` path (discovered in `@jazzmind/busibox-app/lib/data`). The shared `lib/media/*` module exists but is shaped for OpenAI-Sora workflows — wrong fit for training videos.
3. **File size**: up to 2 GB per video.
4. **Viewers**: any authenticated user.
5. **External sources**: YouTube / Vimeo / other URLs supported alongside uploads.
6. **Resume playback**: cross-session, cross-device, tracked in data-api (same pattern as existing `UserProgress`).

## Key Design Decisions

| Decision | Chosen | Why |
|---|---|---|
| Metadata model | New `training-videos` data-api document | Matches existing `progress` / `quiz-scores` / `badges` pattern. Existing `VideoRecord` in `@jazzmind/busibox-app/lib/media` rejected as Sora-shaped. |
| Upload mechanism | Phase 1: `uploadChatAttachment` (single-request multipart). Phase 2: presigned direct-to-MinIO (deferred, blocked on data-api endpoints). | Ships 80% case today; migration path preserves schema and playback. |
| Source discriminator | `source: 'uploaded' \| 'external'` field on the video record | One schema covers both cases cleanly. |
| Resume-playback storage | New `training-video-progress` document, `visibility: 'personal'` | Cross-device resume; analytics-ready. |
| External-video resume | Supported for YouTube + Vimeo via their player SDKs | Consistent UX regardless of source. |
| Admin auth | `cashman-ai-training:admin` role via `requireAdmin` helper | Reuse existing Busibox authz pattern. |

## Sections Approved During Brainstorm

1. Architecture overview
2. Data model (`training-videos`, `training-video-progress`)
3. API routes (4 admin + 4 read)
4. Admin UI (`/admin/videos` with add/edit modals)
5. Playback UI + resume
6. Authorization (viewer/admin split)
7. Error handling, limits, and 2 GB ceiling (incl. nginx / Next.js tuning)
8. Testing (unit + route + component + manual checklist)

## Next Steps

- Invoke `writing-plans` skill to produce the implementation plan.
- Implementation follows plan + code reviews per standard workflow.

See the full spec at `docs/superpowers/specs/2026-04-17-video-hosting-design.md` for the authoritative version.
