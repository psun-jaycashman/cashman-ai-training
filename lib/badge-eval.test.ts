import { describe, it, expect } from 'vitest';
import { computeEarnedBadges } from './badge-eval';
import { MODULES, countsTowardCompletion } from './module-data';
import type { UserProgress } from './types';

describe('computeEarnedBadges — intro exclusion', () => {
  it('awards completionist for required modules without the intro module', () => {
    const requiredLessons = MODULES.filter(countsTowardCompletion).flatMap((m) =>
      m.lessons.map((l) => ({ moduleId: m.id, lessonId: l.id })),
    );

    const progress: UserProgress[] = requiredLessons.map((k, i) => ({
      id: `p-${i}`,
      visitorId: 'u1',
      moduleId: k.moduleId,
      lessonId: k.lessonId,
      completed: true,
      completedAt: '2026-07-06T00:00:00.000Z',
      startedAt: '2026-07-06T00:00:00.000Z',
      timeSpentSeconds: 0,
    }));

    const badges = computeEarnedBadges({ visitorId: 'u1', progress });
    expect(badges.some((b) => b.badgeType === 'completionist')).toBe(true);
  });
});
