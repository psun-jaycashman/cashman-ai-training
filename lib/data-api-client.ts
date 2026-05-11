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
  TRAINING_VIDEOS: 'ai-training-videos',
  TRAINING_VIDEO_PROGRESS: 'ai-training-video-progress',
  SUBMISSION_FILES: 'ai-training-submission-files',
  TRAINING_USERS: 'ai-training-users',
  SURVEY_RESPONSES: 'ai-training-survey-responses',
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
  // Shared so the leaderboard can read every user's lesson completion.
  // Bind app/employee roles to the document in data-api admin to control
  // which users can see each other's progress.
  visibility: 'shared',
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

export const surveyResponseSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    visitorId: { type: 'string', required: true, label: 'Visitor ID', order: 1 },
    moduleId: { type: 'string', required: true, label: 'Module ID', order: 2 },
    lessonId: { type: 'string', required: true, label: 'Lesson ID', order: 3 },
    activityId: { type: 'string', required: true, label: 'Activity ID', order: 4 },
    response: { type: 'string', label: 'Response (JSON)', order: 5 },
    completedAt: { type: 'string', label: 'Completed At', readonly: true, order: 6 },
  },
  displayName: 'Survey Responses',
  itemLabel: 'Survey Response',
  sourceApp: 'cashman-ai-training',
  // Cross-user readable so admins can review survey results.
  visibility: 'authenticated',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};

export const trainingUserSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    visitorId: { type: 'string', required: true, label: 'User ID', order: 1 },
    email: { type: 'string', label: 'Email', order: 2 },
    displayName: { type: 'string', label: 'Display Name', order: 3 },
    firstSeenAt: { type: 'string', label: 'First Seen', readonly: true, order: 4 },
    lastSeenAt: { type: 'string', label: 'Last Seen', readonly: true, order: 5 },
  },
  displayName: 'Training Users',
  itemLabel: 'User Profile',
  sourceApp: 'cashman-ai-training',
  // Cross-user readable so the leaderboard can resolve every visitor's
  // display name without leaking other documents.
  visibility: 'authenticated',
  allowSharing: false,
  graphNode: '',
  graphRelationships: [],
};

export const submissionFileSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    moduleId: { type: 'string', required: true, label: 'Module ID', order: 1 },
    lessonId: { type: 'string', required: true, label: 'Lesson ID', order: 2 },
    exerciseId: { type: 'string', required: true, label: 'Exercise ID', order: 3 },
    lessonTitle: { type: 'string', label: 'Lesson Title', order: 4 },
    fileName: { type: 'string', required: true, label: 'File Name', order: 5 },
    fileId: { type: 'string', required: true, label: 'File ID', order: 6 },
    mimeType: { type: 'string', label: 'MIME Type', order: 7 },
    sizeBytes: { type: 'number', label: 'Size (bytes)', order: 8 },
    responseExcerpt: { type: 'string', label: 'Response Excerpt', order: 9 },
    uploaderUserId: { type: 'string', required: true, label: 'Uploader User ID', order: 10 },
    uploaderEmail: { type: 'string', label: 'Uploader Email', order: 11 },
    uploadedAt: { type: 'string', label: 'Uploaded At', readonly: true, order: 12 },
  },
  displayName: 'Submission Files',
  itemLabel: 'Submission',
  sourceApp: 'cashman-ai-training',
  // Shared so every authenticated app user can browse peer submissions.
  // Bind app role to the document AND the file library in data-api admin.
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

// ==========================================================================
// ensureDataDocuments
// ==========================================================================

