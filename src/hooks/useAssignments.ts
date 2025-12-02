import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toastSuccess, toastError } from '@/lib/toast';

export interface AssignmentFilters {
  status?: string;
  testId?: string;
  studentId?: string;
  page?: number;
  limit?: number;
}

export interface Assignment {
  id: string;
  test: {
    id: string;
    title: string;
    testCode: string;
    totalScore: number;
  };
  student: {
    id: string;
    fullName: string;
    grade?: string;
  };
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  deadline: string | null;
  createdAt: string;
}

export interface PaginatedAssignments {
  data: Assignment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AssignmentDetail extends Assignment {
  test: Assignment['test'] & {
    questionCount: number;
  };
  student: Assignment['student'] & {
    email: string;
  };
  assignedBy: {
    id: string;
    fullName: string;
  };
}

export interface CreateAssignmentDto {
  testId: string;
  studentId: string;
  deadline?: string;
}

export interface BulkAssignDto {
  testId: string;
  studentIds: string[];
  deadline?: string;
}

/**
 * Fetch teacher's assignments with filters
 */
export function useAssignments(filters?: AssignmentFilters) {
  return useQuery({
    queryKey: ['teacher-assignments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.testId) params.append('testId', filters.testId);
      if (filters?.studentId) params.append('studentId', filters.studentId);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get<{
        success: boolean;
        data: PaginatedAssignments;
        timestamp: string;
      }>(`/assignments/teacher?${params.toString()}`);
      return response.data.data;
    },
  });
}

/**
 * Fetch single assignment details
 */
export function useAssignment(assignmentId: string | null) {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: AssignmentDetail;
        timestamp: string;
      }>(`/assignments/${assignmentId}`);
      return response.data.data;
    },
    enabled: !!assignmentId,
  });
}

/**
 * Fetch students assigned to a specific test
 */
export function useAssignedStudents(testId: string | null) {
  return useQuery({
    queryKey: ['assigned-students', testId],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: Array<{
          assignmentId: string;
          student: {
            id: string;
            fullName: string;
            grade?: string;
          };
          status: string;
          assignedAt: string;
          deadline: string | null;
        }>;
        timestamp: string;
      }>(`/assignments/test/${testId}/students`);
      return response.data.data;
    },
    enabled: !!testId,
  });
}

/**
 * Create single assignment mutation
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAssignmentDto) => {
      const response = await api.post<{
        success: boolean;
        data: Assignment;
        timestamp: string;
      }>('/assignments', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toastSuccess('Assignment created successfully');
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || 'Failed to create assignment');
    },
  });
}

/**
 * Bulk assign mutation
 */
export function useBulkAssign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkAssignDto) => {
      const response = await api.post<{
        success: boolean;
        data: {
          assigned: number;
          skipped: number;
          assignments: Array<{
            id: string;
            studentName: string;
          }>;
        };
        timestamp: string;
      }>('/assignments/bulk', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toastSuccess(`Successfully assigned to ${data.assigned} students`);
      if (data.skipped > 0) {
        toastError(`${data.skipped} students were already assigned this test`);
      }
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || 'Failed to assign test');
    },
  });
}

/**
 * Delete assignment mutation
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{
        success: boolean;
        data: { message: string };
        timestamp: string;
      }>(`/assignments/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toastSuccess('Assignment deleted successfully');
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || 'Failed to delete assignment');
    },
  });
}

/**
 * Extend deadline mutation
 */
export function useExtendDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newDeadline }: { id: string; newDeadline: Date }) => {
      const response = await api.post<{
        success: boolean;
        data: { message: string; newDeadline: string };
        timestamp: string;
      }>(`/assignments/${id}/extend-deadline`, {
        newDeadline: newDeadline.toISOString(),
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
      toastSuccess('Deadline extended successfully');
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || 'Failed to extend deadline');
    },
  });
}
