import { create } from "zustand";
import type { ITest, ITestQuestion } from "@/types/test.types";

export interface TestAnswer {
  questionId: string;
  answer: string;
}

export interface TestState {
  // Test data
  test: ITest | null;
  questions: ITestQuestion[];
  submissionId: string | null;
  assignmentId: string | null;

  // Answers
  answers: Record<string, string>; // questionId -> answer

  // UI state
  currentQuestionIndex: number;
  isSubmitting: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  showReview: boolean;

  // Actions
  setTest: (test: ITest, questions: ITestQuestion[]) => void;
  setSubmission: (submissionId: string, assignmentId: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  setCurrentQuestion: (index: number) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setLastSaved: (date: Date) => void;
  setShowReview: (show: boolean) => void;
  reset: () => void;
  getAnsweredCount: () => number;
  getUnansweredQuestions: () => ITestQuestion[];
}

const initialState = {
  test: null,
  questions: [],
  submissionId: null,
  assignmentId: null,
  answers: {},
  currentQuestionIndex: 0,
  isSubmitting: false,
  isSaving: false,
  lastSaved: null,
  showReview: false,
};

export const useTestStore = create<TestState>((set, get) => ({
  ...initialState,

  setTest: (test, questions) => {
    set({ test, questions });
  },

  setSubmission: (submissionId, assignmentId) => {
    set({ submissionId, assignmentId });
  },

  setAnswer: (questionId, answer) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer,
      },
    }));
  },

  setCurrentQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  setSubmitting: (isSubmitting) => {
    set({ isSubmitting });
  },

  setSaving: (isSaving) => {
    set({ isSaving });
  },

  setLastSaved: (date) => {
    set({ lastSaved: date });
  },

  setShowReview: (show) => {
    set({ showReview: show });
  },

  reset: () => {
    set(initialState);
  },

  getAnsweredCount: () => {
    const { answers } = get();
    return Object.values(answers).filter(
      (answer) => answer && answer.trim() !== ""
    ).length;
  },

  getUnansweredQuestions: () => {
    const { questions, answers } = get();
    return questions.filter(
      (q) => !answers[q.id] || answers[q.id].trim() === ""
    );
  },
}));
