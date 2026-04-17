/**
 * Shared helper for checking whether a user's role list grants admin access.
 *
 * Admin roles in practice come in a few shapes:
 * - Plain `admin` (any case — some JWTs use `Admin` as a display-cased claim)
 * - Namespaced `app:cashman-ai-training:admin`
 *
 * Centralising the check here prevents drift between client and server.
 */

const ADMIN_ROLE_PATTERNS: RegExp[] = [
  /^admin$/i,
  /^app:cashman-ai-training:admin$/i,
];

export function isAdminRole(roles: string[] | undefined | null): boolean {
  if (!roles) return false;
  return roles.some((role) =>
    ADMIN_ROLE_PATTERNS.some((pattern) => pattern.test(role))
  );
}
