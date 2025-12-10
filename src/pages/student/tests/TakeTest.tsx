import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle,
  List,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { toastSuccess, toastError } from "@/lib/toast";
import api from "@/lib/api";
import { QuestionNavigator } from "./components/QuestionNavigator";
import { QuestionCard } from "./components/QuestionCard";
import { ProgressBar } from "./components/ProgressBar";
import { SubmitModal } from "./components/SubmitModal";
import { useAutoSave } from "./hooks/useAutoSave";
import { useTestTimer } from "./hooks/useTestTimer";
import type { TestType } from "@/shared/types/enum";

interface TestQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  questionImage: string | null;
  questionType?: "TEXT" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    E?: string;
  } | null;
  score: number;
  unitName: string | null;
  difficulty: string | null;
  studentAnswer: string;
  answerId?: string;
}

interface TestSubmissionData {
  submission: {
    id: string;
    status: string;
    createdAt: string;
  };
  test: {
    id: string;
    title: string;
    testCode: string;
    totalScore: number;
    testType: TestType;
  };
  assignment: {
    deadline: string | null;
  };
  questions: TestQuestion[];
  progress: {
    answered: number;
    total: number;
  };
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading test...</p>
      </div>
    </div>
  );
}

export function TakeTest() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasStartedRef = useRef(false);

  // Start test or get existing submission
  const startMutation = useMutation({
    mutationFn: () => api.post("/student/submissions/start", { assignmentId }),
    onSuccess: (response) => {
      // Handle both wrapped and unwrapped responses
      const data = response.data?.data || response.data;
      const submissionId = data?.submissionId;
      if (submissionId) {
        setSubmissionId(submissionId);
      } else {
        console.error("No submissionId in response:", response.data);
        toastError("Failed to get submission ID from server");
        hasStartedRef.current = false;
      }
    },
    onError: (error: any) => {
      // Reset ref on error so user can retry
      hasStartedRef.current = false;
      console.error("Failed to start test:", error);
      toastError(
        error.response?.data?.message || error.message || "Failed to start test"
      );
      navigate("/student/tests");
    },
  });

  // Fetch submission with questions
  const {
    data: testData,
    isLoading,
    isError,
    error: queryError,
  } = useQuery<TestSubmissionData>({
    queryKey: ["test-submission", submissionId],
    queryFn: async () => {
      if (!submissionId) {
        throw new Error("Submission ID is required");
      }
      try {
        const response = await api.get<
          { success: boolean; data: TestSubmissionData } | TestSubmissionData
        >(`/student/submissions/${submissionId}/take`);
        // Handle both wrapped and unwrapped responses
        const data =
          "data" in response.data && response.data.data
            ? response.data.data
            : (response.data as TestSubmissionData);
        console.log("Test data loaded:", {
          hasQuestions: !!data?.questions,
          questionCount: data?.questions?.length,
        });
        return data;
      } catch (error: any) {
        console.error("Error fetching test data:", error);
        toastError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load test"
        );
        throw error;
      }
    },
    enabled: !!submissionId,
    retry: 1,
  });

  // Initialize answers from existing data when testData loads
  useEffect(() => {
    if (testData?.questions && Array.isArray(testData.questions)) {
      const existingAnswers: Record<string, string> = {};
      testData.questions.forEach((q) => {
        if (q.studentAnswer) {
          existingAnswers[q.id] = q.studentAnswer;
        }
      });
      setAnswers(existingAnswers);
    }
  }, [testData]);

  // Submit test mutation
  const submitMutation = useMutation({
    mutationFn: () => api.post(`/student/submissions/${submissionId}/submit`),
    onSuccess: () => {
      toastSuccess("Test submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      navigate("/student/tests");
    },
    onError: (error: any) => {
      toastError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit test"
      );
    },
  });

  // Auto-save hook
  const { saveStatus, saveAnswer } = useAutoSave(submissionId);

  // Timer hook (if deadline exists)
  const { timeRemaining, isOvertime } = useTestTimer(
    testData?.assignment?.deadline ?? undefined
  );

  // Start test on mount (only once)
  useEffect(() => {
    if (
      assignmentId &&
      !submissionId &&
      !startMutation.isPending &&
      !hasStartedRef.current
    ) {
      hasStartedRef.current = true;
      startMutation.mutate();
    }
  }, [assignmentId, submissionId, startMutation]);

  // Warn before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Show error state if query failed
  if (isError && queryError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {queryError instanceof Error
              ? queryError.message
              : "Failed to load test"}
          </p>
          <Button onClick={() => navigate("/student/tests")}>
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  // Show loading only if we're waiting for submissionId or testData
  if (
    (startMutation.isPending && !submissionId) ||
    (submissionId && isLoading) ||
    (submissionId && !testData && !isError)
  ) {
    return <LoadingScreen />;
  }

  // If we have submissionId but no testData after loading, show error
  if (submissionId && !testData && !isLoading && !isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No test data available</p>
          <Button onClick={() => navigate("/student/tests")}>
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  // Safety check: ensure testData exists before accessing properties
  if (!testData) {
    return <LoadingScreen />;
  }

  const questions = testData.questions;
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No questions found</p>
          <Button onClick={() => navigate("/student/tests")}>
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  const handleAnswerChange = async (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setHasUnsavedChanges(true);

    // Auto-save
    await saveAnswer(questionId, answer);
    setHasUnsavedChanges(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowNavigator(false);
  };

  const handleSubmit = () => {
    // Check unanswered questions
    const unanswered = questions.filter(
      (q: TestQuestion) => !answers[q.id] || answers[q.id].trim() === ""
    );

    if (unanswered.length > 0) {
      setShowSubmitModal(true);
    } else {
      submitMutation.mutate();
    }
  };

  const confirmSubmit = () => {
    setShowSubmitModal(false);
    submitMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Test Info */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to leave? Your progress is saved."
                    )
                  ) {
                    navigate("/student/tests");
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div>
                <h1 className="font-bold text-lg">
                  {testData.test?.title || "Test"}
                </h1>
                <p className="text-sm text-gray-500">
                  {testData.test?.testCode || ""}
                </p>
              </div>
            </div>

            {/* Center: Progress */}
            <div className="flex-1 max-w-md mx-8">
              <ProgressBar
                answered={
                  Object.keys(answers).filter(
                    (id) => answers[id] && answers[id].trim() !== ""
                  ).length
                }
                total={questions.length}
              />
            </div>

            {/* Right: Timer & Navigator */}
            <div className="flex items-center gap-3">
              {/* Timer */}
              {testData.assignment?.deadline && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isOvertime
                      ? "bg-red-100 text-red-700"
                      : timeRemaining && timeRemaining.hours < 1
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">
                    {timeRemaining
                      ? `${timeRemaining.hours}:${timeRemaining.minutes
                          .toString()
                          .padStart(2, "0")}:${timeRemaining.seconds
                          .toString()
                          .padStart(2, "0")}`
                      : "Overtime"}
                  </span>
                </div>
              )}

              {/* Save Status */}
              <div className="flex items-center gap-2 text-sm">
                {saveStatus === "saving" && (
                  <>
                    <Save className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span className="text-blue-600">Saving...</span>
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Saved</span>
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Error</span>
                  </>
                )}
              </div>

              {/* Question Navigator Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNavigator(!showNavigator)}
              >
                <List className="w-4 h-4 mr-2" />
                Questions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator Sidebar (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <QuestionNavigator
                questions={questions}
                currentIndex={currentQuestionIndex}
                answers={answers}
                onJumpTo={handleJumpToQuestion}
              />
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Question Card */}
            <QuestionCard
              question={{
                ...currentQuestion,
                questionImage: currentQuestion.questionImage ?? undefined,
                questionType: currentQuestion.questionType ?? "TEXT",
                options: currentQuestion.options ?? null,
                unitName: currentQuestion.unitName ?? undefined,
                difficulty: currentQuestion.difficulty ?? undefined,
              }}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              answer={answers[currentQuestion.id] || ""}
              onAnswerChange={(answer) =>
                handleAnswerChange(currentQuestion.id, answer)
              }
            />

            {/* Navigation Buttons */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <span className="text-sm text-gray-500">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending}
                      isLoading={submitMutation.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Test
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button (Always Visible) */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">
                    {
                      Object.keys(answers).filter(
                        (id) => answers[id] && answers[id].trim() !== ""
                      ).length
                    }{" "}
                    of {questions.length} questions answered
                  </p>
                  <p className="text-sm text-blue-700">
                    You can submit when you're ready
                  </p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  isLoading={submitMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Test
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Question Navigator Modal */}
      {showNavigator && (
        <Modal
          isOpen
          onClose={() => setShowNavigator(false)}
          size="lg"
          title="Questions"
        >
          <QuestionNavigator
            questions={questions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            onJumpTo={handleJumpToQuestion}
          />
        </Modal>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <SubmitModal
          isOpen
          onClose={() => setShowSubmitModal(false)}
          onConfirm={confirmSubmit}
          questions={questions}
          answers={answers}
          isSubmitting={submitMutation.isPending}
        />
      )}
    </div>
  );
}
