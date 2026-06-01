# Silent Fallback for AI-Graded Eval — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When agent-api can't grade an exercise submission, the learner sees the same UI as someone whose exercise has no rubric (completion check + static feedback panel) instead of a red error banner. User-input errors still surface so they can be fixed.

**Architecture:** Server-side classification — `app/api/activities/evaluate/route.ts` distinguishes agent failures (network throws, non-2xx, agent-returned error, missing output) from user-input failures (4xx). On agent failure, return `200 { evaluation: null, evaluationStatus: 'unavailable', ... }` instead of 502. Client `ExerciseComponent.tsx` treats `evaluation == null` as the no-rubric success path. One `console.error` log line per fallback for admin visibility.

**Tech Stack:** Next.js App Router (Node runtime), Vitest, `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-06-01-eval-silent-fallback-design.md`

---

## File Structure

- **Modify:** `app/api/activities/evaluate/route.ts` — wrap agent call in try/classify; add `evaluationStatus` field; log on fallback.
- **Create:** `app/api/activities/evaluate/route.test.ts` — vitest covering the four agent-failure cases, the happy path, and the preserved 4xx user-error paths.
- **Modify:** `components/activities/ExerciseComponent.tsx` — branch on `data.evaluation == null` inside the existing `hasRubric` flow.

No new files beyond the test. No new types beyond a `'ok' | 'unavailable'` string union added inline in the route.

---

## Task 1: Server test scaffold + first failing test (agent network throw → silent fallback)

**Files:**
- Create: `app/api/activities/evaluate/route.test.ts`

- [ ] **Step 1: Create the test file with mocks and the first failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/auth-middleware', () => ({ requireAuthWithTokenExchange: vi.fn() }));
vi.mock('@/lib/activity-data', () => ({ getExercise: vi.fn() }));
vi.mock('@/lib/data-api-client', () => ({ ensureDataDocuments: vi.fn() }));
vi.mock('@/lib/submission-data-api', () => ({
  insertSubmission: vi.fn(),
  uploadSubmissionToLibrary: vi.fn(),
}));
vi.mock('@/lib/module-data', () => ({ getLesson: vi.fn() }));
vi.mock('@/lib/xlsx-summary', () => ({ summarizeWorkbook: vi.fn() }));
vi.mock('@jazzmind/busibox-app/lib/authz', () => ({ getUserEmailFromToken: vi.fn() }));

import { POST } from './route';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { getExercise } from '@/lib/activity-data';

const auth = {
  ssoToken: null,
  apiToken: 't',
  userId: 'u1',
  roles: [],
  isTestUser: false,
} as never;

const exerciseWithRubric = {
  id: 'ex-1',
  moduleId: 'mod-1',
  lessonId: 'les-1',
  title: 'Test',
  variant: 'paste-back',
  instructions: 'do the thing',
  evaluationRubric: {
    criteria: ['c1', 'c2'],
    passingScore: 2,
    systemPrompt: 'sys',
  },
} as never;

function jsonRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/activities/evaluate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuthWithTokenExchange).mockResolvedValue(auth);
  vi.mocked(getExercise).mockReturnValue(exerciseWithRubric);
  // Default: agent reachable and returns a valid evaluation. Per-test fetch
  // mocks override this.
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      output: {
        score: 2,
        maxScore: 2,
        feedback: 'great',
        passed: true,
        criteriaResults: [],
      },
    }),
  }) as never;
});

