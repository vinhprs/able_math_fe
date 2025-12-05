import api from "@/lib/api";
import type {
  PendingReport,
  ReportCard,
  ApproveReportDto,
  RejectReportDto,
} from "@/types/report";
import type {
  AchievementReportData,
  AdtmReportData,
} from "@/types/reports.types";

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
    }>("/reports/pending");
    return response.data.data;
  },

  /**
   * Get all reports for teacher (with optional filters)
   * GET /api/reports/teacher/all
   * Query params: status, testType
   */
  async getAllReportsForTeacher(filters?: {
    status?: string;
    testType?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.testType) params.append("testType", filters.testType);

    const queryString = params.toString();
    const url = `/reports/teacher/all${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<{
      success: boolean;
      data: any[];
      timestamp: string;
    }>(url);
    return response.data.data;
  },

  /**
   * Get report card by ID for teacher
   * GET /api/reports/teacher/:reportId
   */
  async getReportCardById(reportId: string): Promise<ReportCard> {
    const response = await api.get<{
      success: boolean;
      data: ReportCard;
      timestamp: string;
    }>(`/reports/teacher/${reportId}`);
    return response.data.data;
  },

  // ========== ADMIN APIs ==========

  /**
   * Get all reports for admin (with optional filters)
   * GET /api/reports/admin/all
   * Query params: status, testType, teacherId
   */
  async getAllReports(filters?: {
    status?: string;
    testType?: string;
    teacherId?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.testType) params.append("testType", filters.testType);
    if (filters?.teacherId) params.append("teacherId", filters.teacherId);

    const queryString = params.toString();
    const url = `/reports/admin/all${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<{
      success: boolean;
      data: any[];
      timestamp: string;
    }>(url);
    return response.data.data;
  },

  /**
   * Get report card by submission ID for teacher
   * GET /api/reports/teacher/by-submission/:submissionId
   */
  async getReportCardBySubmissionId(
    submissionId: string
  ): Promise<ReportCard | null> {
    try {
      const response = await api.get<{
        success: boolean;
        data: ReportCard;
        timestamp: string;
      }>(`/reports/teacher/by-submission/${submissionId}`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to get report card by submission ID:", error);
      return null;
    }
  },

  /**
   * Get report for review
   * Note: This endpoint needs to be added to backend or use submissionId-based endpoints
   * GET /api/reports/:reportId
   */
  async getReportForReview(
    reportId: string
  ): Promise<AchievementReportData | AdtmReportData> {
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
    data?: ApproveReportDto
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
    data: RejectReportDto
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
    return responseData.pdfUrl || "";
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
    }>("/reports/student/my-reports");
    return response.data.data;
  },

  /**
   * Get published report detail
   * GET /api/reports/student/:reportId
   */
  async getPublishedReport(
    reportId: string
  ): Promise<AchievementReportData | AdtmReportData> {
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
      throw new Error("PDF URL is required");
    }
    window.open(pdfUrl, "_blank");
  },
};
