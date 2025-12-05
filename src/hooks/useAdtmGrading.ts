import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ITest, ITestQuestion } from '@/types/test.types';
import { SubmissionStatus } from '@shared/types/enum';

/**
 * A-DTM submission with full details
 */
export interface AdtmSubmission {
  id: string;
  assignmentId: string;
  testId: string;
  studentId: string;
  student?: {
    id: string;
    fullName: string;
    username: string;
  };
  status: SubmissionStatus;
  submittedAt: string | null;
  totalScore: number | null;
  standardScore: number | null;
  gradedAt: string | null;
  test: ITest;
  adtmData?: {
    id: string;
    testLevel: number;
    concentrationLevel: number | null;
    currentMood: string | null;
    expectedScore: number | null;
    section1CorrectCount: number;
    section1MistakeCount: number;
    section1UnsolvedCount: number;
    section1RawScore: number;
    section1StandardScore: number;
    section2RawScore: number;
    section2StandardScore: number;
    section2UnitScores: Record<string, { rawScore: number; maxScore: number }> | null;
    section3RawScore: number;
    section3StandardScore: number;
    section3UnitScores: Record<string, { rawScore: number; maxScore: number }> | null;
    section4RawScore: number;
    section4StandardScore: number;
    section4UnitScores: Record<string, { rawScore: number; maxScore: number }> | null;
    section5RawScore: number;
    section5StandardScore: number;
    section5UnitScores: Record<string, { rawScore: number; maxScore: number }> | null;
    overallStandardScore: number | null;
  };
  answers: Array<{
    id: string;
    questionId: string;
    question: ITestQuestion;
    studentAnswer: string | null;
    scoreEarned: number | null;
    isCorrect: boolean | null;
  }>;
}

/**
 * Fetch A-DTM submission by ID for grading
 */
export function useAdtmSubmission(submissionId: string | null) {
  return useQuery({
    queryKey: ['adtm-submission', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const response = await api.get<{
        success: boolean;
        data: AdtmSubmission;
        timestamp: string;
      }>(`/teacher/adtm/submissions/${submissionId}`);
      return response.data.data;
    },
    enabled: !!submissionId,
  });
}

/**
 * Grade A-DTM submission
 */
export function useGradeAdtmSubmission() {
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
      }>(`/teacher/adtm/submissions/${submissionId}/submit`);
      return response.data.data;
    },
    onSuccess: (_, submissionId) => {
      queryClient.invalidateQueries({ queryKey: ['adtm-submission', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}

