import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdtmSubmission } from "@/hooks/useAdtmGrading";
import { useAdtmGradingStore } from "@/store/adtmGradingStore";
import { useAdtmAutoSave } from "@/hooks/useAdtmAutoSave";
import {
  useCalculateSection1Scores,
  useCalculateSectionScores,
  useCalculateSimpleSectionScores,
} from "@/hooks/useCalculateScores";
import { Button, Card, CardContent } from "@/components/ui";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Section1GradingEnhanced } from "@/components/grading/Section1GradingEnhanced";
import { SectionWithUnitsGrading } from "@/components/grading/SectionWithUnitsGrading";
import { SimpleSectionGrading } from "@/components/grading/SimpleSectionGrading";
import { FinalReviewPage } from "@/components/grading/FinalReviewPage";

const SECTION_NAMES = [
  "",
  "Computational Ability",
  "Conceptual Understanding",
  "Concept Application",
  "Reasoning Ability",
  "Problem Solving",
];

export function AdtmGradingEnhanced() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(1);

  const { data: submission, isLoading } = useAdtmSubmission(
    submissionId || null
  );
  const {
    section1,
    section2,
    section3,
    section4,
    section5,
    setSubmissionId,
    loadFromSubmission,
  } = useAdtmGradingStore();

  const { isSaving, savedAt } = useAdtmAutoSave(submissionId || null);

  // Load submission data
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

  // Calculate section scores
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

  // Calculate progress
  const completedSections = useMemo(() => {
    let count = 0;
    if (section1Scores.rawScore > 0 && section1.concentrationLevel !== null)
      count++;
    if (section2Scores.rawScore > 0) count++;
    if (section3Scores.rawScore > 0) count++;
    if (section4Scores.rawScore > 0) count++;
    if (section5Scores.rawScore > 0) count++;
    return count;
  }, [
    section1Scores,
    section2Scores,
    section3Scores,
    section4Scores,
    section5Scores,
    section1.concentrationLevel,
  ]);

  const progress = (completedSections / 5) * 100;

  // Check if section is complete
  const isSectionComplete = (sectionNum: number): boolean => {
    switch (sectionNum) {
      case 1:
        return (
          section1.concentrationLevel !== null &&
          section1.currentMood !== null &&
          section1.expectedScore !== null &&
          questionsBySection[1].every(
            (q) => section1.answers[q.id] !== undefined
          )
        );
      case 2:
        return questionsBySection[2].every(
          (q) => section2.answers[q.id] !== undefined
        );
      case 3:
        return questionsBySection[3].every(
          (q) => section3.answers[q.id] !== undefined
        );
      case 4:
        return questionsBySection[4].every(
          (q) => section4.answers[q.id] !== undefined
        );
      case 5:
        return questionsBySection[5].every(
          (q) => section5.answers[q.id] !== undefined
        );
      default:
        return false;
    }
  };

  const goToSection = (sectionNum: number) => {
    if (sectionNum >= 1 && sectionNum <= 6) {
      setCurrentSection(sectionNum);
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
              Back to List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-secondary-50">
      {/* Top Navigation Bar - Fixed */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/teacher/grading")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>

          <div className="h-10 w-px bg-secondary-200" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
              {submission.student?.fullName?.charAt(0).toUpperCase() || "S"}
            </div>
            <div>
              <div className="font-medium text-secondary-900">
                {submission.student?.fullName || "Unknown Student"}
              </div>
              <div className="text-sm text-secondary-500">
                {submission.test.testCode} • {submission.test.title}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-secondary-600">
              {completedSections}/5 Sections Complete
            </div>
            <div className="w-32 h-2 bg-secondary-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Auto-save Indicator */}
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : savedAt ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>
                  Saved {formatDistanceToNow(savedAt, { addSuffix: true })}
                </span>
              </>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
            {currentSection === 6 && (
              <Button variant="primary" size="sm">
                Complete Grading
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section Navigation */}
        <div className="w-64 bg-white border-r border-secondary-200 flex flex-col">
          <div className="p-4 border-b border-secondary-200">
            <h3 className="font-semibold text-secondary-900">Sections</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {[1, 2, 3, 4, 5].map((sectionNum) => {
              const isComplete = isSectionComplete(sectionNum);
              const isActive = currentSection === sectionNum;
              let score = 0;
              let maxScore = 0;

              switch (sectionNum) {
                case 1:
                  score = section1Scores.rawScore;
                  maxScore = section1Scores.maxScore;
                  break;
                case 2:
                  score = section2Scores.rawScore;
                  maxScore = section2Scores.maxScore;
                  break;
                case 3:
                  score = section3Scores.rawScore;
                  maxScore = section3Scores.maxScore;
                  break;
                case 4:
                  score = section4Scores.rawScore;
                  maxScore = section4Scores.maxScore;
                  break;
                case 5:
                  score = section5Scores.rawScore;
                  maxScore = section5Scores.maxScore;
                  break;
              }

              return (
                <button
                  key={sectionNum}
                  onClick={() => goToSection(sectionNum)}
                  className={`w-full p-4 text-left border-b border-secondary-100 transition-colors ${
                    isActive
                      ? "bg-primary-50 border-l-4 border-l-primary-600"
                      : "hover:bg-secondary-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-secondary-400" />
                      )}
                      <span className="font-medium text-secondary-900">
                        Section {sectionNum}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-secondary-600 ml-7">
                    {SECTION_NAMES[sectionNum]}
                  </div>
                  {score > 0 && (
                    <div className="text-xs text-secondary-500 ml-7 mt-1">
                      {score}/{maxScore} pts
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Overall Score Card */}
          <div className="p-4 border-t border-secondary-200 bg-secondary-50">
            <div className="text-xs text-secondary-500 mb-1">Overall Score</div>
            <div className="text-2xl font-bold text-secondary-900">
              {overallScores.totalRawScore}
              <span className="text-lg text-secondary-500">
                /{overallScores.totalMaxScore}
              </span>
            </div>
            <div className="text-lg font-semibold text-primary-600">
              {overallScores.overallStandardScore.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentSection === 1 && (
            <Section1GradingEnhanced
              questions={questionsBySection[1]}
              submission={submission}
              onNext={() => goToSection(2)}
            />
          )}

          {currentSection === 2 && (
            <SectionWithUnitsGrading
              sectionNumber={2}
              sectionName={SECTION_NAMES[2]}
              questions={questionsBySection[2]}
              onPrevious={() => goToSection(1)}
              onNext={() => goToSection(3)}
            />
          )}

          {currentSection === 3 && (
            <SectionWithUnitsGrading
              sectionNumber={3}
              sectionName={SECTION_NAMES[3]}
              questions={questionsBySection[3]}
              onPrevious={() => goToSection(2)}
              onNext={() => goToSection(4)}
            />
          )}

          {currentSection === 4 && (
            <SimpleSectionGrading
              sectionNumber={4}
              sectionName={SECTION_NAMES[4]}
              questions={questionsBySection[4]}
              onPrevious={() => goToSection(3)}
              onNext={() => goToSection(5)}
            />
          )}

          {currentSection === 5 && (
            <SimpleSectionGrading
              sectionNumber={5}
              sectionName={SECTION_NAMES[5]}
              questions={questionsBySection[5]}
              onPrevious={() => goToSection(4)}
              onNext={() => goToSection(6)}
            />
          )}

          {currentSection === 6 && (
            <FinalReviewPage
              submission={submission}
              questionsBySection={questionsBySection}
              onBack={() => goToSection(5)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
