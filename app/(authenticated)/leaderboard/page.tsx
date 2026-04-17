'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from '@jazzmind/busibox-app/components/auth/SessionProvider';
import { Trophy } from 'lucide-react';
import LeaderboardTable from '@/components/gamification/Leaderboard';
import type { LeaderboardEntry } from '@/lib/types';
import { displayNameFromEmail } from '@/lib/display-name';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function LeaderboardPage() {
  const { user } = useSession();
  const [rawEntries, setRawEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${basePath}/api/leaderboard`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setRawEntries(data.leaderboard || data.entries || data || []);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Backend stores only visitorIds, so it can't populate display names.
  // For the current user's row we override with a name derived from their
  // session email — same pattern the profile page uses.
  const currentUserName = displayNameFromEmail(user?.email);
  const entries = useMemo(() => {
    if (!user?.id || !currentUserName) return rawEntries;
    return rawEntries.map((e) =>
      e.visitorId === user.id ? { ...e, displayName: currentUserName } : e
    );
  }, [rawEntries, user?.id, currentUserName]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          See how you stack up against your colleagues. Complete modules and earn badges to climb the ranks!
        </p>
      </div>

      {/* Top 3 Podium (if enough entries) */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Second place */}
          <div className="flex flex-col items-center justify-end">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-400 mb-2">
              {entries[1].displayName.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-full">
              {entries[1].displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{entries[1].totalPoints.toLocaleString()} pts</p>
            <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">2</span>
            </div>
          </div>

          {/* First place */}
          <div className="flex flex-col items-center justify-end">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-bold text-white mb-2 shadow-lg">
              {entries[0].displayName.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-full">
              {entries[0].displayName}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{entries[0].totalPoints.toLocaleString()} pts</p>
            <div className="w-full h-28 bg-amber-100 dark:bg-amber-900/30 rounded-t-lg mt-2 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          {/* Third place */}
          <div className="flex flex-col items-center justify-end">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl font-bold text-amber-700 dark:text-amber-400 mb-2">
              {entries[2].displayName.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-full">
              {entries[2].displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{entries[2].totalPoints.toLocaleString()} pts</p>
            <div className="w-full h-14 bg-amber-50 dark:bg-amber-900/20 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-600/60 dark:text-amber-400/60">3</span>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <LeaderboardTable entries={entries} currentUserId={user?.id} />
    </div>
  );
}
