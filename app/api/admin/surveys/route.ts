import { NextRequest, NextResponse } from 'next/server';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import {
  ensureDataDocuments,
  listSurveyResponses,
  listTrainingUsers,
} from '@/lib/data-api-client';
import { displayNameFromEmail } from '@/lib/display-name';
import { isAdminRole } from '@/lib/admin-roles';
import { MODULES } from '@/lib/module-data';
import { getSurvey } from '@/lib/activity-data';

export const runtime = 'nodejs';

/**
 * GET /api/admin/surveys
 *
 * Admin only. Returns every survey response with the responder's display
 * name and lesson context, decoded from the JSON blob into a list of
 * { question, answer } pairs the admin UI can render.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  if (!isAdminRole(auth.roles)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin access required' },
      { status: 403 },
    );
  }

  const ids = await ensureDataDocuments(auth.apiToken);
  const [records, allUsers] = await Promise.all([
    listSurveyResponses(auth.apiToken, ids.surveyResponses),
    listTrainingUsers(auth.apiToken, ids.trainingUsers),
  ]);

  const userIdentity = new Map<string, { displayName: string | null; email: string }>();
  for (const u of allUsers) {
    userIdentity.set(u.visitorId, {
      displayName: u.displayName ?? displayNameFromEmail(u.email) ?? null,
      email: u.email ?? '',
    });
  }

  const responses = records.map((r) => {
    const identity = userIdentity.get(r.visitorId);
    const survey = getSurvey(r.activityId);
    const module = MODULES.find((m) => m.id === r.moduleId);
    const lesson = module?.lessons.find((l) => l.id === r.lessonId);

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(r.response || '{}');
    } catch {
      parsed = {};
    }

    // Pull each survey-question answer into a flat list. Falls back to
    // raw key/value pairs if the survey definition isn't found.
    const answers: Array<{ questionId: string; question: string; answer: string }> = [];
    if (survey) {
      for (const q of survey.questions) {
        const raw = parsed[q.id];
        const answer = raw === undefined || raw === null
          ? '—'
          : Array.isArray(raw)
            ? raw.join(', ')
            : String(raw);
        answers.push({ questionId: q.id, question: q.question, answer });
      }
    } else {
      for (const [k, v] of Object.entries(parsed)) {
        const answer = Array.isArray(v) ? v.join(', ') : String(v);
        answers.push({ questionId: k, question: k, answer });
      }
    }

    return {
      id: r.id,
      visitorId: r.visitorId,
      uploaderName: identity?.displayName ?? r.visitorId,
      uploaderEmail: identity?.email ?? '',
      moduleId: r.moduleId,
      moduleTitle: module?.title ?? r.moduleId,
      lessonId: r.lessonId,
      lessonTitle: lesson?.title ?? r.lessonId,
      surveyId: r.activityId,
      surveyTitle: survey?.title ?? r.activityId,
      completedAt: r.completedAt,
      answers,
    };
  });

  return NextResponse.json({ responses });
}
