import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useTest,
  useUpdateTest,
  useAddQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/useTests";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import { TestInfoForm } from "@/components/forms/TestInfoForm";
import { QuestionArrayForm } from "@/components/forms/QuestionArrayForm";
import { TestStatus } from "@shared/types/enum";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import type { ICreateQuestionDto } from "@/types/test.types";

export function TestEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: test, isLoading } = useTest(id || null);
  const updateTest = useUpdateTest();
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

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
                onClick={() => navigate("/admin/tests")}
                className="mt-4"
              >
                Back to Tests
              </Button>
            </CardContent>
          </Card>
      </div>
    );
  }

  if (test.status === TestStatus.PUBLISHED) {
    return (
      <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Cannot Edit Published Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  This test has been published and cannot be edited. Please
                  archive it first if you need to make changes.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/tests")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tests
              </Button>
            </CardContent>
          </Card>
      </div>
    );
  }

  const handleTestInfoSubmit = async (data: any) => {
    try {
      await updateTest.mutateAsync({
        id: test.id,
        data: {
          title: data.title,
          curriculum: data.curriculum,
          grade: data.grade,
          semester: data.semester,
          term: data.term,
          level: data.level,
        },
      });
      alert("Test information updated successfully");
    } catch (error: any) {
      alert(error.message || "Failed to update test");
    }
  };

  const handleQuestionsChange = async (
    newQuestions: ICreateQuestionDto[],
    totalScore: number
  ) => {
    // This is a simplified version - in a real app, you'd want to compare
    // existing questions with new ones and update/delete/add accordingly
    // For now, we'll just show a message that questions need to be managed individually
  };

  const existingQuestions: ICreateQuestionDto[] =
    test.questions?.map((q) => ({
      questionNumber: q.questionNumber,
      unitName: q.unitName || "",
      correctAnswer: q.correctAnswer,
      score: q.score,
      difficulty: q.difficulty || ("MEDIUM" as any),
      questionText: q.questionText,
      questionImage: q.questionImage || undefined,
    })) || [];

  return (
    <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Test: {test.testCode}</CardTitle>
                <p className="text-sm text-secondary-500 mt-1">
                  Status:{" "}
                  <Badge
                    variant={
                      test.status === TestStatus.DRAFT ? "default" : "success"
                    }
                  >
                    {test.status}
                  </Badge>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/tests")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Test Info Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Test Information</h3>
                <TestInfoForm
                  initialData={{
                    title: test.title,
                    curriculum: test.curriculum,
                    grade: test.grade,
                    semester: test.semester,
                    term: test.term as any,
                    level: test.level,
                  }}
                  onSubmit={handleTestInfoSubmit}
                  generatedTestCode={test.testCode}
                />
              </div>

              {/* Questions Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Questions</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    Note: To modify questions, please use the individual
                    question actions. Adding new questions will automatically
                    assign the next sequential number.
                  </p>
                </div>
                <QuestionArrayForm
                  initialQuestions={existingQuestions}
                  onChange={handleQuestionsChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
