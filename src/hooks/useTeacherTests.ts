import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ITest, ITestDetail, IPaginatedTestResponse } from '@/types/test.types';

interface TeacherTestFilters {
  page?: number;
  limit?: number;
  grade?: string;
  level?: number;
  search?: string;
}

interface TestStatistics {
  totalAssignments: number;
  completedSubmissions: number;
  avgScore: number;
  highestScore: number;
  completionRate: number;
}

interface TestDetailForTeacher extends ITestDetail {
  questionCount?: number;
  unitBreakdown?: Array<{
    unitName: string;
    questionCount: number;
    totalScore: number;
  }>;
}

/**
 * Fetch published tests for teachers
 */
export function useTeacherTests(filters?: TeacherTestFilters) {
  return useQuery({
    queryKey: ['teacher-tests', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.grade) params.append('grade', filters.grade);
      if (filters?.level) params.append('level', filters.level.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get<{
        success: boolean;
        data: IPaginatedTestResponse;
        timestamp: string;
      }>(`/teacher/tests/achievement?${params.toString()}`);
      return response.data.data;
    },
  });
}

/**
 * Fetch test details for teacher preview
 */
export function useTeacherTestDetails(testId: string | null) {
  return useQuery({
    queryKey: ['teacher-test-details', testId],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: TestDetailForTeacher;
        timestamp: string;
      }>(`/teacher/tests/achievement/${testId}`);
      return response.data.data;
    },
    enabled: !!testId,
  });
}

/**
 * Fetch test statistics
 */
export function useTeacherTestStats(testId: string | null) {
  return useQuery({
    queryKey: ['teacher-test-stats', testId],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: TestStatistics;
        timestamp: string;
      }>(`/teacher/tests/achievement/${testId}/stats`);
      return response.data.data;
    },
    enabled: !!testId,
  });
}

