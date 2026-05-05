import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
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
 * GET /api/admin/surveys/export
 *
 * Admin-only. Streams an .xlsx with one row per (response × question)
 * so admins can pivot/filter in Excel. Wide format would be brittle
 * across surveys with different questions; long format is the safer
 * default for reporting.
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

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Cashman AI Training';
  wb.created = new Date();

  const ws = wb.addWorksheet('Survey Responses');
  ws.columns = [
    { header: 'User', key: 'user', width: 24 },
    { header: 'Email', key: 'email', width: 32 },
    { header: 'Module', key: 'module', width: 28 },
    { header: 'Lesson', key: 'lesson', width: 32 },
    { header: 'Survey', key: 'survey', width: 32 },
    { header: 'Question', key: 'question', width: 60 },
    { header: 'Answer', key: 'answer', width: 60 },
    { header: 'Completed At', key: 'completedAt', width: 22 },
  ];
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2B6E2B' },
  };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  for (const r of records) {
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

    const userLabel = identity?.displayName ?? r.visitorId;
    const email = identity?.email ?? '';
    const moduleLabel = module?.title ?? r.moduleId;
    const lessonLabel = lesson?.title ?? r.lessonId;
    const surveyLabel = survey?.title ?? r.activityId;

    const questions = survey
      ? survey.questions.map((q) => ({ id: q.id, text: q.question }))
      : Object.keys(parsed).map((k) => ({ id: k, text: k }));

    if (questions.length === 0) {
      // Survey with no schema — emit a single row so the response isn't lost.
      ws.addRow({
        user: userLabel,
        email,
        module: moduleLabel,
        lesson: lessonLabel,
        survey: surveyLabel,
        question: '(no questions defined)',
        answer: r.response || '',
        completedAt: r.completedAt,
      });
      continue;
    }

    for (const q of questions) {
      const raw = parsed[q.id];
      const answer = raw === undefined || raw === null
        ? ''
        : Array.isArray(raw)
          ? raw.join(', ')
          : String(raw);
      ws.addRow({
        user: userLabel,
        email,
        module: moduleLabel,
        lesson: lessonLabel,
        survey: surveyLabel,
        question: q.text,
        answer,
        completedAt: r.completedAt,
      });
    }
  }

  // Freeze the header row + auto-filter the data so admins can sort/filter
  // immediately in Excel.
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  if (ws.rowCount > 1) {
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: ws.rowCount, column: ws.columnCount },
    };
  }

  const buffer = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="survey-responses-${stamp}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
