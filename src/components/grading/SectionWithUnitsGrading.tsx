import { useState, useMemo } from "react";
import { useAdtmGradingStore } from "@/store/adtmGradingStore";
import { useCalculateSectionScores } from "@/hooks/useCalculateScores";
import { useDifficultyBreakdown } from "@/hooks/useDifficultyBreakdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
} from "@/components/ui";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react";
import type { ITestQuestion } from "@/types/test.types";
import { DifficultyBreakdownTable } from "@/components/reports/DifficultyBreakdownTable";

interface SectionWithUnitsGradingProps {
  sectionNumber: 2 | 3;
  sectionName: string;
  questions: ITestQuestion[];
  onPrevious: () => void;
  onNext: () => void;
}

export function SectionWithUnitsGrading({
  sectionNumber,
  sectionName,
  questions,
  onPrevious,
  onNext,
}: SectionWithUnitsGradingProps) {
  const { section2, section3, setSectionAnswer } = useAdtmGradingStore();
  const [openUnits, setOpenUnits] = useState<Set<string>>(
    new Set([questions[0]?.unitName || ""])
  );

  const sectionData = sectionNumber === 2 ? section2 : section3;

  const scores = useCalculateSectionScores({
    questions,
    answers: sectionData.answers,
  });

  // Calculate difficulty breakdown in real-time
  const difficultyBreakdown = useDifficultyBreakdown({
    questions,
    answers: sectionData.answers,
  });

  // Group questions by unit
  const units = useMemo(() => {
    const unitMap: Record<string, ITestQuestion[]> = {};
    questions.forEach((q) => {
      const unitName = q.unitName || "No Unit";
      if (!unitMap[unitName]) {
        unitMap[unitName] = [];
      }
      unitMap[unitName].push(q);
    });

    return Object.entries(unitMap).map(([name, unitQuestions]) => {
      const maxScore = unitQuestions.reduce((sum, q) => sum + q.score, 0);
      const rawScore = unitQuestions.reduce(
        (sum, q) => sum + (sectionData.answers[q.id] ?? 0),
        0
      );
      const standardScore = maxScore > 0 ? (rawScore / maxScore) * 100 : 0;

      return {
        name,
        questions: unitQuestions.sort(
          (a, b) => a.questionNumber - b.questionNumber
        ),
        maxScore,
        rawScore,
        standardScore: Math.round(standardScore * 100) / 100,
      };
    });
  }, [questions, sectionData.answers]);

  const toggleUnit = (unitName: string) => {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitName)) {
        next.delete(unitName);
      } else {
        next.add(unitName);
      }
      return next;
    });
  };

  const handleScoreChange = (questionId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const clampedValue = Math.max(0, Math.min(question.score, numValue));
      setSectionAnswer(sectionNumber, questionId, clampedValue);
    }
  };

  const isUnitComplete = (unitName: string): boolean => {
    const unit = units.find((u) => u.name === unitName);
    if (!unit) return false;
    return unit.questions.every((q) => sectionData.answers[q.id] !== undefined);
  };

  const canProceed = questions.every(
    (q) => sectionData.answers[q.id] !== undefined
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">
            Section {sectionNumber}
          </h2>
          <h3 className="text-xl text-secondary-600">{sectionName}</h3>
        </div>

        <div className="flex gap-4">
          <Badge variant="info">{units.length} Units</Badge>
          <Badge variant="info">{questions.length} Questions</Badge>
          <Badge variant="success" className="font-semibold">
            Raw: {scores.rawScore}/{scores.maxScore}
          </Badge>
          <Badge variant="success" className="font-semibold">
            Standard: {scores.standardScore.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Units Accordion */}
      <div className="space-y-3">
        {units.map((unit) => {
          const isOpen = openUnits.has(unit.name);
          const isComplete = isUnitComplete(unit.name);

          return (
            <Card key={unit.name}>
              <button onClick={() => toggleUnit(unit.name)} className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-secondary-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-secondary-400" />
                      )}
                      <div className="text-left">
                        <CardTitle className="text-lg">{unit.name}</CardTitle>
                        <p className="text-sm text-secondary-500 mt-1">
                          {unit.questions.length} questions • Max{" "}
                          {unit.maxScore} pts
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isComplete && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      <div className="text-right">
                        <div className="font-semibold">
                          {unit.rawScore}/{unit.maxScore}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {unit.standardScore.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </button>

              {isOpen && (
                <CardContent>
                  {/* Unit Questions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {unit.questions.map((question) => {
                      const score = sectionData.answers[question.id] ?? 0;

                      return (
                        <div
                          key={question.id}
                          className="p-3 border border-secondary-200 rounded-lg bg-white"
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
                                question.difficulty === 4 ||
                                question.difficulty === 3
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
                            type="number"
                            min="0"
                            max={question.score}
                            value={score || ""}
                            onChange={(e) =>
                              handleScoreChange(question.id, e.target.value)
                            }
                            className="w-full mb-2"
                            placeholder="0"
                          />

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() =>
                                setSectionAnswer(sectionNumber, question.id, 0)
                              }
                            >
                              0
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() =>
                                setSectionAnswer(
                                  sectionNumber,
                                  question.id,
                                  question.score
                                )
                              }
                            >
                              {question.score}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Unit Summary */}
                  <div className="pt-4 border-t border-secondary-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-600">
                        Raw Score
                      </span>
                      <span className="font-semibold">
                        {unit.rawScore} / {unit.maxScore}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all"
                        style={{
                          width: `${(unit.rawScore / unit.maxScore) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-secondary-600">
                        Standard Score
                      </span>
                      <span className="font-semibold text-primary-600">
                        {unit.standardScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all"
                        style={{ width: `${unit.standardScore}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Section Total */}
      <Card>
        <CardHeader>
          <CardTitle>Section {sectionNumber} Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-600">Raw Score</span>
                <span className="text-2xl font-bold">
                  {scores.rawScore}{" "}
                  <span className="text-lg text-secondary-500">
                    / {scores.maxScore}
                  </span>
                </span>
              </div>
              <div className="w-full h-3 bg-secondary-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 transition-all"
                  style={{
                    width: `${(scores.rawScore / scores.maxScore) * 100}%`,
                  }}
                />
              </div>
              <div className="text-xs text-secondary-500 mt-1 text-right">
                {((scores.rawScore / scores.maxScore) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="pt-4 border-t border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-600">
                  Standard Score
                </span>
                <span className="text-2xl font-bold text-primary-600">
                  {scores.standardScore.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 bg-secondary-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${scores.standardScore}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {sectionNumber === 2 ? (
              <TrendingUp className="w-5 h-5 text-primary-600" />
            ) : (
              <Activity className="w-5 h-5 text-primary-600" />
            )}
            {sectionNumber === 2
              ? "Concept Understanding - Difficulty Analysis"
              : "Concept Application - Difficulty Analysis"}
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
        <Button variant="outline" onClick={onPrevious}>
          ← Previous Section
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button variant="primary" onClick={onNext} disabled={!canProceed}>
            Next: Section {sectionNumber + 1} →
          </Button>
        </div>
      </div>
    </div>
  );
}
