import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import {
  useSaveAnswer,
  useStartTest,
  useSubmission,
  useSubmitTest,
  useTestForTaking,
} from "@/hooks/useTestSubmissions";
import { useTestStore } from "@/store/testStore";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export function TakeTest() {
  const params = useParams<{ testId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assignmentId = searchParams.get("assignmentId");
  const submissionIdParam = searchParams.get("submissionId");

  const {
    test,
    questions,
    submissionId,
    answers,
    currentQuestionIndex,
    isSubmitting,
    isSaving,
    lastSaved,
    setTest,
    setSubmission,
    setAnswer,
    setCurrentQuestion,
    setSubmitting,
    setSaving,
    setLastSaved,
    getAnsweredCount,
    reset,
  } = useTestStore();

  const [deadline, setDeadline] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [showWarning, setShowWarning] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);

  const { data: testData, isLoading: testLoading } = useTestForTaking(
    params.testId || null
  );
  const { data: submissionData, isLoading: submissionLoading } = useSubmission(
    submissionIdParam || submissionId || null
  );
  const startTestMutation = useStartTest();
  const saveAnswerMutation = useSaveAnswer();
  const submitTestMutation = useSubmitTest();

  // Initialize test data
  useEffect(() => {
    if (testData && testData.questions) {
      setTest(testData, testData.questions);
    }
  }, [testData, setTest]);

  // Initialize submission
  useEffect(() => {
    if (submissionData) {
      setSubmission(submissionData.id, submissionData.assignmentId);
      // Load existing answers
      if (submissionData.answers) {
        submissionData.answers.forEach((answer) => {
          if (answer.studentAnswer) {
            setAnswer(answer.questionId, answer.studentAnswer);
          }
        });
      }
    } else if (assignmentId && params.testId && !submissionIdParam) {
      // Start new test
      startTestMutation.mutate(
        { testId: params.testId, assignmentId },
        {
          onSuccess: (data) => {
            setSubmission(data.id, data.assignmentId);
          },
        }
      );
    }
  }, [
    submissionData,
    assignmentId,
    params.testId,
    submissionIdParam,
    setSubmission,
    setAnswer,
    startTestMutation,
  ]);

  // Set deadline from assignment
  useEffect(() => {
    if (submissionData?.test) {
      // You would get deadline from assignment API
      // For now, we'll calculate from test duration if available
    }
  }, [submissionData]);

  // Timer effect
  useEffect(() => {
    if (!deadline) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Time expired");
        setShowWarning(true);
        // Auto-submit when time expires
        if (submissionId && !isSubmitting) {
          handleSubmit();
        }
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);

      // Show warning at 5 minutes
      if (diff <= 5 * 60 * 1000 && !showWarning) {
        setShowWarning(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline, submissionId, isSubmitting]);

  // Auto-save effect
  const saveAnswer = useCallback(
    async (questionId: string, answer: string, immediate = false) => {
      if (!submissionId) return;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      const performSave = async () => {
        setSaving(true);
        try {
          await saveAnswerMutation.mutateAsync({
            submissionId,
            questionId,
            answer,
          });
          setLastSaved(new Date());
        } catch (error) {
          console.error("Failed to save answer:", error);
        } finally {
          setSaving(false);
        }
      };

      if (immediate) {
        await performSave();
      } else {
        saveTimeoutRef.current = setTimeout(performSave, 30000); // 30 seconds
      }
    },
    [submissionId, saveAnswerMutation, setSaving, setLastSaved]
  );

  // Save on answer change
  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && submissionId) {
      const answer = answers[currentQuestion.id] || "";
      saveAnswer(currentQuestion.id, answer);
    }
  }, [answers, currentQuestionIndex, questions, submissionId, saveAnswer]);

  // Save on navigation
  const handleNavigation = useCallback(
    (direction: "prev" | "next") => {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && submissionId) {
        const answer = answers[currentQuestion.id] || "";
        saveAnswer(currentQuestion.id, answer, true);
      }

      if (direction === "prev" && currentQuestionIndex > 0) {
        setCurrentQuestion(currentQuestionIndex - 1);
      } else if (
        direction === "next" &&
        currentQuestionIndex < questions.length - 1
      ) {
        setCurrentQuestion(currentQuestionIndex + 1);
      }
    },
    [
      currentQuestionIndex,
      questions,
      answers,
      submissionId,
      saveAnswer,
      setCurrentQuestion,
    ]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) {
        // Don't interfere with text input
        if (e.key === "Enter" && e.ctrlKey) {
          e.preventDefault();
          handleNavigation("next");
        } else if (e.key === "Escape" && e.shiftKey && e.ctrlKey) {
          e.preventDefault();
          handleNavigation("prev");
        } else if (e.key === "s" && e.ctrlKey) {
          e.preventDefault();
          const currentQuestion = questions[currentQuestionIndex];
          if (currentQuestion && submissionId) {
            saveAnswer(
              currentQuestion.id,
              answers[currentQuestion.id] || "",
              true
            );
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentQuestionIndex,
    questions,
    answers,
    submissionId,
    saveAnswer,
    handleNavigation,
  ]);

  // Prevent accidental refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Save current answer before leaving
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && submissionId) {
        const answer = answers[currentQuestion.id] || "";
        saveAnswer(currentQuestion.id, answer, true);
      }

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentQuestionIndex, questions, answers, submissionId, saveAnswer]);

  // Focus input on question change
  useEffect(() => {
    if (answerInputRef.current) {
      answerInputRef.current.focus();
    }
  }, [currentQuestionIndex]);

  const handleAnswerChange = (value: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      setAnswer(currentQuestion.id, value);
    }
  };

  const handleSubmit = async () => {
    if (!submissionId || isSubmitting) return;

    // Save all answers first
    for (const question of questions) {
      const answer = answers[question.id] || "";
      if (answer.trim()) {
        await saveAnswer(question.id, answer, true);
      }
    }

    setSubmitting(true);
    try {
      await submitTestMutation.mutateAsync(submissionId);
      navigate(
        `/student/tests/${params.testId}/review?submissionId=${submissionId}`
      );
    } catch (error) {
      console.error("Failed to submit test:", error);
      alert("Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (!submissionId) return;

    // Save current answer
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      await saveAnswer(
        currentQuestion.id,
        answers[currentQuestion.id] || "",
        true
      );
    }

    navigate("/student/tests");
  };

  const handleQuestionClick = (index: number) => {
    handleNavigation("next"); // Save current first
    setCurrentQuestion(index);
  };

  if (testLoading || submissionLoading || startTestMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-secondary-600">Test not found</p>
          <Button onClick={() => navigate("/student/tests")} className="mt-4">
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id] || "";

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-secondary-900">
                {test.title}
              </h1>
              <p className="text-sm text-secondary-600 font-mono">
                {test.testCode}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {deadline && (
                <div
                  className={`flex items-center gap-2 ${
                    showWarning ? "text-red-600" : "text-secondary-700"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-lg">{timeRemaining}</span>
                </div>
              )}
              <div className="text-sm text-secondary-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              {isSaving ? (
                <Badge variant="info">Saving...</Badge>
              ) : lastSaved ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {showWarning && deadline && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Time is running out! Please submit your test soon.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWarning(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-secondary-200">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-primary-600">
                        Question {currentQuestion.questionNumber}
                      </span>
                      {currentQuestion.unitName && (
                        <Badge variant="info">{currentQuestion.unitName}</Badge>
                      )}
                      <Badge variant="default">
                        {currentQuestion.score} points
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <p className="text-lg text-secondary-900 whitespace-pre-wrap">
                    {currentQuestion.questionText}
                  </p>
                  {currentQuestion.questionImage && (
                    <img
                      src={currentQuestion.questionImage}
                      alt="Question"
                      className="mt-4 max-w-full rounded-lg"
                    />
                  )}
                </div>

                {/* Answer Input */}
                <div>
                  <Textarea
                    ref={answerInputRef}
                    label="Your Answer"
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Enter your answer here..."
                    className="min-h-[200px] text-lg"
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-secondary-200">
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation("prev")}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleSaveAndExit}>
                      <Save className="w-4 h-4 mr-2" />
                      Save & Exit
                    </Button>
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                      >
                        Submit Test
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => handleNavigation("next")}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Palette Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-4">
                  Questions ({getAnsweredCount()}/{questions.length})
                </h3>
                <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                  {questions.map((q, index) => {
                    const isAnswered =
                      answers[q.id] && answers[q.id].trim() !== "";
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => handleQuestionClick(index)}
                        className={`
                          w-10 h-10 rounded-lg font-medium text-sm transition-colors
                          ${
                            isCurrent
                              ? "bg-primary-600 text-white ring-2 ring-primary-300"
                              : isAnswered
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                          }
                        `}
                      >
                        {q.questionNumber}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() =>
                      navigate(
                        `/student/tests/${params.testId}/review?submissionId=${submissionId}`
                      )
                    }
                  >
                    Review All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
