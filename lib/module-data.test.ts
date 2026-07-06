import { describe, it, expect } from 'vitest';
import { MODULES, countsTowardCompletion } from './module-data';

describe('countsTowardCompletion', () => {
  it('counts a normal module', () => {
    expect(countsTowardCompletion({})).toBe(true);
  });

  it('excludes bonus modules', () => {
    expect(countsTowardCompletion({ isBonus: true })).toBe(false);
  });

  it('excludes intro modules', () => {
    expect(countsTowardCompletion({ isIntro: true })).toBe(false);
  });
});

describe('intro module', () => {
  const intro = MODULES[0];

  it('is first in the list', () => {
    expect(intro.id).toBe('mod-intro');
  });

  it('is flagged as intro and excluded from completion', () => {
    expect(intro.isIntro).toBe(true);
    expect(countsTowardCompletion(intro)).toBe(false);
  });

  it('has exactly one video-only lesson (no activity)', () => {
    expect(intro.lessons).toHaveLength(1);
    const lesson = intro.lessons[0];
    expect(lesson.id).toBe('mod-intro-les-1');
    expect(lesson.activityType).toBeUndefined();
    expect(lesson.activityId).toBeUndefined();
    expect(lesson.quizId).toBeUndefined();
  });
});
