import { describe, it, expect } from 'vitest';
import { isAdminRole } from './admin-roles';

describe('isAdminRole', () => {
  it('returns false for empty/missing input', () => {
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole([])).toBe(false);
  });

  it('matches lowercase admin', () => {
    expect(isAdminRole(['user', 'admin'])).toBe(true);
  });

  it('matches capitalised Admin', () => {
    expect(isAdminRole(['user', 'Admin'])).toBe(true);
  });

  it('matches ADMIN', () => {
    expect(isAdminRole(['ADMIN'])).toBe(true);
  });

  it('matches namespaced app:cashman-ai-training:admin', () => {
    expect(isAdminRole(['user', 'app:cashman-ai-training:admin'])).toBe(true);
  });

  it('does not match unrelated roles that contain "admin"', () => {
    expect(isAdminRole(['app:busibox-workforce:admin-data-team'])).toBe(false);
    expect(isAdminRole(['administrator'])).toBe(false);
    expect(isAdminRole(['super-admin'])).toBe(false);
  });

  it('does not match a different app namespace', () => {
    expect(isAdminRole(['app:other-app:admin'])).toBe(false);
  });
});
