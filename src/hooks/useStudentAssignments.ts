import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface StudentAssignmentFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  hasDeadline?: boolean;
  overdue?: boolean;
  page?: number;
  limit?: number;
}

export interface StudentAssignment {
  id: string;
  test: {
    id: string;
    title: string;
    testCode: string;
    totalScore: number;
  };
  assignedBy: {
    fullName: string;
  };
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  deadline: string | null;
  isOverdue: boolean;
  assignedAt: string;
  submission: {
    id: string;
    status: string;
    score: number | null;
    submittedAt: string | null;
  } | null;
}

export interface PaginatedStudentAssignments {
  data: StudentAssignment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StudentAssignmentDetail extends StudentAssignment {
  test: StudentAssignment['test'] & {
    questionCount: number;
  };
  timeRemaining: {
    days: number;
    hours: number;
  } | null;
  submission: StudentAssignment['submission'] & {
    gradedAt: string | null;
  } | null;
  canStart: boolean;
  canContinue: boolean;
  canViewResult: boolean;
}

export interface UpcomingDeadline {
  id: string;
  testTitle: string;
  testCode: string;
  deadline: string;
  timeRemaining: {
    days: number;
    hours: number;
  };
}

export interface AssignmentStats {
  total: number;
  pending: number;
  inProgress: number;
  submitted: number;
  graded: number;
  overdue: number;
  dueSoon: number;
  completionRate: number;
}

/**
 * Fetch student's assignments with filters
 */
export function useStudentAssignments(filters?: StudentAssignmentFilters) {
  return useQuery({
    queryKey: ['student-assignments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.hasDeadline !== undefined) params.append('hasDeadline', filters.hasDeadline.toString());
      if (filters?.overdue !== undefined) params.append('overdue', filters.overdue.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get<{
        success: boolean;
        data: PaginatedStudentAssignments;
        timestamp: string;
      }>(`/student/assignments?${params.toString()}`);
      return response.data.data;
    },
  });
}

/**
 * Fetch single assignment detail for student
 */
export function useStudentAssignment(assignmentId: string | null) {
  return useQuery({
    queryKey: ['student-assignment', assignmentId],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: StudentAssignmentDetail;
        timestamp: string;
      }>(`/student/assignments/${assignmentId}`);
      return response.data.data;
    },
    enabled: !!assignmentId,
  });
}

/**
 * Fetch upcoming deadlines (next 7 days)
 */
export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: ['upcoming-deadlines'],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: UpcomingDeadline[];
        timestamp: string;
      }>('/student/assignments/deadlines/upcoming');
      return response.data.data;
    },
  });
}

/**
 * Fetch assignment statistics
 */
export function useAssignmentStats() {
  return useQuery({
    queryKey: ['student-assignment-stats'],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: AssignmentStats;
        timestamp: string;
      }>('/student/assignments/stats/summary');
      return response.data.data;
    },
  });
}
