import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input } from "@/components/ui";
import { achievementTestsApi } from "@/shared/api/achievement-tests.api";
import { toastSuccess, toastError } from "@/lib/toast";
import { Spinner } from "@/components/ui";
import { CheckCircle } from "lucide-react";
import type { TestSetupData } from "./types";

// ✅ All statistics are REQUIRED
const schema = z.object({
  nationalAverage: z.coerce
    .number()
    .min(0, "Must be at least 0")
    .max(100, "Must be at most 100"),
  maxScore: z.coerce.number().min(0, "Must be at least 0"),
  totalApplicants: z.coerce.number().min(0, "Must be at least 0"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onBack: () => void;
  onComplete: () => void;
  testData: Partial<TestSetupData>;
}

export function Step5_ReviewSave({ onBack, onComplete, testData }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      nationalAverage: 0,
      maxScore: 100,
      totalApplicants: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!testData.testId) {
      toastError("Test ID is missing");
      return;
    }

    setIsLoading(true);
    try {
      await achievementTestsApi.finalizeTest(testData.testId, {
        nationalAverage: data.nationalAverage,
        maxScore: data.maxScore,
        totalApplicants: data.totalApplicants,
      });

      toastSuccess("Test code finalized successfully!");
      onComplete();
    } catch (error: any) {
      toastError(error.response?.data?.message || "Failed to finalize test");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Test Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">
            Test Code Created
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Test Code:</span>
            <span className="ml-2 font-mono font-bold text-green-700">
              {testData.testCode}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Grade:</span>
            <span className="ml-2 font-semibold">{testData.grade}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Questions:</span>
            <span className="ml-2 font-semibold">
              {testData.totalQuestions}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="ml-2 text-yellow-600 font-semibold">DRAFT</span>
          </div>
        </div>
      </div>

      {/* Questions Summary */}
      {testData.questions && testData.questions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Questions Summary</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Q#</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Unit</th>
                  <th className="px-4 py-2 text-left">Answer</th>
                  <th className="px-4 py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {testData.questions.slice(0, 5).map((q, idx) => {
                  const answer = testData.answers?.find(
                    (a) => a.questionNo === q.questionNo
                  );
                  return (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{q.questionNo}</td>
                      <td className="px-4 py-2">
                        {q.type === "MULTIPLE_CHOICE" ? "객관식" : "주관식"}
                      </td>
                      <td className="px-4 py-2">{q.unitName}</td>
                      <td className="px-4 py-2 font-mono">
                        {answer?.correctAnswer}
                      </td>
                      <td className="px-4 py-2 text-right">{q.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {testData.questions.length > 5 && (
              <div className="px-4 py-2 text-center text-sm text-gray-500 bg-gray-50">
                ... and {testData.questions.length - 5} more questions
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Form - ✅ ALL REQUIRED */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Test Statistics <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          All fields are required. Enter statistics manually.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* National Average - REQUIRED */}
            <Input
              label="National Average (전국 평균) *"
              type="number"
              step="0.01"
              placeholder="75.5"
              error={errors.nationalAverage?.message}
              helperText="0 to 100"
              required
              {...register("nationalAverage")}
            />

            {/* Max Score - REQUIRED */}
            <Input
              label="Max Score (최고 점수) *"
              type="number"
              placeholder="100"
              error={errors.maxScore?.message}
              required
              {...register("maxScore")}
            />

            {/* Total Applicants - REQUIRED */}
            <Input
              label="Total Applicants (응시자 수) *"
              type="number"
              placeholder="150"
              error={errors.totalApplicants?.message}
              required
              {...register("totalApplicants")}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              ← Back
            </Button>
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Finalizing...
                </>
              ) : (
                "Finalize Test →"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
