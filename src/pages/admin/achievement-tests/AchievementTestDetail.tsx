import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from "@/components/ui";
import { toastError } from "@/lib/toast";
import { achievementTestsApi } from "@/shared/api/achievement-tests.api";
import type { AchievementTest } from "@/shared/types/achievement-test.types";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function AchievementTestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<AchievementTest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTest();
    }
  }, [id]);

  const fetchTest = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const result = await achievementTestsApi.getTestDetail(id);
      setTest(result);
    } catch (error: any) {
      toastError(error.response?.data?.message || "Failed to fetch test");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "success" | "warning" | "danger" | "info"
    > = {
      PUBLISHED: "default",
      DRAFT: "success",
      ARCHIVED: "warning",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Test not found</p>
          <Button
            onClick={() => navigate("/admin/achievement-tests")}
            className="mt-4"
          >
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/achievement-tests")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to List
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{test.testCode}</h1>
        <p className="text-gray-600 mt-1">Achievement Test Details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Test Code:</span>
              <p className="font-mono font-semibold">{test.testCode}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Grade:</span>
              <p className="font-semibold">{test.grade}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Semester:</span>
              <p className="font-semibold">{test.semester}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Level:</span>
              <p className="font-semibold">{test.level}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status:</span>
              <div className="mt-1">{getStatusBadge(test.status)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Total Questions:</span>
              <p className="font-semibold">{test.totalQuestions}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Score:</span>
              <p className="font-semibold">{test.totalScore}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">National Average:</span>
              <p className="font-semibold">{test.nationalAverage}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Max Score:</span>
              <p className="font-semibold">{test.maxScore}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Applicants:</span>
              <p className="font-semibold">{test.totalApplicants}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {test.questions && test.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions ({test.questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Q#</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Unit</th>
                    <th className="px-4 py-2 text-left">Answer</th>
                    <th className="px-4 py-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {test.questions.map((q) => (
                    <tr key={q.questionNo} className="border-b">
                      <td className="px-4 py-2">{q.questionNo}</td>
                      <td className="px-4 py-2">
                        {q.type === "MULTIPLE_CHOICE" ? "객관식" : "주관식"}
                      </td>
                      <td className="px-4 py-2">{q.unitName}</td>
                      <td className="px-4 py-2 font-mono">{q.correctAnswer}</td>
                      <td className="px-4 py-2 text-right">{q.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
