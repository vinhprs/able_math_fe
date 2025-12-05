import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  AdtmTemplateListResponse,
  AdtmTemplateDetailsResponse,
  AdtmTemplateStatistics,
  AdtmTemplateFilters,
} from '@/types/adtm-template.types';

/**
 * Fetch A-DTM templates with filters and pagination
 */
export function useAdtmTemplates(filters?: AdtmTemplateFilters) {
  return useQuery({
    queryKey: ['adtm-templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.level) params.append('level', filters.level);
      if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get<{
        success: boolean;
        data: AdtmTemplateListResponse;
        timestamp: string;
      }>(`/admin/adtm/templates?${params.toString()}`);
      return response.data.data;
    },
  });
}

/**
 * Fetch single A-DTM template details by ID
 */
export function useAdtmTemplateDetails(templateId: string | null) {
  return useQuery({
    queryKey: ['adtm-templates', templateId, 'details'],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: AdtmTemplateDetailsResponse;
        timestamp: string;
      }>(`/admin/adtm/templates/${templateId}`);
      return response.data.data;
    },
    enabled: !!templateId,
  });
}

/**
 * Fetch A-DTM template statistics
 */
export function useAdtmTemplateStatistics(templateId: string | null) {
  return useQuery({
    queryKey: ['adtm-templates', templateId, 'statistics'],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: AdtmTemplateStatistics;
        timestamp: string;
      }>(`/admin/adtm/templates/${templateId}/statistics`);
      return response.data.data;
    },
    enabled: !!templateId,
  });
}

/**
 * Update template status (active/inactive) mutation
 */
export function useUpdateTemplateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await api.put<{
        success: boolean;
        data: { id: string; testCode: string; isActive: boolean; status: string };
        timestamp: string;
      }>(`/admin/adtm/templates/${id}/status`, { isActive });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adtm-templates'] });
      queryClient.invalidateQueries({ queryKey: ['adtm-templates', variables.id] });
    },
  });
}

