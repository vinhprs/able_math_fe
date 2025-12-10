import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAdtmTemplate } from "./templates/adtm-templates";
import { Section1Screen } from "./Section1Screen";
import { SectionsScreen } from "./SectionsScreen";
import { adtmService } from "@/services/adtmService";
import { useAutoSave } from "@/hooks/useAutoSave";
import { AutoSaveStatusIndicator } from "@/components/adtm/AutoSaveStatus";
import { ProgressIndicator } from "@/components/adtm/ProgressIndicator";
import { SessionWarning } from "@/components/auth/SessionWarning";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Loader2 } from "lucide-react";

interface SectionData {
  concentration?: number;
  mood?: number;
  expectedScore?: number;
  questionScores: Record<number, number>;
}

export function AdtmGradingLayoutEnhanced() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const [currentSection, setCurrentSection] = useState(1);
  const [sectionData, setSectionData] = useState<SectionData>({
    questionScores: {},
  });

  // Fetch submission data
  const {
    data: submission,
    isLoading: loadingSubmission,
    error: submissionError,
    refetch: refetchSubmission,
  } = useQuery({
    queryKey: ["adtm-submission", submissionId],
    queryFn: () => adtmService.getSubmission(submissionId!),
    enabled: !!submissionId,
  });

  // Get template
  const template = submission
    ? getAdtmTemplate(submission.test.testCode)
    : null;

  // Fetch current progress
  const {
    data: progress,
    refetch: refetchProgress,
    isLoading: loadingProgress,
  } = useQuery({
    queryKey: ["adtm-progress", submissionId],
    queryFn: () => adtmService.getGradingProgress(submissionId!),
    enabled: !!submissionId,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Auto-save hook
  const autoSave = useAutoSave({
    onSave: async (data: SectionData) => {
      return adtmService.saveProgress(submissionId!, currentSection, {
        concentration: data.concentration,
        mood: data.mood,
        expectedScore: data.expectedScore,
        questionScores: data.questionScores,
      });
    },
    debounceMs: 2000,
    enabled:
      !!submissionId && Object.keys(sectionData.questionScores).length > 0,
  });

  // Load initial data for current section
  useEffect(() => {
    if (submission?.answersBySection?.[currentSection]) {
      const answers = submission.answersBySection[currentSection];
      const questionScores: Record<number, number> = {};

      answers.forEach((answer: any) => {
        if (answer.question && answer.scoreEarned != null) {
          questionScores[answer.question.questionNumber] = answer.scoreEarned;
        }
      });

      setSectionData({
        concentration:
          currentSection === 1
            ? submission.adtmData?.concentrationLevel || undefined
            : undefined,
        mood:
          currentSection === 1
            ? submission.adtmData?.currentMood
              ? parseInt(submission.adtmData.currentMood, 10)
              : undefined
            : undefined,
        expectedScore:
          currentSection === 1
            ? submission.adtmData?.expectedScore || undefined
            : undefined,
        questionScores,
      });
    }
  }, [currentSection, submission]);

  // Trigger auto-save when data changes
  useEffect(() => {
    if (
      Object.keys(sectionData.questionScores).length > 0 ||
      (currentSection === 1 &&
        (sectionData.concentration ||
          sectionData.mood ||
          sectionData.expectedScore))
    ) {
      autoSave.save(sectionData);
    }
  }, [sectionData, autoSave.save, currentSection]);

  // Handle section change with save
  const handleSectionChange = useCallback(
    async (newSection: number) => {
      // Save current section first
      if (Object.keys(sectionData.questionScores).length > 0) {
        await autoSave.saveNow(sectionData);
      }

      // Refetch progress
      await refetchProgress();

      // Navigate to new section
      setCurrentSection(newSection);
    },
    [sectionData, autoSave.saveNow, refetchProgress]
  );

  // Finalize grading
  const finalizeMutation = useMutation({
    mutationFn: () => adtmService.finalizeGrading(submissionId!),
    onSuccess: () => {
      navigate(`/teacher/adtm/report/${submissionId}`);
    },
  });

  // Handle navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSave.status === "saving") {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [autoSave.status]);

  if (loadingSubmission || loadingProgress) {
    return <LoadingOverlay message="Loading test data..." />;
  }

  if (submissionError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorDisplay
          title="Failed to Load Submission"
          message="Could not load the test data. Please try again."
          onRetry={() => refetchSubmission()}
        />
      </div>
    );
  }

  if (!template || !submission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 font-semibold">
            {!template ? "Template not found" : "Submission not found"}
          </p>
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentSectionData = template.sections[currentSection - 1];

  // Get initial data for current section
  const getInitialData = () => {
    if (currentSection === 1 && submission.adtmData) {
      return {
        concentration:
          sectionData.concentration ||
          submission.adtmData.concentrationLevel ||
          undefined,
        mood:
          sectionData.mood ||
          (submission.adtmData.currentMood
            ? parseInt(submission.adtmData.currentMood, 10)
            : undefined),
        expectedScore:
          sectionData.expectedScore ||
          submission.adtmData.expectedScore ||
          undefined,
        questionScores: sectionData.questionScores,
      };
    }
    return {
      questionScores: sectionData.questionScores,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session Warning */}
      <SessionWarning />

      {/* Auto-Save Status */}
      <AutoSaveStatusIndicator
        status={autoSave.status}
        lastSaved={autoSave.lastSaved}
        error={autoSave.error}
      />

      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            A-DTM Grading: {template.testName}
          </h1>
          <div className="mt-2 text-sm text-gray-600">
            Student: {submission.student.name} | Grade: {template.grade}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProgressIndicator
            sectionsCompleted={
              progress?.sectionsCompleted || {
                section1: false,
                section2: false,
                section3: false,
                section4: false,
                section5: false,
              }
            }
            currentSection={currentSection}
            onSectionClick={handleSectionChange}
          />
        </div>
      </div>

      {/* Grading Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentSection === 1 ? (
          <Section1Screen
            section={currentSectionData}
            initialData={getInitialData()}
            onComplete={async (data) => {
              // Update local state
              setSectionData({
                concentration: data.specialInputs.concentration,
                mood: data.specialInputs.mood,
                expectedScore: data.specialInputs.expectedScore,
                questionScores: data.questionScores,
              });
              // Save immediately
              await autoSave.saveNow({
                concentration: data.specialInputs.concentration,
                mood: data.specialInputs.mood,
                expectedScore: data.specialInputs.expectedScore,
                questionScores: data.questionScores,
              });
              // Move to next section
              if (currentSection < 5) {
                await handleSectionChange(currentSection + 1);
              }
            }}
            isSubmitting={autoSave.isSaving}
          />
        ) : (
          <SectionsScreen
            section={currentSectionData}
            initialData={getInitialData()}
            onComplete={async (data) => {
              // Update local state
              setSectionData({
                questionScores: data.questionScores,
              });
              // Save immediately
              await autoSave.saveNow({
                questionScores: data.questionScores,
              });
              // Move to next section or finalize
              if (currentSection < 5) {
                await handleSectionChange(currentSection + 1);
              } else {
                await finalizeMutation.mutateAsync();
              }
            }}
            isSubmitting={autoSave.isSaving}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => handleSectionChange(currentSection - 1)}
            disabled={currentSection === 1}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Section
          </button>

          {currentSection < 5 ? (
            <button
              onClick={() => handleSectionChange(currentSection + 1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next Section
            </button>
          ) : (
            <button
              onClick={() => finalizeMutation.mutate()}
              disabled={!progress?.canFinalize || finalizeMutation.isPending}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {finalizeMutation.isPending ? (
                <>
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Finalizing...
                </>
              ) : (
                "Finalize & Generate Report"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
