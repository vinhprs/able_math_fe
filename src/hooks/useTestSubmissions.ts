import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ITest, ITestQuestion } from "@/types/test.types";
import { SubmissionStatus } from "@/shared/types/enum";

export interface StudentAssignment {
  id: string;
  testId: string;
  assignmentId: string;
  testCode: string;
  title: string;
  status: SubmissionStatus;
  assignedAt: string;
  deadline: string | null;
  submittedAt: string | null;
  score: number | null;
  test: ITest;
}

export interface Submission {
  id: string;
  assignmentId: string;
  testId: string;
  studentId: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  totalScore: number | null;
  standardScore: number | null;
  gradedAt: string | null;
  test: ITest;
  answers: Array<{
    id: string;
    questionId: string;
    studentAnswer: string | null;
    scoreEarned: number | null;
    isCorrect: boolean | null;
  }>;
}

export interface TestWithQuestions extends ITest {
  questions: ITestQuestion[];
}

/**
 * Fetch student's assigned tests
 */
export function useStudentAssignments(status?: SubmissionStatus) {
  return useQuery({
    queryKey: ["student", "assignments", status],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: StudentAssignment[];
        timestamp: string;
      }>("/student/assignments", {
        params: status ? { status } : undefined,
      });
      return response.data.data;
    },
  });
}

/**
 * Start a test (create draft submission)
 */
export function useStartTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { testId: string; assignmentId: string }) => {
      const response = await api.post<{
        success: boolean;
        data: Submission;
        timestamp: string;
      }>("/student/submissions", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "assignments"] });
    },
  });
}

/**
 * Get test with questions for taking
 */
export function useTestForTaking(testId: string | null) {
  return useQuery({
    queryKey: ["test", "taking", testId],
    queryFn: async () => {
      if (!testId) return null;
      const response = await api.get<{
        success: boolean;
        data: TestWithQuestions;
        timestamp: string;
      }>(`/tests/${testId}`);
      return response.data.data;
    },
    enabled: !!testId,
  });
}

/**
 * Get submission with answers
 */
export function useSubmission(submissionId: string | null) {
  return useQuery({
    queryKey: ["submission", submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const response = await api.get<{
        success: boolean;
        data: Submission;
        timestamp: string;
      }>(`/student/submissions/${submissionId}`);
      return response.data.data;
    },
    enabled: !!submissionId,
  });
}

/**
 * Save answer
 */
export function useSaveAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      submissionId: string;
      questionId: string;
      answer: string;
    }) => {
      const response = await api.put<{
        success: boolean;
        data: { id: string; studentAnswer: string };
        timestamp: string;
      }>(`/student/submissions/${data.submissionId}/answers`, {
        questionId: data.questionId,
        answer: data.answer,
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["submission", variables.submissionId],
      });
    },
  });
}

/**
 * Submit test
 */
export function useSubmitTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await api.post<{
        success: boolean;
        data: Submission;
        timestamp: string;
      }>(`/student/submissions/${submissionId}/submit`);
      return response.data.data;
    },
    onSuccess: (_, submissionId) => {
      queryClient.invalidateQueries({
        queryKey: ["submission", submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["student", "assignments"] });
    },
  });
}
