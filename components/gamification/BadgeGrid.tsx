'use client';

import {
  Award,
  Zap,
  Mail,
  FileText,
  Table,
  Image,
  Search,
  Rocket,
  Star,
  Trophy,
  Sparkles,
  Lock,
} from 'lucide-react';
import type { BadgeType, BadgeDefinition } from '@/lib/types';

const badgeIcons: Record<string, React.ReactNode> = {
  'first-steps': <Award className="w-6 h-6" />,
  'quick-learner': <Zap className="w-6 h-6" />,
  'email-ace': <Mail className="w-6 h-6" />,
  'report-writer': <FileText className="w-6 h-6" />,
  'data-wrangler': <Table className="w-6 h-6" />,
  'media-maker': <Image className="w-6 h-6" />,
  'search-pro': <Search className="w-6 h-6" />,
  'power-user': <Rocket className="w-6 h-6" />,
  'perfect-score': <Star className="w-6 h-6" />,
  'completionist': <Trophy className="w-6 h-6" />,
  'think-aimpossible': <Sparkles className="w-6 h-6" />,
};

const badgeColors: Record<string, string> = {
  'first-steps': 'from-blue-400 to-blue-600',
  'quick-learner': 'from-yellow-400 to-orange-500',
  'email-ace': 'from-teal-400 to-teal-600',
  'report-writer': 'from-purple-400 to-purple-600',
  'data-wrangler': 'from-orange-400 to-red-500',
  'media-maker': 'from-pink-400 to-pink-600',
  'search-pro': 'from-green-400 to-green-600',
  'power-user': 'from-indigo-400 to-indigo-600',
  'perfect-score': 'from-rose-400 to-rose-600',
  'completionist': 'from-amber-400 to-amber-600',
  'think-aimpossible': 'from-violet-400 to-fuchsia-500',
};

interface BadgeGridProps {
  earnedBadges: BadgeType[];
  allBadges: BadgeDefinition[];
}

export default function BadgeGrid({ earnedBadges, allBadges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {allBadges.map((badge) => {
        const isEarned = earnedBadges.includes(badge.type);

        return (
          <div
            key={badge.type}
            className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
              isEarned
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 opacity-60'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                isEarned
                  ? `bg-gradient-to-br ${badgeColors[badge.type] || 'from-indigo-400 to-indigo-600'} text-white shadow-lg`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              {isEarned ? (
                badgeIcons[badge.type] || <Award className="w-6 h-6" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <h4 className={`text-xs font-semibold mb-1 ${
              isEarned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {badge.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {isEarned ? badge.description : badge.criteria}
            </p>
          </div>
        );
      })}
    </div>
  );
}
