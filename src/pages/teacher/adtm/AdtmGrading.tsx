import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAdtmSubmission,
  useGradeAdtmSubmission,
} from "@/hooks/useAdtmGrading";
import { useAdtmGradingStore } from "@/store/adtmGradingStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Stepper,
} from "@/components/ui";
import { Section1Form } from "@/components/grading/Section1Form";
import { SectionForm } from "@/components/grading/SectionForm";
import { GradingReview } from "@/components/grading/GradingReview";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

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

export function AdtmGrading() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const { data: submission, isLoading } = useAdtmSubmission(
    submissionId || null
  );
  const gradeMutation = useGradeAdtmSubmission();

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

  // Load submission data when available
  useEffect(() => {
    if (submission) {
      setSubmissionId(submission.id);
      loadFromSubmission(submission);
    }
  }, [submission, setSubmissionId, loadFromSubmission]);

  // Group questions by section
  const questionsBySection = useMemo(() => {
    if (!submission?.answers) return { 1: [], 2: [], 3: [], 4: [], 5: [] };

    const sections: Record<
      number,
      (typeof submission.answers)[0]["question"][]
    > = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };

    submission.answers.forEach((answer) => {
      const sectionNum = answer.question?.sectionNumber;
      if (sectionNum && sectionNum >= 1 && sectionNum <= 5) {
        if (!sections[sectionNum].find((q) => q.id === answer.question.id)) {
          sections[sectionNum].push(answer.question);
        }
      }
    });

    // Sort by question number
    Object.keys(sections).forEach((key) => {
      const num = parseInt(key, 10);
      sections[num].sort((a, b) => a.questionNumber - b.questionNumber);
    });

    return sections;
  }, [submission]);

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmitGrading = async () => {
    if (!submissionId) return;

    try {
      await gradeMutation.mutateAsync(submissionId);
      navigate("/teacher/grading");
    } catch (error) {
      console.error("Failed to submit grading:", error);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: {
        // Validate Section 1
        if (
          section1.concentrationLevel === null ||
          section1.currentMood === null ||
          section1.expectedScore === null
        ) {
          return false;
        }
        // Check if all questions have scores
        const section1Questions = questionsBySection[1];
        return section1Questions.every(
          (q) => section1.answers[q.id] !== undefined
        );
      }
      case 2:
      case 3:
      case 4:
      case 5: {
        // Validate sections 2-5
        const sectionKey = `section${currentStep}` as keyof typeof section2;
        const sectionData =
          sectionKey === "section2"
            ? section2
            : sectionKey === "section3"
            ? section3
            : sectionKey === "section4"
            ? section4
            : section5;
        const questions = questionsBySection[currentStep];
        return questions.every((q) => sectionData.answers[q.id] !== undefined);
      }
      case 6:
        return true; // Review step is always valid
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
              onClick={() => navigate("/teacher/grading")}
              className="mt-4"
            >
              Back to Grading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">A-DTM Grading</h1>
        <p className="text-secondary-600 mt-1">
          {submission.student?.fullName} - {submission.test.testCode}
        </p>
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
          {/* Step 1: Section 1 */}
          {currentStep === 1 && (
            <Section1Form
              questions={questionsBySection[1]}
              answers={section1.answers}
              concentrationLevel={section1.concentrationLevel}
              currentMood={section1.currentMood}
              expectedScore={section1.expectedScore}
              onConcentrationChange={(level) =>
                setSection1PreTest({ concentrationLevel: level })
              }
              onMoodChange={(mood) => setSection1PreTest({ currentMood: mood })}
              onExpectedScoreChange={(score) =>
                setSection1PreTest({ expectedScore: score })
              }
              onAnswerChange={setSection1Answer}
            />
          )}

          {/* Steps 2-5: Sections 2-5 */}
          {currentStep >= 2 && currentStep <= 5 && (
            <SectionForm
              sectionNumber={currentStep}
              sectionTitle={SECTION_TITLES[currentStep]}
              questions={questionsBySection[currentStep]}
              answers={
                currentStep === 2
                  ? section2.answers
                  : currentStep === 3
                  ? section3.answers
                  : currentStep === 4
                  ? section4.answers
                  : section5.answers
              }
              onAnswerChange={(questionId, score) =>
                setSectionAnswer(currentStep, questionId, score)
              }
            />
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <GradingReview
              questions={submission.answers.map((a) => a.question)}
              section1Questions={questionsBySection[1]}
              section2Questions={questionsBySection[2]}
              section3Questions={questionsBySection[3]}
              section4Questions={questionsBySection[4]}
              section5Questions={questionsBySection[5]}
            />
          )}

          {/* Navigation Buttons */}
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
                onClick={handleSubmitGrading}
                disabled={gradeMutation.isPending}
                isLoading={gradeMutation.isPending}
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
