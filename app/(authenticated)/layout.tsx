'use client';

import { ReactNode } from 'react';
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

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/modules', label: 'Modules' },
  { href: '/playground', label: 'AI Playground' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/profile', label: 'My Profile' },
];

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useSession();
  const pathname = usePathname();

  const isAdmin = isAdminRole(user?.roles);

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
