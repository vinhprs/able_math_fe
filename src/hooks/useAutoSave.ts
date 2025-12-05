import { useEffect, useRef } from "react";
import { useUpdateSection1, useUpdateSection } from "./useAdtmGradingWorkflow";

interface UseAutoSaveOptions {
  submissionId: string | null;
  sectionNumber: 1 | 2 | 3 | 4 | 5;
  data: {
    answers: Record<string, number | null | undefined>;
    section1Data?: {
      concentrationLevel: number | null;
      currentMood: number | null;
      expectedScore: number | null;
    };
  };
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Auto-save hook with debouncing
 * Saves section data after user stops typing
 */
export function useAutoSave({
  submissionId,
  sectionNumber,
  data,
  debounceMs = 500,
  enabled = true,
}: UseAutoSaveOptions) {
  const updateSection1 = useUpdateSection1();
  const updateSection = useUpdateSection();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    if (!enabled || !submissionId) return;

    // Create a serialized version of the data to compare
    const dataString = JSON.stringify(data);

    // Skip if data hasn't changed
    if (dataString === lastSavedRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        if (sectionNumber === 1) {
          const { section1Data, answers } = data;
          if (
            section1Data &&
            section1Data.concentrationLevel !== null &&
            section1Data.currentMood !== null &&
            section1Data.expectedScore !== null
          ) {
            await updateSection1.mutateAsync({
              submissionId,
              data: {
                concentrationLevel: section1Data.concentrationLevel,
                currentMood: section1Data.currentMood,
                expectedScore: section1Data.expectedScore,
                answers: Object.entries(answers)
                  .filter(([_, score]) => score !== null && score !== undefined)
                  .map(([questionId, score]) => ({
                    questionId,
                    score: score!,
                  })),
              },
            });
            lastSavedRef.current = dataString;
          }
        } else {
          await updateSection.mutateAsync({
            submissionId,
            sectionNumber: sectionNumber as 2 | 3 | 4 | 5,
            data: {
              answers: Object.entries(data.answers)
                .filter(([_, score]) => score !== null && score !== undefined)
                .map(([questionId, score]) => ({
                  questionId,
                  score: score!,
                })),
            },
          });
          lastSavedRef.current = dataString;
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    submissionId,
    sectionNumber,
    data,
    debounceMs,
    enabled,
    updateSection1,
    updateSection,
  ]);

  return {
    isSaving: updateSection1.isPending || updateSection.isPending,
  };
}
