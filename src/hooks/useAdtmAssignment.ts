import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  AvailableStudentsResponse,
  AdtmTemplateForAssignment,
  AssignStudentsRequest,
  AssignStudentsResponse,
  AssignmentFilters,
} from '@/types/adtm-assignment.types';

/**
 * Fetch students available for A-DTM assignment
 */
export function useAvailableStudents(filters?: AssignmentFilters) {
  return useQuery({
    queryKey: ['adtm-assignment', 'available-students', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.grade) params.append('grade', filters.grade);
      if (filters?.classId) params.append('classId', filters.classId);
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get<{
        success: boolean;
        data: AvailableStudentsResponse;
        timestamp: string;
      }>(`/teacher/adtm/students/available?${params.toString()}`);
      return response.data.data;
    },
  });
}

/**
 * Fetch active A-DTM templates for assignment
 */
export function useAdtmTemplatesForAssignment(level?: string) {
  return useQuery({
    queryKey: ['adtm-assignment', 'templates', level],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (level) params.append('level', level);

      const response = await api.get<{
        success: boolean;
        data: { templates: AdtmTemplateForAssignment[]; total: number };
        timestamp: string;
      }>(`/teacher/adtm/templates?${params.toString()}`);
      return response.data.data;
    },
  });
}

/**
 * Assign students to A-DTM test mutation
 */
export function useAssignStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignStudentsRequest) => {
      const response = await api.post<{
        success: boolean;
        data: AssignStudentsResponse;
        timestamp: string;
      }>('/teacher/adtm/assign', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adtm-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['adtm-templates'] });
    },
  });
}

