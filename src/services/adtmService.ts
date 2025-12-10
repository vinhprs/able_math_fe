import api from "@/lib/api";

export const adtmService = {
  /**
   * Save grading progress
   */
  async saveProgress(submissionId: string, sectionNumber: number, data: any) {
    const response = await api.post(
      `/teacher/adtm/submissions/${submissionId}/save-section-progress`,
      {
        sectionNumber,
        data,
      }
    );
    return response.data;
  },

  /**
   * Get grading progress
   */
  async getGradingProgress(submissionId: string) {
    const response = await api.get(
      `/teacher/adtm/submissions/${submissionId}/progress`
    );
    return response.data;
  },

  /**
   * Get submission details
   */
  async getSubmission(submissionId: string) {
    const response = await api.get(`/teacher/adtm/submissions/${submissionId}`);
    return response.data.data;
  },

  /**
   * Get template details
   */
  async getTemplate(testId: string) {
    const response = await api.get(`/tests/${testId}`);
    return response.data.data;
  },

  /**
   * Finalize grading and generate report
   */
  async finalizeGrading(submissionId: string) {
    const response = await api.post(
      `/teacher/adtm/submissions/${submissionId}/finalize`
    );
    return response.data;
  },
};
