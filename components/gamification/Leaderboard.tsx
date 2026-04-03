'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 w-5 text-center">{rank}</span>;
}

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Points
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
              Modules
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
              Badges
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {entries.map((entry) => {
            const isCurrent = entry.visitorId === currentUserId;
            return (
              <tr
                key={entry.visitorId}
                className={`transition-colors ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <RankBadge rank={entry.rank} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${
                    isCurrent ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'
                  }`}>
                    {entry.displayName}
                    {isCurrent && (
                      <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {entry.totalPoints.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.modulesCompleted}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.badgesEarned}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No leaderboard data yet. Start completing modules to appear here!
        </div>
      )}
    </div>
  );
}
