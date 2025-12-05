import { Button, Input, Select, Textarea } from "@/components/ui";
import type { ICreateQuestionDto } from "@/types/test.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DifficultyLevel } from "@/shared/types/enum";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const questionSchema = z.object({
  questionNumber: z.number().positive(),
  unitName: z.string().min(1, "Unit name is required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  score: z.number().positive("Score must be positive"),
  difficulty: z.nativeEnum(DifficultyLevel, {
    error: "Difficulty is required",
  }),
  questionText: z.string().optional(),
  questionImage: z.string().optional(),
});

const questionArraySchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

type QuestionArrayFormData = z.infer<typeof questionArraySchema>;

interface QuestionArrayFormProps {
  initialQuestions?: ICreateQuestionDto[];
  onChange?: (questions: ICreateQuestionDto[], totalScore: number) => void;
}

const DIFFICULTY_OPTIONS = [
  { value: DifficultyLevel.HIGH, label: "High" },
  { value: DifficultyLevel.MEDIUM, label: "Medium" },
  { value: DifficultyLevel.LOW, label: "Low" },
];

export function QuestionArrayForm({
  initialQuestions,
  onChange,
}: QuestionArrayFormProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useForm<QuestionArrayFormData>({
    resolver: zodResolver(questionArraySchema),
    defaultValues: {
      questions: initialQuestions?.length
        ? initialQuestions
        : [
            {
              questionNumber: 1,
              unitName: "",
              correctAnswer: "",
              score: 1,
              difficulty: DifficultyLevel.MEDIUM,
              questionText: "",
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const watchedQuestions = watch("questions");

  // Calculate total score
  const totalScore =
    watchedQuestions?.reduce((sum, q) => sum + (q.score || 0), 0) || 0;

  // Notify parent of changes
  useEffect(() => {
    if (onChange && watchedQuestions) {
      onChange(watchedQuestions, totalScore);
    }
  }, [watchedQuestions, totalScore, onChange]);

  const addQuestion = () => {
    const nextNumber = fields.length + 1;
    append({
      questionNumber: nextNumber,
      unitName: "",
      correctAnswer: "",
      score: 1,
      difficulty: DifficultyLevel.MEDIUM,
      questionText: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary-900">Questions</h3>
        <Button type="button" onClick={addQuestion} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {fields.map((field, index) => {
        const questionErrors = errors.questions?.[index];
        return (
          <div
            key={field.id}
            className="p-6 border border-secondary-200 rounded-lg bg-white space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-secondary-900">
                Question {index + 1}
              </h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Question Number"
                type="number"
                value={index + 1}
                disabled
                className="bg-secondary-50"
              />

              <Input
                label="Unit Name"
                error={questionErrors?.unitName?.message}
                {...register(`questions.${index}.unitName`)}
                placeholder="e.g., Addition, Subtraction"
              />

              <Input
                label="Correct Answer"
                error={questionErrors?.correctAnswer?.message}
                {...register(`questions.${index}.correctAnswer`)}
                placeholder="Enter correct answer"
              />

              <Input
                label="Score"
                type="number"
                min="1"
                error={questionErrors?.score?.message}
                {...register(`questions.${index}.score`, {
                  valueAsNumber: true,
                })}
              />

              <Select
                label="Difficulty"
                options={DIFFICULTY_OPTIONS}
                error={questionErrors?.difficulty?.message}
                {...register(`questions.${index}.difficulty`)}
              />
            </div>

            <Textarea
              label="Question Text (Optional)"
              error={questionErrors?.questionText?.message}
              {...register(`questions.${index}.questionText`)}
              placeholder="Enter question text if needed"
              rows={3}
            />

            <Input
              label="Question Image URL (Optional)"
              type="url"
              error={questionErrors?.questionImage?.message}
              {...register(`questions.${index}.questionImage`)}
              placeholder="https://example.com/image.png"
            />
          </div>
        );
      })}

      {errors.questions?.root && (
        <p className="text-sm text-red-600">{errors.questions.root.message}</p>
      )}

      <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary-900">
            Total Score
          </span>
          <span className="text-2xl font-bold text-primary-700">
            {totalScore}
          </span>
        </div>
      </div>
    </div>
  );
}
