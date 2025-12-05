import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdtmGradingStore } from "@/store/adtmGradingStore";
import { useGradeAdtmSubmission } from "@/hooks/useAdtmGrading";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Checkbox,
  Alert,
} from "@/components/ui";
import {
  Edit,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Star,
  Loader2,
} from "lucide-react";
import {
  useCalculateSection1Scores,
  useCalculateSectionScores,
  useCalculateSimpleSectionScores,
} from "@/hooks/useCalculateScores";
import type { AdtmSubmission } from "@/hooks/useAdtmGrading";
import type { ITestQuestion } from "@/types/test.types";

interface FinalReviewPageProps {
  submission: AdtmSubmission;
  questionsBySection: Record<number, ITestQuestion[]>;
  onBack: () => void;
}

export function FinalReviewPage({
  submission,
  questionsBySection,
  onBack,
}: FinalReviewPageProps) {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const { section1, section2, section3, section4, section5, setCurrentStep } =
    useAdtmGradingStore();

  const gradeMutation = useGradeAdtmSubmission();

  // Calculate all section scores
  const section1Scores = useCalculateSection1Scores({
    questions: questionsBySection[1],
    answers: section1.answers,
  });

  const section2Scores = useCalculateSectionScores({
    questions: questionsBySection[2],
    answers: section2.answers,
  });

  const section3Scores = useCalculateSectionScores({
    questions: questionsBySection[3],
    answers: section3.answers,
  });

  const section4Scores = useCalculateSimpleSectionScores({
    questions: questionsBySection[4],
    answers: section4.answers,
  });

  const section5Scores = useCalculateSimpleSectionScores({
    questions: questionsBySection[5],
    answers: section5.answers,
  });

  // Calculate overall
  const overallScores = useMemo(() => {
    const totalRawScore =
      section1Scores.rawScore +
      section2Scores.rawScore +
      section3Scores.rawScore +
      section4Scores.rawScore +
      section5Scores.rawScore;

    const totalMaxScore =
      section1Scores.maxScore +
      section2Scores.maxScore +
      section3Scores.maxScore +
      section4Scores.maxScore +
      section5Scores.maxScore;

    const overallStandardScore =
      totalMaxScore > 0 ? (totalRawScore / totalMaxScore) * 100 : 0;

    return {
      totalRawScore,
      totalMaxScore,
      overallStandardScore: Math.round(overallStandardScore * 100) / 100,
    };
  }, [
    section1Scores,
    section2Scores,
    section3Scores,
    section4Scores,
    section5Scores,
  ]);

  // Validation warnings
  const validationWarnings = useMemo(() => {
    const warnings: Array<{ section: number; message: string }> = [];

    // Check Section 1 special inputs
    if (section1.concentrationLevel === null) {
      warnings.push({ section: 1, message: "Concentration level is missing" });
    }
    if (section1.currentMood === null) {
      warnings.push({ section: 1, message: "Current mood is missing" });
    }
    if (section1.expectedScore === null) {
      warnings.push({ section: 1, message: "Expected score is missing" });
    }

    // Check for unanswered questions
    [1, 2, 3, 4, 5].forEach((sectionNum) => {
      const questions = questionsBySection[sectionNum];
      const sectionData =
        sectionNum === 1
          ? section1
          : sectionNum === 2
          ? section2
          : sectionNum === 3
          ? section3
          : sectionNum === 4
          ? section4
          : section5;

      const unanswered = questions.filter(
        (q) => sectionData.answers[q.id] === undefined
      );
      if (unanswered.length > 0) {
        warnings.push({
          section: sectionNum,
          message: `${unanswered.length} question(s) not answered`,
        });
      }
    });

    return warnings;
  }, [section1, section2, section3, section4, section5, questionsBySection]);

  const getPerformanceRating = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const getSectionName = (sectionNum: number): string => {
    const names = [
      "",
      "Computational Ability",
      "Conceptual Understanding",
      "Concept Application",
      "Reasoning Ability",
      "Problem Solving",
    ];
    return names[sectionNum];
  };

  const getSectionRawScore = (sectionNum: number): number => {
    switch (sectionNum) {
      case 1:
        return section1Scores.rawScore;
      case 2:
        return section2Scores.rawScore;
      case 3:
        return section3Scores.rawScore;
      case 4:
        return section4Scores.rawScore;
      case 5:
        return section5Scores.rawScore;
      default:
        return 0;
    }
  };

  const getSectionMaxScore = (sectionNum: number): number => {
    switch (sectionNum) {
      case 1:
        return section1Scores.maxScore;
      case 2:
        return section2Scores.maxScore;
      case 3:
        return section3Scores.maxScore;
      case 4:
        return section4Scores.maxScore;
      case 5:
        return section5Scores.maxScore;
      default:
        return 0;
    }
  };

  const getSectionStandardScore = (sectionNum: number): number => {
    switch (sectionNum) {
      case 1:
        return section1Scores.standardScore;
      case 2:
        return section2Scores.standardScore;
      case 3:
        return section3Scores.standardScore;
      case 4:
        return section4Scores.standardScore;
      case 5:
        return section5Scores.standardScore;
      default:
        return 0;
    }
  };

  const getUnits = (sectionNum: number) => {
    if (sectionNum === 2) {
      return section2Scores.unitScores;
    }
    if (sectionNum === 3) {
      return section3Scores.unitScores;
    }
    return [];
  };

  const handleFinalSubmit = async () => {
    if (!submission?.id) return;

    try {
      await gradeMutation.mutateAsync(submission.id);
      // Navigate to grading list - query will be automatically refreshed due to invalidation
      navigate("/teacher/grading");
    } catch (error: any) {
      alert(error.message || "Failed to submit grading");
    }
  };

  const goToSection = (sectionNum: number) => {
    setCurrentStep(sectionNum);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-secondary-900">
          Review Before Submit
        </h2>
        <p className="text-secondary-500 mt-1">
          Please review all sections before finalizing the grading
        </p>
      </div>

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
              {submission.student?.fullName?.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">
                {submission.student?.fullName || "Unknown Student"}
              </div>
              <div className="text-sm text-secondary-500">
                {submission.student?.username} • {submission.test.grade} •{" "}
                {submission.test.title}
              </div>
              <div className="text-sm text-secondary-500 mt-1">
                {submission.test.testCode}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-secondary-200">
            <div className="text-center">
              <div className="text-sm text-secondary-500 mb-2">
                Overall Score
              </div>
              <div className="text-4xl font-bold mb-1">
                {overallScores.totalRawScore}
                <span className="text-2xl text-secondary-500">
                  /{overallScores.totalMaxScore}
                </span>
              </div>
              <div className="text-3xl font-bold text-primary-600 mb-4">
                {overallScores.overallStandardScore.toFixed(1)}%
              </div>
              <Badge
                variant={
                  overallScores.overallStandardScore >= 80
                    ? "success"
                    : overallScores.overallStandardScore >= 60
                    ? "warning"
                    : "danger"
                }
                className="text-base px-4 py-2"
              >
                <Star className="w-4 h-4 mr-2" />
                {getPerformanceRating(overallScores.overallStandardScore)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Review */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((sectionNum) => (
          <Card key={sectionNum}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Section {sectionNum}: {getSectionName(sectionNum)}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToSection(sectionNum)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Section 1 Special Inputs */}
              {sectionNum === 1 && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-secondary-50 rounded-lg">
                  <div>
                    <div className="text-xs text-secondary-500 mb-1">
                      Concentration
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Star
                          key={level}
                          className={`w-4 h-4 ${
                            level <= (section1.concentrationLevel || 0)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-secondary-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary-500 mb-1">Mood</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((mood) => (
                        <Star
                          key={mood}
                          className={`w-4 h-4 ${
                            mood <= (section1.currentMood || 0)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-secondary-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary-500 mb-1">
                      Expected
                    </div>
                    <div className="font-semibold">
                      {section1.expectedScore || 0} pts
                    </div>
                  </div>
                </div>
              )}

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-secondary-500 mb-1">
                    Raw Score
                  </div>
                  <div className="text-xl font-semibold">
                    {getSectionRawScore(sectionNum)} /{" "}
                    {getSectionMaxScore(sectionNum)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-secondary-500 mb-1">
                    Standard Score
                  </div>
                  <div className="text-xl font-semibold text-primary-600">
                    {getSectionStandardScore(sectionNum).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Section 1 Answer Distribution */}
              {sectionNum === 1 && (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">
                      Correct: {section1Scores.correctCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      Mistakes: {section1Scores.mistakeCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">
                      Unsolved: {section1Scores.unsolvedCount}
                    </span>
                  </div>
                </div>
              )}

              {/* Sections 2-3 Units */}
              {(sectionNum === 2 || sectionNum === 3) && (
                <div className="space-y-2">
                  <div className="text-sm text-secondary-500 mb-2">Units:</div>
                  {getUnits(sectionNum).map((unit) => (
                    <div
                      key={unit.unitName}
                      className="flex items-center justify-between p-2 bg-secondary-50 rounded"
                    >
                      <span className="text-sm font-medium">
                        {unit.unitName}
                      </span>
                      <span className="text-sm text-secondary-600">
                        {unit.rawScore}/{unit.maxScore} (
                        {unit.standardScore.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <Alert variant="warning">
          <AlertCircle className="w-5 h-5" />
          <div>
            <div className="font-medium mb-2">Validation Warnings</div>
            <ul className="space-y-1">
              {validationWarnings.map((warning, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    Section {warning.section}: {warning.message}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToSection(warning.section)}
                  >
                    Fix
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {/* Confirmation */}
      <Card>
        <CardContent className="pt-6">
          <Checkbox
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            label="I have reviewed all sections and confirm the scores are accurate"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          ← Back to Section 5
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost">Save as Draft</Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleFinalSubmit}
            disabled={
              !confirmed ||
              validationWarnings.length > 0 ||
              gradeMutation.isPending
            }
          >
            {gradeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Complete Grading & Generate Report"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
