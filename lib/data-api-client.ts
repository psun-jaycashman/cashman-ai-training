/**
 * Data API Client for Cashman AI Training
 *
 * Provides typed CRUD operations for training progress, quiz scores, and badges
 * using the Busibox data-api service.
 * Uses shared client from @jazzmind/busibox-app.
 */

import {
  generateId,
  getNow,
  queryRecords,
  insertRecords,
  updateRecords,
  deleteRecords,
  ensureDocuments,
} from '@jazzmind/busibox-app';
import type { AppDataSchema } from '@jazzmind/busibox-app';
import type { UserProgress, QuizScore, Badge } from './types';

// ==========================================================================
// Data Document Names
// ==========================================================================

export const DOCUMENTS = {
  PROGRESS: 'ai-training-progress',
  QUIZ_SCORES: 'ai-training-quiz-scores',
  BADGES: 'ai-training-badges',
  ACTIVITY_RESPONSES: 'ai-training-activity-responses',
} as const;

// ==========================================================================
// Schemas
// ==========================================================================

export const progressSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    visitorId: { type: 'string', required: true, label: 'Visitor ID', hidden: true },
    moduleId: { type: 'string', required: true, label: 'Module ID', order: 1 },
    lessonId: { type: 'string', required: true, label: 'Lesson ID', order: 2 },
    completed: { type: 'boolean', required: true, label: 'Completed', order: 3 },
    completedAt: { type: 'string', label: 'Completed At', readonly: true, order: 4 },
    startedAt: { type: 'string', label: 'Started At', readonly: true, order: 5 },
    timeSpentSeconds: { type: 'number', label: 'Time Spent (seconds)', order: 6 },
  },
  displayName: 'Training Progress',
  itemLabel: 'Progress Entry',
  sourceApp: 'cashman-ai-training',
  visibility: 'personal',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};

export const quizScoreSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    visitorId: { type: 'string', required: true, label: 'Visitor ID', hidden: true },
    moduleId: { type: 'string', required: true, label: 'Module ID', order: 1 },
    lessonId: { type: 'string', required: true, label: 'Lesson ID', order: 2 },
    quizId: { type: 'string', required: true, label: 'Quiz ID', order: 3 },
    score: { type: 'number', required: true, label: 'Score', order: 4 },
    maxScore: { type: 'number', required: true, label: 'Max Score', order: 5 },
    attempts: { type: 'number', required: true, label: 'Attempts', order: 6 },
    completedAt: { type: 'string', label: 'Completed At', readonly: true, order: 7 },
    answers: { type: 'string', label: 'Answers (JSON)', hidden: true, order: 8 },
  },
  displayName: 'Quiz Scores',
  itemLabel: 'Quiz Score',
  sourceApp: 'cashman-ai-training',
  visibility: 'personal',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};

export const badgeSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    visitorId: { type: 'string', required: true, label: 'Visitor ID', hidden: true },
    badgeType: { type: 'string', required: true, label: 'Badge Type', order: 1 },
    earnedAt: { type: 'string', label: 'Earned At', readonly: true, order: 2 },
    metadata: { type: 'string', label: 'Metadata (JSON)', hidden: true, order: 3 },
  },
  displayName: 'Badges',
  itemLabel: 'Badge',
  sourceApp: 'cashman-ai-training',
  visibility: 'authenticated',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};

export const activityResponseSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    visitorId: { type: 'string', required: true, label: 'Visitor ID', hidden: true },
    moduleId: { type: 'string', required: true, label: 'Module ID', order: 1 },
    lessonId: { type: 'string', required: true, label: 'Lesson ID', order: 2 },
    activityType: { type: 'string', required: true, label: 'Activity Type', order: 3 },
    activityId: { type: 'string', required: true, label: 'Activity ID', order: 4 },
    response: { type: 'string', label: 'Response (JSON)', hidden: true, order: 5 },
    completedAt: { type: 'string', label: 'Completed At', readonly: true, order: 6 },
  },
  displayName: 'Activity Responses',
  itemLabel: 'Activity Response',
  sourceApp: 'cashman-ai-training',
  visibility: 'personal',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};

// ==========================================================================
// ensureDataDocuments
// ==========================================================================

