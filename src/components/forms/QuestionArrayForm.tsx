import { MultipleChoiceEditor } from "@/components/admin/MultipleChoiceEditor";
import { QuestionTypeSelector } from "@/components/admin/QuestionTypeSelector";
import { ScoreSummary } from "@/components/tests/ScoreSummary";
import { ScoreValidationAlert } from "@/components/tests/ScoreValidationAlert";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ICreateQuestionDto } from "@/types/test.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const questionSchema = z.object({
  questionNumber: z.number().positive(),
  unitName: z.string().min(1, "Unit name is required"),
  questionType: z.enum(["TEXT", "MULTIPLE_CHOICE", "TRUE_FALSE"]).optional(),
  options: z
    .object({
      A: z.string().optional(),
      B: z.string().optional(),
      C: z.string().optional(),
      D: z.string().optional(),
      E: z.string().optional(),
    })
    .nullable()
    .optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  score: z.number().positive("Score must be positive"),
  difficulty: z.number().int().min(1).max(4, {
    message: "Difficulty must be between 1 and 4",
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
  targetScore?: number;
  showValidation?: boolean;
}

const DIFFICULTY_OPTIONS = [
  { value: "1", label: "Level 1 (Easy)" },
  { value: "2", label: "Level 2 (Medium)" },
  { value: "3", label: "Level 3 (Hard)" },
  { value: "4", label: "Level 4 (Very Hard)" },
];

export function QuestionArrayForm({
  initialQuestions,
  onChange,
  targetScore = 100,
  showValidation = true,
}: QuestionArrayFormProps) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionArrayFormData>({
    resolver: zodResolver(questionArraySchema),
    defaultValues: {
      questions: initialQuestions?.length
        ? initialQuestions.map((q) => ({
            ...q,
            questionType: q.questionType || "TEXT",
            options: q.options || null,
          }))
        : [
            {
              questionNumber: 1,
              unitName: "",
              questionType: "TEXT" as const,
              options: null,
              correctAnswer: "",
              score: 1,
              difficulty: 2, // Default to Medium (Level 2)
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
      questionType: "TEXT",
      options: null,
      correctAnswer: "",
      score: 1,
      difficulty: 2, // Default to Medium (Level 2)
      questionText: "",
    });
  };

  // Calculate remaining score for each question
  const getRemainingScore = (currentQuestionIndex: number) => {
    const otherQuestionsTotal =
      watchedQuestions
        ?.filter((_, idx) => idx !== currentQuestionIndex)
        .reduce((sum, q) => sum + (q.score || 0), 0) || 0;
    return targetScore - otherQuestionsTotal;
  };

  return (
    <div className="space-y-6">
      {/* Score Summary - Always visible */}
      {showValidation && (
        <ScoreSummary
          questions={watchedQuestions || []}
          targetScore={targetScore}
        />
      )}

      {/* Validation Alert */}
      {showValidation && (
        <ScoreValidationAlert
          questions={watchedQuestions || []}
          targetScore={targetScore}
        />
      )}

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

            {/* Question Type Selector */}
            <QuestionTypeSelector
              value={watchedQuestions?.[index]?.questionType || "TEXT"}
              onChange={(type) => {
                setValue(`questions.${index}.questionType`, type);
                if (type === "MULTIPLE_CHOICE") {
                  setValue(`questions.${index}.options`, {
                    A: "",
                    B: "",
                    C: "",
                    D: "",
                    E: "",
                  });
                  setValue(`questions.${index}.correctAnswer`, "");
                } else {
                  setValue(`questions.${index}.options`, null);
                }
              }}
            />

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

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label
                    htmlFor={`score-${index}`}
                    className="block text-sm font-medium text-secondary-700"
                  >
                    Score *
                  </label>
                  {showValidation && (
                    <span className="text-xs text-gray-500">
                      (Remaining: {getRemainingScore(index).toFixed(1)} points)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id={`score-${index}`}
                    type="number"
                    step="0.5"
                    min="0"
                    error={questionErrors?.score?.message}
                    className={cn(
                      showValidation &&
                        getRemainingScore(index) < 0 &&
                        "border-red-500 focus:ring-red-500"
                    )}
                    {...register(`questions.${index}.score`, {
                      valueAsNumber: true,
                    })}
                  />
                  {showValidation &&
                    getRemainingScore(index) < 0 &&
                    watchedQuestions?.[index]?.score &&
                    watchedQuestions[index].score > 0 && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    )}
                </div>
                {showValidation &&
                  getRemainingScore(index) < 0 &&
                  watchedQuestions?.[index]?.score &&
                  watchedQuestions[index].score > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      This question's score exceeds remaining allocation
                    </p>
                  )}
              </div>

              <Select
                label="Difficulty"
                options={DIFFICULTY_OPTIONS}
                error={questionErrors?.difficulty?.message}
                {...register(`questions.${index}.difficulty`, {
                  valueAsNumber: true,
                })}
              />
            </div>

            <Textarea
              label="Question Text (Optional)"
              error={questionErrors?.questionText?.message}
              {...register(`questions.${index}.questionText`)}
              placeholder="Enter question text if needed"
              rows={3}
            />

            {/* Conditional: Multiple Choice Editor OR Text Answer */}
            {watchedQuestions?.[index]?.questionType === "MULTIPLE_CHOICE" ? (
              <MultipleChoiceEditor
                options={
                  watchedQuestions[index].options || {
                    A: "",
                    B: "",
                    C: "",
                    D: "",
                    E: "",
                  }
                }
                correctAnswer={watchedQuestions[index].correctAnswer || ""}
                onChange={(options, correctAnswer) => {
                  setValue(`questions.${index}.options`, options);
                  setValue(`questions.${index}.correctAnswer`, correctAnswer);
                }}
              />
            ) : (
              <Input
                label="Correct Answer"
                error={questionErrors?.correctAnswer?.message}
                {...register(`questions.${index}.correctAnswer`)}
                placeholder="Enter correct answer"
              />
            )}

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
    </div>
  );
}
