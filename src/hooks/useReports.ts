import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AchievementReportData, AdtmReportData } from '@/types/reports.types';

/**
 * Fetch Achievement test report
 */
export function useAchievementReport(submissionId: string) {
  return useQuery({
    queryKey: ['reports', 'achievement', submissionId],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: AchievementReportData;
        timestamp: string;
      }>(`/reports/achievement/${submissionId}`);
      return response.data.data;
    },
    enabled: !!submissionId,
    retry: false, // Don't retry if it fails (wrong test type)
    onError: (error) => {
      // Silently handle errors - wrong test type is expected for one of the queries
      console.debug('Achievement report fetch failed (may be A-DTM test):', error);
    },
  });
}

/**
 * Fetch A-DTM test report
 */
export function useAdtmReport(submissionId: string) {
  return useQuery({
    queryKey: ['reports', 'adtm', submissionId],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: AdtmReportData;
        timestamp: string;
      }>(`/reports/adtm/${submissionId}`);
      return response.data.data;
    },
    enabled: !!submissionId,
    retry: false, // Don't retry if it fails (wrong test type)
    onError: (error) => {
      // Silently handle errors - wrong test type is expected for one of the queries
      console.debug('A-DTM report fetch failed (may be Achievement test):', error);
    },
  });
}

/**
 * Generate PDF for a report
 */
export function useGeneratePdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await api.post<{ success: boolean; pdfUrl: string; message: string }>(
        `/reports/${submissionId}/generate-pdf`
      );
      return response.data;
    },
    onSuccess: (data, submissionId) => {
      // Invalidate report queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reports', submissionId] });
    },
  });
}

/**
 * Download PDF file
 */
export function downloadPdf(submissionId: string) {
  const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/reports/${submissionId}/download-pdf`;
  window.open(url, '_blank');
}