export async function ensureDataDocuments(token: string): Promise<{
  progress: string;
  quizScores: string;
  badges: string;
  activityResponses: string;
}> {
  const ids = await ensureDocuments(
    token,
    {
      progress: {
        name: DOCUMENTS.PROGRESS,
        schema: progressSchema,
        visibility: 'personal',
      },
      quizScores: {
        name: DOCUMENTS.QUIZ_SCORES,
        schema: quizScoreSchema,
        visibility: 'personal',
      },
      badges: {
        name: DOCUMENTS.BADGES,
        schema: badgeSchema,
        visibility: 'authenticated',
      },
      activityResponses: {
        name: DOCUMENTS.ACTIVITY_RESPONSES,
        schema: activityResponseSchema,
        visibility: 'personal',
      },
    },
    'cashman-ai-training'
  );
  return ids as { progress: string; quizScores: string; badges: string; activityResponses: string };
}

// ==========================================================================
// Progress Operations
// ==========================================================================

export async function getUserProgress(
  token: string,
  documentId: string,
  visitorId: string
): Promise<UserProgress[]> {
  const result = await queryRecords<UserProgress>(token, documentId, {
    where: { field: 'visitorId', op: 'eq', value: visitorId },
    orderBy: [{ field: 'startedAt', direction: 'desc' }],
  });
  return result.records;
}

export async function getModuleProgress(
  token: string,
  documentId: string,
  visitorId: string,
  moduleId: string
): Promise<UserProgress[]> {
  const result = await queryRecords<UserProgress>(token, documentId, {
    where: {
      and: [
        { field: 'visitorId', op: 'eq', value: visitorId },
        { field: 'moduleId', op: 'eq', value: moduleId },
      ],
    },
    orderBy: [{ field: 'startedAt', direction: 'asc' }],
  });
  return result.records;
}

export async function markLessonComplete(
  token: string,
  documentId: string,
  visitorId: string,
  moduleId: string,
  lessonId: string
): Promise<UserProgress> {
  // Check if progress record already exists for this lesson
  const existing = await queryRecords<UserProgress>(token, documentId, {
    where: {
      and: [
        { field: 'visitorId', op: 'eq', value: visitorId },
        { field: 'moduleId', op: 'eq', value: moduleId },
        { field: 'lessonId', op: 'eq', value: lessonId },
      ],
    },
    limit: 1,
  });

  const now = getNow();

  if (existing.records.length > 0) {
    const record = existing.records[0];
    const updates = {
      completed: true,
      completedAt: now,
    };

    await updateRecords(
      token,
      documentId,
      updates,
      { field: 'id', op: 'eq', value: record.id }
    );

    return { ...record, ...updates };
  }

  // Create new progress record
  const progress: UserProgress = {
    id: generateId(),
    visitorId,
    moduleId,
    lessonId,
    completed: true,
    completedAt: now,
    startedAt: now,
    timeSpentSeconds: 0,
  };

  await insertRecords(token, documentId, [progress]);
  return progress;
}

// ==========================================================================
// Quiz Score Operations
// ==========================================================================

interface StoredQuizScore extends Omit<QuizScore, 'answers'> {
  answers: string;
}

export async function saveQuizScore(
  token: string,
  documentId: string,
  score: QuizScore
): Promise<QuizScore> {
  // Check if a score already exists for this quiz
  const existing = await queryRecords<StoredQuizScore>(token, documentId, {
    where: {
      and: [
        { field: 'visitorId', op: 'eq', value: score.visitorId },
        { field: 'quizId', op: 'eq', value: score.quizId },
      ],
    },
    limit: 1,
  });

  const storedScore: StoredQuizScore = {
    ...score,
    answers: JSON.stringify(score.answers),
  };

  if (existing.records.length > 0) {
    const updates = {
      score: storedScore.score,
      maxScore: storedScore.maxScore,
      attempts: storedScore.attempts,
      completedAt: storedScore.completedAt,
      answers: storedScore.answers,
    };

    await updateRecords(
      token,
      documentId,
      updates,
      { field: 'id', op: 'eq', value: existing.records[0].id }
    );

    return score;
  }

  await insertRecords(token, documentId, [storedScore]);
  return score;
}

