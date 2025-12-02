import type { IUser, ILoginCredentials, IAuthResponse } from '@shared/types/users.types';
import type { UserRole } from '@shared/types/enum';

export type { IUser, ILoginCredentials, IAuthResponse, UserRole };

/**
 * API Error response
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Export report types
export type {
  ChartData,
  QuestionResult,
  UnitScore,
  DifficultyScore,
  AchievementReportData,
  AdtmSectionData,
  AdtmReportData,
} from './reports.types';

