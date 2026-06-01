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