export async function getUserQuizScores(
  token: string,
  documentId: string,
  visitorId: string
): Promise<QuizScore[]> {
  const result = await queryRecords<StoredQuizScore>(token, documentId, {
    where: { field: 'visitorId', op: 'eq', value: visitorId },
    orderBy: [{ field: 'completedAt', direction: 'desc' }],
  });

  return result.records.map((record) => ({
    ...record,
    answers: JSON.parse(record.answers) as Record<string, number | number[]>,
  }));
}

// ==========================================================================
// Badge Operations
// ==========================================================================

interface StoredBadge extends Omit<Badge, 'metadata'> {
  metadata: string;
}

export async function getUserBadges(
  token: string,
  documentId: string,
  visitorId: string
): Promise<Badge[]> {
  const result = await queryRecords<StoredBadge>(token, documentId, {
    where: { field: 'visitorId', op: 'eq', value: visitorId },
    orderBy: [{ field: 'earnedAt', direction: 'desc' }],
  });

  return result.records.map((record) => ({
    ...record,
    metadata: JSON.parse(record.metadata) as Record<string, unknown>,
  }));
}

export async function awardBadge(
  token: string,
  documentId: string,
  badge: Badge
): Promise<Badge> {
  // Check if badge already awarded
  const existing = await queryRecords<StoredBadge>(token, documentId, {
    where: {
      and: [
        { field: 'visitorId', op: 'eq', value: badge.visitorId },
        { field: 'badgeType', op: 'eq', value: badge.badgeType },
      ],
    },
    limit: 1,
  });

  if (existing.records.length > 0) {
    // Badge already awarded, return existing
    return {
      ...existing.records[0],
      metadata: JSON.parse(existing.records[0].metadata) as Record<string, unknown>,
    };
  }

  const storedBadge: StoredBadge = {
    ...badge,
    metadata: JSON.stringify(badge.metadata),
  };

  await insertRecords(token, documentId, [storedBadge]);
  return badge;
}

export async function getAllBadges(
  token: string,
  documentId: string
): Promise<Badge[]> {
  const result = await queryRecords<StoredBadge>(token, documentId, {
    orderBy: [{ field: 'earnedAt', direction: 'desc' }],
  });

  return result.records.map((record) => ({
    ...record,
    metadata: JSON.parse(record.metadata) as Record<string, unknown>,
  }));
}

// ==========================================================================
// Activity Response Operations
// ==========================================================================

export interface ActivityResponse {
  id: string;
  visitorId: string;
  moduleId: string;
  lessonId: string;
  activityType: string;
  activityId: string;
  response: string; // JSON string
  completedAt: string;
}

export async function saveActivityResponse(
  token: string,
  documentId: string,
  data: {
    visitorId: string;
    moduleId: string;
    lessonId: string;
    activityType: string;
    activityId: string;
    response: Record<string, unknown>;
  }
): Promise<ActivityResponse> {
  const existing = await queryRecords<ActivityResponse>(token, documentId, {
    where: {
      and: [
        { field: 'visitorId', op: 'eq', value: data.visitorId },
        { field: 'activityId', op: 'eq', value: data.activityId },
      ],
    },
    limit: 1,
  });

  const now = getNow();

  if (existing.records.length > 0) {
    const record = existing.records[0];
    await updateRecords(
      token,
      documentId,
      { response: JSON.stringify(data.response), completedAt: now },
      { field: 'id', op: 'eq', value: record.id }
    );
    return { ...record, response: JSON.stringify(data.response), completedAt: now };
  }

  const entry: ActivityResponse = {
    id: generateId(),
    visitorId: data.visitorId,
    moduleId: data.moduleId,
    lessonId: data.lessonId,
    activityType: data.activityType,
    activityId: data.activityId,
    response: JSON.stringify(data.response),
    completedAt: now,
  };

  await insertRecords(token, documentId, [entry]);
  return entry;
}

export async function getAllActivityResponses(
  token: string,
  documentId: string
): Promise<ActivityResponse[]> {
  const result = await queryRecords<ActivityResponse>(token, documentId, {
    orderBy: [{ field: 'completedAt', direction: 'desc' }],
  });
  return result.records;
}
