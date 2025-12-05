import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Select } from "@/components/ui";
import { Term } from "@/shared/types/enum";
import type { ICreateTestDto } from "@/types/test.types";

// Input schema (what the form uses - level as string)
const testInfoInputSchema = z.object({
  curriculum: z.string().min(1, "Curriculum is required"),
  grade: z.string().min(1, "Grade is required"),
  semester: z.string().min(1, "Semester is required"),
  term: z.nativeEnum(Term, { error: "Term is required" }),
  level: z.enum(["1", "2", "3"], { error: "Level is required" }),
  title: z.string().min(3, "Title must be at least 3 characters"),
});

// Output schema (transformed - level as number)
const testInfoSchema = testInfoInputSchema.extend({
  level: z.enum(["1", "2", "3"]).transform((val) => Number(val)),
});

// Form input type
export type TestInfoFormInput = z.infer<typeof testInfoInputSchema>;

// Form output type (after transform)
export type TestInfoFormData = z.infer<typeof testInfoSchema>;

interface TestInfoFormProps {
  initialData?: Partial<ICreateTestDto>;
  onSubmit: (data: TestInfoFormData) => void;
  generatedTestCode?: string;
}

const CURRICULUM_OPTIONS = [
  { value: "Singapore Math", label: "Singapore Math" },
  { value: "Common Core", label: "Common Core" },
  { value: "Vietnamese", label: "Vietnamese" },
];

const GRADE_OPTIONS = [
  { value: "E1", label: "E1" },
  { value: "E2", label: "E2" },
  { value: "E3", label: "E3" },
  { value: "E4", label: "E4" },
  { value: "E5", label: "E5" },
  { value: "E6", label: "E6" },
  { value: "M1", label: "M1" },
  { value: "M2", label: "M2" },
  { value: "M3", label: "M3" },
];

const SEMESTER_OPTIONS = [
  { value: "S1", label: "Semester 1" },
  { value: "S2", label: "Semester 2" },
];

const TERM_OPTIONS = [
  { value: Term.T1, label: "Term 1" },
  { value: Term.T2, label: "Term 2" },
];

const LEVEL_OPTIONS = [
  { value: "1", label: "Level 1 (L1)" },
  { value: "2", label: "Level 2 (L2)" },
  { value: "3", label: "Level 3 (L3)" },
];

export function TestInfoForm({
  initialData,
  onSubmit,
  generatedTestCode,
}: TestInfoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TestInfoFormInput>({
    resolver: zodResolver(testInfoInputSchema),
    defaultValues: initialData
      ? {
          curriculum: initialData.curriculum || "",
          grade: initialData.grade || "",
          semester: initialData.semester || "",
          term: initialData.term || Term.T1,
          level: (initialData.level?.toString() || "1") as "1" | "2" | "3",
          title: initialData.title || "",
        }
      : undefined,
  });

  const watchedValues = watch(["grade", "term", "level"]);

  const handleFormSubmit = (data: TestInfoFormInput) => {
    // Transform level from string to number
    const transformedData: TestInfoFormData = {
      ...data,
      level: Number(data.level),
    };
    onSubmit(transformedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Curriculum"
          options={CURRICULUM_OPTIONS}
          error={errors.curriculum?.message}
          {...register("curriculum")}
        />

        <Select
          label="Grade"
          options={GRADE_OPTIONS}
          error={errors.grade?.message}
          {...register("grade")}
        />

        <Select
          label="Semester"
          options={SEMESTER_OPTIONS}
          error={errors.semester?.message}
          {...register("semester")}
        />

        <Select
          label="Term"
          options={TERM_OPTIONS}
          error={errors.term?.message}
          {...register("term")}
        />

        <div>
          <Select
            label="Level"
            options={LEVEL_OPTIONS}
            error={errors.level?.message}
            {...register("level")}
          />
        </div>

        <Input
          label="Title"
          error={errors.title?.message}
          {...register("title")}
          placeholder="Enter test title"
        />
      </div>

      {generatedTestCode && (
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm font-medium text-primary-900 mb-1">
            Generated Test Code
          </p>
          <p className="text-lg font-mono font-semibold text-primary-700">
            {generatedTestCode}
          </p>
        </div>
      )}

      {watchedValues[0] &&
        watchedValues[1] &&
        watchedValues[2] &&
        !generatedTestCode && (
          <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
            <p className="text-sm text-secondary-600">
              Test code will be generated automatically after you fill in all
              fields.
            </p>
          </div>
        )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Next: Add Questions
        </button>
      </div>
    </form>
  );
}
