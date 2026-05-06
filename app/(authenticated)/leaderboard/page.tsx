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
          Complete modules, learn, and expand your capabilities!
        </p>
      </div>

      <LeaderboardTable entries={entries} currentUserId={user?.id} />
    </div>
  );
}
