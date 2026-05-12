/**
 * Compute which badges a user has earned, derived from their progress and
 * quiz scores. Pure function — no data-api writes, no side effects. Badges
 * are not persisted; every page that needs them recomputes from the
 * underlying achievement data.
 *
 * This replaces the older "evaluateAndAwardBadges" model that wrote rows
 * into ai-training-badges. That model fought RLS / role-binding issues on
 * the data-api side and was strictly redundant: if a user has 15
 * completed lessons, "first-steps" is implied — there's nothing to store.
 *
 * Used by:
 *   - GET /api/badges            → return current user's earned badges
 *   - POST /api/progress         → return delta after marking a lesson
 *   - POST /api/quizzes/:id/submit → return delta after a quiz submission
 *   - GET /api/leaderboard       → progress-derived per-user counts
 *   - GET /api/progress/admin    → per-user breakdown
 */

import { MODULES, getModule } from '@/lib/module-data';
import type { Badge, BadgeType, QuizScore, UserProgress } from '@/lib/types';

interface ComputeArgs {
  visitorId: string;
  progress: UserProgress[];
  /** Optional. Omitted for cross-user views where quiz scores aren't readable. */
  quizScores?: QuizScore[];
}

/**
 * Returns every badge the user currently qualifies for. Badge IDs are
 * synthetic (visitorId + badgeType) — they're stable across calls so React
 * keys stay consistent, but they don't correspond to any database row.
 *
 * earnedAt is derived from the achievement that triggered the badge:
 *   - first-steps     → earliest lesson completion
 *   - module badges   → latest lesson completion in that module
 *   - perfect-score   → completedAt of the first perfect quiz
 *   - completionist   → latest required-lesson completion
 *   - think-aimpossible → completedAt of the qualifying final quiz
 */
export function computeEarnedBadges({
  visitorId,
  progress,
  quizScores,
}: ComputeArgs): Badge[] {
  const completed = progress.filter((p) => p.completed);
  const completionTime = new Map<string, string>();
  for (const p of completed) {
    const key = `${p.moduleId}:${p.lessonId}`;
    const t = p.completedAt || p.startedAt;
    if (!t) continue;
    // Keep the latest stamp per lesson, in case of duplicate rows.
    const prev = completionTime.get(key);
    if (!prev || t > prev) completionTime.set(key, t);
  }
  const completedSet = new Set(completionTime.keys());

  const fallback = new Date().toISOString();
  const earned: Badge[] = [];

  function emit(badgeType: BadgeType, earnedAt: string | undefined) {
    earned.push({
      id: `${visitorId}:${badgeType}`,
      visitorId,
      badgeType,
      earnedAt: earnedAt ?? fallback,
      metadata: {},
    });
  }

  // first-steps — any lesson completed.
  if (completedSet.size >= 1) {
    const earliest = [...completionTime.values()].sort()[0];
    emit('first-steps', earliest);
  }

  // Module-completion badges. Earned when every lesson in the module is
  // marked complete; earnedAt = latest of those completions.
  const moduleBadges: Array<{ badgeType: BadgeType; modId: string }> = [
    { badgeType: 'email-ace', modId: 'mod-2' },
    { badgeType: 'report-writer', modId: 'mod-3' },
    { badgeType: 'data-wrangler', modId: 'mod-4' },
    { badgeType: 'media-maker', modId: 'mod-5' },
    { badgeType: 'search-pro', modId: 'mod-6' },
  ];
  for (const { badgeType, modId } of moduleBadges) {
    const mod = getModule(modId);
    if (!mod) continue;
    const stamps = mod.lessons.map((l) => completionTime.get(`${modId}:${l.id}`));
    if (!stamps.every((s): s is string => !!s)) continue;
    const latest = stamps.sort().reverse()[0];
    emit(badgeType, latest);
  }

  // Quiz-derived badges. Skipped silently when quizScores wasn't passed
  // (cross-user views where the caller can't read peers' scores).
  if (quizScores) {
    const perfect = quizScores
      .filter((s) => s.maxScore > 0 && s.score === s.maxScore)
      .sort((a, b) => (a.completedAt || '').localeCompare(b.completedAt || ''))[0];
    if (perfect) emit('perfect-score', perfect.completedAt);
  }

  // completionist — every required (non-bonus) module fully done.
  const requiredModules = MODULES.filter((m) => !m.isBonus);
  const requiredLessonKeys = requiredModules.flatMap((m) =>
    m.lessons.map((l) => `${m.id}:${l.id}`),
  );
  const requiredCompletionStamps = requiredLessonKeys
    .map((k) => completionTime.get(k))
    .filter((s): s is string => !!s);
  if (
    requiredLessonKeys.length > 0 &&
    requiredCompletionStamps.length === requiredLessonKeys.length
  ) {
    const latest = requiredCompletionStamps.sort().reverse()[0];
    emit('completionist', latest);
  }

  // think-aimpossible — 95%+ of required lessons done AND final quiz ≥ 80%.
  if (quizScores && requiredLessonKeys.length > 0) {
    const completedRequired = requiredLessonKeys.filter((k) =>
      completedSet.has(k),
    ).length;
    const ratio = completedRequired / requiredLessonKeys.length;
    if (ratio >= 0.95) {
      const finalQuiz = quizScores.find(
        (s) => s.quizId === 'quiz-final' && s.maxScore > 0,
      );
      if (finalQuiz && finalQuiz.score / finalQuiz.maxScore >= 0.8) {
        emit('think-aimpossible', finalQuiz.completedAt);
      }
    }
  }

  return earned;
}

/**
 * Diff helper: returns badges in `after` whose badgeType isn't in `before`.
 * Used by POST endpoints to surface "new badge earned!" toasts.
 */
export function diffBadges(before: Badge[], after: Badge[]): Badge[] {
  const beforeTypes = new Set(before.map((b) => b.badgeType));
  return after.filter((b) => !beforeTypes.has(b.badgeType));
}
