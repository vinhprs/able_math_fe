import { useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAdtmSubmission } from "@/hooks/useAdtmGradingWorkflow";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  useCalculateSection1Scores,
  useCalculateSectionScores,
  useCalculateSimpleSectionScores,
} from "@/hooks/useCalculateScores";
import { useAdtmGradingStore } from "@/store/adtmGradingStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Stepper,
} from "@/components/ui";
import {
  QuestionInput,
  UnitCard,
  SectionStats,
  ConcentrationLevelInput,
  CurrentMoodInput,
  ExpectedScoreInput,
} from "@/components/grading";
import { ArrowLeft, ArrowRight, Check, Loader2, Save } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { useSubmitGrading } from "@/hooks/useAdtmGradingWorkflow";

const STEPS = [
  "Section 1 - Calculation",
  "Section 2 - Conceptual Understanding",
  "Section 3 - Conceptual Application",
  "Section 4 - Reasoning",
  "Section 5 - Problem-Solving",
  "Review & Submit",
];

const SECTION_TITLES = [
  "",
  "Calculation Ability",
  "Conceptual Understanding",
  "Conceptual Application",
  "Reasoning Ability",
  "Problem-Solving Ability",
];

export function GradeAdtm() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sectionParam = searchParams.get("section");

  const { data: submission, isLoading } = useAdtmSubmission(
    submissionId || null
  );
  const submitMutation = useSubmitGrading();

  const {
    currentStep,
    section1,
    section2,
    section3,
    section4,
    section5,
    setSubmissionId,
    setCurrentStep,
    setSection1PreTest,
    setSection1Answer,
    setSectionAnswer,
    loadFromSubmission,
  } = useAdtmGradingStore();

  // Set initial section from URL param
  useEffect(() => {
    if (sectionParam) {
      const sectionNum = parseInt(sectionParam, 10);
      if (sectionNum >= 1 && sectionNum <= 6) {
        setCurrentStep(sectionNum);
      }
    }
  }, [sectionParam, setCurrentStep]);

  // Load submission data
  useEffect(() => {
    if (submission) {
      setSubmissionId(submission.id);
      loadFromSubmission(submission);
    }
  }, [submission, setSubmissionId, loadFromSubmission]);

  // Get questions by section
  const questionsBySection = useMemo(() => {
    if (!submission?.answersBySection) {
      return { 1: [], 2: [], 3: [], 4: [], 5: [] };
    }

    const sections: Record<number, typeof submission.answers> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };

    Object.entries(submission.answersBySection).forEach(
      ([sectionNum, answers]) => {
        const num = parseInt(sectionNum, 10);
        if (num >= 1 && num <= 5) {
          sections[num] = answers;
        }
      }
    );

    // Extract unique questions
    const questionsBySectionNum: Record<number, any[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };

    Object.entries(sections).forEach(([sectionNum, answers]) => {
      const num = parseInt(sectionNum, 10);
      const questionMap = new Map();
      answers.forEach((answer) => {
        if (answer.question && !questionMap.has(answer.question.id)) {
          questionMap.set(answer.question.id, answer.question);
        }
      });
      questionsBySectionNum[num] = Array.from(questionMap.values()).sort(
        (a, b) => a.questionNumber - b.questionNumber
      );
    });

    return questionsBySectionNum;
  }, [submission]);

  // Auto-save for current section
  const currentSectionData = useMemo(() => {
    if (currentStep === 1) {
      return {
        answers: section1.answers,
        section1Data: {
          concentrationLevel: section1.concentrationLevel,
          currentMood: section1.currentMood,
          expectedScore: section1.expectedScore,
        },
      };
    }
    const section =
      currentStep === 2
        ? section2
        : currentStep === 3
        ? section3
        : currentStep === 4
        ? section4
        : section5;
    return { answers: section.answers };
  }, [currentStep, section1, section2, section3, section4, section5]);

  const { isSaving } = useAutoSave({
    submissionId: submissionId || null,
    sectionNumber: currentStep as 1 | 2 | 3 | 4 | 5,
    data: currentSectionData,
    enabled: !!submissionId && currentStep <= 5,
  });

  // Calculate Section 1 scores
  const section1Scores = useCalculateSection1Scores({
    questions: questionsBySection[1],
    answers: section1.answers,
  });

  // Calculate Section 2-3 scores (with units)
  const section2Scores = useCalculateSectionScores({
    questions: questionsBySection[2],
    answers: section2.answers,
  });

  const section3Scores = useCalculateSectionScores({
    questions: questionsBySection[3],
    answers: section3.answers,
  });

  // Calculate Section 4-5 scores (simple)
  const section4Scores = useCalculateSimpleSectionScores({
    questions: questionsBySection[4],
    answers: section4.answers,
  });

  const section5Scores = useCalculateSimpleSectionScores({
    questions: questionsBySection[5],
    answers: section5.answers,
  });

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      navigate(
        `/teacher/adtm/grade/${submissionId}?section=${currentStep - 1}`
      );
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      navigate(
        `/teacher/adtm/grade/${submissionId}?section=${currentStep + 1}`
      );
    }
  };

  const handleSubmit = async () => {
    if (!submissionId) return;

    try {
      await submitMutation.mutateAsync(submissionId);
      toastSuccess("Grading submitted successfully");
      // Navigate to grading list - query will be automatically refreshed due to invalidation
      navigate("/teacher/grading");
    } catch (error: any) {
      toastError(error.message || "Failed to submit grading");
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: {
        if (
          section1.concentrationLevel === null ||
          section1.currentMood === null ||
          section1.expectedScore === null
        ) {
          return false;
        }
        return questionsBySection[1].every(
          (q) =>
            section1.answers[q.id] !== null &&
            section1.answers[q.id] !== undefined
        );
      }
      case 2:
      case 3:
      case 4:
      case 5: {
        const sectionData =
          currentStep === 2
            ? section2
            : currentStep === 3
            ? section3
            : currentStep === 4
            ? section4
            : section5;
        return questionsBySection[currentStep].every(
          (q) =>
            sectionData.answers[q.id] !== null &&
            sectionData.answers[q.id] !== undefined
        );
      }
      case 6:
        return true;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-secondary-600">Submission not found</p>
            <Button
              onClick={() => navigate("/teacher/adtm/students")}
              className="mt-4"
            >
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            A-DTM Grading
          </h1>
          <p className="text-secondary-600 mt-1">
            {submission.student?.fullName} - {submission.test.testCode}
          </p>
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <Save className="w-4 h-4 animate-pulse" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* Stepper */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep <= 5
              ? `Section ${currentStep}: ${SECTION_TITLES[currentStep]}`
              : "Review & Submit"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Section 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Special Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ConcentrationLevelInput
                  value={section1.concentrationLevel}
                  onChange={(level) =>
                    setSection1PreTest({ concentrationLevel: level })
                  }
                />
                <CurrentMoodInput
                  value={section1.currentMood}
                  onChange={(mood) => setSection1PreTest({ currentMood: mood })}
                />
                <ExpectedScoreInput
                  value={section1.expectedScore}
                  onChange={(score) =>
                    setSection1PreTest({ expectedScore: score })
                  }
                  maxScore={section1Scores.maxScore}
                />
              </div>

              {/* Questions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Questions
                </h3>
                {questionsBySection[1].map((question) => (
                  <QuestionInput
                    key={question.id}
                    questionNumber={question.questionNumber}
                    maxScore={question.score}
                    currentScore={section1.answers[question.id]}
                    onChange={(score) => setSection1Answer(question.id, score)}
                  />
                ))}
              </div>

              {/* Stats */}
              <SectionStats
                stats={[
                  { label: "Correct", value: section1Scores.correctCount },
                  { label: "Mistakes", value: section1Scores.mistakeCount },
                  { label: "Unsolved", value: section1Scores.unsolvedCount },
                  {
                    label: "Raw Score",
                    value: `${section1Scores.rawScore} / ${section1Scores.maxScore}`,
                  },
                  {
                    label: "Standard Score",
                    value: `${section1Scores.standardScore.toFixed(1)}%`,
                    highlight: true,
                  },
                ]}
              />
            </div>
          )}

          {/* Sections 2-3 (With Units) */}
          {(currentStep === 2 || currentStep === 3) && (
            <div className="space-y-6">
              {(() => {
                const questions = questionsBySection[currentStep];
                const answers =
                  currentStep === 2 ? section2.answers : section3.answers;
                const scores =
                  currentStep === 2 ? section2Scores : section3Scores;

                // Group by unit
                const unitGroups: Record<string, typeof questions> = {};
                questions.forEach((q) => {
                  const unitName = q.unitName || "No Unit";
                  if (!unitGroups[unitName]) {
                    unitGroups[unitName] = [];
                  }
                  unitGroups[unitName].push(q);
                });

                return (
                  <>
                    {Object.entries(unitGroups).map(
                      ([unitName, unitQuestions]) => {
                        const unitScore = scores.unitScores.find(
                          (u) => u.unitName === unitName
                        );
                        return (
                          <UnitCard
                            key={unitName}
                            unitName={unitName}
                            questions={unitQuestions}
                            answers={answers}
                            onAnswerChange={(questionId, score) =>
                              setSectionAnswer(currentStep, questionId, score)
                            }
                            unitRawScore={unitScore?.rawScore}
                            unitMaxScore={unitScore?.maxScore}
                            unitStandardScore={unitScore?.standardScore}
                          />
                        );
                      }
                    )}

                    <SectionStats
                      stats={[
                        {
                          label: "Section Total",
                          value: `${scores.rawScore} / ${scores.maxScore}`,
                        },
                        {
                          label: "Standard Score",
                          value: `${scores.standardScore.toFixed(1)}%`,
                          highlight: true,
                        },
                      ]}
                    />
                  </>
                );
              })()}
            </div>
          )}

          {/* Sections 4-5 (Simple) */}
          {(currentStep === 4 || currentStep === 5) && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Questions
                </h3>
                {questionsBySection[currentStep].map((question) => {
                  const answers =
                    currentStep === 4 ? section4.answers : section5.answers;
                  return (
                    <QuestionInput
                      key={question.id}
                      questionNumber={question.questionNumber}
                      maxScore={question.score}
                      currentScore={answers[question.id]}
                      onChange={(score) =>
                        setSectionAnswer(currentStep, question.id, score)
                      }
                    />
                  );
                })}
              </div>

              {(() => {
                const scores =
                  currentStep === 4 ? section4Scores : section5Scores;
                return (
                  <SectionStats
                    stats={[
                      {
                        label: "Total",
                        value: `${scores.rawScore} / ${scores.maxScore}`,
                      },
                      {
                        label: "Standard Score",
                        value: `${scores.standardScore.toFixed(1)}%`,
                        highlight: true,
                      },
                    ]}
                  />
                );
              })()}
            </div>
          )}

          {/* Review Step */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <p className="text-secondary-600">
                Review all sections before submitting. Make sure all questions
                are graded.
              </p>
              {/* Review content will be added */}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-secondary-200">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 6 ? (
              <Button onClick={handleNext} disabled={!validateCurrentStep()}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                isLoading={submitMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                Submit Grading
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
