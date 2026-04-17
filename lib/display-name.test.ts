import { describe, it, expect } from 'vitest';
import { displayNameFromEmail } from './display-name';

describe('displayNameFromEmail', () => {
  it('returns null for falsy input', () => {
    expect(displayNameFromEmail(undefined)).toBeNull();
    expect(displayNameFromEmail(null)).toBeNull();
    expect(displayNameFromEmail('')).toBeNull();
  });

  it('capitalises dotted local parts', () => {
    expect(displayNameFromEmail('peter.sun@jaycashman.com')).toBe('Peter Sun');
  });

  it('capitalises multi-dot local parts', () => {
    expect(displayNameFromEmail('mary.jane.watson@example.com')).toBe('Mary Jane Watson');
  });

  it('capitalises single-part locals', () => {
    expect(displayNameFromEmail('psun@jaycashman.com')).toBe('Psun');
  });

  it('handles malformed email without @', () => {
    expect(displayNameFromEmail('not-an-email')).toBe('Not-an-email');
  });
});
