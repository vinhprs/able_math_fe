import { useParams, useNavigate } from "react-router-dom";
import { useTest } from "@/hooks/useTests";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import { TestStatus } from "@/shared/types/enum";
import { ArrowLeft, Loader2, BarChart3 } from "lucide-react";
import { format } from "date-fns";

export function TestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: test, isLoading } = useTest(id || null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-secondary-600">Test not found</p>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/tests/achievement")}
              className="mt-4"
            >
              Back to Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: TestStatus) => {
    const variants: Record<
      TestStatus,
      "default" | "success" | "warning" | "danger"
    > = {
      [TestStatus.DRAFT]: "default",
      [TestStatus.PUBLISHED]: "success",
      [TestStatus.ARCHIVED]: "danger",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{test.title}</CardTitle>
              <p className="text-sm text-secondary-500 mt-1">
                <span className="font-mono">{test.testCode}</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/tests/achievement")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <span className="text-sm font-medium text-secondary-600">
                Status
              </span>
              <div className="mt-1">{getStatusBadge(test.status)}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-600">
                Grade
              </span>
              <p className="text-sm text-secondary-900 mt-1">{test.grade}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-600">
                Level
              </span>
              <p className="text-sm text-secondary-900 mt-1">L{test.level}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-600">
                Curriculum
              </span>
              <p className="text-sm text-secondary-900 mt-1">
                {test.curriculum}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-600">
                Semester
              </span>
              <p className="text-sm text-secondary-900 mt-1">{test.semester}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-600">
                Term
              </span>
              <p className="text-sm text-secondary-900 mt-1">{test.term}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-600">
                Total Score
              </span>
              <p className="text-sm font-semibold text-secondary-900 mt-1">
                {test.totalScore}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-600">
                Questions
              </span>
              <p className="text-sm text-secondary-900 mt-1">
                {test.questions?.length || 0}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-secondary-600">
                Created
              </span>
              <p className="text-sm text-secondary-900 mt-1">
                {format(new Date(test.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          {test.statistics && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-primary-900">Statistics</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-primary-700">
                    Total Submissions
                  </span>
                  <p className="text-lg font-semibold text-primary-900">
                    {test.statistics.totalSubmissions}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-primary-700">
                    Average Score
                  </span>
                  <p className="text-lg font-semibold text-primary-900">
                    {test.statistics.averageScore.toFixed(1)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-primary-700">
                    Highest Score
                  </span>
                  <p className="text-lg font-semibold text-primary-900">
                    {test.statistics.highestScore}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-primary-700">Lowest Score</span>
                  <p className="text-lg font-semibold text-primary-900">
                    {test.statistics.lowestScore}
                  </p>
                </div>
              </div>
            </div>
          )}

          {test.status === TestStatus.DRAFT && (
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  navigate(`/admin/tests/achievement/${test.id}/edit`)
                }
              >
                Edit Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions List */}
      {test.questions && test.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions ({test.questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {test.questions.map((question) => (
                <div
                  key={question.id}
                  className="border border-secondary-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-secondary-900">
                        Question {question.questionNumber}
                      </span>
                      <Badge variant="info">
                        {question.difficulty
                          ? `Level ${question.difficulty}`
                          : "N/A"}
                      </Badge>
                      <span className="text-sm text-secondary-600">
                        {question.score} point
                        {question.score !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium text-secondary-700">
                        Unit:
                      </span>{" "}
                      <span className="text-secondary-900">
                        {question.unitName || "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-secondary-700">
                        Correct Answer:
                      </span>{" "}
                      <span className="text-secondary-900">
                        {question.correctAnswer}
                      </span>
                    </p>
                    {question.questionText && (
                      <p className="text-secondary-700 mt-2">
                        {question.questionText}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
