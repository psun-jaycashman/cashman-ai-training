'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header, Footer } from '@jazzmind/busibox-app';
import type { NavigationItem } from '@jazzmind/busibox-app';
import { useSession } from '@jazzmind/busibox-app/components/auth/SessionProvider';
import { isAdminRole } from '@/lib/admin-roles';

const portalBaseUrl = (process.env.NEXT_PUBLIC_BUSIBOX_PORTAL_URL || process.env.NEXT_PUBLIC_AI_PORTAL_URL || '').replace(/\/+$/, '');
const portalUrl = portalBaseUrl
  ? (portalBaseUrl.endsWith('/portal') ? portalBaseUrl : `${portalBaseUrl}/portal`)
  : '/portal';

const apiBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const baseNavItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/modules', label: 'Modules' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/profile', label: 'My Profile' },
];

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useSession();
  const pathname = usePathname();

  // Stamp the user into the leaderboard roster so peers can see them by
  // name — fire-and-forget, idempotent. We pass the email/displayName from
  // useSession() because the data-api token doesn't always carry an email
  // claim, so token-only extraction on the server can leave the row blank.
  // Failure is silent; the UI falls back to visitorId for unknown users.
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${apiBasePath}/api/users/me`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user?.email ?? undefined,
        displayName: user?.displayName ?? undefined,
      }),
    }).catch(() => { /* non-fatal */ });
  }, [isAuthenticated, user?.email, user?.displayName]);

  const isAdmin = isAdminRole(user?.roles);
  const navItems = isAdmin
    ? [...baseNavItems, { href: '/admin', label: 'Admin' }]
    : baseNavItems;

  const adminNavigation: NavigationItem[] = isAdmin
    ? [{ label: 'Admin Dashboard', href: '/admin' }]
    : [];

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header
        session={{ user, isAuthenticated }}
        onLogout={handleLogout}
        postLogoutRedirectTo={`${portalUrl}/login`}
        adminNavigation={adminNavigation}
        appsLink={`${portalUrl}/home`}
        accountLink={`${portalUrl}/account`}
      />
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-6 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                isActive(item.href)
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
