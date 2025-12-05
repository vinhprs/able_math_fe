import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAdtmGradingStore } from '@/store/adtmGradingStore';
import { debounce } from '@/lib/debounce';

interface SaveProgressRequest {
  answers: Record<string, number>;
  section1Data?: {
    concentrationLevel: number;
    currentMood: number;
    expectedScore: number;
  };
  currentSection: number;
}

/**
 * Auto-save hook for A-DTM grading
 * Debounces saves to 500ms after last change
 */
export function useAdtmAutoSave(submissionId: string | null) {
  const { section1, section2, section3, section4, section5, currentStep, markSaved } =
    useAdtmGradingStore();

  const saveMutation = useMutation({
    mutationFn: async (data: SaveProgressRequest) => {
      if (!submissionId) return;
      const response = await api.put<{
        success: boolean;
        data: { savedAt: Date };
        timestamp: string;
      }>(`/teacher/adtm/submissions/${submissionId}/save-progress`, data);
      return response.data.data;
    },
    onSuccess: () => {
      markSaved();
    },
  });

  // Collect all answers
  const getAllAnswers = useCallback((): Record<string, number> => {
    return {
      ...section1.answers,
      ...section2.answers,
      ...section3.answers,
      ...section4.answers,
      ...section5.answers,
    };
  }, [section1.answers, section2.answers, section3.answers, section4.answers, section5.answers]);

  // Debounced save function
  const debouncedSave = useRef(
    debounce((data: SaveProgressRequest) => {
      if (submissionId) {
        saveMutation.mutate(data);
      }
    }, 500),
  ).current;

  // Auto-save on changes
  useEffect(() => {
    if (!submissionId) return;

    const answers = getAllAnswers();
    const hasAnswers = Object.keys(answers).length > 0;
    const hasSection1Data =
      section1.concentrationLevel !== null &&
      section1.currentMood !== null &&
      section1.expectedScore !== null;

    if (hasAnswers || hasSection1Data) {
      debouncedSave({
        answers,
        section1Data: hasSection1Data
          ? {
              concentrationLevel: section1.concentrationLevel!,
              currentMood: section1.currentMood!,
              expectedScore: section1.expectedScore!,
            }
          : undefined,
        currentSection: currentStep,
      });
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [
    submissionId,
    getAllAnswers,
    section1.concentrationLevel,
    section1.currentMood,
    section1.expectedScore,
    currentStep,
    debouncedSave,
  ]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const answers = getAllAnswers();
      if (Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
        // Cancel debounce and save immediately
        debouncedSave.cancel();
        const data: SaveProgressRequest = {
          answers,
          section1Data:
            section1.concentrationLevel !== null &&
            section1.currentMood !== null &&
            section1.expectedScore !== null
              ? {
                  concentrationLevel: section1.concentrationLevel,
                  currentMood: section1.currentMood,
                  expectedScore: section1.expectedScore,
                }
              : undefined,
          currentSection: currentStep,
        };
        if (submissionId) {
          saveMutation.mutate(data);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      debouncedSave.cancel();
    };
  }, [getAllAnswers, debouncedSave, submissionId, section1, currentStep, saveMutation]);

  return {
    isSaving: saveMutation.isPending,
    savedAt: saveMutation.data?.savedAt,
    error: saveMutation.error,
  };
}

