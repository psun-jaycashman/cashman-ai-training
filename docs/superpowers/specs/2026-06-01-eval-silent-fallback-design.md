# Silent Fallback for AI-Graded Exercise Evaluation

**Date:** 2026-06-01
**Status:** Approved — ready for implementation plan
**Scope:** `app/api/activities/evaluate/route.ts`, `components/activities/ExerciseComponent.tsx`

## Context

Exercise submissions are AI-graded against per-exercise rubrics. The client (`ExerciseComponent.tsx`) calls `POST /api/activities/evaluate`, which forwards to `agent-api`'s `/runs/invoke` using the `record-extractor` agent and a structured `EVALUATION_SCHEMA` response. When the agent is unavailable, returns an error, or returns malformed output, the current behaviour shows the learner a red error banner ("Failed to evaluate. Try again.") even though the submission was still saved and progress was still recorded. This makes routine agent hiccups look like a broken product.

A pre-design audit of `lib/activity-data.ts` confirmed that all 15 defined exercises already have well-formed `evaluationRubric` objects (non-empty `criteria`, `passingScore <= criteria.length`, non-trivial `systemPrompt`). No rubric backfill is required.

## Goal

When AI grading is unavailable, the learner sees the same UI as someone who completed an exercise that has no rubric: completion check, static feedback panel (hints / good examples / answer key), and progress recorded — with no error message. User-input errors (file too large, missing fields, unreadable workbook) continue to surface so the learner can correct them.

## Non-Goals

- No client- or server-side retries (the B3 option was rejected during brainstorming).
- No human-review queue (B4 was rejected).
- No new admin UI, dashboard, or metrics store. One server log line per fallback is the only telemetry added.
- No rubric backfill — coverage is already 100%.
- No change to which exercises are AI-graded, the rubric format, or the agent name/tier.

## Behaviour Specification

### Failure-vs-error classification

The evaluate route distinguishes two failure classes:

**Agent failures (silent fallback applies)** — the agent could not produce a usable evaluation:
- `fetch` to `AGENT_API_URL/runs/invoke` throws (network, DNS, timeout).
- The agent-api response status is non-2xx.
- The agent-api response body contains a non-null `error` field (this includes schema-validation failures, which agent-api surfaces here because the schema is `strict: true`).
- The agent-api response body is missing `output`.

**User-fixable errors (still return 4xx, no fallback)** — the learner submitted something the system can't process:
- Missing `exerciseId`.
- Exercise not found.
- Exercise has no `evaluationRubric`.
- Multipart body is malformed.
- Uploaded file exceeds `SUBMISSION_MAX_BYTES`.
- Uploaded `.xlsx` exceeds `XLSX_MAX_BYTES` or fails to parse.
- Non-xlsx file uploaded without a written `userResponse`.

**Auth errors (unchanged)** — `requireAuthWithTokenExchange` already returns a `NextResponse` with the appropriate status (typically 401). This is unchanged.

### Server response shape

On agent failure, the route returns HTTP `200` with body:

```json
{
  "evaluation": null,
  "evaluationStatus": "unavailable",
  "submission": { "id": "...", "fileId": "..." } | null,
  "submissionError": "..." | undefined,
  "submissionLibraryConfigured": true | false
}
```

The submission-upload-to-shared-library logic still runs in both the happy and fallback paths. Failure to upload to the shared library is independent of evaluation status, as it is today.

On the happy path, the response remains:

```json
{
  "evaluation": { ...EVALUATION_SCHEMA shape... },
  "evaluationStatus": "ok",
  "submission": { ... } | null,
  "submissionError": "..." | undefined,
  "submissionLibraryConfigured": true | false
}
```

The new `evaluationStatus` field is informational (a single string union: `"ok" | "unavailable"`). The primary client-side signal is still whether `evaluation` is null.

### Server logging

A single `console.error` line fires on every fallback, with enough context to debug from production logs:

```
[EVALUATE] fallback fired: exerciseId=<id> reason=<network|status_5xx|agent_error|missing_output>
```

`reason` is a short enum string derived from how the failure was detected. No new logger, metric system, or dashboard is introduced.

### Client behaviour

In `ExerciseComponent.tsx`, the `hasRubric` branch (current lines 118-171) is adjusted so:

1. On `res.ok && data.evaluation == null`, the component takes the same flow as the existing "no rubric" path (current lines 172-179): `setSubmitted(true)`, open the static feedback panel if one exists, call `onComplete(completionText)`. It does **not** call `setEvalError` and does **not** call `setEvaluation`.
2. On `res.ok && data.evaluation != null`, the existing happy-path rendering runs unchanged.
3. On `!res.ok`, the existing error path runs unchanged — `setEvalError` is called, the error banner renders, but the submission is still marked complete and `onComplete` is still called (matching the current behaviour for user-fixable errors).

The learner therefore sees, in the fallback case:

- The "submission complete" check.
- The static feedback panel (hints / good examples / answer key) if the exercise defines one.
- No score or per-criterion card.
- No error banner.
- Progress, leaderboard points, and badges update normally.

## Affected files

- `app/api/activities/evaluate/route.ts` — wrap the agent call in a `try`/catch-and-classify, add the `evaluationStatus` field, add the log line.
- `components/activities/ExerciseComponent.tsx` — branch on `data.evaluation == null` inside the existing `hasRubric` `try` block.

No new files, no new types beyond the `evaluationStatus` union, no migrations, no env-var changes.

## Risks and Trade-offs

- **Learner believes they passed when they were never graded.** Accepted during brainstorming as the price of "no friction" — the static feedback panel still gives them something to learn from, and a fallback that lies about grading is preferable to one that visibly breaks the lesson flow.
- **Silent fallbacks could hide a broken agent.** Mitigation: server-side log line on every fallback. If silent failures become common we can add an admin "AI eval health" view later, outside this spec.
- **`evaluationStatus` is technically redundant** with `evaluation == null`. Kept anyway because explicit status strings are cheaper to grep in logs and let future telemetry distinguish "agent unavailable" from "no rubric" without re-parsing the body.

## Open Questions

None. Brainstorming closed all four (rubric backfill scope, fallback UX choice, retry behaviour, review queue).
