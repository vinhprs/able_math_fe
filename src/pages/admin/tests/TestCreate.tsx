import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTest, useAddQuestion } from "@/hooks/useTests";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Stepper,
  Button,
} from "@/components/ui";
import {
  TestInfoForm,
  type TestInfoFormData,
} from "@/components/forms/TestInfoForm";
import { QuestionArrayForm } from "@/components/forms/QuestionArrayForm";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { ICreateQuestionDto } from "@/types/test.types";

const STEPS = ["Test Info", "Add Questions", "Review"];

export function TestCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [testInfo, setTestInfo] = useState<TestInfoFormData | null>(null);
  const [questions, setQuestions] = useState<ICreateQuestionDto[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [generatedTestCode, setGeneratedTestCode] = useState<string>("");

  const createTest = useCreateTest();
  const addQuestion = useAddQuestion();

  // Generate test code preview
  const generateTestCodePreview = (data: TestInfoFormData) => {
    return `${data.grade}_${data.term}_L${data.level}_01`;
  };

  const handleTestInfoSubmit = (data: TestInfoFormData) => {
    setTestInfo(data);
    setGeneratedTestCode(generateTestCodePreview(data));
    setCurrentStep(2);
  };

  const handleQuestionsChange = (
    newQuestions: ICreateQuestionDto[],
    newTotalScore: number
  ) => {
    setQuestions(newQuestions);
    setTotalScore(newTotalScore);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/admin/tests/achievement");
    }
  };

  const handleSubmit = async () => {
    if (!testInfo || questions.length === 0) {
      alert("Please complete all steps");
      return;
    }

    try {
      // Create test
      const test = await createTest.mutateAsync({
        title: testInfo.title,
        curriculum: testInfo.curriculum,
        grade: testInfo.grade,
        semester: testInfo.semester,
        term: testInfo.term,
        level: testInfo.level,
      });

      // Add questions one by one
      for (const question of questions) {
        await addQuestion.mutateAsync({
          testId: test.id,
          data: {
            questionNumber: question.questionNumber,
            unitName: question.unitName,
            correctAnswer: question.correctAnswer,
            score: question.score,
            difficulty: question.difficulty,
            questionText: question.questionText,
            questionImage: question.questionImage,
          },
        });
      }

      alert("Test created successfully!");
      navigate("/admin/tests");
    } catch (error: any) {
      alert(error.message || "Failed to create test");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Achievement Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <Stepper steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Step 1: Test Info */}
          {currentStep === 1 && (
            <div>
              <TestInfoForm
                onSubmit={handleTestInfoSubmit}
                generatedTestCode={generatedTestCode}
              />
            </div>
          )}

          {/* Step 2: Add Questions */}
          {currentStep === 2 && (
            <div>
              <QuestionArrayForm
                initialQuestions={questions.length > 0 ? questions : undefined}
                onChange={handleQuestionsChange}
              />
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={questions.length === 0}
                >
                  Next: Review
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && testInfo && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Test Information</h3>
                <div className="bg-secondary-50 p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-secondary-600">
                        Title:
                      </span>
                      <p className="text-sm text-secondary-900">
                        {testInfo.title}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-secondary-600">
                        Test Code:
                      </span>
                      <p className="text-sm font-mono font-semibold text-secondary-900">
                        {generatedTestCode}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-secondary-600">
                        Curriculum:
                      </span>
                      <p className="text-sm text-secondary-900">
                        {testInfo.curriculum}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-secondary-600">
                        Grade:
                      </span>
                      <p className="text-sm text-secondary-900">
                        {testInfo.grade}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-secondary-600">
                        Semester:
                      </span>
                      <p className="text-sm text-secondary-900">
                        {testInfo.semester}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-secondary-600">
                        Term:
                      </span>
                      <p className="text-sm text-secondary-900">
                        {testInfo.term}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-secondary-600">
                        Level:
                      </span>
                      <p className="text-sm text-secondary-900">
                        L{testInfo.level}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-secondary-600">
                        Total Score:
                      </span>
                      <p className="text-sm font-semibold text-secondary-900">
                        {totalScore}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Questions ({questions.length})
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questions.map((q, index) => (
                    <div key={index} className="bg-secondary-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold">
                          Question {q.questionNumber}
                        </span>
                        <span className="text-sm text-secondary-600">
                          {q.score} point{q.score !== 1 ? "s" : ""} •{" "}
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-700 mb-1">
                        <span className="font-medium">Unit:</span> {q.unitName}
                      </p>
                      <p className="text-sm text-secondary-700 mb-1">
                        <span className="font-medium">Correct Answer:</span>{" "}
                        {q.correctAnswer}
                      </p>
                      {q.questionText && (
                        <p className="text-sm text-secondary-700 mt-2">
                          {q.questionText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createTest.isPending || addQuestion.isPending}
                  isLoading={createTest.isPending || addQuestion.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Create Test
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
