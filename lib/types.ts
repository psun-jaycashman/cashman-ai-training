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

export type ActivityType = 'quiz' | 'exercise' | 'game' | 'survey';

export interface Lesson {
  id: string;
  title: string;
  content: string; // markdown content
  estimatedMinutes: number;
  order: number;
  quizId?: string;
  activityType?: ActivityType;
  activityId?: string;
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

// ==========================================================================
// Exercise Types
// ==========================================================================

export type ExerciseVariant = 'prompt-challenge' | 'article-reflection' | 'paste-back';

export interface EvaluationRubric {
  criteria: string[];
  passingScore: number;
  systemPrompt: string;
}

export interface EvaluationCriterionResult {
  criterion: string;
  met: boolean;
  comment: string;
}

export interface EvaluationResult {
  score: number;
  maxScore: number;
  feedback: string;
  passed: boolean;
  criteriaResults: EvaluationCriterionResult[];
}

export interface GoodExample {
  title: string;
  body: string;
  note?: string;
}

export interface Exercise {
  id: string;
  moduleId: string;
  lessonId: string;
  title: string;
  variant: ExerciseVariant;
  instructions: string;
  scenario?: string;
  modelAnswer?: string;
  goodExamples?: GoodExample[];
  hints?: string[];
  articleUrl?: string;
  reflectionPrompt?: string;
  evaluationRubric?: EvaluationRubric;
}

// ==========================================================================
// Game Types (Scenario Decision Tree)
// ==========================================================================

export interface GameChoice {
  label: string;
  nextNodeId: string;
  feedback: string;
  isCorrect?: boolean;
}

export interface GameNode {
  id: string;
  situation: string;
  choices: GameChoice[];
}

export interface Game {
  id: string;
  moduleId: string;
  lessonId: string;
  title: string;
  description: string;
  nodes: GameNode[];
  startNodeId: string;
}

// ==========================================================================
// Survey Types
// ==========================================================================

export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple-choice';
  question: string;
  options?: string[];
  category: 'self-assessment' | 'feedback';
}

export interface Survey {
  id: string;
  moduleId: string;
  lessonId: string;
  title: string;
  questions: SurveyQuestion[];
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
  | 'email-ace'
  | 'report-writer'
  | 'data-wrangler'
  | 'media-maker'
  | 'search-pro'
  | 'agent-handler'
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
// Training Video Types
// ==========================================================================

export type VideoSource = 'uploaded' | 'external';
export type ExternalVideoProvider = 'youtube' | 'vimeo' | 'other';

export interface TrainingVideo {
  id: string;
  moduleId: string;
  lessonId?: string;
  title: string;
  description?: string;
  source: VideoSource;
  // Present when source === 'uploaded'
  fileId?: string;
  mimeType?: string;
  sizeBytes?: number;
  // Present when source === 'external'
  externalUrl?: string;
  externalProvider?: ExternalVideoProvider;
  posterUrl?: string;
  durationSeconds?: number;
  order: number;
  uploadedBy: string;
  uploadedAt: string;
}

export type PlaybackInfo =
  | { kind: 'uploaded'; url: string; mimeType: string; expiresAt: string }
  | { kind: 'external'; provider: ExternalVideoProvider; url: string };

export interface TrainingVideoWithPlayback extends TrainingVideo {
  playback: PlaybackInfo;
}

export interface VideoProgress {
  id: string;
  visitorId: string;
  videoId: string;
  moduleId: string;
  lessonId?: string;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: string;
}

// ==========================================================================
// Utility Types
// ==========================================================================

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
