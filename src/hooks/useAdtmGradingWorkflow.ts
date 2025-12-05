import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AdtmSubmission } from "./useAdtmGrading";

/**
 * Register student for A-DTM test
 */
export function useRegisterStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: string; testCode: string }) => {
      const response = await api.post<{
        success: boolean;
        data: AdtmSubmission;
        timestamp: string;
      }>("/teacher/adtm/register-student", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adtm-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

/**
 * Get A-DTM submission with all sections
 */
export function useAdtmSubmission(submissionId: string | null) {
  return useQuery({
    queryKey: ["adtm-submission", submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const response = await api.get<{
        success: boolean;
        data: AdtmSubmission & {
          answersBySection: Record<number, AdtmSubmission["answers"]>;
        };
        timestamp: string;
      }>(`/teacher/adtm/submissions/${submissionId}`);
      return response.data.data;
    },
    enabled: !!submissionId,
  });
}

/**
 * Update Section 1 grades
 */
export function useUpdateSection1() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: {
        concentrationLevel: number;
        currentMood: number;
        expectedScore: number;
        answers: Array<{ questionId: string; score: number }>;
      };
    }) => {
      const response = await api.put<{
        success: boolean;
        data: {
          section1: {
            rawScore: number;
            standardScore: number;
            maxScore: number;
            correctCount: number;
            mistakeCount: number;
            unsolvedCount: number;
          };
          message: string;
        };
        timestamp: string;
      }>(`/teacher/adtm/submissions/${submissionId}/section1`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["adtm-submission", variables.submissionId],
      });
    },
  });
}

/**
 * Update Section 2-5 grades
 */
export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      sectionNumber,
      data,
    }: {
      submissionId: string;
      sectionNumber: 2 | 3 | 4 | 5;
      data: {
        answers: Array<{ questionId: string; score: number }>;
      };
    }) => {
      type SectionResponse = {
        sectionNumber: number;
        rawScore: number;
        standardScore: number;
        maxScore: number;
        unitScores: Array<{
          unitName: string;
          rawScore: number;
          maxScore: number;
          standardScore: number;
          questionCount: number;
        }>;
      };

      const response = await api.put<{
        success: boolean;
        data: {
          [key: string]: SectionResponse | string;
          message: string;
        };
        timestamp: string;
      }>(
        `/teacher/adtm/submissions/${submissionId}/section${sectionNumber}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["adtm-submission", variables.submissionId],
      });
    },
  });
}

/**
 * Calculate all scores
 */
export function useCalculateScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await api.post<{
        success: boolean;
        data: {
          section1: {
            rawScore: number;
            standardScore: number;
            maxScore: number;
            correctCount: number;
            mistakeCount: number;
            unsolvedCount: number;
          };
          section2: {
            sectionNumber: number;
            rawScore: number;
            standardScore: number;
            maxScore: number;
            unitScores: Array<{
              unitName: string;
              rawScore: number;
              maxScore: number;
              standardScore: number;
              questionCount: number;
            }>;
          };
          section3: {
            sectionNumber: number;
            rawScore: number;
            standardScore: number;
            maxScore: number;
            unitScores: Array<{
              unitName: string;
              rawScore: number;
              maxScore: number;
              standardScore: number;
              questionCount: number;
            }>;
          };
          section4: {
            sectionNumber: number;
            rawScore: number;
            standardScore: number;
            maxScore: number;
            unitScores: Array<{
              unitName: string;
              rawScore: number;
              maxScore: number;
              standardScore: number;
              questionCount: number;
            }>;
          };
          section5: {
            sectionNumber: number;
            rawScore: number;
            standardScore: number;
            maxScore: number;
            unitScores: Array<{
              unitName: string;
              rawScore: number;
              maxScore: number;
              standardScore: number;
              questionCount: number;
            }>;
          };
          overallStandardScore: number;
          totalRawScore: number;
          totalMaxScore: number;
        };
        timestamp: string;
      }>(`/teacher/adtm/submissions/${submissionId}/calculate`);
      return response.data.data;
    },
    onSuccess: (_, submissionId) => {
      queryClient.invalidateQueries({
        queryKey: ["adtm-submission", submissionId],
      });
    },
  });
}

/**
 * Submit final grading
 */
export function useSubmitGrading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await api.post<{
        success: boolean;
        data: {
          section1: {
            rawScore: number;
            standardScore: number;
            maxScore: number;
            correctCount: number;
            mistakeCount: number;
            unsolvedCount: number;
          };
          section2: {
            sectionNumber: number;
            rawScore: number;
            standardScore: number;
            maxScore: number;
            unitScores: Array<{
              unitName: string;
              rawScore: number;
              maxScore: number;
              standardScore: number;
              questionCount: number;
            }>;
          };
          section3: {
            sectionNumber: number;
            rawScore: number;
            standardScore: number;
            maxScore: number;
            unitScores: Array<{
              unitName: string;
              rawScore: number;
              maxScore: number;
              standardScore: number;
              questionCount: number;
            }>;
          };
          section4: {
            sectionNumber: number;
            rawScore: number;
            standardScore: number;
            maxScore: number;
            unitScores: Array<{
              unitName: string;
              rawScore: number;
              maxScore: number;
              standardScore: number;
              questionCount: number;
            }>;
          };
          section5: {
            sectionNumber: number;
            rawScore: number;
            standardScore: number;
            maxScore: number;
            unitScores: Array<{
              unitName: string;
              rawScore: number;
              maxScore: number;
              standardScore: number;
              questionCount: number;
            }>;
          };
          overallStandardScore: number;
          totalRawScore: number;
          totalMaxScore: number;
          message: string;
        };
        timestamp: string;
      }>(`/teacher/adtm/submissions/${submissionId}/submit`);
      return response.data.data;
    },
    onSuccess: (_, submissionId) => {
      queryClient.invalidateQueries({
        queryKey: ["adtm-submission", submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["adtm-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}
