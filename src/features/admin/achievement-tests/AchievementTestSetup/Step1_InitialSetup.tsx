import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Select } from "@/components/ui";
import { achievementTestsApi } from "@/shared/api/achievement-tests.api";
import { toastSuccess, toastError } from "@/lib/toast";
import { Spinner } from "@/components/ui";
import type { TestSetupData } from "./types";

const schema = z.object({
  grade: z.enum(["E4", "E5", "E6"]),
  semester: z.coerce.number().min(1).max(2),
  examType: z.enum(["MIDTERM", "FINAL"]),
  level: z.enum(["L1", "L2", "L3"]),
  testNumber: z.string().regex(/^0[1-3]$/),
  totalQuestions: z.coerce.number().min(1),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onNext: (data: Partial<TestSetupData>) => void;
  initialData?: Partial<TestSetupData>;
}

export function Step1_InitialSetup({ onNext, initialData }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData
      ? {
          grade: (initialData.grade as "E4" | "E5" | "E6") || "E4",
          semester: initialData.semester || 1,
          examType: (initialData.examType as "MIDTERM" | "FINAL") || "MIDTERM",
          level: (initialData.level as "L1" | "L2" | "L3") || "L2",
          testNumber: initialData.testNumber || "01",
          totalQuestions: initialData.totalQuestions || 20,
        }
      : {
          grade: "E4",
          semester: 1,
          examType: "MIDTERM",
          level: "L2",
          testNumber: "01",
          totalQuestions: 20,
        },
  });

  const grade = watch("grade");

  // Elementary: 01, 02 / Middle: 01, 02, 03
  const numberOptions = grade?.startsWith("E")
    ? ["01", "02"]
    : ["01", "02", "03"];

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await achievementTestsApi.createSetup({
        grade: data.grade,
        semester: data.semester,
        examType: data.examType,
        level: data.level,
        testNumber: data.testNumber,
        totalQuestions: data.totalQuestions,
      });

      toastSuccess(`Test code created: ${result.testCode}`);
      onNext({
        ...data,
        testId: result.testId,
        testCode: result.testCode,
      } as Partial<TestSetupData>);
    } catch (error: any) {
      toastError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create test setup"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Test papers already exist as PDFs (e.g.,
          E41-T1-L2-01.pdf). This form is for entering answer keys only.
        </p>
        <p className="text-xs text-blue-600 mt-2">
          Curriculum: 2015개정 (fixed, no selection needed)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grade */}
        <Select
          label="Grade (학년) *"
          options={[
            { value: "E4", label: "초등 4학년 (Elementary 4)" },
            { value: "E5", label: "초등 5학년 (Elementary 5)" },
            { value: "E6", label: "초등 6학년 (Elementary 6)" },
          ]}
          error={errors.grade?.message}
          {...register("grade")}
        />

        {/* Semester */}
        <Select
          label="Semester (학기) *"
          options={[
            { value: "1", label: "1학기 (Semester 1)" },
            { value: "2", label: "2학기 (Semester 2)" },
          ]}
          error={errors.semester?.message}
          {...register("semester")}
        />

        {/* Exam Type */}
        <Select
          label="Exam Type *"
          options={[
            { value: "MIDTERM", label: "중간고사 (Midterm)" },
            { value: "FINAL", label: "기말고사 (Final)" },
          ]}
          error={errors.examType?.message}
          {...register("examType")}
        />

        {/* Level */}
        <Select
          label="Level (난이도) *"
          options={[
            { value: "L1", label: "L1" },
            { value: "L2", label: "L2" },
            { value: "L3", label: "L3" },
          ]}
          error={errors.level?.message}
          {...register("level")}
        />

        {/* Test Number */}
        <Select
          label="Number (번호) *"
          options={numberOptions.map((num) => ({
            value: num,
            label: num,
          }))}
          error={errors.testNumber?.message}
          {...register("testNumber")}
        />

        {/* Total Questions */}
        <Input
          label="Total Questions (총 문항 수) *"
          type="number"
          placeholder="20"
          error={errors.totalQuestions?.message}
          {...register("totalQuestions")}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Creating...
            </>
          ) : (
            "Next: Select Units →"
          )}
        </Button>
      </div>
    </form>
  );
}
