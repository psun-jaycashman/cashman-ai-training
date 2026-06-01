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
import type { Exercise } from '@/lib/types';

const auth = {
  ssoToken: null,
  apiToken: 't',
  userId: 'u1',
  roles: [],
  isTestUser: false,
} as never;

const exerciseWithRubric: Exercise = {
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
};

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
});
