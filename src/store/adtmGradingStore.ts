import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Section1State {
  concentrationLevel: number | null;
  currentMood: number | null;
  expectedScore: number | null;
  answers: Record<string, number>; // questionId -> score
}

export interface SectionState {
  answers: Record<string, number>; // questionId -> score
}

export interface AdtmGradingState {
  submissionId: string | null;
  currentStep: number; // 1-6 (1-5 for sections, 6 for review)
  section1: Section1State;
  section2: SectionState;
  section3: SectionState;
  section4: SectionState;
  section5: SectionState;
  isDirty: boolean;
  lastSaved: Date | null;

  // Actions
  setSubmissionId: (id: string | null) => void;
  setCurrentStep: (step: number) => void;
  setSection1PreTest: (data: {
    concentrationLevel?: number;
    currentMood?: number;
    expectedScore?: number;
  }) => void;
  setSection1Answer: (questionId: string, score: number) => void;
  setSectionAnswer: (
    sectionNumber: number,
    questionId: string,
    score: number
  ) => void;
  loadFromSubmission: (submission: any) => void;
  reset: () => void;
  markDirty: () => void;
  markSaved: () => void;
}

const initialState = {
  submissionId: null,
  currentStep: 1,
  section1: {
    concentrationLevel: null,
    currentMood: null,
    expectedScore: null,
    answers: {},
  },
  section2: {
    answers: {},
  },
  section3: {
    answers: {},
  },
  section4: {
    answers: {},
  },
  section5: {
    answers: {},
  },
  isDirty: false,
  lastSaved: null,
};

export const useAdtmGradingStore = create<AdtmGradingState>()(
  persist(
    (set, _get) => ({
      ...initialState,

      setSubmissionId: (id) => {
        set({ submissionId: id });
      },

      setCurrentStep: (step) => {
        if (step >= 1 && step <= 6) {
          set({ currentStep: step });
        }
      },

      setSection1PreTest: (data) => {
        set((state) => ({
          section1: {
            ...state.section1,
            ...data,
          },
          isDirty: true,
        }));
      },

      setSection1Answer: (questionId, score) => {
        set((state) => ({
          section1: {
            ...state.section1,
            answers: {
              ...state.section1.answers,
              [questionId]: score,
            },
          },
          isDirty: true,
        }));
      },

      setSectionAnswer: (sectionNumber, questionId, score) => {
        const sectionKey = `section${sectionNumber}` as keyof Pick<
          AdtmGradingState,
          "section2" | "section3" | "section4" | "section5"
        >;
        set((state) => ({
          [sectionKey]: {
            ...state[sectionKey],
            answers: {
              ...state[sectionKey].answers,
              [questionId]: score,
            },
          },
          isDirty: true,
        }));
      },

      loadFromSubmission: (submission) => {
        if (!submission) return;

        const section1: Section1State = {
          concentrationLevel: submission.adtmData?.concentrationLevel ?? null,
          currentMood: submission.adtmData?.currentMood
            ? parseInt(submission.adtmData.currentMood as string, 10)
            : null,
          expectedScore: submission.adtmData?.expectedScore ?? null,
          answers: {},
        };

        const sections: Record<string, SectionState> = {
          section2: { answers: {} },
          section3: { answers: {} },
          section4: { answers: {} },
          section5: { answers: {} },
        };

        // Load answers from submission
        if (submission.answers) {
          submission.answers.forEach((answer: any) => {
            const sectionNum = answer.question?.sectionNumber;
            const score = answer.scoreEarned ?? 0;

            if (sectionNum === 1) {
              section1.answers[answer.questionId] = score;
            } else if (sectionNum >= 2 && sectionNum <= 5) {
              const sectionKey =
                `section${sectionNum}` as keyof typeof sections;
              sections[sectionKey].answers[answer.questionId] = score;
            }
          });
        }

        set({
          submissionId: submission.id,
          section1,
          section2: sections.section2,
          section3: sections.section3,
          section4: sections.section4,
          section5: sections.section5,
          isDirty: false,
        });
      },

      reset: () => {
        set(initialState);
      },

      markDirty: () => {
        set({ isDirty: true });
      },

      markSaved: () => {
        set({ isDirty: false, lastSaved: new Date() });
      },
    }),
    {
      name: "adtm-grading-storage",
      partialize: (state) => ({
        submissionId: state.submissionId,
        currentStep: state.currentStep,
        section1: state.section1,
        section2: state.section2,
        section3: state.section3,
        section4: state.section4,
        section5: state.section5,
      }),
    }
  )
);
