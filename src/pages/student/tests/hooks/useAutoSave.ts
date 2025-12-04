import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave(submissionId: string | null) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const saveMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: string }) =>
      api.put(`/student/submissions/${submissionId}/answers/${questionId}`, {
        questionId,
        answer,
      }),
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      // Reset to idle after 2 seconds
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    },
    onError: () => {
      setSaveStatus('error');
    },
  });

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  const saveAnswer = useCallback(
    (questionId: string, answer: string) => {
      if (!submissionId) return;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce: save after 1 second of no changes
      saveTimeoutRef.current = setTimeout(() => {
        saveMutation.mutate({ questionId, answer });
      }, 1000);
    },
    [submissionId, saveMutation]
  );

  return { saveStatus, saveAnswer };
}

