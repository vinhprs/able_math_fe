import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface ResultFilters {
  testType?: string;
  page?: number;
  limit?: number;
}

interface ResultListItem {
  id: string;
  test: {
    id: string;
    title: string;
    testCode: string;
    testType: string;
  };
  totalScore: number;
  maxScore: number;
  standardScore: number;
  submittedAt: string;
  gradedAt: string;
}

interface ResultListResponse {
  data: ResultListItem[];
  total: number;
  page: number;
  totalPages: number;
}

interface ResultDetail {
  submission: {
    id: string;
    submittedAt: string;
    gradedAt: string;
  };
  test: {
    id: string;
    title: string;
    testCode: string;
    testType: string;
    totalScore: number;
  };
  scores: {
    totalRawScore: number;
    standardScore: number;
    maxScore: number;
    percentage: number;
  };
  questions: Array<{
    questionNumber: number;
    questionText: string;
    questionImage?: string;
    unitName: string;
    maxScore: number;
    difficulty: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    scoreEarned: number;
  }>;
  unitScores: Array<{
    unitName: string;
    totalScore: number;
    maxScore: number;
    questionCount: number;
    standardScore: number;
  }>;
  adtmData?: any;
}

interface ResultSummary {
  test: {
    title: string;
    testCode: string;
  };
  scores: {
    totalScore: number;
    maxScore: number;
    standardScore: number;
  };
  statistics: {
    totalQuestions: number;
    correctCount: number;
    incorrectCount: number;
    accuracy: number;
  };
  timestamps: {
    submittedAt: string;
    gradedAt: string;
  };
}

/**
 * Hook to fetch student results list
 */
export function useStudentResults(filters: ResultFilters = {}) {
  return useQuery<ResultListResponse>({
    queryKey: ['student-results', filters],
    queryFn: async () => {
      const response = await api.get('/student/results', { params: filters });
      // Backend wraps response in { success, data, timestamp }
      return response.data.data || response.data;
    },
  });
}

/**
 * Hook to fetch detailed result
 */
export function useResultDetail(submissionId: string) {
  return useQuery<ResultDetail>({
    queryKey: ['result-detail', submissionId],
    queryFn: async () => {
      const response = await api.get(`/student/results/${submissionId}`);
      // Backend wraps response in { success, data, timestamp }
      return response.data.data || response.data;
    },
    enabled: !!submissionId,
  });
}

/**
 * Hook to fetch result summary
 */
export function useResultSummary(submissionId: string) {
  return useQuery<ResultSummary>({
    queryKey: ['result-summary', submissionId],
    queryFn: async () => {
      const response = await api.get(`/student/results/${submissionId}/summary`);
      // Backend wraps response in { success, data, timestamp }
      return response.data.data || response.data;
    },
    enabled: !!submissionId,
  });
}

