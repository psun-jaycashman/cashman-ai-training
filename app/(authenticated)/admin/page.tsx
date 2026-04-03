'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@jazzmind/busibox-app/components/auth/SessionProvider';
import { useRouter } from 'next/navigation';
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  ChevronUp,
  ChevronDown,
  Shield,
} from 'lucide-react';
import type { AdminUserProgress } from '@/lib/types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

type SortKey = 'displayName' | 'lessonsCompleted' | 'averageQuizScore' | 'lastActivity';
type SortDir = 'asc' | 'desc';

export default function AdminPage() {
  const { user } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('lessonsCompleted');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const isAdmin = user?.roles?.includes('admin') ?? false;

  useEffect(() => {
    if (!isAdmin && user) {
      router.replace('/');
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(`${basePath}/api/progress/admin`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || data || []);
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, user, router]);

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400">You need admin privileges to view this page.</p>
      </div>
    );
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const multiplier = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'displayName') {
      return multiplier * a.displayName.localeCompare(b.displayName);
    }
    if (sortKey === 'lastActivity') {
      return multiplier * (new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime());
    }
    const aVal = a[sortKey] as number;
    const bVal = b[sortKey] as number;
    return multiplier * (aVal - bVal);
  });

  // Stats
  const totalUsers = users.length;
  const avgCompletion = totalUsers > 0
    ? users.reduce((sum, u) => sum + (u.totalLessons > 0 ? (u.lessonsCompleted / u.totalLessons) * 100 : 0), 0) / totalUsers
    : 0;
  const totalCertificates = users.filter((u) => u.certificateEarned).length;
  const avgQuizScore = totalUsers > 0
    ? users.reduce((sum, u) => sum + u.averageQuizScore, 0) / totalUsers
    : 0;

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return null;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 inline ml-1" />
      : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor training progress across all users.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgCompletion)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Completion</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgQuizScore)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Quiz Score</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCertificates}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Progress Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Progress</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => handleSort('displayName')}
                >
                  User <SortIcon field="displayName" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => handleSort('lessonsCompleted')}
                >
                  Progress <SortIcon field="lessonsCompleted" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 hidden sm:table-cell"
                  onClick={() => handleSort('averageQuizScore')}
                >
                  Quiz Avg <SortIcon field="averageQuizScore" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Badges
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 hidden lg:table-cell"
                  onClick={() => handleSort('lastActivity')}
                >
                  Last Active <SortIcon field="lastActivity" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Cert
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {sortedUsers.map((u) => {
                const percent = u.totalLessons > 0 ? (u.lessonsCompleted / u.totalLessons) * 100 : 0;
                return (
                  <tr key={u.visitorId} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.displayName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: percent >= 100 ? '#22c55e' : '#4f46e5',
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-16 text-right">
                          {u.lessonsCompleted}/{u.totalLessons}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {Math.round(u.averageQuizScore)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {u.badges.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      {u.certificateEarned ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40">
                          <Award className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No user data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
