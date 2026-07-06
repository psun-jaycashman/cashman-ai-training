import { describe, it, expect } from 'vitest';
import { countsTowardCompletion } from './module-data';

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