describe('POST /api/activities/evaluate — silent fallback', () => {
  it('returns evaluation: null with status "unavailable" when fetch throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as never;

    const res = await POST(jsonRequest({ exerciseId: 'ex-1', userResponse: 'hi' }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.evaluation).toBeNull();
    expect(body.evaluationStatus).toBe('unavailable');
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run app/api/activities/evaluate/route.test.ts`
Expected: FAIL — either the test throws (because the route currently returns 502 on fetch errors) or the body assertions fail (because `evaluationStatus` doesn't exist yet).

- [ ] **Step 3: Commit the failing test**

```bash
git add app/api/activities/evaluate/route.test.ts
git commit -m "Add failing test for silent fallback on agent network error"
```

---

## Task 2: Make the network-throw test pass — server fallback for fetch failures

**Files:**
- Modify: `app/api/activities/evaluate/route.ts` (around the `fetch(\`${AGENT_API_URL}/runs/invoke\`, ...)` block, currently lines 220-251)

- [ ] **Step 1: Replace the agent call block with classify-and-fallback logic**

Locate the current block (after `const prompt = ...`):

```typescript
    const res = await fetch(`${AGENT_API_URL}/runs/invoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_name: EVALUATOR_AGENT_NAME,
        input: { prompt },
        response_schema: EVALUATION_SCHEMA,
        agent_tier: EVALUATOR_AGENT_TIER,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[EVALUATE] Agent API error:", res.status, errorText);
      return NextResponse.json(
        { error: "Failed to evaluate submission", details: errorText },
        { status: 502 }
      );
    }

    const result = await res.json();

    if (result.error) {
      console.error("[EVALUATE] Agent returned error:", result.error);
      return NextResponse.json(
        { error: "Evaluation failed", details: result.error },
        { status: 502 }
      );
    }
```

Replace it with this classify-and-fallback version:

```typescript
    type EvaluationStatus = "ok" | "unavailable";
    let evaluation: unknown = null;
    let evaluationStatus: EvaluationStatus = "ok";

    try {
      const res = await fetch(`${AGENT_API_URL}/runs/invoke`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_name: EVALUATOR_AGENT_NAME,
          input: { prompt },
          response_schema: EVALUATION_SCHEMA,
          agent_tier: EVALUATOR_AGENT_TIER,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        console.error(
          `[EVALUATE] fallback fired: exerciseId=${exerciseId} reason=status_${res.status}`,
          errorText,
        );
        evaluationStatus = "unavailable";
      } else {
        const result = await res.json();
        if (result.error) {
          console.error(
            `[EVALUATE] fallback fired: exerciseId=${exerciseId} reason=agent_error`,
            result.error,
          );
          evaluationStatus = "unavailable";
        } else if (result.output == null) {
          console.error(
            `[EVALUATE] fallback fired: exerciseId=${exerciseId} reason=missing_output`,
          );
          evaluationStatus = "unavailable";
        } else {
          evaluation = result.output;
        }
      }
    } catch (err) {
      console.error(
        `[EVALUATE] fallback fired: exerciseId=${exerciseId} reason=network`,
        err,
      );
      evaluationStatus = "unavailable";
    }
```

- [ ] **Step 2: Replace the final response statement to include the new field and use the classified evaluation**

Locate the current final return (currently around line 305):

```typescript
    return NextResponse.json({
      evaluation: result.output,
      submission: submissionRecord,
      submissionError: submissionError ?? undefined,
      submissionLibraryConfigured: !!submissionLibraryId,
    });
```

Replace with:

```typescript
    return NextResponse.json({
      evaluation,
      evaluationStatus,
      submission: submissionRecord,
      submissionError: submissionError ?? undefined,
      submissionLibraryConfigured: !!submissionLibraryId,
    });
```

- [ ] **Step 3: Update the shared-library upload guard so it still runs on the fallback path**

The current guard reads `if (submissionLibraryId && uploadedFile) { ... }` (around line 259). That guard does not reference `result.output` and does not need editing for the fallback to keep working — the file still gets pushed to the shared library whether or not AI grading succeeded.

Verify by re-reading the route file: the guard block must NOT mention the local `result` variable that we just removed from outer scope. If it does, replace any `result.output` reference inside the guard with `evaluation`.

- [ ] **Step 4: Run the failing test to verify it now passes**

Run: `npx vitest run app/api/activities/evaluate/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/activities/evaluate/route.ts
git commit -m "Add silent fallback when agent-api unavailable for eval"
```

---

## Task 3: Add and pass the remaining server tests

**Files:**
- Modify: `app/api/activities/evaluate/route.test.ts`

- [ ] **Step 1: Append the additional test cases inside the existing `describe` block**

Add these tests after the network-throw test:

```typescript
  it('returns evaluation: null when agent-api responds non-2xx', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'upstream down',
    }) as never;

    const res = await POST(jsonRequest({ exerciseId: 'ex-1', userResponse: 'hi' }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.evaluation).toBeNull();
    expect(body.evaluationStatus).toBe('unavailable');
  });

  it('returns evaluation: null when agent returns 200 with result.error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ error: 'schema_validation_failed' }),
    }) as never;

    const res = await POST(jsonRequest({ exerciseId: 'ex-1', userResponse: 'hi' }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.evaluation).toBeNull();
    expect(body.evaluationStatus).toBe('unavailable');
  });

  it('returns evaluation: null when agent returns 200 but output is missing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    }) as never;

    const res = await POST(jsonRequest({ exerciseId: 'ex-1', userResponse: 'hi' }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.evaluation).toBeNull();
    expect(body.evaluationStatus).toBe('unavailable');
  });

  it('returns the AI evaluation on the happy path', async () => {
    // beforeEach already configures fetch to return a valid output.
    const res = await POST(jsonRequest({ exerciseId: 'ex-1', userResponse: 'hi' }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.evaluation).toMatchObject({ passed: true, score: 2, maxScore: 2 });
    expect(body.evaluationStatus).toBe('ok');
  });

  it('still returns 400 when exerciseId is missing (user-fixable error preserved)', async () => {
    const res = await POST(jsonRequest({ userResponse: 'hi' }));
    expect(res.status).toBe(400);
  });

  it('still returns 404 when exercise is not found (user-fixable error preserved)', async () => {
    vi.mocked(getExercise).mockReturnValueOnce(undefined as never);
    const res = await POST(jsonRequest({ exerciseId: 'unknown', userResponse: 'hi' }));
    expect(res.status).toBe(404);
  });

  it('still returns 400 when exercise has no rubric (user-fixable error preserved)', async () => {
    vi.mocked(getExercise).mockReturnValueOnce({
      ...exerciseWithRubric,
      evaluationRubric: undefined,
    } as never);
    const res = await POST(jsonRequest({ exerciseId: 'ex-1', userResponse: 'hi' }));
    expect(res.status).toBe(400);
  });
```

- [ ] **Step 2: Run all tests in this file and verify they pass**

Run: `npx vitest run app/api/activities/evaluate/route.test.ts`
Expected: 7 tests pass.

- [ ] **Step 3: Commit**

```bash
git add app/api/activities/evaluate/route.test.ts
git commit -m "Cover all fallback and preserved-error cases in eval route tests"
```

---

## Task 4: Client — treat `evaluation: null` as no-rubric success path

**Files:**
- Modify: `components/activities/ExerciseComponent.tsx` (the `hasRubric` branch, currently lines 118-171)

- [ ] **Step 1: Edit the response-handling block to branch on `data.evaluation == null`**

Locate this block (currently around lines 151-160):

```typescript
        const data = await res.json();
        setEvaluation(data.evaluation);
        setSubmitted(true);
        if (hasFeedbackPanel) {
          setActiveExample(0);
          setShowExamples(true);
        }
        // For tracking, persist either the typed text or a stub describing the
        // upload so the activity record carries something meaningful.
        onComplete(completionText);
```

Replace with:

```typescript
        const data = await res.json();
        // evaluation === null is the silent fallback: agent-api was unreachable
        // or returned an unusable result. Render the same way as a no-rubric
        // exercise — completion check + static feedback panel, no error banner.
        if (data.evaluation != null) {
          setEvaluation(data.evaluation);
        }
        setSubmitted(true);
        if (hasFeedbackPanel) {
          setActiveExample(0);
          setShowExamples(true);
        }
        // For tracking, persist either the typed text or a stub describing the
        // upload so the activity record carries something meaningful.
        onComplete(completionText);
```

- [ ] **Step 2: Confirm the `!res.ok` and the outer `else` (no-rubric) branches were left untouched**

Re-read lines 146-179 of `components/activities/ExerciseComponent.tsx`. The catch block (`setEvalError` + `setSubmitted(true)` + `onComplete`) must be unchanged. The `else` after `if (hasRubric)` (the original no-rubric path) must be unchanged.

- [ ] **Step 3: Type-check the full repo**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: all tests pass (the route tests from Task 3 plus all previously-existing tests).

- [ ] **Step 5: Commit**

```bash
git add components/activities/ExerciseComponent.tsx
git commit -m "Handle null evaluation client-side as no-rubric success path"
```

---

## Task 5: Manual smoke test in the running app

**Files:** None — verification only.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server boots on the configured port (default 3222) with no compile errors.

- [ ] **Step 2: Verify the happy path**

In a browser, open any module exercise that has a rubric (e.g., the first exercise in `mod-1`). Submit a real response.

Expected:
- Completion check appears.
- The AI-generated `evaluation` card renders with score / passed / per-criterion comments.
- No error banner.

- [ ] **Step 3: Verify the silent fallback by simulating an agent outage**

Stop `agent-api` (or set `AGENT_API_URL` in `.env.local` to a guaranteed-unreachable URL such as `http://localhost:1` and restart `npm run dev`). Submit the same exercise again.

Expected:
- Completion check appears.
- Static feedback panel (good examples / hints / answer key) opens if the exercise has one.
- No `evaluation` score card.
- **No red error banner.**
- Server log line `[EVALUATE] fallback fired: exerciseId=<id> reason=network ...` appears in the dev server console.

- [ ] **Step 4: Verify user-fixable errors still surface**

Restore the real `AGENT_API_URL` and restart. Open the browser devtools network tab. Use the Console to manually `POST` to `/api/activities/evaluate` with an empty body, e.g.:

```javascript
await fetch('/api/activities/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
}).then(r => [r.status, r.json()]).then(([s, p]) => p.then(b => console.log(s, b)));
```

Expected: status `400` with a body containing `error: "exerciseId and userResponse are required"`. This proves user-input validation was not collateral damage.

- [ ] **Step 5: Report results to the user**

Confirm in the conversation whether each of steps 2-4 behaved as expected. If anything is off, do not mark the work complete — investigate and fix before continuing.

---

## Verification

After Task 5 passes manually, the spec's behaviour specification is fully covered. Re-read `docs/superpowers/specs/2026-06-01-eval-silent-fallback-design.md` once more and confirm:

- [ ] Agent failure classification covered by Task 2 implementation + Task 1/3 tests.
- [ ] User-fixable 4xx errors preserved — Task 3 includes the regression tests.
- [ ] `evaluationStatus` field present on both happy and fallback responses (Task 2).
- [ ] Server log line on every fallback (Task 2).
- [ ] Client renders the no-rubric flow when `evaluation == null` (Task 4) — manually verified in Task 5.
- [ ] No retries, no review queue, no rubric backfill, no admin UI — confirmed by absence of any task touching those areas.
