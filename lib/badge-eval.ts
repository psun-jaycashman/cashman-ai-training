/**
 * Single source of truth for "what badges should this user have, given their
 * current progress + quiz scores?" Used by:
 *   - POST /api/progress  (after marking a lesson complete)
 *   - POST /api/badges    (explicit "check my badges" trigger)
 *   - GET  /api/badges    (retro-award when the profile page loads, so users
 *                          who lost an award to an earlier silent failure
 *                          recover without needing to re-complete a lesson)
 *
 * Idempotent: tryAward short-circuits when a badge is already earned.
 */

import { generateId, getNow } from '@jazzmind/busibox-app';
import {
  awardBadge,
  getUserBadges,
  getUserProgress,
  getUserQuizScores,
} from '@/lib/data-api-client';
import { MODULES, getModule } from '@/lib/module-data';
import type { Badge, BadgeType } from '@/lib/types';

export async function evaluateAndAwardBadges(
  token: string,
  documentIds: { progress: string; quizScores: string; badges: string },
  userId: string,
): Promise<{ newBadges: Badge[]; earnedTypes: Set<BadgeType> }> {
  const [allProgress, existingBadges, quizScores] = await Promise.all([
    getUserProgress(token, documentIds.progress, userId),
    getUserBadges(token, documentIds.badges, userId),
    getUserQuizScores(token, documentIds.quizScores, userId),
  ]);

  const completedSet = new Set(
    allProgress.filter((p) => p.completed).map((p) => `${p.moduleId}:${p.lessonId}`),
  );
  const earnedTypes = new Set<BadgeType>(existingBadges.map((b) => b.badgeType));
  const newBadges: Badge[] = [];

  const totalCompleted = completedSet.size;

  function isModuleComplete(modId: string): boolean {
    const mod = getModule(modId);
    if (!mod) return false;
    return mod.lessons.every((l) => completedSet.has(`${modId}:${l.id}`));
  }

  async function tryAward(
    badgeType: BadgeType,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    if (earnedTypes.has(badgeType)) return;
    const badge: Badge = {
      id: generateId(),
      visitorId: userId,
      badgeType,
      earnedAt: getNow(),
      metadata,
    };
    try {
      const awarded = await awardBadge(token, documentIds.badges, badge);
      newBadges.push(awarded);
      earnedTypes.add(badgeType);
    } catch (err) {
      // Don't let one failed insert stop the rest of the evaluation; log
      // and continue. The next call to evaluateAndAwardBadges will retry.
      console.error('[BADGES] award failed for', badgeType, err);
    }
  }

  if (totalCompleted >= 1) await tryAward('first-steps');
  if (isModuleComplete('mod-2')) await tryAward('email-ace');
  if (isModuleComplete('mod-3')) await tryAward('report-writer');
  if (isModuleComplete('mod-4')) await tryAward('data-wrangler');
  if (isModuleComplete('mod-5')) await tryAward('media-maker');
  if (isModuleComplete('mod-6')) await tryAward('search-pro');
  // (power-user: Module 8 merged into Module 6 — search-pro covers it.)

  const hasPerfect = quizScores.some((s) => s.score === s.maxScore && s.maxScore > 0);
  if (hasPerfect) await tryAward('perfect-score');

  const requiredModules = MODULES.filter((m) => !m.isBonus);
  const allRequiredComplete = requiredModules.every((m) => isModuleComplete(m.id));
  if (allRequiredComplete) await tryAward('completionist');

  const requiredLessons = requiredModules.flatMap((m) =>
    m.lessons.map((l) => `${m.id}:${l.id}`),
  );
  const completedRequired = requiredLessons.filter((key) =>
    completedSet.has(key),
  ).length;
  if (
    requiredLessons.length > 0 &&
    completedRequired / requiredLessons.length >= 0.95
  ) {
    const finalQuiz = quizScores.find(
      (s) => s.quizId === 'quiz-final' && s.maxScore > 0,
    );
    if (finalQuiz && finalQuiz.score / finalQuiz.maxScore >= 0.8) {
      await tryAward('think-aimpossible');
    }
  }

  return { newBadges, earnedTypes };
}
