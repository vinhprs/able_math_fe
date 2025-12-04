import api from '@/lib/api';
import type {
  PendingReport,
  ReportCard,
  ApproveReportDto,
  RejectReportDto,
} from '@/types/report';
import type { AchievementReportData, AdtmReportData } from '@/types/reports.types';

/**
 * Report service for API calls
 * All methods use the configured axios instance with auth interceptors
 */
export const reportService = {
  // ========== TEACHER APIs ==========

  /**
   * Get pending reports for review
   * GET /api/reports/pending
   */
  async getPendingReports(): Promise<PendingReport[]> {
    const response = await api.get<{
      success: boolean;
      data: PendingReport[];
      timestamp: string;
    }>('/reports/pending');
    return response.data.data;
  },

  /**
   * Get report card by submission ID
   * This will be used to get reportId from submissionId
   * Note: Backend endpoint needs to be added, or use existing report generation
   */
  async getReportCardBySubmissionId(_submissionId: string): Promise<ReportCard | null> {
    // For now, we'll generate the report which creates/updates the report card
    // Then we can extract the reportId from it
    // This is a workaround until a proper endpoint is added
    try {
      // Try to get report data - this ensures report card exists
      // We'll need to parse the report card from the response or add a backend endpoint
      return null; // Placeholder - will be implemented when backend endpoint is added
    } catch {
      return null;
    }
  },

  /**
   * Get report for review
   * Note: This endpoint needs to be added to backend or use submissionId-based endpoints
   * GET /api/reports/:reportId
   */
  async getReportForReview(reportId: string): Promise<AchievementReportData | AdtmReportData> {
    const response = await api.get<{
      success: boolean;
      data: AchievementReportData | AdtmReportData;
      timestamp: string;
    }>(`/reports/${reportId}`);
    return response.data.data;
  },

  /**
   * Approve report
   * POST /api/reports/:reportId/approve
   */
  async approveReport(
    reportId: string,
    data?: ApproveReportDto,
  ): Promise<ReportCard> {
    const response = await api.post<{
      success: boolean;
      data: ReportCard;
      timestamp: string;
    }>(`/reports/${reportId}/approve`, data || {});
    return response.data.data;
  },

  /**
   * Publish report
   * POST /api/reports/:reportId/publish
   */
  async publishReport(reportId: string): Promise<ReportCard> {
    const response = await api.post<{
      success: boolean;
      data: ReportCard;
      timestamp: string;
    }>(`/reports/${reportId}/publish`);
    return response.data.data;
  },

  /**
   * Reject report
   * POST /api/reports/:reportId/reject
   */
  async rejectReport(
    reportId: string,
    data: RejectReportDto,
  ): Promise<ReportCard> {
    const response = await api.post<{
      success: boolean;
      data: ReportCard;
      timestamp: string;
    }>(`/reports/${reportId}/reject`, data);
    return response.data.data;
  },

  /**
   * Generate PDF for a report
   * POST /api/reports/:submissionId/generate-pdf
   * Note: Backend returns direct JSON (not wrapped in transform interceptor)
   */
  async generatePdf(submissionId: string): Promise<string> {
    const response = await api.post<{
      success: boolean;
      pdfUrl: string;
      message: string;
    }>(`/reports/${submissionId}/generate-pdf`);
    // Backend returns direct JSON: { success, pdfUrl, message }
    const responseData = response.data as any;
    return responseData.pdfUrl || '';
  },

  // ========== STUDENT APIs ==========

  /**
   * Get my published reports
   * GET /api/reports/student/my-reports
   */
  async getMyReports(): Promise<ReportCard[]> {
    const response = await api.get<{
      success: boolean;
      data: ReportCard[];
      timestamp: string;
    }>('/reports/student/my-reports');
    return response.data.data;
  },

  /**
   * Get published report detail
   * GET /api/reports/student/:reportId
   */
  async getPublishedReport(reportId: string): Promise<AchievementReportData | AdtmReportData> {
    const response = await api.get<{
      success: boolean;
      data: AchievementReportData | AdtmReportData;
      timestamp: string;
    }>(`/reports/student/${reportId}`);
    return response.data.data;
  },

  /**
   * Download PDF by URL
   * Opens PDF in new window/tab
   */
  downloadPdf(pdfUrl: string): void {
    if (!pdfUrl) {
      throw new Error('PDF URL is required');
    }
    window.open(pdfUrl, '_blank');
  },
};