export async function ensureDataDocuments(token: string): Promise<{
  progress: string;
  quizScores: string;
  badges: string;
  activityResponses: string;
  trainingVideos: string;
  trainingVideoProgress: string;
  submissionFiles: string;
  trainingUsers: string;
  surveyResponses: string;
}> {
  const ids = await ensureDocuments(
    token,
    {
      progress: {
        name: DOCUMENTS.PROGRESS,
        schema: progressSchema,
        visibility: 'shared',
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
      trainingVideos: {
        name: DOCUMENTS.TRAINING_VIDEOS,
        schema: trainingVideoSchema,
        visibility: 'authenticated',
      },
      trainingVideoProgress: {
        name: DOCUMENTS.TRAINING_VIDEO_PROGRESS,
        schema: videoProgressSchema,
        visibility: 'personal',
      },
      submissionFiles: {
        name: DOCUMENTS.SUBMISSION_FILES,
        schema: submissionFileSchema,
        visibility: 'authenticated',
      },
      trainingUsers: {
        name: DOCUMENTS.TRAINING_USERS,
        schema: trainingUserSchema,
        visibility: 'authenticated',
      },
      surveyResponses: {
        name: DOCUMENTS.SURVEY_RESPONSES,
        schema: surveyResponseSchema,
        visibility: 'authenticated',
      },
    },
    'cashman-ai-training'
  );
  return ids as {
    progress: string;
    quizScores: string;
    badges: string;
    activityResponses: string;
    trainingVideos: string;
    trainingVideoProgress: string;
    submissionFiles: string;
    trainingUsers: string;
    surveyResponses: string;
  };
}

// ==========================================================================
// Training Users (display-name + roster source for the leaderboard)
// ==========================================================================

export interface TrainingUser {
  id: string;
  visitorId: string;
  email?: string;
  displayName?: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export async function listTrainingUsers(
  token: string,
  documentId: string,
): Promise<TrainingUser[]> {
  const result = await queryRecords<TrainingUser>(token, documentId, {
    orderBy: [{ field: 'lastSeenAt', direction: 'desc' }],
  });
  return result.records;
}

export async function upsertTrainingUser(
  token: string,
  documentId: string,
  input: { visitorId: string; email?: string; displayName?: string },
): Promise<TrainingUser> {
  const now = getNow();
  const existing = await queryRecords<TrainingUser>(token, documentId, {
    where: { field: 'visitorId', op: 'eq', value: input.visitorId },
    limit: 1,
  });

  if (existing.records.length > 0) {
    const record = existing.records[0];
    // Refresh email/displayName if we have new values, always bump lastSeenAt.
    const updates: Partial<TrainingUser> = { lastSeenAt: now };
    if (input.email && input.email !== record.email) updates.email = input.email;
    if (input.displayName && input.displayName !== record.displayName) {
      updates.displayName = input.displayName;
    }
    await updateRecords(
      token,
      documentId,
      updates,
      { field: 'id', op: 'eq', value: record.id },
    );
    return { ...record, ...updates };
  }

  const profile: TrainingUser = {
    id: generateId(),
    visitorId: input.visitorId,
    email: input.email,
    displayName: input.displayName,
    firstSeenAt: now,
    lastSeenAt: now,
  };
  // 'inherit' so peers can see each other on the leaderboard.
  await insertRecords(token, documentId, [profile], { recordVisibility: 'inherit' });
  return profile;
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

  // Records default to creator-personal RLS even when the document is
  // 'shared'/'authenticated'; force inherit so the leaderboard can read
  // every user's completion across the org.
  await insertRecords(token, documentId, [progress], { recordVisibility: 'inherit' });
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

function parseBadgeMetadata(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'string') return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
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
    metadata: parseBadgeMetadata(record.metadata),
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
      metadata: parseBadgeMetadata(existing.records[0].metadata),
    };
  }

  const storedBadge: StoredBadge = {
    ...badge,
    metadata: JSON.stringify(badge.metadata ?? {}),
  };

  // 'inherit' so admins (and the leaderboard) can read every user's badges,
  // matching the pattern used by progress / training-users / submissions.
  // Without this, records default to creator-personal even on an
  // 'authenticated' document, which silently breaks cross-user views.
  const insertResponse = await insertRecords(
    token,
    documentId,
    [storedBadge],
    { recordVisibility: 'inherit' },
  );

  // insertRecords throws on non-2xx, so reaching here means the data-api
  // accepted the request. We've observed the symptom "accepted but never
  // visible on re-query" (badges stay at 0 even after repeated awards).
  // Catch both the count=0 soft-failure (data-api accepted the request
  // but persisted nothing) and the inserted-but-invisible RLS case.
  if (!insertResponse?.count) {
    throw new Error(
      `data-api returned 200 but count=${insertResponse?.count ?? 'undefined'}; response=${JSON.stringify(insertResponse)}`,
    );
  }

  const verify = await queryRecords<StoredBadge>(token, documentId, {
    where: {
      and: [
        { field: 'visitorId', op: 'eq', value: badge.visitorId },
        { field: 'badgeType', op: 'eq', value: badge.badgeType },
      ],
    },
    limit: 1,
  });
  if (verify.records.length === 0) {
    throw new Error(
      `insert reported count=${insertResponse.count} (recordIds=${JSON.stringify(insertResponse.recordIds)}) but row not visible on re-query for visitorId=${badge.visitorId} badgeType=${badge.badgeType}`,
    );
  }

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
    metadata: parseBadgeMetadata(record.metadata),
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

// ==========================================================================
// Survey Responses (cross-user readable, for admin review)
// ==========================================================================

export interface SurveyResponseRecord {
  id: string;
  visitorId: string;
  moduleId: string;
  lessonId: string;
  activityId: string;
  response: string;
  completedAt: string;
}

/**
 * Mirror a survey response into the cross-user readable
 * ai-training-survey-responses document. The personal copy in
 * ai-training-activity-responses still gets written by saveActivityResponse;
 * this is an additional record so admins can review answers.
 */
export async function mirrorSurveyResponse(
  token: string,
  documentId: string,
  data: {
    visitorId: string;
    moduleId: string;
    lessonId: string;
    activityId: string;
    response: Record<string, unknown>;
  }
): Promise<SurveyResponseRecord> {
  const existing = await queryRecords<SurveyResponseRecord>(token, documentId, {
    where: {
      and: [
        { field: 'visitorId', op: 'eq', value: data.visitorId },
        { field: 'activityId', op: 'eq', value: data.activityId },
      ],
    },
    limit: 1,
  });
  const now = getNow();
  const responseJson = JSON.stringify(data.response);

  if (existing.records.length > 0) {
    const record = existing.records[0];
    await updateRecords(
      token,
      documentId,
      { response: responseJson, completedAt: now },
      { field: 'id', op: 'eq', value: record.id }
    );
    return { ...record, response: responseJson, completedAt: now };
  }

  const entry: SurveyResponseRecord = {
    id: generateId(),
    visitorId: data.visitorId,
    moduleId: data.moduleId,
    lessonId: data.lessonId,
    activityId: data.activityId,
    response: responseJson,
    completedAt: now,
  };
  // 'inherit' so admins (and any authenticated user) can read.
  await insertRecords(token, documentId, [entry], { recordVisibility: 'inherit' });
  return entry;
}

export async function listSurveyResponses(
  token: string,
  documentId: string
): Promise<SurveyResponseRecord[]> {
  const result = await queryRecords<SurveyResponseRecord>(token, documentId, {
    orderBy: [{ field: 'completedAt', direction: 'desc' }],
  });
  return result.records;
}
