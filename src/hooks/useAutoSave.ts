import { useEffect, useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { debounce } from "@/lib/debounce";

interface UseAutoSaveOptions<T> {
  onSave: (data: T) => Promise<any>;
  debounceMs?: number;
  enabled?: boolean;
}

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave<T>({
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: onSave,
    onMutate: () => {
      setStatus("saving");
      setError(null);
    },
    onSuccess: () => {
      setStatus("saved");
      setLastSaved(new Date());
      // Reset to idle after 2 seconds
      setTimeout(() => setStatus("idle"), 2000);
    },
    onError: (err: any) => {
      setStatus("error");
      setError(err?.message || "Failed to save");
      console.error("Auto-save error:", err);
    },
  });

  // Debounced save function
  const debouncedSave = useRef(
    debounce((data: T) => {
      if (enabled) {
        saveMutation.mutate(data);
      }
    }, debounceMs)
  ).current;

  // Manual save function (immediate, no debounce)
  const saveNow = useCallback(
    (data: T) => {
      if (enabled) {
        saveMutation.mutate(data);
      }
    },
    [enabled, saveMutation]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    status,
    lastSaved,
    error,
    save: debouncedSave,
    saveNow,
    isSaving: status === "saving",
  };
}
