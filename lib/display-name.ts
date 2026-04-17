/**
 * Derive a human-readable display name from an email address.
 *
 * Example: `peter.sun@jaycashman.com` → `Peter Sun`.
 * Example: `psun@jaycashman.com` → `Psun`.
 *
 * Used anywhere we only have email + visitorId and need a friendly label.
 */
export function displayNameFromEmail(email: string | undefined | null): string | null {
  if (!email) return null;
  const localPart = email.split('@')[0];
  if (!localPart) return null;
  return localPart
    .split('.')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
