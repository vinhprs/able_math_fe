import { useMemo, useRef } from "react";
import { useAdtmGradingStore } from "@/store/adtmGradingStore";
import { useCalculateSection1Scores } from "@/hooks/useCalculateScores";
import { useDifficultyBreakdown } from "@/hooks/useDifficultyBreakdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
  Alert,
} from "@/components/ui";
import {
  Star,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import type { AdtmSubmission } from "@/hooks/useAdtmGrading";
import type { ITestQuestion } from "@/types/test.types";
import { DifficultyBreakdownTable } from "@/components/reports/DifficultyBreakdownTable";

interface Section1GradingEnhancedProps {
  questions: ITestQuestion[];
  submission: AdtmSubmission;
  onNext: () => void;
}

export function Section1GradingEnhanced({
  questions,
  onNext,
}: Section1GradingEnhancedProps) {
  const { section1, setSection1PreTest, setSection1Answer } =
    useAdtmGradingStore();

  const questionRefs = useRef<(HTMLInputElement | null)[]>([]);

  const scores = useCalculateSection1Scores({
    questions,
    answers: section1.answers,
  });

  const maxScore = useMemo(() => {
    return questions.reduce((sum, q) => sum + q.score, 0);
  }, [questions]);

  // Calculate difficulty breakdown in real-time
  const difficultyBreakdown = useDifficultyBreakdown({
    questions,
    answers: section1.answers,
  });

  // Get answer type for a question
  const getAnswerType = (
    questionId: string
  ): "CORRECT" | "MISTAKE" | "UNSOLVED" => {
    const score = section1.answers[questionId] ?? 0;
    const question = questions.find((q) => q.id === questionId);
    if (!question) return "UNSOLVED";

    if (score === 0) return "UNSOLVED";
    if (score === question.score) return "CORRECT";
    return "MISTAKE";
  };

  const handleScoreChange = (questionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const clampedValue = Math.max(0, Math.min(question.score, numValue));
      setSection1Answer(questionId, clampedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const nextIndex = e.shiftKey ? index - 1 : index + 1;
      if (nextIndex >= 0 && nextIndex < questions.length) {
        questionRefs.current[nextIndex]?.focus();
      }
    } else if (e.key === "0") {
      e.preventDefault();
      const question = questions[index];
      if (question) setSection1Answer(question.id, 0);
    } else if (e.key === "=") {
      e.preventDefault();
      const question = questions[index];
      if (question) setSection1Answer(question.id, question.score);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < questions.length) {
        questionRefs.current[nextIndex]?.focus();
      }
    }
  };

  const markAllCorrect = () => {
    questions.forEach((q) => {
      setSection1Answer(q.id, q.score);
    });
  };

  const clearAll = () => {
    questions.forEach((q) => {
      setSection1Answer(q.id, 0);
    });
  };

  const canProceed =
    section1.concentrationLevel !== null &&
    section1.currentMood !== null &&
    section1.expectedScore !== null &&
    questions.every((q) => section1.answers[q.id] !== undefined);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (section1.concentrationLevel === null) {
      errors.push("Concentration level is required");
    }
    if (section1.currentMood === null) {
      errors.push("Current mood is required");
    }
    if (section1.expectedScore === null) {
      errors.push("Expected score is required");
    }
    return errors;
  }, [section1]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Section Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-secondary-900">Section 1</h2>
            <h3 className="text-xl text-secondary-600">
              Computational Ability
            </h3>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Badge variant="info">{questions.length} Questions</Badge>
          <Badge variant="info">Max {maxScore} pts</Badge>
          <Badge variant="success" className="font-semibold">
            Raw: {scores.rawScore}/{maxScore}
          </Badge>
          <Badge variant="success" className="font-semibold">
            Standard: {scores.standardScore.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Special Inputs Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <CardTitle>Special Assessment</CardTitle>
            <Badge variant="danger">Required</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Concentration Level */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Current Concentration Level{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setSection1PreTest({ concentrationLevel: level })
                  }
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                    section1.concentrationLevel === level
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-sm text-secondary-500">
              Student's focus level during the test (1-5)
            </p>
          </div>

          {/* Current Mood */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Current Mood <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSection1PreTest({ currentMood: mood })}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                    section1.currentMood === mood
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-sm text-secondary-500">
              Student's emotional state during the test (1-5)
            </p>
          </div>

          {/* Expected Score */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Expected Score <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              max={maxScore}
              value={section1.expectedScore ?? ""}
              onChange={(e) =>
                setSection1PreTest({
                  expectedScore: parseFloat(e.target.value) || 0,
                })
              }
              className="w-32"
            />
            <p className="mt-1.5 text-sm text-secondary-500">
              Your estimated score for this student
            </p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="danger">
              <AlertCircle className="w-5 h-5" />
              <div>
                <div className="font-medium mb-1">Missing Required Fields</div>
                <ul className="list-disc list-inside text-sm">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Questions Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Score Entry</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={markAllCorrect}>
                Mark All Correct
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Keyboard Shortcuts */}
          <div className="mb-4 p-3 bg-secondary-50 rounded-lg flex gap-4 text-xs text-secondary-600">
            <span>
              <kbd className="px-2 py-1 bg-white border border-secondary-300 rounded">
                Tab
              </kbd>{" "}
              Next
            </span>
            <span>
              <kbd className="px-2 py-1 bg-white border border-secondary-300 rounded">
                Shift+Tab
              </kbd>{" "}
              Previous
            </span>
            <span>
              <kbd className="px-2 py-1 bg-white border border-secondary-300 rounded">
                0
              </kbd>{" "}
              Mark unsolved
            </span>
            <span>
              <kbd className="px-2 py-1 bg-white border border-secondary-300 rounded">
                =
              </kbd>{" "}
              Full score
            </span>
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {questions.map((question, index) => {
              const score = section1.answers[question.id] ?? 0;
              const answerType = getAnswerType(question.id);

              return (
                <div
                  key={question.id}
                  className="p-4 border border-secondary-200 rounded-lg bg-white hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      Q{question.questionNumber}
                    </span>
                    <span className="text-xs text-secondary-500">
                      {question.score}pts
                    </span>
                    <Badge
                      variant={
                        question.difficulty === 4 || question.difficulty === 3
                          ? "danger"
                          : question.difficulty === 2
                          ? "warning"
                          : "default"
                      }
                      className="text-xs"
                    >
                      {question.difficulty
                        ? `Level ${question.difficulty}`
                        : "N/A"}
                    </Badge>
                  </div>

                  <Input
                    ref={(el) => {
                      questionRefs.current[index] = el;
                    }}
                    type="number"
                    min="0"
                    max={question.score}
                    value={score || ""}
                    onChange={(e) =>
                      handleScoreChange(question.id, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-full mb-2"
                    placeholder="0"
                    autoFocus={index === 0}
                  />

                  <div className="flex gap-1 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setSection1Answer(question.id, 0)}
                    >
                      0
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() =>
                        setSection1Answer(question.id, question.score)
                      }
                    >
                      {question.score}
                    </Button>
                  </div>

                  <div className="text-xs">
                    {answerType === "CORRECT" && (
                      <Badge
                        variant="success"
                        className="w-full justify-center"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Correct
                      </Badge>
                    )}
                    {answerType === "MISTAKE" && (
                      <Badge
                        variant="warning"
                        className="w-full justify-center"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Mistake
                      </Badge>
                    )}
                    {answerType === "UNSOLVED" && (
                      <Badge
                        variant="default"
                        className="w-full justify-center"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Unsolved
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Calculation Results */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Answer Distribution */}
            <div>
              <h4 className="font-medium text-secondary-700 mb-3">
                Answer Distribution
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Correct</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-700">
                      {scores.correctCount}
                    </div>
                    <div className="text-xs text-secondary-500">
                      {((scores.correctCount / questions.length) * 100).toFixed(
                        1
                      )}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium">Mistakes</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-700">
                      {scores.mistakeCount}
                    </div>
                    <div className="text-xs text-secondary-500">
                      {((scores.mistakeCount / questions.length) * 100).toFixed(
                        1
                      )}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Unsolved</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-700">
                      {scores.unsolvedCount}
                    </div>
                    <div className="text-xs text-secondary-500">
                      {(
                        (scores.unsolvedCount / questions.length) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scores */}
            <div>
              <h4 className="font-medium text-secondary-700 mb-3">Scores</h4>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-secondary-500 mb-1">
                    Raw Score
                  </div>
                  <div className="text-2xl font-bold">
                    {scores.rawScore}{" "}
                    <span className="text-lg text-secondary-500">
                      / {maxScore}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-primary-600 transition-all"
                      style={{
                        width: `${(scores.rawScore / maxScore) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm text-secondary-500 mb-1">
                    Standard Score
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    {scores.standardScore.toFixed(1)}%
                  </div>
                  <div className="w-full h-2 bg-secondary-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{ width: `${scores.standardScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison */}
            {section1.expectedScore !== null && (
              <div>
                <h4 className="font-medium text-secondary-700 mb-3">
                  Comparison
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-secondary-500 mb-1">
                      Expected
                    </div>
                    <div className="text-lg font-medium">
                      {section1.expectedScore} pts
                    </div>
                    <div className="w-full h-2 bg-secondary-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-secondary-400"
                        style={{
                          width: `${
                            (section1.expectedScore / maxScore) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-secondary-500 mb-1">
                      Actual
                    </div>
                    <div className="text-lg font-medium">
                      {scores.rawScore} pts
                    </div>
                    <div className="w-full h-2 bg-secondary-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          scores.rawScore >= section1.expectedScore
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                        style={{
                          width: `${(scores.rawScore / maxScore) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-secondary-200">
                    {scores.rawScore >= section1.expectedScore ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Exceeded by {scores.rawScore - section1.expectedScore}{" "}
                          points
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Below by {section1.expectedScore - scores.rawScore}{" "}
                          points
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Calculation Difficulty Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DifficultyBreakdownTable
            data={difficultyBreakdown}
            showInsights={true}
            showTotal={true}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline">Save Draft</Button>
        <Button variant="primary" onClick={onNext} disabled={!canProceed}>
          Next: Section 2 →
        </Button>
      </div>
    </div>
  );
}
