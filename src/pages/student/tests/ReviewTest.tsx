import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTestStore } from "@/store/testStore";
import { useSubmission, useSubmitTest } from "@/hooks/useTestSubmissions";
import { Loader2 } from "lucide-react";

export function ReviewTest() {
  const params = useParams<{ testId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const submissionId = searchParams.get("submissionId");

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    test,
    questions,
    answers,
    getUnansweredQuestions,
    setCurrentQuestion,
    setSubmitting,
    isSubmitting,
  } = useTestStore();

  const { data: submission, isLoading } = useSubmission(submissionId || null);
  const submitTestMutation = useSubmitTest();

  const unansweredQuestions = getUnansweredQuestions();

  const handleQuestionClick = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
    navigate(
      `/student/tests/${params.testId}/take?submissionId=${submissionId}`
    );
  };

  const handleSubmit = async () => {
    if (!submissionId || isSubmitting) return;

    setSubmitting(true);
    try {
      await submitTestMutation.mutateAsync(submissionId);
      navigate(
        `/student/tests/${params.testId}/result?submissionId=${submissionId}`
      );
    } catch (error) {
      console.error("Failed to submit test:", error);
      alert("Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() =>
              navigate(
                `/student/tests/${params.testId}/take?submissionId=${submissionId}`
              )
            }
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Test
          </Button>
          <h1 className="text-3xl font-bold text-secondary-900">
            Review Your Answers
          </h1>
          <p className="text-secondary-600 mt-2">
            Review all questions before submitting. You can click any question
            to edit your answer.
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-secondary-600">Total Questions</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {questions.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-600">Answered</p>
                <p className="text-2xl font-bold text-green-600">
                  {questions.length - unansweredQuestions.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-600">Unanswered</p>
                <p className="text-2xl font-bold text-red-600">
                  {unansweredQuestions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning if unanswered */}
        {unansweredQuestions.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    You have {unansweredQuestions.length} unanswered question
                    {unansweredQuestions.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please review and answer all questions before submitting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-4 mb-6">
          {questions.map((question, index) => {
            const answer = answers[question.id] || "";
            const isAnswered = answer.trim() !== "";

            return (
              <Card
                key={question.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  !isAnswered ? "border-red-200 bg-red-50" : ""
                }`}
                onClick={() => handleQuestionClick(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg font-bold text-secondary-900">
                          Question {question.questionNumber}
                        </span>
                        {question.unitName && (
                          <Badge variant="info">{question.unitName}</Badge>
                        )}
                        <Badge variant="default">{question.score} points</Badge>
                        {isAnswered ? (
                          <Badge
                            variant="success"
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Answered
                          </Badge>
                        ) : (
                          <Badge
                            variant="danger"
                            className="flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Unanswered
                          </Badge>
                        )}
                      </div>
                      <p className="text-secondary-900 mb-3 whitespace-pre-wrap">
                        {question.questionText}
                      </p>
                      {question.questionImage && (
                        <img
                          src={question.questionImage}
                          alt="Question"
                          className="mb-3 max-w-md rounded-lg"
                        />
                      )}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-secondary-700 mb-1">
                          Your Answer:
                        </p>
                        {isAnswered ? (
                          <p className="text-secondary-900 bg-white p-3 rounded-lg border border-secondary-200">
                            {answer}
                          </p>
                        ) : (
                          <p className="text-secondary-500 italic">
                            No answer provided
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuestionClick(index);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-secondary-900">
                  Ready to submit your test?
                </p>
                <p className="text-sm text-secondary-600 mt-1">
                  {unansweredQuestions.length > 0
                    ? `You have ${
                        unansweredQuestions.length
                      } unanswered question${
                        unansweredQuestions.length > 1 ? "s" : ""
                      }. You can still submit, but unanswered questions will receive 0 points.`
                    : "All questions have been answered. Click submit to finalize your test."}
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowConfirmModal(true)}
                isLoading={isSubmitting}
              >
                Submit Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Confirm Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-700 mb-4">
                Are you sure you want to submit your test? This action cannot be
                undone.
              </p>
              {unansweredQuestions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> You have{" "}
                    {unansweredQuestions.length} unanswered question
                    {unansweredQuestions.length > 1 ? "s" : ""}. These will
                    receive 0 points.
                  </p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                >
                  Yes, Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
