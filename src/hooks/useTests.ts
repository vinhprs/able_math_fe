import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  ITest,
  ITestDetail,
  ITestQuestion,
  ICreateTestDto,
  IUpdateTestDto,
  ICreateQuestionDto,
  ITestQueryFilters,
  IPaginatedTestResponse,
} from '@/types/test.types';

/**
 * Fetch tests with filters and pagination
 */
export function useTests(filters?: ITestQueryFilters) {
  return useQuery({
    queryKey: ['tests', 'achievement', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.testType) params.append('testType', filters.testType);
      if (filters?.grade) params.append('grade', filters.grade);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.curriculum) params.append('curriculum', filters.curriculum);
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get<{ success: boolean; data: IPaginatedTestResponse; timestamp: string }>(
        `/tests/achievement?${params.toString()}`
      );
      return response.data.data;
    },
  });
}

/**
 * Fetch single test by ID
 */
export function useTest(testId: string | null) {
  return useQuery({
    queryKey: ['tests', 'achievement', testId],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: ITestDetail; timestamp: string }>(
        `/tests/achievement/${testId}`
      );
      return response.data.data;
    },
    enabled: !!testId,
  });
}

/**
 * Create test mutation
 */
export function useCreateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateTestDto) => {
      const response = await api.post<{ success: boolean; data: ITest; timestamp: string }>(
        '/tests/achievement',
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'achievement'] });
    },
  });
}

/**
 * Update test mutation
 */
export function useUpdateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IUpdateTestDto }) => {
      const response = await api.put<{ success: boolean; data: ITest; timestamp: string }>(
        `/tests/achievement/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'achievement'] });
      queryClient.invalidateQueries({ queryKey: ['tests', 'achievement', variables.id] });
    },
  });
}

/**
 * Delete test mutation (soft delete - archives)
 */
export function useDeleteTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tests/achievement/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'achievement'] });
    },
  });
}

/**
 * Publish test mutation
 */
export function usePublishTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<{ success: boolean; data: ITest; timestamp: string }>(
        `/tests/achievement/${id}/publish`
      );
      return response.data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'achievement'] });
      queryClient.invalidateQueries({ queryKey: ['tests', 'achievement', id] });
    },
  });
}

/**
 * Add question to test mutation
 */
export function useAddQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ testId, data }: { testId: string; data: ICreateQuestionDto }) => {
      const response = await api.post<{ success: boolean; data: ITestQuestion; timestamp: string }>(
        `/tests/achievement/${testId}/questions`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'achievement', variables.testId] });
    },
  });
}

/**
 * Update question mutation
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testId,
      questionId,
      data,
    }: {
      testId: string;
      questionId: string;
      data: Partial<ICreateQuestionDto>;
    }) => {
      const response = await api.put<{ success: boolean; data: ITestQuestion; timestamp: string }>(
        `/tests/achievement/${testId}/questions/${questionId}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'achievement', variables.testId] });
    },
  });
}

/**
 * Delete question mutation
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ testId, questionId }: { testId: string; questionId: string }) => {
      await api.delete(`/tests/achievement/${testId}/questions/${questionId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'achievement', variables.testId] });
    },
  });
}

