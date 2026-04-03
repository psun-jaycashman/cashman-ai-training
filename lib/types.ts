/**
 * Shared Types for Cashman AI Training App
 */

// ==========================================================================
// Authentication Types
// ==========================================================================

export interface User {
  id: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  roles: string[];
}

export interface Session {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// ==========================================================================
// API Types
// ==========================================================================

export interface ApiError {
  error: string;
  message?: string;
  details?: string;
  code?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==========================================================================
// Common Types
// ==========================================================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationEntity extends BaseEntity {
  organizationId: string;
}

// ==========================================================================
// Module & Lesson Types
// ==========================================================================

export interface Module {
  id: string;
  title: string;
  description: string;
  instructor: 'Peter' | 'Bobby' | 'Wes';
  estimatedMinutes: number;
  order: number;
  icon: string;
  videoUrl: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // markdown content
  estimatedMinutes: number;
  order: number;
  quizId?: string;
  interactiveType?: 'playground' | 'rag-demo' | 'security-challenge' | 'exercise' | null;
}

// ==========================================================================
// Progress Tracking
// ==========================================================================

export interface UserProgress {
  id: string;
  visitorId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string;
  startedAt: string;
  timeSpentSeconds: number;
}

// ==========================================================================
// Quiz Types
// ==========================================================================

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'matching';
  question: string;
  options: string[];
  correctAnswer: number | number[];
  explanation: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizScore {
  id: string;
  visitorId: string;
  moduleId: string;
  lessonId: string;
  quizId: string;
  score: number;
  maxScore: number;
  attempts: number;
  completedAt: string;
  answers: Record<string, number | number[]>;
}

// ==========================================================================
// Badge Types
// ==========================================================================

export type BadgeType =
  | 'first-steps'
  | 'quick-learner'
  | 'prompt-pro'
  | 'security-shield'
  | 'agent-handler'
  | 'data-wrangler'
  | 'power-user'
  | 'perfect-score'
  | 'completionist'
  | 'think-aimpossible';

export interface Badge {
  id: string;
  visitorId: string;
  badgeType: BadgeType;
  earnedAt: string;
  metadata: Record<string, unknown>;
}

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

// ==========================================================================
// Leaderboard
// ==========================================================================

export interface LeaderboardEntry {
  visitorId: string;
  displayName: string;
  totalPoints: number;
  modulesCompleted: number;
  badgesEarned: number;
  rank: number;
}

// ==========================================================================
// Admin Types
// ==========================================================================

export interface AdminUserProgress {
  visitorId: string;
  displayName: string;
  email: string;
  modulesCompleted: number;
  totalModules: number;
  lessonsCompleted: number;
  totalLessons: number;
  averageQuizScore: number;
  badges: BadgeType[];
  lastActivity: string;
  certificateEarned: boolean;
}

// ==========================================================================
// Certificate
// ==========================================================================

export interface Certificate {
  userName: string;
  completionDate: string;
  totalScore: number;
  badgesEarned: number;
}

// ==========================================================================
// Utility Types
// ==========================================================================

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
